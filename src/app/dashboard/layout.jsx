// import DashboardShell from "@/components/Dashboard/DashboardShell";
// import DashboardPage from "@/components/Dashboard/demo/dashboard";
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";

// export default async function DashboardLayout({ children }) {
//   const session = await getServerSession();

//   if (!session) redirect("/login");

//   return <DashboardShell session={session}>{children}</DashboardShell>;
//   // return <DashboardPage />;
// }



// import DashboardShell from "@/components/Dashboard/DashboardShell";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/features/Auth/auth.config";
// import { redirect } from "next/navigation";

// export default async function DashboardLayout({ children }) {
//   const session = await getServerSession(authOptions);
//   if (!session) redirect("/login");

//   return <DashboardShell>{children}</DashboardShell>;
// }



import DashboardShell from "@/components/Dashboard/DashboardShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardShell>{children}</DashboardShell>;
}