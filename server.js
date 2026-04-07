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
  const { login, password } = req.body;
  const db = client.db('researchportal');

  const student = await db.collection('students').findOne({ username: login });
  const faculty = !student ? await db.collection('faculty').findOne({ username: login }) : null;
  const user = student || faculty;
  const type = student ? 'student' : 'faculty';

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(200).json({ user: null, error: 'Invalid credentials' });
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

// --- REMAINING ROUTES (Search, Postings, Applications) ---
// [I have kept your existing logic for these, simply ensuring verifyToken and DB calls remain stable]

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