'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DriverMapComponent from "../../components/DriverMapComponent";

export default function DriverDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const state = "driver";

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

  if (session?.user?.role === "driver") {
      return <DriverMapComponent role={session?.user?.role} state={state}/>;
  }

  return null;
}