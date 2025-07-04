import { getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  
  // Capitalize first letter
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {displayStatus}
    </span>
  );
}
