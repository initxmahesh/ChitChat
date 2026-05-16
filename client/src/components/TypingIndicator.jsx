export default function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;

  let label;
  if (users.length === 1)
    label = `${users[0].fullName} is typing`;
  else if (users.length === 2)
    label = `${users[0].fullName} and ${users[1].fullName} are typing`;
  else
    label = "Several people are typing";

  return (
    <div className="flex items-center gap-2 px-3 sm:px-6 py-1.5">
      {/* Bouncing dots */}
      <div className="flex items-center gap-[3px]">
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "0.9s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "180ms", animationDuration: "0.9s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "360ms", animationDuration: "0.9s" }}
        />
      </div>
      <span className="text-xs text-gray-400 italic">{label}…</span>
    </div>
  );
}
