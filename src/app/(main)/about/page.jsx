import { authOptions } from "../../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import React from "react";

async function page() {
  const session = await getServerSession(authOptions);
  console.log("session", session);
  return <div>page</div>;
}

export default page;
