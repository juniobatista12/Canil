import { resetAdminTwoFactor } from './helpers/reset-2fa'

export default async function globalSetup(): Promise<void> {
  resetAdminTwoFactor()
}
