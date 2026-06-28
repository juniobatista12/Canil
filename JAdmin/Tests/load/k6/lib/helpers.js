import { check } from 'k6';

export function checkOk(res, label) {
  check(res, {
    [`${label} 2xx`: (r) => r.status >= 200 && r.status < 300,
  });
}
