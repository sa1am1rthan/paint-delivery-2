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
    return <div className="flex items-center justify-center min-h-screen bg-blue-100">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="p-12 bg-gray-100 shadow-2xl rounded-xl text-center max-w-lg w-full flex flex-col items-center justify-center" style={{ height: '600px' }}>
        <h1 className="text-3xl font-bold mb-6 text-gray-800" style={{ marginBottom: '20px' }}>Account Pending Approval....</h1>
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Your account is currently pending. Please wait until the owner assigns you a role.
          </p>
          <p className="text-gray-600 text-center">
            Check back later or contact the administrator for more information.
          </p>
        </div>
        <button 
          style={{ marginTop: '20px' }}
          onClick={handleBackClick}
          className="mt-8 bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
