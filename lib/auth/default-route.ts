// Default landing route after login or after being denied a restricted route, by role.
export function getDefaultRouteForRoles(roles: string[]): string {
  if (roles.includes("ROLE_ADMIN") || roles.includes("ROLE_HR_MANAGER")) return "/dashboard"
  if (roles.includes("ROLE_HR")) return "/applications/my"
  return "/"
}
