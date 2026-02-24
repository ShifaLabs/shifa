import UserProfileDropdown from "../Navigation/Shared/user-profile-dropdown";

export default function Header({ session }) {
  return (
    <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-md sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl w-96">
        <span className="material-icons-round text-slate-400 text-xl mr-2">
          search
        </span>
        <input
          className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none"
          placeholder="Search appointments, patients..."
          type="text"
        />
      </div>

      <div className="flex items-center gap-6">
        <UserProfileDropdown user={session.user} />
      </div>
    </header>
  );
}
