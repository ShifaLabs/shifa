import DashboardShell from "@/components/Dashboard/DashboardShell";
import { getServerSession } from "next-auth";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession();

  if (!session) redirect("/login");

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
