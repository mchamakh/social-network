export default function Login() {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl flex flex-row w-335 h-180 p-4">
        <img
          src="/login.jpeg"
          alt="decoration"
          className="w-1/2 h-full object-cover rounded-xl"
        />
        <div className="flex flex-col flex-1 items-center justify-center gap-25 px-12">
          <div className="text-center">
            <h1 className="text-6xl text-black font-(family-name:--font-domine)">
              Welcome back
            </h1>
            <p className="text-gray-400 mt-2">It's nice to see you again !</p>
          </div>

          <div className="flex flex-col gap-15 w-full">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-black font-medium">Email</label>
              <input
                type="text"
                className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-black font-medium">Password</label>
              <input
                type="password"
                className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <button className="bg-black text-white px-12 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
