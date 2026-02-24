"use client";
import Logo from "../Navigation/Shared/Logo/Logo";

export default function Sidebar({ navItems }) {
  return (
    <aside className="w-64 bg-sidebar-light dark:bg-sidebar-dark flex flex-col border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="p-6 flex items-center gap-2">
        <Logo width={100} height={100} text="text-4xl" />
      </div>

      <nav className="flex-1 px-6 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              item.active
                ? "bg-white dark:bg-slate-700 text-primary font-semibold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800"
            }`}
            href={item.href || "#"}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-blue-500/10 dark:bg-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
          <span className="material-icons-round text-primary text-5xl opacity-20 absolute -right-2 -bottom-2">
            add_circle
          </span>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            Pro Plan
          </p>
          <p className="text-sm font-medium mb-4">
            Get unlimited access to all features.
          </p>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
