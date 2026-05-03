import { UsersList } from "@/components/users/users-list"

export const metadata = {
  title: "Users — WorkfitAI Admin",
  description: "Manage platform users",
}

export default function UsersPage() {
  return <UsersList />
}
