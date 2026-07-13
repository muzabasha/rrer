"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/actions/auth.actions"

const departments = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotechnology",
  "Management",
  "Law",
  "Pharmacy",
  "Nursing",
  "Architecture",
  "Design",
  "Arts & Humanities",
  "Sciences",
]

const schools = [
  "School of Engineering & Technology",
  "School of Computer Science & Engineering",
  "School of Management & Business Studies",
  "School of Law",
  "School of Pharmacy",
  "School of Nursing",
  "School of Architecture",
  "School of Design",
  "School of Arts, Humanities & Social Sciences",
  "School of Sciences",
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    school: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError("")
    setErrors({})

    const fieldErrors: Record<string, string> = {}
    if (form.name.length < 2) fieldErrors.name = "Name must be at least 2 characters"
    if (!form.email.includes("@")) fieldErrors.email = "Invalid email"
    if (form.password.length < 8) fieldErrors.password = "Must be at least 8 characters"
    if (form.password !== form.confirmPassword)
      fieldErrors.confirmPassword = "Passwords do not match"
    if (!form.department) fieldErrors.department = "Select a department"
    if (!form.school) fieldErrors.school = "Select a school"

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const result = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        school: form.school,
      })

      if (result.success) {
        router.push("/login?registered=true")
      } else {
        setErrors(result.error || {})
        setServerError("Registration failed. Please try again.")
      }
    } catch {
      setServerError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Register for the REVA Research Intelligence Portal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
            placeholder="you@reva.edu.in"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => updateForm("password", e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.password ? "border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => updateForm("confirmPassword", e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.confirmPassword
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="school" className="block text-sm font-medium text-gray-700">
            School
          </label>
          <select
            id="school"
            value={form.school}
            onChange={(e) => updateForm("school", e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.school ? "border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          >
            <option value="">Select school</option>
            {schools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.school && <p className="mt-1 text-xs text-red-600">{errors.school}</p>}
        </div>

        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700"
          >
            Department
          </label>
          <select
            id="department"
            value={form.department}
            onChange={(e) => updateForm("department", e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.department ? "border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="mt-1 text-xs text-red-600">{errors.department}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
