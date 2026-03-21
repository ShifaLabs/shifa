import DashboardShell from "@/modules/dashboard/components/DashboardShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardShell>{children}</DashboardShell>;
}
