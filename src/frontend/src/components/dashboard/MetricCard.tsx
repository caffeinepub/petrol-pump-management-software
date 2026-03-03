import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  statusColor?: "amber" | "green" | "red" | "blue";
  subtitle?: string;
}

const statusColors = {
  amber: "text-amber border-amber/30 bg-amber/10",
  green: "text-fuel-petrol border-fuel-petrol/30 bg-fuel-petrol/10",
  red: "text-destructive border-destructive/30 bg-destructive/10",
  blue: "text-fuel-diesel border-fuel-diesel/30 bg-fuel-diesel/10",
};

const iconColors = {
  amber: "text-amber bg-amber/20",
  green: "text-fuel-petrol bg-fuel-petrol/20",
  red: "text-destructive bg-destructive/20",
  blue: "text-fuel-diesel bg-fuel-diesel/20",
};

export default function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  statusColor = "amber",
  subtitle,
}: MetricCardProps) {
  return (
    <div
      className={`bg-navy-700 rounded-2xl p-5 border ${statusColors[statusColor]} shadow-card`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[statusColor]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${trend.value >= 0 ? "bg-fuel-petrol/20 text-fuel-petrol" : "bg-destructive/20 text-destructive"}`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl text-foreground">{value}</span>
          {unit && (
            <span className="text-muted-foreground text-sm">{unit}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
