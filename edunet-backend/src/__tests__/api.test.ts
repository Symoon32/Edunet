import request from 'supertest';
import app from '../app';

describe('API Basic Endpoints', () => {
  it('should return 200 OK for the root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Edunet API - backend');
  });

  it('should return 200 OK for /api endpoint', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Edunet API - raíz de API');
  });
});
