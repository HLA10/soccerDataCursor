import { redirect } from "next/navigation"

export default function Home() {
  // Simple redirect to login - let client-side handle session check
  redirect("/login")
}

