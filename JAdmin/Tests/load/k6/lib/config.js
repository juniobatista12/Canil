export const webBaseUrl = __ENV.K6_WEB_BASE_URL || 'http://localhost';
export const email = __ENV.SEED_ADMIN_EMAIL || 'admin@localhost';
export const password = __ENV.SEED_ADMIN_PASSWORD || 'Admin@123!';

export const vus = Number(__ENV.K6_VUS || 10);
export const duration = __ENV.K6_DURATION || '1m';
