import { useState } from "react";
import { MessageSquare, LogOut, ArrowLeft, Pencil } from "lucide-react";
import ProfileModal from "./ProfileModal";

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Sidebar({ currentUser, onlineUsers, messageCount = 0, onLogout, onBack, isOpen = false, onClose }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:z-auto
      `}>
        {/* Logo + Back */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to rooms"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <MessageSquare className="w-6 h-6 text-brand-600" />
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              ChitChat
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 pt-4 pb-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100">
              <p className="text-2xl font-bold text-gray-900">
                {onlineUsers.length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Online users</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100">
              <p className="text-2xl font-bold text-gray-900">
                {messageCount >= 1000
                  ? `${(messageCount / 1000).toFixed(1)}k`
                  : messageCount}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Messages</p>
            </div>
          </div>
        </div>

        {/* Online users */}
        <div className="flex-1 overflow-y-auto px-4 pt-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Online — {onlineUsers.length}
          </p>

          <div className="space-y-1">
            {onlineUsers.map((u) => {
              const isYou = u._id === currentUser?._id;
              return (
                <div
                  key={u._id}
                  className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <div
                      className={`w-8 h-8 ${getAvatarColor(u.fullName)} rounded-full flex items-center justify-center text-xs font-semibold text-white`}
                    >
                      {getInitials(u.fullName)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.fullName}
                      {isYou && (
                        <span className="text-gray-400 font-normal"> (you)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">Active now</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current user / logout */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfile(true)}
              className="relative group flex-shrink-0"
              title="Edit profile"
            >
              <div
                className={`w-9 h-9 ${getAvatarColor(currentUser?.fullName || "")} rounded-full flex items-center justify-center text-xs font-semibold text-white`}
              >
                {getInitials(currentUser?.fullName || "?")}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                {currentUser?.fullName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentUser?.username ? `@${currentUser.username}` : currentUser?.email}
              </p>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
