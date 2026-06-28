import http from 'k6/http';
import { sleep } from 'k6';
import { vus, duration } from '../lib/config.js';
import { loginWeb, getUsersWeb, getMeWeb } from '../lib/auth.js';
import { checkOk } from '../lib/helpers.js';

export const options = {
  vus,
  duration,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1200'],
    'http_req_duration{name:login}': ['p(95)<800'],
  },
};

export default function () {
  const jar = new http.CookieJar();
  loginWeb(jar);
  checkOk(getUsersWeb(jar), 'users');
  checkOk(getMeWeb(jar), 'me');
  sleep(1);
}
