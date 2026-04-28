import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/homebg.jpeg')" }}
    >
      <nav className="flex items-center justify-between px-8 py-6">
        <img src="/logo.png" alt="logo" className="h-15 w-auto" />
        <div className="flex items-center gap-4">
          <Link
            href={"/register"}
            className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors"
          >
            Sign up
          </Link>
          <Link
            href={"/login"}
            className="text-black font-medium hover:opacity-70 transition-opacity"
          >
            Sign in
          </Link>
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center mt-48 gap-4 text-center">
        <h1 className="text-6xl text-black font-(family-name:--font-domine)">
          Welcome on <span className="text-blue-300 blur-[2px]">Social</span>
        </h1>
        <p className=" text-gray-500 text-lg">
          Connect, share, and discover people who are just like you.
        </p>
        <button className="mt-4 bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors">
          Create your account !
        </button>
      </div>
    </div>
  );
}
