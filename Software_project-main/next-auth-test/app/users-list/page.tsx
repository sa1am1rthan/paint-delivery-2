'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OwnerMapComponent from "../../components/UserListComponent";

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
    return <OwnerMapComponent role={session?.user?.role} state={state}/>;
  }else{
    router.push("/login");
  }

  return null;
}
