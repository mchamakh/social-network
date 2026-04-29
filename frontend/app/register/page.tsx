"use client";
import { useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function Register() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canGoNext = () => {
    if (step === 1) return firstName.trim() !== "" && lastName.trim() !== "";
    if (step === 2) return email.trim() !== "" && password.trim() !== "";
    return true;
  };

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
                      First Name{" "}
                      <span className="text-orange-600 text-lg">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border text-black border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Last Name{" "}
                      <span className="text-orange-600 text-lg">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="border text-black border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                    <Link
                      href="/login"
                      className="text-gray-400 hover:underline text-center text-sm mt-1"
                    >
                      Already have an account ?
                    </Link>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Email <span className="text-orange-600 text-lg">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border text-black border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Password{" "}
                      <span className="text-orange-600 text-lg">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border text-black border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                    <Link
                      href="/login"
                      className="text-gray-400 hover:underline text-center text-sm mt-1"
                    >
                      Already have an account ?
                    </Link>
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
                      className="border text-black border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black font-medium">
                      Birthday
                    </label>
                    <input
                      type="date"
                      className="border text-black border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400"
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
                      className="border text-black border-gray-200 rounded-lg px-4 py-3 w-full outline-none focus:border-gray-400 resize-none"
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
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="bg-black cursor-pointer text-white px-3 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors"
              >
                <FaArrowLeft />
              </button>
            )}

            {step < 4 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
                className="bg-black cursor-pointer text-white px-3 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors ml-auto disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaArrowRight />
              </button>
            )}

            {step === 4 && (
              <button className="bg-black cursor-pointer text-white px-6 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors">
                Join us
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
