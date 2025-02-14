"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = Cookies.get("session");
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        Cookies.remove("session");
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return children;
}
