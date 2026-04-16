const request = require('supertest');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

// 1. MOCK EVERYTHING BEFORE REQUIRING THE APP
jest.mock('mongodb');
jest.mock('jsonwebtoken');
jest.mock('@sendgrid/mail');

// 2. DEFINE THE MOCK DATABASE BEHAVIOR
const mockCollection = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([]), // Returns empty array by default
  sort: jest.fn().mockReturnThis(),
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
};

// Force the MongoClient mock to return our mockDb
MongoClient.prototype.db.mockReturnValue(mockDb);

// Force JWT to always succeed
jwt.verify.mockReturnValue({ username: 'testuser', userType: 'faculty' });
jwt.sign.mockReturnValue('mocked_new_token');

// 3. NOW REQUIRE THE APP
const { app } = require('./server');

describe('Research Portal API Basic Tests', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/edit/faculty', () => {
    it('should return 200 when update is successful', async () => {
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

      const res = await request(app)
        .patch('/api/edit/faculty')
        .set('Authorization', 'Bearer some.token')
        .send({ firstName: 'Dr. Smith' });

      expect(res.statusCode).toEqual(200);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });
  });

  describe('GET /api/search', () => {
    it('should return postings and status 200', async () => {
      // Mock some data coming back from the DB
      mockCollection.toArray.mockResolvedValueOnce([
        { title: 'AI Research', department: 'CS' }
      ]);

      const res = await request(app).get('/api/search?q=AI');

      expect(res.statusCode).toEqual(200);
      expect(res.body.postings).toHaveLength(1);
    });
  });
});