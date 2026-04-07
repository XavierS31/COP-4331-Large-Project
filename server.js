require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { MongoClient, ObjectId } = require('mongodb');

// Step 1: Initialize SendGrid API
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
const JWT_SECRET = process.env.JWT_SECRET;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
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

// --- AUTH ROUTES ---

app.post('/api/login', async (req, res) => {
  console.log('[LOGIN] req.body received:', JSON.stringify(req.body));
  const { login, password } = req.body;
  const db = client.db('researchportal');

  const student = await db.collection('students').findOne({ username: login });
  const faculty = !student ? await db.collection('faculty').findOne({ username: login }) : null;
  const user = student || faculty;
  const type = student ? 'student' : 'faculty';

  if (!user) {
    console.log(`[LOGIN] No user found for username: "${login}"`);
    return res.status(200).json({ user: null, error: 'User not found in database' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log(`[LOGIN] bcrypt.compare result for "${login}": ${passwordMatch}`);
  if (!passwordMatch) {
    return res.status(200).json({ user: null, error: 'Incorrect password' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ error: 'Please verify your email before logging in.' });
  }

  const token = jwt.sign({ username: user.username, userType: type }, JWT_SECRET, { expiresIn: '30m' });
  res.status(200).json({ user, userType: type, token });
});

app.post('/api/signup/student', async (req, res) => {
  const { firstName, lastName, login, password, ucfEmail, major, college } = req.body;
  try {
    const db = client.db('researchportal');
    const existing = await db.collection('students').findOne({ username: login });
    if (existing) return res.status(200).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const vToken = crypto.randomBytes(32).toString('hex');

    await db.collection('students').insertOne({
      firstName, lastName, username: login, password: hashedPassword,
      ucfEmail, major, college, isVerified: false, verificationToken: vToken
    });

    const verifyLink = `${process.env.BASE_URL}/api/verify-email?token=${vToken}`;
    
    // Step 2: Send via SendGrid API
    await sgMail.send({
      to: ucfEmail,
      from: process.env.EMAIL_USER, // Your verified sender
      subject: '[Research Portal] Verify your email',
      html: `<p>Please verify your email by clicking <a href="${verifyLink}">here</a>.</p>`
    });

    res.status(200).json({ error: '' });
  } catch (e) {
    res.status(200).json({ error: e.toString() });
  }
});

app.post('/api/signup/faculty', async (req, res) => {
  const { firstName, lastName, login, password, email, role, department } = req.body;
  try {
    const db = client.db('researchportal');
    const existing = await db.collection('faculty').findOne({ username: login });
    if (existing) return res.status(200).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const vToken = crypto.randomBytes(32).toString('hex');

    await db.collection('faculty').insertOne({
      firstName, lastName, username: login, password: hashedPassword,
      email, role, department, isVerified: false, verificationToken: vToken
    });

    const verifyLink = `${process.env.BASE_URL}/api/verify-email?token=${vToken}`;
    
    // Step 3: Send via SendGrid API (Fixed variable: 'email')
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_USER,
      subject: '[Research Portal] Verify your faculty account',
      html: `<p>Please verify your email by clicking <a href="${verifyLink}">here</a>.</p>`
    });

    res.status(200).json({ error: '' });
  } catch (e) {
    res.status(200).json({ error: e.toString() });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const db = client.db('researchportal');
    const student = await db.collection('students').findOne({ ucfEmail: email });
    const faculty = !student ? await db.collection('faculty').findOne({ email: email }) : null;
    const user = student || faculty;

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await db.collection(student ? 'students' : 'faculty').updateOne(
        { _id: user._id },
        { $set: { resetToken, resetTokenExpiry: Date.now() + 3600000 } }
      );

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      // Step 4: Send via SendGrid API
      await sgMail.send({
        to: email,
        from: process.env.EMAIL_USER,
        subject: '[Research Portal] Password Reset',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
      });
    }
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
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
  const db = client.db('researchportal');
  const student = await db.collection('students').findOne({ verificationToken: token });
  const faculty = !student ? await db.collection('faculty').findOne({ verificationToken: token }) : null;
  const user = student || faculty;

  if (user) {
    await db.collection(student ? 'students' : 'faculty').updateOne(
      { _id: user._id },
      { $set: { isVerified: true }, $unset: { verificationToken: "" } }
    );
    return res.redirect(`${process.env.FRONTEND_URL}/?verified=true`);
  }
  res.status(400).send('Invalid or expired token');
});

app.get('/api/search', async (req, res) => {
  const { q, major, department } = req.query;
  const db = client.db('researchportal');
  const filter = {};
  if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
  if (major) filter.requiredMajor = { $regex: major, $options: 'i' };
  if (department) filter.department = { $regex: department, $options: 'i' };

  const postings = await db.collection('postings').find(filter).sort({ createdAt: -1 }).toArray();
  res.status(200).json({ postings });
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
    const research = await db.collection('postings').findOne({ _id: new ObjectId(researchId) });

    if (!research) {
      error = "Posting not found";
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

// Start Server
async function start() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    app.listen(5000, () => console.log('Server running on port 5000'));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
start();