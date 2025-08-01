import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginUser } from "../services/authAPI";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const LoginUser = async (e) => {
     try {
      e.preventDefault();
      const userData = { email,password };
      const data = await loginUser(userData);
      if(data.status === "success"){
        toast.success("Logged in successfully");
        navigate("/dashboard");
      } else{
        toast(data.message);
      }
    } catch (err) {
      toast("We are facing some technical issues");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white shadow-md rounded-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          All-stop Retail Banking Solution
        </h1>

        <form className="space-y-5" onSubmit={(e) => LoginUser(e)}>
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Email ID
            </label>
            <input
              type="text"
              placeholder="Enter your Email ID"
              className="w-full px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Register CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-800">
            New user?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Click here to register
            </Link>
          </p>
        </div>
        <ToastContainer></ToastContainer>
        {/* {error && <ErrorModal message={error} onClose={() => setError("")} />} - structure definition */}
      </div>
    </div>
  );
}
