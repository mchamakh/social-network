"use client";
import { useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const [step, setStep] = useState(1);
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
                Welcome !
              </h1>
              <p className="text-gray-400 mt-2">Get started on Social</p>
            </div>

            <div className="flex flex-col gap-6 w-full">
              {step === 1 && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Password
                    </label>
                    <input
                      type="password"
                      className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Nickname
                    </label>
                    <input
                      type="text"
                      className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Birthday
                    </label>
                    <input
                      type="date"
                      className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      About me
                    </label>
                    <textarea
                      className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400 resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Avatar
                    </label>
                    <input
                      type="file"
                      className="border border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-between">
            <button
              onClick={() => setStep(step - 1)}
              className="cursor-pointer bg-black text-white px-3 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => setStep(step + 1)}
              className="cursor-pointer bg-black text-white px-3 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
