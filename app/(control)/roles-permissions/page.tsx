import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { RolesPermissionsClient } from "@/components/roles/roles-permissions-client"

export const metadata = { title: "Roles & Permissions — WorkfitAI" }

export default async function RolesPermissionsPage() {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get("auth_session")?.value
  if (!cookieValue) redirect("/login")

  const session = JSON.parse(decodeURIComponent(cookieValue))
  const roles: string[] = session.roles ?? []

  // Middleware already blocks non-Admin, but explicit guard as defence-in-depth
  if (!roles.includes("ROLE_ADMIN")) {
    redirect("/dashboard")
  }

  return <RolesPermissionsClient isAdmin={true} />
}
