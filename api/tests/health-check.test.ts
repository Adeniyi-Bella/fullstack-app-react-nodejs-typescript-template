import request from 'supertest';
import { app } from '@/app';

describe('Health check', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
  });
});
