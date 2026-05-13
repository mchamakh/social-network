import Link from "next/link";
import { FiBell, FiSettings, FiUsers, FiUser, FiHome } from "react-icons/fi";

// TODO: receive user prop from parent once auth is connected
export default function Sidebar() {
  return (
    <div className="flex flex-col w-48 min-h-screen bg-white px-4 py-6 gap-8">

      {/* User card */}
      <div className="flex items-center gap-3 px-2 pt-2">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <FiUser size={18} className="text-gray-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-black truncate">Username</p>
          <p className="text-xs text-gray-400 truncate">@handle</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
          Main
        </p>
        <nav className="flex flex-col gap-1">
          <Link
            href="/feed"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors"
          >
            <FiHome size={18} />
            <span className="text-sm font-medium">Feed</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors"
          >
            <FiUser size={18} />
            <span className="text-sm font-medium">Profile</span>
          </Link>
          <Link
            href="/groups"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors"
          >
            <FiUsers size={18} />
            <span className="text-sm font-medium">Groups</span>
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
          Settings
        </p>
        <nav className="flex flex-col gap-1">
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors"
          >
            <FiBell size={18} />
            <span className="text-sm font-medium">Notification</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors"
          >
            <FiSettings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
