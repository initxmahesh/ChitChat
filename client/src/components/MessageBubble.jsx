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

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Bubble corner shaping based on position within a group
function getBubbleShape(isOwn, position) {
  // position: "solo" | "first" | "middle" | "last"
  if (isOwn) {
    if (position === "solo")   return "rounded-2xl rounded-br-md";
    if (position === "first")  return "rounded-2xl rounded-br-sm";
    if (position === "middle") return "rounded-2xl rounded-r-sm";
    if (position === "last")   return "rounded-2xl rounded-tr-sm rounded-br-md";
  } else {
    if (position === "solo")   return "rounded-2xl rounded-bl-md";
    if (position === "first")  return "rounded-2xl rounded-bl-sm";
    if (position === "middle") return "rounded-2xl rounded-l-sm";
    if (position === "last")   return "rounded-2xl rounded-tl-sm rounded-bl-md";
  }
  return "rounded-2xl";
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showName = true,
  showTimestamp = true,
}) {
  const { sender, text, createdAt } = message;
  const name = sender?.fullName || "Unknown";

  // Derive position within a group for corner shaping
  const isFirst = showAvatar;
  const isLast = showTimestamp;
  let position;
  if (isFirst && isLast)  position = "solo";
  else if (isFirst)        position = "first";
  else if (isLast)         position = "last";
  else                     position = "middle";

  const isGrouped = !isFirst; // continuation message — tighter spacing

  const bubbleShape = getBubbleShape(isOwn, position);

  return (
    <div
      className={`flex gap-2 sm:gap-3 px-3 sm:px-6 ${isOwn ? "flex-row-reverse" : ""} ${
        isGrouped ? "pt-0.5" : "pt-2"
      }`}
    >
      {/* Avatar column — always reserve space to keep alignment */}
      {!isOwn && (
        <div className="w-7 sm:w-8 flex-shrink-0 flex items-end">
          {showAvatar && (
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 ${getAvatarColor(name)} rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold text-white`}
            >
              {getInitials(name)}
            </div>
          )}
        </div>
      )}

      <div className={`max-w-[82%] sm:max-w-[65%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name — only at start of group for others */}
        {!isOwn && showName && (
          <p className="text-xs font-medium text-gray-500 mb-1 ml-1">{name}</p>
        )}

        {/* Bubble */}
        <div
          className={`px-3 py-2 sm:px-4 sm:py-2.5 text-sm leading-relaxed ${bubbleShape} ${
            isOwn
              ? "bg-brand-600 text-white"
              : "bg-white border border-gray-100 text-gray-800 shadow-sm"
          }`}
        >
          {text}
        </div>

        {/* Timestamp — only at end of group */}
        {showTimestamp && (
          <p
            className={`text-[10px] sm:text-[11px] text-gray-400 mt-1 ${
              isOwn ? "text-right mr-1" : "ml-1"
            }`}
          >
            {formatTime(createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}
