"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiBell, FiSettings, FiUsers, FiUser, FiHome, FiLogOut } from "react-icons/fi";

type Props = {
  username?: string;
};

export default function Sidebar({ username = "User" }: Props) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col w-48 min-h-screen bg-white px-4 py-6 gap-8">
      {/* User */}
      <div className="flex items-center gap-3 pt-2 px-1">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-gray-500">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-semibold text-black truncate">{username}</p>
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
      <div className="mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors w-full">
          <FiLogOut size={18} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
