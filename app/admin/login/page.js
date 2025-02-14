"use client";

import { useState } from "react";
import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2, LogIn } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      Cookies.set("session", token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
      });

      router.push("/admin/dashboard");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-emerald-100">
              <LogIn className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-gray-600">Access your admin dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Forgot password?{" "}
          <a
            href="https://shopee.co.id/fadhila_store"
            target="_blank"
            className="text-emerald-600 hover:underline"
          >
            Contact admin
          </a>
        </p>
      </div>
    </div>
  );
}
