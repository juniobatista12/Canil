/** Matches detail routes with a GUID id (excludes `/users/register`, etc.). */
export const guidPath = (segment: 'users') =>
  new RegExp(`/${segment}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`, 'i')
