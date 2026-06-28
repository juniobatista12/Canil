import http from 'k6/http';
import { check } from 'k6';
import { webBaseUrl, tenantSlug, email, password } from './config.js';

export function loginWeb(jar) {
  const res = http.post(
    `${webBaseUrl}/api/auth/login`,
    JSON.stringify({ email, password, tenantSlug }),
    {
      jar,
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login' },
    },
  );
  check(res, { 'login 200': (r) => r.status === 200 });
  return jar;
}

export function getUsersWeb(jar) {
  return http.get(`${webBaseUrl}/api/users?page=1&pageSize=20`, {
    jar,
    tags: { name: 'users' },
  });
}

export function getMeWeb(jar) {
  return http.get(`${webBaseUrl}/api/auth/me`, {
    jar,
    tags: { name: 'me' },
  });
}
