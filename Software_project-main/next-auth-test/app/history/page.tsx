'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DriverMapComponent from "../../components/AdminHistoryComponent";

export default function DriverDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const state = "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } 
    // else if (session?.user?.role !== "driver") {
    //   router.push("/unauthorized");
    // }
  }, [session, status, router]);

  console.log("session >>> ", session);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session?.user?.role === "admin") {
      return <DriverMapComponent role={session?.user?.role} state={state}/>;
  }else{
    router.push("/login");
  }

  return null;
}