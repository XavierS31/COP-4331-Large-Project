require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());


const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.MONGODB_URI;

const client = new MongoClient(url);
const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

var cardList =
  [
    'Roy Campanella',
    'Paul Molitor',
    'Tony Gwynn',
    'Dennis Eckersley',
    'Reggie Jackson',
    'Gaylord Perry',
    'Buck Leonard',
    'Rollie Fingers',
    'Charlie Gehringer',
    'Wade Boggs',
    'Carl Hubbell',
    'Dave Winfield',
    'Jackie Robinson',
    'Ken Griffey, Jr.',
    'Al Simmons',
    'Chuck Klein',
    'Mel Ott',
    'Mark McGwire',
    'Nolan Ryan',
    'Ralph Kiner',
    'Yogi Berra',
    'Goose Goslin',
    'Greg Maddux',
    'Frankie Frisch',
    'Ernie Banks',
    'Ozzie Smith',
    'Hank Greenberg',
    'Kirby Puckett',
    'Bob Feller',
    'Dizzy Dean',
    'Joe Jackson',
    'Sam Crawford',
    'Barry Bonds',
    'Duke Snider',
    'George Sisler',
    'Ed Walsh',
    'Tom Seaver',
    'Willie Stargell',
    'Bob Gibson',
    'Brooks Robinson',
    'Steve Carlton',
    'Joe Medwick',
    'Nap Lajoie',
    'Cal Ripken, Jr.',
    'Mike Schmidt',
    'Eddie Murray',
    'Tris Speaker',
    'Al Kaline',
    'Sandy Koufax',
    'Willie Keeler',
    'Pete Rose',
    'Robin Roberts',
    'Eddie Collins',
    'Lefty Gomez',
    'Lefty Grove',
    'Carl Yastrzemski',
    'Frank Robinson',
    'Juan Marichal',
    'Warren Spahn',
    'Pie Traynor',
    'Roberto Clemente',
    'Harmon Killebrew',
    'Satchel Paige',
    'Eddie Plank',
    'Josh Gibson',
    'Oscar Charleston',
    'Mickey Mantle',
    'Cool Papa Bell',
    'Johnny Bench',
    'Mickey Cochrane',
    'Jimmie Foxx',
    'Jim Palmer',
    'Cy Young',
    'Eddie Mathews',
    'Honus Wagner',
    'Paul Waner',
    'Grover Alexander',
    'Rod Carew',
    'Joe DiMaggio',
    'Joe Morgan',
    'Stan Musial',
    'Bill Terry',
    'Rogers Hornsby',
    'Lou Brock',
    'Ted Williams',
    'Bill Dickey',
    'Christy Mathewson',
    'Willie McCovey',
    'Lou Gehrig',
    'George Brett',
    'Hank Aaron',
    'Harry Heilmann',
    'Walter Johnson',
    'Roger Clemens',
    'Ty Cobb',
    'Whitey Ford',
    'Willie Mays',
    'Rickey Henderson',
    'Babe Ruth'
  ];


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

// JWT Verification Middleware with Token Refresh
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Generate a new token with refreshed expiration
    const newToken = jwt.sign(
      { username: decoded.username, userType: decoded.userType },
      JWT_SECRET,
      { expiresIn: '30m' }
    );
    req.newToken = newToken;

    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.post('/api/login', async (req, res, next) => {
  // incoming: login, password
  // outgoing: user data (student or faculty), userType, error

  var error = '';

  const { login, password } = req.body;
  const db = client.db('researchportal');

  // Check students table first
  const studentResults = await db.collection('students').find({ username: login }).toArray();

  if (studentResults.length > 0) {
    const user = studentResults[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ user: null, userType: null, token: null, error: 'Invalid credentials' });
    }
    if (user.isVerified === false) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign(
      { username: user.username, userType: 'student' },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    var ret = {
      user: user,
      userType: 'student',
      token: token,
      error: error
    };
    return res.status(200).json(ret);
  }

  // Check faculty table if student not found
  const facultyResults = await db.collection('faculty').find({ username: login }).toArray();

  if (facultyResults.length > 0) {
    const user = facultyResults[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ user: null, userType: null, token: null, error: 'Invalid credentials' });
    }
    if (user.isVerified === false) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign(
      { username: user.username, userType: 'faculty' },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    var ret = {
      user: user,
      userType: 'faculty',
      token: token,
      error: error
    };
    return res.status(200).json(ret);
  }

  // No user found in either table
  var ret = {
    user: null,
    userType: null,
    token: null,
    error: 'Invalid credentials'
  };
  res.status(200).json(ret);
});


app.post('/api/signup/student', async (req, res, next) => {
  // incoming: firstName, lastName, login, password, ucfEmail, major, college
  // outgoing: error

  const { firstName, lastName, login, password, ucfEmail, major, college } = req.body;

  var error = '';

  try {
    const db = client.db('researchportal');

    // Check if user already exists in students or faculty tables
    const existingStudent = await db.collection('students').find({ username: login }).toArray();
    const existingFaculty = await db.collection('faculty').find({ username: login }).toArray();

    if (existingStudent.length > 0 || existingFaculty.length > 0) {
      error = "User already exists";
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create a new student object with all database fields
      const newStudent = {
        firstName: firstName,
        lastName: lastName,
        username: login,
        password: hashedPassword,
        ucfEmail: ucfEmail,
        major: major,
        college: college,
        isVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpiry: Date.now() + 86400000
      };

      await db.collection('students').insertOne(newStudent);

      const verifyLink = `${process.env.BASE_URL}/api/verify-email?token=${verificationToken}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: ucfEmail,
        subject: 'Verify your email',
        html: `<p>Please verify your email clicking <a href="${verifyLink}">here</a>.</p>`
      });
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/signup/faculty', async (req, res, next) => {
  // incoming: firstName, lastName, login, password, email, role, department
  // outgoing: error

  const { firstName, lastName, login, password, email, role, department } = req.body;

  var error = '';

  try {
    const db = client.db('researchportal');

    // Check if user already exists in students or faculty tables
    const existingStudent = await db.collection('students').find({ username: login }).toArray();
    const existingFaculty = await db.collection('faculty').find({ username: login }).toArray();

    if (existingStudent.length > 0 || existingFaculty.length > 0) {
      error = "User already exists";
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create a new faculty object with all database fields
      const newFaculty = {
        firstName: firstName,
        lastName: lastName,
        username: login,
        password: hashedPassword,
        email: email,
        role: role,
        department: department,
        isVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpiry: Date.now() + 86400000
      };

      await db.collection('faculty').insertOne(newFaculty);

      const verifyLink = `${process.env.BASE_URL}/api/verify-email?token=${verificationToken}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email',
        html: `<p>Please verify your email clicking <a href="${verifyLink}">here</a>.</p>`
      });
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.patch('/api/edit/student', verifyToken, async (req, res, next) => {
  // incoming: any fields to update (firstName, lastName, password, ucfEmail, major, college)
  // outgoing: error

  const { firstName, lastName, password, ucfEmail, major, college } = req.body;
  const username = req.user.username;  // Use authenticated user's username from token

  var error = '';

  // Build update object with only provided fields
  const updateFields = {};
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  if (password) updateFields.password = password;
  if (ucfEmail) updateFields.ucfEmail = ucfEmail;
  if (major) updateFields.major = major;
  if (college) updateFields.college = college;

  try {
    const db = client.db('researchportal');
    const result = await db.collection('students').updateOne(
      { username: username },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      error = "Student not found";
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { error: error, token: req.newToken };
  res.status(200).json(ret);
});

app.patch('/api/edit/faculty', verifyToken, async (req, res, next) => {
  // incoming: any fields to update (firstName, lastName, password, email, role, department)
  // outgoing: error

  const { firstName, lastName, password, email, role, department } = req.body;
  const username = req.user.username;  // Use authenticated user's username from token

  var error = '';

  // Build update object with only provided fields
  const updateFields = {};
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  if (password) updateFields.password = password;
  if (email) updateFields.email = email;
  if (role) updateFields.role = role;
  if (department) updateFields.department = department;

  try {
    const db = client.db('researchportal');
    const result = await db.collection('faculty').updateOne(
      { username: username },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      error = "Faculty not found";
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { error: error, token: req.newToken };
  res.status(200).json(ret);
});

app.delete('/api/delete/student', verifyToken, async (req, res, next) => {
  // outgoing: error

  const username = req.user.username;  // Use authenticated user's username from token

  var error = '';

  try {
    const db = client.db('researchportal');
    const result = await db.collection('students').deleteOne({ username: username });

    if (result.deletedCount === 0) {
      error = "Student not found";
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { error: error, token: req.newToken };
  res.status(200).json(ret);
});

app.delete('/api/delete/faculty', verifyToken, async (req, res, next) => {
  // outgoing: error

  const username = req.user.username;  // Use authenticated user's username from token

  var error = '';

  try {
    const db = client.db('researchportal');
    const result = await db.collection('faculty').deleteOne({ username: username });

    if (result.deletedCount === 0) {
      error = "Faculty not found";
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { error: error, token: req.newToken };
  res.status(200).json(ret);
});

app.get('/api/verify-email', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Token is missing');

  try {
    const db = client.db('researchportal');

    const student = await db.collection('students').findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (student) {
      await db.collection('students').updateOne(
        { _id: student._id },
        {
          $set: { isVerified: true },
          $unset: { verificationToken: "", verificationTokenExpiry: "" }
        }
      );
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verified=true`);
    }

    const faculty = await db.collection('faculty').findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (faculty) {
      await db.collection('faculty').updateOne(
        { _id: faculty._id },
        {
          $set: { isVerified: true },
          $unset: { verificationToken: "", verificationTokenExpiry: "" }
        }
      );
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verified=true`);
    }

    res.status(400).send('Invalid or expired token');
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const db = client.db('researchportal');
    const student = await db.collection('students').findOne({ ucfEmail: email });
    const faculty = (!student) ? await db.collection('faculty').findOne({ email: email }) : null;

    const user = student || faculty;
    const collectionName = student ? 'students' : 'faculty';

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      await db.collection(collectionName).updateOne(
        { _id: user._id },
        { $set: { resetToken, resetTokenExpiry } }
      );

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`
      });
    }

    // Always return 200
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const db = client.db('researchportal');
    const student = await db.collection('students').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    const faculty = (!student) ? await db.collection('faculty').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    }) : null;

    const user = student || faculty;
    const collectionName = student ? 'students' : 'faculty';

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection(collectionName).updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q, major, department } = req.query;
    const db = client.db('researchportal');
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (major) filter.requiredMajor = { $regex: major, $options: 'i' };
    if (department) filter.department = { $regex: department, $options: 'i' };

    const postings = await db.collection('postings').find(filter).sort({ createdAt: -1 }).toArray();
    res.status(200).json({ postings });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.post('/api/postings', verifyToken, async (req, res) => {
  if (req.user.userType !== 'faculty') {
    return res.status(403).json({ error: 'Only faculty can create postings' });
  }

  const { title, description, requiredMajor, capacity, department } = req.body;

  const newPosting = {
    title,
    description,
    requiredMajor,
    capacity,
    department,
    facultyUsername: req.user.username,
    createdAt: new Date(),
    applicantCount: 0
  };

  try {
    const db = client.db('researchportal');
    await db.collection('postings').insertOne(newPosting);
    res.status(200).json({ posting: newPosting, token: req.newToken });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.get('/api/postings/mine', verifyToken, async (req, res) => {
  try {
    const db = client.db('researchportal');
    const postings = await db.collection('postings')
      .find({ facultyUsername: req.user.username })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ postings, token: req.newToken });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.delete('/api/postings/:id', verifyToken, async (req, res) => {
  if (req.user.userType !== 'faculty') {
    return res.status(403).json({ error: 'Only faculty can delete postings' });
  }

  try {
    const db = client.db('researchportal');
    const result = await db.collection('postings').deleteOne({
      _id: new ObjectId(req.params.id),
      facultyUsername: req.user.username
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Posting not found or unauthorized' });
    }

    res.status(200).json({ token: req.newToken });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

app.post('/api/research/create', verifyToken, async (req, res, next) => {
  // incoming: title, description, college, isopen (optional: postedAt)
  // outgoing: error, research post object, newToken

  // Only allow faculty to create research posts
  if (req.user.userType !== 'faculty') {
    return res.status(403).json({ error: 'Only faculty can create research posts', token: req.newToken });
  }

  const { title, description, college, isopen } = req.body;
  const postedAt = req.body.postedAt || new Date().toISOString().split('T')[0];

  var error = '';

  // Validate required fields
  if (!title || !description || !college) {
    error = "Title, description, and college are required";
    return res.status(200).json({ error: error, token: req.newToken });
  }

  try {
    const db = client.db('researchportal');

    // Get faculty member's _id
    const faculty = await db.collection('faculty').findOne({ username: req.user.username });

    if (!faculty) {
      error = "Faculty not found";
      return res.status(200).json({ error: error, token: req.newToken });
    }

    // Create new research post linked to faculty's _id
    const newResearchPost = {
      facultyId: faculty._id,
      title: title,
      description: description,
      college: college,
      isOpen: isopen !== undefined ? isopen : true,
      postedAt: postedAt
    };

    const result = await db.collection('research').insertOne(newResearchPost);

    var ret = {
      error: error,
      researchPost: newResearchPost,
      postId: result.insertedId,
      token: req.newToken
    };
    res.status(200).json(ret);
  } catch (e) {
    error = e.toString();
    var ret = { error: error, token: req.newToken };
    res.status(200).json(ret);
  }
});

app.post('/api/applications/create', verifyToken, async (req, res, next) => {
  // incoming: researchId, statement (optional: status, appliedAt)
  // outgoing: error, application object, newToken

  // Only allow students to create applications
  if (req.user.userType !== 'student') {
    return res.status(403).json({ error: 'Only students can create applications', token: req.newToken });
  }

  const { researchId, statement } = req.body;
  const status = req.body.status || 'pending';
  const appliedAt = req.body.appliedAt || new Date().toISOString().split('T')[0];

  var error = '';

  // Validate required fields
  if (!researchId || !statement) {
    error = "researchId and statement are required";
    return res.status(200).json({ error: error, token: req.newToken });
  }

  try {
    const db = client.db('researchportal');
    const { ObjectId } = require('mongodb');

    // Get student's _id
    const student = await db.collection('students').findOne({ username: req.user.username });

    if (!student) {
      error = "Student not found";
      return res.status(200).json({ error: error, token: req.newToken });
    }

    // Verify research post exists
    const research = await db.collection('research').findOne({ _id: new ObjectId(researchId) });

    if (!research) {
      error = "Research post not found";
      return res.status(200).json({ error: error, token: req.newToken });
    }

    // Create new application linked to student and research post
    const newApplication = {
      researchId: new ObjectId(researchId),
      studentId: student._id,
      status: status,
      statement: statement,
      appliedAt: appliedAt
    };

    const result = await db.collection('applications').insertOne(newApplication);

    var ret = {
      error: error,
      application: newApplication,
      applicationId: result.insertedId,
      token: req.newToken
    };
    res.status(200).json(ret);
  } catch (e) {
    error = e.toString();
    var ret = { error: error, token: req.newToken };
    res.status(200).json(ret);
  }
});

async function start() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

start();
