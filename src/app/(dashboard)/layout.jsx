import Header from "@/components/Dashboard/Header";
import Sidebar from "@/components/Dashboard/Sidebar";

export const metadata = {
  title: "Dashboard - Shifa Healthcare",
  description: "Healthcare Management Dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex transition-colors duration-200 ">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
