import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/Auth/auth.config";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Not logged in → login page
  if (!session) {
    redirect("/login");
  }

  // Role-based redirect
  const role = session?.user?.role;

  if (role === "doctor") {
    redirect("/dashboard/doctor");
  }

  if (role === "patient") {
    redirect("/dashboard/patient");
  }

  if (role === "admin") {
    redirect("/dashboard/admin");
  }

   
  redirect("/dashboard/profile");
}
 