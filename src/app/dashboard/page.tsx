"use client";

import { useSession } from "next-auth/react";
import Loading from "../loading";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("status:", status);
  console.log("session:", session);

  if (status === "loading") return <Loading />;
  if (session.user.role === "patient") {
    router.push("/dashboard/patient");
  }
  if (session.user.role === "doctor") {
    router.push("/dashboard/doctor");
  }
};

export default Dashboard;
