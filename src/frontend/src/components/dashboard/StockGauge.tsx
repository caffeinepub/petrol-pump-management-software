import type { FuelType } from "../../types";

interface StockGaugeProps {
  fuelType: FuelType;
  currentLevel: number;
  capacity: number;
  threshold: number;
}

const fuelColors: Record<FuelType, { bar: string; text: string; bg: string }> =
  {
    Petrol: {
      bar: "bg-fuel-petrol",
      text: "text-fuel-petrol",
      bg: "bg-fuel-petrol/10",
    },
    Diesel: {
      bar: "bg-fuel-diesel",
      text: "text-fuel-diesel",
      bg: "bg-fuel-diesel/10",
    },
    Premium: { bar: "bg-amber", text: "text-amber", bg: "bg-amber/10" },
  };

export default function StockGauge({
  fuelType,
  currentLevel,
  capacity,
  threshold,
}: StockGaugeProps) {
  const percentage = Math.min(100, (currentLevel / capacity) * 100);
  const thresholdPct = (threshold / capacity) * 100;
  const isLow = currentLevel < threshold;
  const isCritical = currentLevel < threshold * 0.5;

  const colors = fuelColors[fuelType];
  const statusLabel = isCritical ? "Critical" : isLow ? "Low" : "OK";
  const statusColor = isCritical
    ? "text-destructive bg-destructive/20"
    : isLow
      ? "text-amber bg-amber/20"
      : "text-fuel-petrol bg-fuel-petrol/20";
  const barColor = isCritical
    ? "bg-destructive"
    : isLow
      ? "bg-amber"
      : colors.bar;

  return (
    <div
      className={`bg-navy-700 rounded-2xl p-5 border ${isLow ? "border-amber/40" : "border-navy-600"} shadow-card`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className={`font-display text-lg ${colors.text}`}>{fuelType}</h3>
          <p className="text-xs text-muted-foreground">
            Tank Capacity: {capacity.toLocaleString()}L
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Gauge bar */}
      <div className="relative mb-3">
        <div className="h-4 bg-navy-800 rounded-full overflow-hidden border border-navy-600">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Threshold marker */}
        <div
          className="absolute top-0 h-4 w-0.5 bg-amber/60"
          style={{ left: `${thresholdPct}%` }}
          title={`Threshold: ${threshold.toLocaleString()}L`}
        />
      </div>

      <div className="flex justify-between text-sm">
        <div>
          <span className={`font-semibold ${colors.text}`}>
            {currentLevel.toLocaleString()}L
          </span>
          <span className="text-muted-foreground text-xs ml-1">current</span>
        </div>
        <div className="text-right">
          <span className="font-semibold text-foreground">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-muted-foreground text-xs ml-1">full</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Threshold:{" "}
        <span className="text-amber">{threshold.toLocaleString()}L</span>
      </p>
    </div>
  );
}
