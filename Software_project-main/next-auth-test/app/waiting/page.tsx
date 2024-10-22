'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WaitingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role && session.user.role !== "pending") {
      router.push("/dashboard"); // or wherever non-pending users should go
    }
  }, [session, status, router]);

  const handleBackClick = () => {
    router.push("/"); // Navigate to the home page
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
        <p className="text-gray-600 mb-4">
          Your account is currently pending. Please wait until the owner assigns you a role.
        </p>
        <p className="text-gray-600 mb-6">
          Check back later or contact the administrator for more information.
        </p>
        <button
          onClick={handleBackClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
