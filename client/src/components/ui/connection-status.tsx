import { useRealtimeStatus } from "../../lib/realtime.js";

export default function ConnectionStatus() {
  const status = useRealtimeStatus();
  let color = "text-gray-400";
  let label = "Offline";
  if (status === "connected") {
    color = "text-green-500";
    label = "Live";
  } else if (status === "reconnecting") {
    color = "text-yellow-400 animate-pulse";
    label = "Reconnecting...";
  } else if (status === "error") {
    color = "text-red-500";
    label = "Connection Error";
  }
  return (
    <div className={`flex items-center space-x-2 text-xs font-medium ${color}`}>
      <span className="w-2 h-2 rounded-full bg-current"></span>
      <span>{label}</span>
    </div>
  );
}
