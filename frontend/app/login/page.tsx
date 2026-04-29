import Link from "next/link";

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl flex flex-row w-335 h-180 p-4">
        <img
          src="/login.jpeg"
          alt="decoration"
          className="w-1/2 h-full object-cover rounded-xl"
        />
        <div className="flex flex-col flex-1 px-12 py-8">
          <div className="flex flex-col flex-1 items-center justify-center gap-10">
            <div className="text-center">
              <h1 className="text-6xl text-black font-(family-name:--font-domine)">
                Welcome back
              </h1>
              <p className="text-gray-400 mt-2">It's nice to see you again !</p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-black font-medium">
                  Email<span className="text-orange-600 text-lg">*</span>
                </label>
                <input
                  type="text"
                  className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-black font-medium">
                  Password<span className="text-orange-600 text-lg">*</span>
                </label>
                <input
                  type="password"
                  className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                />
              </div>

              <Link
                href="/register"
                className="text-gray-500 hover:underline text-center text-sm"
              >
                No account yet ?
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="bg-black text-white px-12 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
