export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          REVA Research Intelligence Portal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive Research Ecosystem Management Platform
        </p>
        <div className="flex gap-4 justify-center">
          <div className="bg-white rounded-lg shadow-md p-6 text-left">
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              Welcome to RRIP
            </h2>
            <p className="text-gray-700">
              A modern platform for managing research, innovation, consultancy, 
              patents, and doctoral programs at REVA University.
            </p>
          </div>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          Built with Next.js 15 • React 19 • TypeScript
        </div>
      </div>
    </div>
  );
}
