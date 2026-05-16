import { SocketContext } from "./SocketContext";

// Socket lifecycle is managed per-room inside Chat.jsx.
// This provider exists to keep the context API stable for any future consumers.
export default function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={null}>
      {children}
    </SocketContext.Provider>
  );
}
