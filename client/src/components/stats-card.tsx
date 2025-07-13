import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-bronze-500" }: StatsCardProps) {
  return (
    <div className="bronze-50 p-6 rounded-lg border border-bronze-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-bronze-700 font-semibold">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className={`${iconColor} text-3xl w-8 h-8`} />
      </div>
    </div>
  );
}
