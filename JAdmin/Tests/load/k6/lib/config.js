export const webBaseUrl = __ENV.K6_WEB_BASE_URL || 'http://localhost';
export const tenantSlug = __ENV.SEED_TENANT_SLUG || 'system';
export const email = __ENV.SEED_SUPERADMIN_EMAIL || 'superadmin@localhost';
export const password = __ENV.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123!';

export const vus = Number(__ENV.K6_VUS || 10);
export const duration = __ENV.K6_DURATION || '1m';
