import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white shadow-md rounded-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-blue-700 mb-1 text-center">
          Welcome to Retail Banking
        </h1>
        <p className="text-sm text-blue-600 mb-6 text-center">
          Please fill out the details to register
        </p>

        <form className="space-y-5">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              User ID
            </label>
            <input
              type="text"
              placeholder="Enter your User ID"
              className="w-full px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Email ID
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Re-enter Password */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Re-enter Password
            </label>
            <input
              type="password"
              placeholder="Re-enter your password"
              className="w-full px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Upload Profile Picture
            </label>
            <input
              type="file"
              className="block w-full text-sm text-blue-900 border border-blue-300 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
