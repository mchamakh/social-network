"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiMessageCircle,
  FiHeart,
  FiShare2,
  FiSend,
  FiUsers,
  FiMessageSquare,
} from "react-icons/fi";

const WORDS = ["Social", "Friends", "Vibes", "Moments"];

const floatStyle = (duration: string, delay: string) => ({
  animation: `float-a ${duration} ease-in-out infinite`,
  animationDelay: delay,
});

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 5% 50%, #93c5fd 0%, #bfdbfe 25%, white 55%), radial-gradient(ellipse at 95% 50%, #93c5fd 0%, #bfdbfe 30%, white 60%)",
      }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 -left-20 h-125 w-125 rounded-full bg-blue-300"
          style={{
            animation: "blob1 7s ease-in-out infinite",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute bottom-0 left-10 h-88 w-88 rounded-full bg-blue-200"
          style={{
            animation: "blob3 6s ease-in-out infinite",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute top-1/4 -right-10 h-125 w-125 rounded-full bg-blue-300"
          style={{
            animation: "blob2 8s ease-in-out infinite",
            filter: "blur(70px)",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <img src="/logo.png" alt="logo" className="h-12 w-auto" />
        <div className="flex items-center gap-4">
          <Link
            href="/register"
            className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors text-sm"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="text-black font-medium hover:opacity-70 transition-opacity text-sm"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Post card — Léa (top left) */}
      <div
        className="absolute top-28 left-14 z-10"
        style={floatStyle("4s", "0s")}
      >
        <div
          className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] p-4 w-60"
          style={{ transform: "rotate(-3deg)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-blue-400">D</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Dempele</p>
              <p className="text-xs text-gray-400">@dembouz</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-2">Match day ! ⚽</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FiHeart size={12} /> 248
            </span>
            <span className="flex items-center gap-1">
              <FiMessageCircle size={12} /> 18
            </span>
          </div>
        </div>
      </div>

      {/* Trending pill */}
      <div
        className="absolute top-78 left-78 z-10"
        style={floatStyle("5.5s", "1.2s")}
      >
        <div
          className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] px-4 py-2 flex items-center gap-2"
          style={{ transform: "rotate(-2deg)" }}
        >
          <FiMessageSquare size={14} className="text-orange-400" />
          <span className="text-xs font-medium text-gray-700">Comment</span>
        </div>
      </div>

      {/* Shared pill */}
      <div
        className="absolute top-118 left-56 z-10"
        style={floatStyle("3.5s", "0.5s")}
      >
        <div
          className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] px-4 py-2 flex items-center gap-2"
          style={{ transform: "rotate(3deg)" }}
        >
          <FiShare2 size={14} className="text-blue-400" />
          <span className="text-xs font-medium text-gray-700">Shared</span>
        </div>
      </div>

      {/* Sent pill */}
      <div
        className="absolute top-152 left-16 z-10"
        style={floatStyle("6s", "2s")}
      >
        <div
          className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] px-4 py-2 flex items-center gap-2"
          style={{ transform: "rotate(-1.5deg)" }}
        >
          <FiSend size={14} className="text-green-400" />
          <span className="text-xs font-medium text-gray-700">Sent</span>
        </div>
      </div>

      {/* Saved pill */}
      <div
        className="absolute top-26 right-14 z-10"
        style={floatStyle("5s", "0.8s")}
      >
        <div
          className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] px-4 py-2 flex items-center gap-2"
          style={{ transform: "rotate(2deg)" }}
        >
          <FiUsers size={14} className="text-purple-400" />
          <span className="text-xs font-medium text-gray-700">Groups</span>
        </div>
      </div>

      {/* +128 likes pill */}
      <div
        className="absolute top-54 right-44 z-10"
        style={floatStyle("4.5s", "1.8s")}
      >
        <div
          className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] px-4 py-2 flex items-center gap-2"
          style={{ transform: "rotate(-2.5deg)" }}
        >
          <FiHeart size={14} className="text-rose-400" />
          <span className="text-xs font-medium text-gray-700">+128</span>
        </div>
      </div>

      {/* New message pill */}
      <div
        className="absolute top-86 right-60 z-10"
        style={floatStyle("3.8s", "0.3s")}
      >
        <div
          className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] px-4 py-2 flex items-center gap-2"
          style={{ transform: "rotate(1.5deg)" }}
        >
          <FiMessageCircle size={14} className="text-blue-400" />
          <span className="text-xs font-medium text-gray-700">New message</span>
        </div>
      </div>

      {/* Post card — Marcus (bottom right) */}
      <div
        className="absolute top-128 right-14 z-10"
        style={floatStyle("5.2s", "1s")}
      >
        <div
          className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.0.2)] p-4 w-60"
          style={{ transform: "rotate(2.5deg)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-fuchsia-200 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-fuchsia-400">M</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Mpyvii</p>
              <p className="text-xs text-gray-400">@mpyv_i</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-2">Can't sleep again 🌙</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FiHeart size={12} /> 132
            </span>
            <span className="flex items-center gap-1">
              <FiMessageCircle size={12} /> 9
            </span>
          </div>
        </div>
      </div>

      {/* Hero — adjust top/left to reposition */}
      <div
        className="absolute z-10 flex flex-col items-center gap-5 text-center"
        style={{ top: "280px", left: "50%", transform: "translateX(-50%)" }}
      >
        <h1
          className="text-6xl text-black font-(family-name:--font-domine) leading-tight whitespace-nowrap"
          style={{ marginLeft: "12rem" }}
        >
          Welcome on{" "}
          <span
            className="text-blue-300 inline-block"
            style={{
              minWidth: "9ch",
              textAlign: "left",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0px)" : "translateY(10px)",
            }}
          >
            {WORDS[wordIndex]}
          </span>
        </h1>
        <p className="text-gray-500 text-base max-w-sm">
          Connect, share, and discover people who are just like you.
        </p>
        <Link
          href="/register"
          className="mt-2 bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors"
        >
          Create your account !
        </Link>
      </div>
    </div>
  );
}
