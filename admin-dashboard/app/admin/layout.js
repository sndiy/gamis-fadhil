// app/admin/layout.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (user && pathname === "/admin/login") {
        router.push("/admin/dashboard");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return children;
}
