// AdminLayout.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Cookies from "js-cookie";

export default function AdminLayout({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        Cookies.set("session", "true");
        setUser(currentUser);
      } else {
        Cookies.remove("session");
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Only show loading state while auth is being checked
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return children;
  }

  return <ProtectedRoute user={user}>{children}</ProtectedRoute>;
}
