'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MapComponent from "../mappg/page";

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const state = "owner";

  useEffect(() => {
    console.log("role", session?.user?.role, "status", status);
    if (status === "unauthenticated") {
      router.push("/login");
    } 
    // else if (session?.user?.role !== "owner") {
    //   router.push("/unauthorized");
    // }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session?.user?.role === "owner") {
    return <MapComponent role={session?.user?.role} state={state}/>;
  }

  return null;
}
