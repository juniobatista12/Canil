/** Matches detail routes with a GUID id (excludes `/users/register`, `/tenants/new`, etc.). */
export const guidPath = (segment: 'users' | 'tenants') =>
  new RegExp(`/${segment}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`, 'i')
