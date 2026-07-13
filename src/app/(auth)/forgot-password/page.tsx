"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement password reset email via Resend/SendGrid
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Check your email</h1>
        <p className="text-sm text-gray-600">
          If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset
          link.
        </p>
        <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="you@reva.edu.in"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
