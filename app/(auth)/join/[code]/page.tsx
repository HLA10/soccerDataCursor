"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirect to invite page if this route is accessed
    // The join/[code] route might be legacy - redirect to invite/[token]
    router.push("/")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Redirecting...</div>
    </div>
  )
}

