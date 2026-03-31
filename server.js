const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://TheBeast:lxKpzZrrsfs3CzKu@researchportal.lvzvius.mongodb.net/?appName=ResearchPortal';

const client = new MongoClient(url);

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

app.post('/api/addcard', async (req, res, next) =>
{
  // incoming: userId, color
  // outgoing: error
	
  const { userId, card } = req.body;

  const newCard = {Card:card,UserId:userId};
  var error = '';

  try
  {
    const db = client.db('COP4331Cards');
    const result = db.collection('Cards').insertOne(newCard);
  }
  catch(e)
  {
    error = e.toString();
  }

  cardList.push( card );

  var ret = { error: error };
  res.status(200).json(ret);
});


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
    var ret = { 
      user: studentResults[0],
      userType: 'student',
      error: error
    };
    return res.status(200).json(ret);
  }

  // Check faculty table if student not found
  const facultyResults = await db.collection('faculty').find({username:login,password:password}).toArray();

  if( facultyResults.length > 0 )
  {
    var ret = { 
      user: facultyResults[0],
      userType: 'faculty',
      error: error
    };
    return res.status(200).json(ret);
  }

  // No user found in either table
  var ret = { 
    user: null,
    userType: null,
    error: error
  };
  res.status(200).json(ret);
});


app.post('/api/searchcards', async (req, res, next) => 
{
  // incoming: userId, search
  // outgoing: results[], error

  var error = '';

  const { userId, search } = req.body;

  var _search = search.trim();
  
  const db = client.db('COP4331Cards');
  const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'i'}}).toArray();
  
  var _ret = [];
  for( var i=0; i<results.length; i++ )
  {
    _ret.push( results[i].Card );
  }
  
  var ret = {results:_ret, error:error};
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
