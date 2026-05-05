import Sidebar from "@/components/Sidebar";
import { FiUser, FiMessageCircle, FiEdit } from "react-icons/fi";

export default function Profile() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="relative sticky top-0 h-screen">
        <img
          src="/logo.png"
          alt="logo"
          className="absolute top-6 left-15 h-14 w-auto z-10"
        />
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-3 pt-0">
        {/* BANNIERE + INFOS */}
        <div className="flex-shrink-0">
          <div className="w-full h-48 bg-gray-300 rounded-b-2xl" />

          <div className="flex flex-col px-8">
            <div className="flex items-end justify-between -mt-12">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center">
                  <FiUser size={40} className="text-gray-500" />
                </div>
                <div className="mb">
                  <h1 className="text-xl font-bold text-black">Dempele</h1>
                  <p className="text-gray-400 text-sm">@dembouz</p>
                </div>
              </div>

              <button className="flex items-center bg-gray-50 gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600  hover:bg-black hover:text-white transition-colors mb-1">
                <FiEdit size={14} />
                Modifier le profil
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-1">
              <p className="text-sm text-black">
                Parisien dans l'âme, rouge et bleu dans le sang.
              </p>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>Né le 20/02/2005</span>
                <span>A rejoint Social en juin 2020</span>
              </div>
              <div className="flex gap-4 text-sm mt-1">
                <span>
                  <strong className="text-black">106</strong>{" "}
                  <span className="text-gray-400">Abonnements</span>
                </span>
                <span>
                  <strong className="text-black">3,2k</strong>{" "}
                  <span className="text-gray-400">Abonnés</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CHAMP STICKY */}
        <div className="sticky top-0 z-10 bg-gray-100 py-4 px-8">
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-white rounded-2xl p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <FiUser size={20} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Quelle est ta pensée du jour ?"
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* POSTS */}
        <div className="px-8 pb-8">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <FiUser size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Dempele</p>
                  <p className="text-xs text-gray-400">12/04/2026 18h20</p>
                </div>
              </div>
              <p className="text-sm text-black">Dimanche au parc...</p>
              <div className="w-full h-48 bg-gray-200 rounded-xl" />
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <FiMessageCircle size={18} />
                <span>12 commentaires</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <FiUser size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Dempele</p>
                  <p className="text-xs text-gray-400">10/04/2026 14h00</p>
                </div>
              </div>
              <p className="text-sm text-black">Belle journée aujourd'hui !</p>
              <div className="w-full h-48 bg-gray-200 rounded-xl" />
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <FiMessageCircle size={18} />
                <span>4 commentaires</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <FiUser size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Dempele</p>
                  <p className="text-xs text-gray-400">08/04/2026 10h30</p>
                </div>
              </div>
              <p className="text-sm text-black">Bonne semaine à tous !</p>
              <div className="w-full h-48 bg-gray-200 rounded-xl" />
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <FiMessageCircle size={18} />
                <span>7 commentaires</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
