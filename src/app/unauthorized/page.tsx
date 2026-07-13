import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">403</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-600">
          You don&apos;t have permission to access this page.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
