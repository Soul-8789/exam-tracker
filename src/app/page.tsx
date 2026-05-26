import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const { userId } = await auth()

  // Signed in → go straight to dashboard
  if (userId) redirect("/dashboard")

  // Not signed in → show landing / go to sign-in
  redirect("/sign-in")
}