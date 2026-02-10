import request from 'supertest';
import app from '../app';
import * as db from '../db/connection';

jest.mock('../db/connection', () => ({
  connectDB: jest.fn()
}));

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 1, correo: 'admin@test.com', rol: 4 };
    next();
  },
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 1, correo: 'admin@test.com', rol: 4 };
    next();
  }
}));

jest.mock('../middleware/authorize', () => ({
  authorizeRoles: () => (req: any, res: any, next: any) => next(),
  authorize: () => (req: any, res: any, next: any) => next()
}));

describe('Users API', () => {
  let mockConn: any;

  beforeEach(() => {
    mockConn = { execute: jest.fn(), release: jest.fn() };
    (db.connectDB as jest.Mock).mockResolvedValue(mockConn);
  });

  it('should list users', async () => {
    mockConn.execute.mockResolvedValue([[{ idUsuarios: 1 }], null]);
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
