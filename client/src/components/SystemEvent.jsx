import { useEffect, useState } from "react";
import { UserPlus, UserMinus, Sparkles } from "lucide-react";

const VISIBLE_MS = 5000;
const FADE_MS    = 200;

const ICON_MAP = {
  join:  UserPlus,
  leave: UserMinus,
};

export default function SystemEvent({ text, type }) {
  const [phase, setPhase] = useState("visible");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), VISIBLE_MS - FADE_MS);
    const goneTimer = setTimeout(() => setPhase("gone"),   VISIBLE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  const Icon = ICON_MAP[type] ?? Sparkles;

  return (
    <div
      className="flex justify-center py-1.5 transition-opacity duration-500"
      style={{ opacity: phase === "fading" ? 0 : 1 }}
    >
      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-4 py-1.5 rounded-full border border-amber-100">
        <Icon className="w-3 h-3" />
        {text}
      </div>
    </div>
  );
}
