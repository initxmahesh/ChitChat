import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { io } from "socket.io-client";
import { Hash, Search, Users, ArrowLeft, X, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import MessageBubble from "../components/MessageBubble";
import SystemEvent from "../components/SystemEvent";
import ChatInput from "../components/ChatInput";

const API = "/api";

export default function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);

  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  // Pending leave timers — keyed by userId. If the same user rejoins within
  // the debounce window we cancel silently (handles React StrictMode & brief reconnects).
  const pendingLeavesRef = useRef(new Map());

  // Scroll to bottom whenever messages or events change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, events]);

  // Clear all pending leave timers on unmount
  useEffect(() => {
    const leaves = pendingLeavesRef.current;
    return () => {
      for (const { timer } of leaves.values()) clearTimeout(timer);
      leaves.clear();
    };
  }, []);

  // Fetch room metadata + message history
  useEffect(() => {
    fetch(`${API}/rooms/${roomId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setRoom(data);
        // Seed allMembers from the DB — this is everyone who has ever joined.
        // onlineUsers is kept separate and populated by the socket's room_users event.
        setAllMembers(
          // Deduplicate by _id in case the API returns duplicates
          Array.from(
            new Map((data.members || []).map((m) => [String(m._id ?? m), m])).values()
          )
        );
      })
      .catch(() => {});

    fetch(`${API}/rooms/${roomId}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.messages) {
          setMessages(data.messages);
          setTotalMessages(data.total ?? data.messages.length);
        }
      })
      .catch(() => {});
  }, [roomId]);

  // Socket lifecycle: create on room enter, destroy on room leave.
  // Connecting here (not at login) means one socket per active chat session.
  useEffect(() => {
    const s = io(window.location.origin, {
      withCredentials: true,
    });
    socketRef.current = s;

    // ── Event handlers ────────────────────────────────────
    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTotalMessages((prev) => prev + 1);
    };

    const onUserJoined = ({ _id, fullName, username }) => {
      const uid = String(_id);
      const pending = pendingLeavesRef.current.get(uid);
      if (pending) {
        clearTimeout(pending.timer);
        pendingLeavesRef.current.delete(uid);
        return;
      }
      setOnlineUsers((prev) =>
        prev.find((u) => u._id === _id)
          ? prev
          : [...prev, { _id, fullName, username }]
      );
      setEvents((prev) => [
        ...prev,
        { id: `join-${uid}-${Date.now()}`, text: `${fullName} joined the room`, type: "join" },
      ]);
    };

    const onUserLeft = ({ _id, fullName }) => {
      const uid = String(_id);
      const existing = pendingLeavesRef.current.get(uid);
      if (existing) clearTimeout(existing.timer);
      const timer = setTimeout(() => {
        pendingLeavesRef.current.delete(uid);
        setOnlineUsers((prev) => prev.filter((u) => u._id !== _id));
        setTypingUsers((prev) => prev.filter((u) => u._id !== _id));
        setEvents((prev) => [
          ...prev,
          { id: `left-${uid}-${Date.now()}`, text: `${fullName} left the room`, type: "leave" },
        ]);
      }, 800);
      pendingLeavesRef.current.set(uid, { timer, fullName });
    };

    const onUserTyping = ({ _id, fullName }) => {
      setTypingUsers((prev) =>
        prev.find((u) => u._id === _id) ? prev : [...prev, { _id, fullName }]
      );
    };

    const onUserStoppedTyping = ({ _id }) => {
      setTypingUsers((prev) => prev.filter((u) => u._id !== _id));
    };

    s.on("receive_message", onMessage);
    s.on("user_joined", onUserJoined);
    s.on("user_left", onUserLeft);
    s.on("user_typing", onUserTyping);
    s.on("user_stopped_typing", onUserStoppedTyping);

    // Authoritative live user list — server sends this right after join_room
    s.on("room_users", (users) => {
      setOnlineUsers(users);
    });

    // Join the room as soon as the socket connects
    s.on("connect", () => {
      s.emit("join_room", { roomId });
    });

    s.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // ── Cleanup: leave room and disconnect on unmount ─────
    return () => {
      if (s.connected) {
        s.emit("leave_room", { roomId });
      }
      s.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const handleSend = useCallback(
    (text) => {
      socketRef.current?.emit("send_message", { roomId, text });
    },
    [roomId]
  );

  const handleTypingStart = useCallback(() => {
    socketRef.current?.emit("typing_start", { roomId });
  }, [roomId]);

  const handleTypingStop = useCallback(() => {
    socketRef.current?.emit("typing_stop", { roomId });
  }, [roomId]);

  // Group messages: same sender + within 5 minutes → collapse avatar/name/timestamp
  const GROUP_MS = 5 * 60 * 1000;

  function sameGroup(a, b) {
    if (!a || !b) return false;
    const sameAuthor = a.sender?._id === b.sender?._id;
    const closeInTime =
      Math.abs(new Date(b.createdAt) - new Date(a.createdAt)) < GROUP_MS;
    return sameAuthor && closeInTime;
  }

  // ── Avatar helpers ────────────────────────────────────────
  const AVATAR_COLORS = [
    "bg-violet-500","bg-rose-500","bg-sky-500","bg-amber-500",
    "bg-emerald-500","bg-pink-500","bg-indigo-500","bg-teal-500",
  ];
  function getInitials(name = "") {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  }
  function getAvatarColor(name = "") {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  // Build a Set of online IDs for O(1) lookup
  const onlineIdSet = new Set(onlineUsers.map((u) => String(u._id)));

  // Sort all members: online first, then offline (stable within each group)
  const sortedMembers = [...allMembers].sort((a, b) => {
    const aOnline = onlineIdSet.has(String(a._id ?? a));
    const bOnline = onlineIdSet.has(String(b._id ?? b));
    return bOnline - aOnline;
  });

  return (
    <div className="h-screen flex bg-gray-50/50">
      <Sidebar
        currentUser={user}
        onlineUsers={onlineUsers}
        messageCount={totalMessages}
        onLogout={logout}
        onBack={() => navigate("/dashboard")}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[61px] px-4 sm:px-6 flex items-center justify-between bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 -ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Hash className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-gray-900 truncate">
                {room?.name ?? "…"}
              </h2>
              <p className="text-[11px] text-gray-400 -mt-0.5">
                {onlineUsers.length}{" "}
                {onlineUsers.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </div>

            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={() => setShowMembers((p) => !p)}
              className={`p-2.5 rounded-lg transition-colors ${
                showMembers
                  ? "text-brand-600 bg-brand-50"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Users className="w-[18px] h-[18px]" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Date separator */}
            <div className="flex items-center gap-4 px-4 sm:px-6 py-4 flex-shrink-0">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Today
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Live join/leave system events — only other users, auto-dismiss in 30s */}
            {events.map((ev) => (
              <SystemEvent key={ev.id} text={ev.text} type={ev.type} />
            ))}

            {/* Messages */}
            <div className="py-2">
              {messages.map((msg, i) => {
                const prev = messages[i - 1];
                const next = messages[i + 1];
                const showAvatar = !sameGroup(prev, msg);
                const showTimestamp = !sameGroup(msg, next);
                return (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwn={msg.sender?._id === user?._id}
                    showAvatar={showAvatar}
                    showName={showAvatar}
                    showTimestamp={showTimestamp}
                  />
                );
              })}
            </div>

            {/* Auto-scroll anchor */}
            <div ref={bottomRef} />
          </div>

          {/* Members panel — inline on lg+, full-screen overlay on mobile */}
          {showMembers && (
            <>
              {/* Mobile overlay backdrop */}
              <div
                className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setShowMembers(false)}
              />
              <div className="fixed inset-y-0 right-0 z-40 w-60 lg:relative lg:inset-auto lg:w-60 lg:z-auto border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
                {/* Panel header */}
                <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Members · {allMembers.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowMembers(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                  {allMembers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-10">
                      No members yet
                    </p>
                  ) : (
                    sortedMembers.map((m) => {
                      const id   = String(typeof m === "object" ? m._id : m);
                      const name = typeof m === "object" ? m.fullName : "Unknown";
                      const uname = typeof m === "object" ? m.username : null;
                      const isMe = id === String(user?._id);
                      const isOnline = onlineIdSet.has(id);

                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-opacity ${getAvatarColor(name)} ${isOnline ? "" : "opacity-40"}`}
                            >
                              {getInitials(name)}
                            </div>
                            {/* Status dot */}
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${
                                isOnline ? "bg-emerald-400" : "bg-gray-300"
                              }`}
                            />
                          </div>

                          {/* Name + username */}
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium truncate leading-tight ${isOnline ? "text-gray-800" : "text-gray-400"}`}>
                              {name}
                              {isMe && (
                                <span className="ml-1.5 text-[10px] text-gray-400 font-normal">
                                  (you)
                                </span>
                              )}
                            </p>
                            {uname && (
                              <p className="text-[11px] text-gray-400 truncate">
                                @{uname}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <ChatInput
          onSend={handleSend}
          roomName={room?.name}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          typingUsers={typingUsers}
        />
      </div>
    </div>
  );
}
