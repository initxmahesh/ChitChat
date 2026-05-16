import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  MessageSquare,
  LogOut,
  Hash,
  Users,
  Lock,
  Plus,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";

const API_URL = "/api/rooms";

const COLORS = [
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
];

function getIconForRoom(room) {
  return room.isPrivate ? Lock : Hash;
}

// ─── Join Modal ──────────────────────────────────────────

function JoinModal({ room, onClose, onJoin, joining }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const Icon = getIconForRoom(room);

  const handleJoin = async () => {
    setError("");
    try {
      await onJoin(room._id, room.isPrivate ? password : null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-5 sm:p-6 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-11 h-11 ${room.color} rounded-xl flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{room.name}</h3>
            <p className="text-sm text-gray-500">{room.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5 bg-gray-50 rounded-xl px-4 py-2.5">
          <Users className="w-4 h-4" />
          <span>{room.members?.length || 0} members</span>
        </div>

        {room.isPrivate && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Room Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter room password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {joining ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Join Room
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Create Room Modal ───────────────────────────────────

function CreateModal({ onClose, onCreate, creating }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setError("");
    if (!name.trim()) {
      setError("Room name is required");
      return;
    }
    if (isPrivate && password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    try {
      await onCreate({ name, description, color, isPrivate, password });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-5">
          Create a New Room
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Room Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team"
              maxLength={30}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
              <span className="text-gray-400 font-normal"> (optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room about?"
              maxLength={120}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg ${c} transition-all ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-brand-500 scale-110"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Private toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Private Room
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                isPrivate ? "bg-brand-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isPrivate ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Password (if private) */}
          {isPrivate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Room Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 4 characters"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-all"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full mt-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Room
              <Plus className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    fetch(API_URL, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRoomClick = (room) => {
    const isMember = room.members?.some(
      (m) => (typeof m === "object" ? m._id : m) === user?._id
    );
    if (isMember) {
      navigate(`/chat/${room._id}`);
    } else {
      setSelectedRoom(room);
    }
  };

  const handleJoin = async (roomId, password) => {
    setJoining(true);
    try {
      const res = await fetch(`${API_URL}/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSelectedRoom(null);
      navigate(`/chat/${roomId}`);
    } finally {
      setJoining(false);
    }
  };

  const handleCreate = async (roomData) => {
    setCreating(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(roomData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRooms((prev) => [data, ...prev]);
      setShowCreate(false);
      navigate(`/chat/${data._id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-100/40 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-brand-600" />
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            ChitChat
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">
            Hi, <span className="font-semibold">{user?.fullName}</span>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chat Rooms</h1>
          <p className="text-gray-500 mt-1">
            Pick a room and start chatting with others.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const Icon = room.isPrivate ? Lock : Hash;
              return (
                <button
                  key={room._id}
                  onClick={() => handleRoomClick(room)}
                  className="group text-left bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-brand-200 active:scale-[0.98] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 ${room.color} rounded-xl flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {room.isPrivate && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        Private
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {room.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5" />
                      {room.members?.length || 0} members
                    </div>
                    <div className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Join
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Create room card */}
            <button
              onClick={() => setShowCreate(true)}
              className="group text-left bg-white/50 rounded-2xl border-2 border-dashed border-gray-200 p-5 hover:border-brand-300 hover:bg-white active:scale-[0.98] transition-all duration-300 flex flex-col items-center justify-center min-h-[180px]"
            >
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-brand-100 rounded-xl flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors" />
              </div>
              <p className="font-semibold text-gray-400 group-hover:text-brand-600 transition-colors text-sm">
                Create Room
              </p>
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedRoom && (
        <JoinModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onJoin={handleJoin}
          joining={joining}
        />
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          creating={creating}
        />
      )}
    </div>
  );
}
