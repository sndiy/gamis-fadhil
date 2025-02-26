"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  // Improved session check with failsafe
  const checkSession = useCallback(async () => {
    const sessionCookie = Cookies.get("session");

    if (sessionCookie) {
      try {
        // Check if we can load dashboard directly
        await router.push("/admin/dashboard");

        // This will execute only if navigation fails (we're still on this page)
        setTimeout(() => {
          // If we're still here after 1s, we failed to navigate
          if (window.location.pathname.includes("/admin/login")) {
            console.log("Navigation failed, staying on login page");
            Cookies.remove("session");
            setInitializing(false);
          }
        }, 1000);
      } catch (error) {
        console.error("Session navigation error:", error);
        Cookies.remove("session");
        setInitializing(false);
      }
    } else {
      setInitializing(false);
    }
  }, [router]);

  // Initial session check
  useEffect(() => {
    checkSession();

    // Failsafe: never stay in initializing state for more than 3 seconds
    const timeout = setTimeout(() => {
      if (initializing) {
        console.warn("Forcing exit from initializing state after timeout");
        setInitializing(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [checkSession, initializing]);

  // Safety mechanism to prevent indefinite loading during login
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        setError("Login timed out. Please try again.");
      }, 8000); // 8 second timeout

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // Perform login with timeout
      const loginPromise = signInWithEmailAndPassword(auth, email, password);
      const loginTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login timed out")), 8000)
      );

      const userCredential = await Promise.race([loginPromise, loginTimeout]);

      // Get token with timeout
      const tokenPromise = userCredential.user.getIdToken();
      const tokenTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Token retrieval timed out")), 5000)
      );

      const token = await Promise.race([tokenPromise, tokenTimeout]);

      // Set cookie and navigate
      Cookies.set("session", token, {
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      });

      router.push("/admin/dashboard");

      // Add a fail-safe for navigation
      setTimeout(() => {
        if (loading) {
          setLoading(false);

          if (window.location.pathname.includes("/admin/login")) {
            // Try an alternative navigation approach
            window.location.href = "/admin/dashboard";
          }
        }
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage;
      if (
        error.message === "Login timed out" ||
        error.message === "Token retrieval timed out"
      ) {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed login attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = `Login failed: ${
          error.message || "Unknown error occurred"
        }`;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  // Show loading screen while checking authentication state
  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mb-4" />
        <p className="text-gray-600">Checking login status...</p>
      </div>
    );
  }

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
              disabled={loading}
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
              disabled={loading}
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
