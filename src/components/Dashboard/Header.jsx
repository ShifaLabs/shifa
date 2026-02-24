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
        {/* <button
          className="p-2 text-slate-400 hover:text-primary transition-colors"
          onClick={toggleDarkMode}
        >
          <span className="material-icons-round">dark_mode</span>
        </button> */}

        {/* <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-icons-round">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </button> */}

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <p className="text-sm font-semibold">Dr. Aisha Rahman</p>
            <p className="text-xs text-slate-500">Cardiologist</p>
          </div>
          <img
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-primary"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcX4FKJNBA8zGlbz1I0JCFXeVoL4I5pBX84WST5yWd6aTQ8exfwGUsnhzWT-z9gHgTFPCcHYbIc2hTUn_FICigKLA-d7w76_tn_VRMgJOeacHa20RDY6cTCqkAyk0X4UYYTV58Xs6yr_11DfR0GhT9zUBD2RUpPhC3XioEGhiVbQwzd-YqwQn4p0msEOKoCxagGXpm6v6O3yt-8XOxCZyVjhvow4nzVDSO2IMAon744TkImr0fLjsoCofJcYc7-diFYQO9iAEgmI8u"
          />
        </div>
      </div>
    </header>
  );
}
