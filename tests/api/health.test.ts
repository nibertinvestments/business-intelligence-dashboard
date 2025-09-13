import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/health/route';

describe('/api/health', () => {
  it('should return health status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('environment');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('services');
  });
});