"use client";

import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session, status } = useSession();

  console.log("status:", status);
  console.log("session:", session);

  if (status === "loading") return <p>Loading...</p>;

  return <div>this is Dashboard home</div>;
};

export default Dashboard;
