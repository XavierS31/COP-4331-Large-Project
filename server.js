const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());


const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://TheBeast:lxKpzZrrsfs3CzKu@researchportal.lvzvius.mongodb.net/?appName=ResearchPortal';

const client = new MongoClient(url);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

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


app.use((req, res, next) => 
{
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

app.post('/api/login', async (req, res, next) => 
{
  // incoming: login, password
  // outgoing: user data (student or faculty), userType, error
	
  var error = '';

  const { login, password } = req.body;
  const db = client.db('researchportal');

  // Check students table first
  const studentResults = await db.collection('students').find({username:login,password:password}).toArray();

  if( studentResults.length > 0 )
  {
    const token = jwt.sign(
      { username: studentResults[0].username, userType: 'student' },
      JWT_SECRET,
      { expiresIn: '30m' }
    );
    
    var ret = { 
      user: studentResults[0],
      userType: 'student',
      token: token,
      error: error
    };
    return res.status(200).json(ret);
  }

  // Check faculty table if student not found
  const facultyResults = await db.collection('faculty').find({username:login,password:password}).toArray();

  if( facultyResults.length > 0 )
  {
    const token = jwt.sign(
      { username: facultyResults[0].username, userType: 'faculty' },
      JWT_SECRET,
      { expiresIn: '30m' }
    );
    
    var ret = { 
      user: facultyResults[0],
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
    error: error
  };
  res.status(200).json(ret);
});


app.post('/api/signup/student', async (req, res, next) => {
  // incoming: firstName, lastName, login, password, ucfEmail, major, college
  // outgoing: error

  const { firstName, lastName, login, password, ucfEmail, major, college } = req.body;

  // Create a new student object with all database fields
  const newStudent = {
    firstName: firstName,
    lastName: lastName,
    username: login,
    password: password,
    ucfEmail: ucfEmail,
    major: major,
    college: college
  };

  var error = '';

  try {
    const db = client.db('researchportal');
    
    // Check if user already exists in students or faculty tables
    const existingStudent = await db.collection('students').find({ username: login }).toArray();
    const existingFaculty = await db.collection('faculty').find({ username: login }).toArray();
    
    if (existingStudent.length > 0 || existingFaculty.length > 0) {
      error = "User already exists";
    } else {
      await db.collection('students').insertOne(newStudent);
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

  // Create a new faculty object with all database fields
  const newFaculty = {
    firstName: firstName,
    lastName: lastName,
    username: login,
    password: password,
    email: email,
    role: role,
    department: department
  };

  var error = '';

  try {
    const db = client.db('researchportal');
    
    // Check if user already exists in students or faculty tables
    const existingStudent = await db.collection('students').find({ username: login }).toArray();
    const existingFaculty = await db.collection('faculty').find({ username: login }).toArray();
    
    if (existingStudent.length > 0 || existingFaculty.length > 0) {
      error = "User already exists";
    } else {
      await db.collection('faculty').insertOne(newFaculty);
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.patch('/api/edit/student', verifyToken, async (req, res, next) => {
  // incoming: username, and any fields to update (firstName, lastName, password, ucfEmail, major, college)
  // outgoing: error

  const { username, firstName, lastName, password, ucfEmail, major, college } = req.body;

  var error = '';

  if (!username) {
    error = "Username is required";
    return res.status(200).json({ error: error });
  }

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
  // incoming: username, and any fields to update (firstName, lastName, password, email, role, department)
  // outgoing: error

  const { username, firstName, lastName, password, email, role, department } = req.body;

  var error = '';

  if (!username) {
    error = "Username is required";
    return res.status(200).json({ error: error });
  }

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
  // incoming: username
  // outgoing: error

  const { username } = req.body;

  var error = '';

  if (!username) {
    error = "Username is required";
    return res.status(200).json({ error: error });
  }

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
  // incoming: username
  // outgoing: error

  const { username } = req.body;

  var error = '';

  if (!username) {
    error = "Username is required";
    return res.status(200).json({ error: error });
  }

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
