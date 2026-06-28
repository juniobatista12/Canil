import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const superAdminEmail = process.env.E2E_SUPERADMIN_EMAIL ?? 'superadmin@localhost'

export function resetSuperAdminTwoFactor(): void {
  if (!process.env.CI) return

  const sql = `
UPDATE "AspNetUsers" SET "TwoFactorEnabled" = false WHERE "Email" = '${superAdminEmail}';
DELETE FROM "AspNetUserTokens"
WHERE "LoginProvider" = 'Authenticator'
  AND "UserId" IN (SELECT "Id" FROM "AspNetUsers" WHERE "Email" = '${superAdminEmail}');
`.trim()

  try {
    execSync(
      `docker compose --env-file .env.test exec -T db psql -U postgres -d jadmin -v ON_ERROR_STOP=1 <<'EOSQL'\n${sql}\nEOSQL`,
      { cwd: repoRoot, stdio: 'pipe', shell: '/bin/bash' },
    )
  } catch {
    // Best-effort — stack may be unavailable locally.
  }
}
