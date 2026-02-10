import request from 'supertest';
import app from '../app';
import * as db from '../db/connection';

jest.mock('../db/connection', () => ({
  connectDB: jest.fn()
}));

describe('Auth Controller (Unit Test)', () => {
  let mockConn: any;

  beforeEach(() => {
    mockConn = { execute: jest.fn(), release: jest.fn() };
    (db.connectDB as jest.Mock).mockResolvedValue(mockConn);
  });

  it('should return 400 if email or password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ correo: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  it('should return 401 if user is not found', async () => {
    mockConn.execute.mockResolvedValue([[], null]);
    const res = await request(app).post('/api/auth/login').send({ correo: 'not@found.com', password: '123' });
    expect(res.status).toBe(401);
  });
});
