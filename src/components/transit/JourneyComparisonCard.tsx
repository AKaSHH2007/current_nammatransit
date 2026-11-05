import {
  Award,
  Bus,
  CheckCircle2,
  Clock,
  Coins,
  Footprints,
  Sparkles,
  TrainFront,
  Zap,
} from "lucide-react";
import type { MultimodalJourneyOption, TransportMode } from "@/lib/transit/multimodal-types";

interface JourneyComparisonCardProps {
  option: MultimodalJourneyOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function JourneyComparisonCard({
  option,
  isSelected,
  onSelect,
}: JourneyComparisonCardProps) {
  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case "metro":
        return <TrainFront className="h-4 w-4 text-blue-600" />;
      case "bus":
        return <Bus className="h-4 w-4 text-orange-600" />;
      case "train":
        return <TrainFront className="h-4 w-4 text-purple-600" />;
      case "walk":
        return <Footprints className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 text-left ${
        isSelected
          ? "border-accent bg-accent-soft/30 shadow-md ring-2 ring-accent"
          : "border-border bg-card hover:border-accent/50 hover:shadow-soft"
      }`}
    >
      {/* Top Header Strip: Option Number & Highlights Badges */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        {option.optionNumber && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground font-mono">
            #{option.optionNumber}
          </span>
        )}

        {option.highlights.map((highlight) => {
          if (highlight === "best_overall") {
            return (
              <span
                key="best_overall"
                className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-purple-900"
              >
                <Award className="h-3 w-3" /> Best Overall
              </span>
            );
          }
          if (highlight === "fastest") {
            return (
              <span
                key="fastest"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800"
              >
                <Zap className="h-3 w-3" /> Fastest
              </span>
            );
          }
          if (highlight === "cheapest") {
            return (
              <span
                key="cheapest"
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800"
              >
                <Coins className="h-3 w-3" /> Cheapest
              </span>
            );
          }
          if (highlight === "fewest_transfers") {
            return (
              <span
                key="fewest"
                className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sky-800"
              >
                <Sparkles className="h-3 w-3" /> Direct Route
              </span>
            );
          }
          if (highlight === "least_walking") {
            return (
              <span
                key="least_walking"
                className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-teal-800"
              >
                <Footprints className="h-3 w-3" /> Least Walking
              </span>
            );
          }
          return null;
        })}

        {isSelected && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-accent">
            <CheckCircle2 className="h-3.5 w-3.5" /> Selected
          </span>
        )}
      </div>

      {/* Main Title & Price / Duration Block */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-foreground/85 font-medium truncate">
            <span className="font-semibold text-foreground">{option.legs[0]?.fromStation}</span>
            <span className="text-muted-foreground/80">→</span>
            <span className="font-semibold text-foreground">
              {option.legs[option.legs.length - 1]?.toStation}
            </span>
          </div>
          <h4 className="mt-0.5 font-display text-sm font-semibold text-foreground truncate">
            {option.title}
          </h4>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{option.description}</p>
        </div>

        <div className="text-right shrink-0">
          <div className="font-display text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
            {option.durationMinutes}{" "}
            <span className="text-xs font-medium text-muted-foreground">min</span>
          </div>
          <div className="text-xs font-bold text-foreground/90 font-mono tabular-nums">
            ₹{option.fare}
          </div>
        </div>
      </div>

      {/* Mode Sequence Chain */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-xl bg-muted/60 px-2.5 py-1.5">
        {option.legs.map((leg, idx) => (
          <div key={leg.id || idx} className="flex items-center gap-1 text-xs">
            {idx > 0 && <span className="text-muted-foreground/60">›</span>}
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                leg.mode === "metro"
                  ? leg.color === "#EAB308" || leg.lineName.toLowerCase().includes("yellow")
                    ? "bg-amber-100 text-amber-950 border border-amber-300 font-semibold"
                    : leg.color === "#16A34A" || leg.lineName.toLowerCase().includes("green")
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  : leg.mode === "bus"
                    ? "bg-orange-100 text-orange-800"
                    : leg.mode === "train"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-slate-100 text-slate-700"
              }`}
            >
              {getModeIcon(leg.mode)}
              {leg.mode === "walk"
                ? `${leg.walkingDistanceMeters || 100}m`
                : leg.routeNumber || leg.lineName}
            </span>
          </div>
        ))}
      </div>

      {/* Key Metrics Strip */}
      <div className="mt-3 grid grid-cols-4 gap-1.5 border-t pt-2.5 text-center text-xs text-muted-foreground">
        <div>
          <span className="block font-semibold text-foreground">
            {option.transferCount === 0 ? "Direct" : `${option.transferCount} xfer`}
          </span>
          <span className="text-[10px]">Transfers</span>
        </div>
        <div>
          <span className="block font-semibold text-foreground font-mono tabular-nums">
            {option.totalStops}
          </span>
          <span className="text-[10px]">Stops</span>
        </div>
        <div>
          <span className="block font-semibold text-foreground font-mono tabular-nums">
            {option.walkingDistanceMeters}m
          </span>
          <span className="text-[10px]">Walking</span>
        </div>
        <div>
          <span className="block font-semibold text-foreground font-mono tabular-nums">
            {option.legs.some((l) => (l.waitingDurationMinutes ?? 0) > 0)
              ? `~${option.legs.reduce((acc, l) => acc + (l.waitingDurationMinutes || 0), 0)}m`
              : "0m"}
          </span>
          <span className="text-[10px]">Wait Time</span>
        </div>
      </div>

      {/* Fare Breakdown Note if mixed */}
      {option.fareBreakdown && option.fareBreakdown.length > 1 && (
        <div className="mt-2 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/60 pt-1.5">
          <span>Fare breakdown:</span>
          <span className="font-medium text-foreground">
            {option.fareBreakdown.map((f) => `${f.label}: ₹${f.amount}`).join(" + ")}
          </span>
        </div>
      )}

      {/* Schedule Disclaimer */}
      <div className="mt-2 text-[10px] text-muted-foreground/75 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3" /> Dep ~{option.departureTime.slice(0, 5)}
        </span>
        <span>Static GTFS · Not live</span>
      </div>
    </div>
  );
}
