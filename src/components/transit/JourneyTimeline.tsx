import { useState } from "react";
import {
  Bus,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Footprints,
  Info,
  MapPin,
  TrainFront,
} from "lucide-react";
import type {
  JourneyLeg,
  MultimodalJourneyOption,
  TransportMode,
} from "@/lib/transit/multimodal-types";

interface JourneyTimelineProps {
  option: MultimodalJourneyOption;
}

export function JourneyTimeline({ option }: JourneyTimelineProps) {
  const [expandedLegs, setExpandedLegs] = useState<Record<string, boolean>>({});

  const toggleLegExpansion = (legId: string) => {
    setExpandedLegs((prev) => ({
      ...prev,
      [legId]: !prev[legId],
    }));
  };

  const getModeBadge = (leg: JourneyLeg) => {
    switch (leg.mode) {
      case "metro":
        if (leg.color === "#EAB308" || leg.lineName.toLowerCase().includes("yellow")) {
          return {
            icon: <TrainFront className="h-4 w-4 text-amber-950" />,
            bgColor: "bg-amber-400 text-amber-950 border border-amber-500",
            lineColor: "border-amber-400",
            dotColor: "bg-amber-500",
            tag: "Yellow Line (Corridor 4)",
          };
        }
        if (leg.color === "#16A34A" || leg.lineName.toLowerCase().includes("green")) {
          return {
            icon: <TrainFront className="h-4 w-4" />,
            bgColor: "bg-emerald-600 text-white",
            lineColor: "border-emerald-500",
            dotColor: "bg-emerald-600",
            tag: "Green Line",
          };
        }
        return {
          icon: <TrainFront className="h-4 w-4" />,
          bgColor: "bg-blue-600 text-white",
          lineColor: "border-blue-500",
          dotColor: "bg-blue-600",
          tag: "Chennai Metro",
        };
      case "bus":
        return {
          icon: <Bus className="h-4 w-4" />,
          bgColor: "bg-orange-600 text-white",
          lineColor: "border-orange-500",
          dotColor: "bg-orange-600",
          tag: "MTC Bus",
        };
      case "train":
        return {
          icon: <TrainFront className="h-4 w-4" />,
          bgColor: "bg-purple-600 text-white",
          lineColor: "border-purple-500",
          dotColor: "bg-purple-600",
          tag: "Southern Railway",
        };
      case "walk":
        return {
          icon: <Footprints className="h-3.5 w-3.5" />,
          bgColor: "bg-slate-500 text-white",
          lineColor: "border-slate-300 border-dashed",
          dotColor: "bg-slate-400",
          tag: "Walking",
        };
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{option.title}</h3>
          <p className="text-xs text-muted-foreground">
            {option.durationMinutes} mins · ₹{option.fare} · {option.totalStops} stops ·{" "}
            {option.transferCount === 0 ? "Direct service" : `${option.transferCount} transfer`}
          </p>
        </div>

        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground font-mono">
          Departure: {option.departureTime.slice(0, 5)}
        </span>
      </div>

      {/* Vertical Step-by-Step Timeline */}
      <div className="relative space-y-6">
        {option.legs.map((leg, legIdx) => {
          const style = getModeBadge(leg);
          const isExpanded = Boolean(expandedLegs[leg.id]);
          const isWalk = leg.mode === "walk";

          return (
            <div key={leg.id || legIdx} className="relative pl-8">
              {/* Vertical connecting line */}
              {legIdx < option.legs.length - 1 && (
                <div
                  className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px ${
                    isWalk
                      ? "border-l-2 border-dashed border-slate-300"
                      : "border-l-2 " + style.lineColor
                  }`}
                />
              )}

              {/* Mode Icon Node */}
              <div
                className={`absolute left-0 top-0.5 grid h-7 w-7 place-items-center rounded-full shadow-xs ${style.bgColor}`}
              >
                {style.icon}
              </div>

              {/* Leg Header Info Box */}
              <div className="rounded-xl border bg-muted/30 p-3.5 transition hover:bg-muted/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold text-foreground">
                      {leg.lineName}
                    </span>
                    <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-foreground/80 shadow-2xs">
                      {leg.operator}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-foreground font-mono">
                    ~{leg.durationMinutes} mins
                  </span>
                </div>

                {leg.instruction && (
                  <p className="mt-1 text-xs text-muted-foreground">{leg.instruction}</p>
                )}

                {/* Departure Station */}
                <div className="mt-3 flex items-start gap-2 text-xs">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-foreground">{leg.fromStation}</span>
                    {leg.departureTime && (
                      <span className="ml-2 text-muted-foreground font-mono">
                        {leg.departureTime.slice(0, 5)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Intermediate Stops Accordion (if transit mode) */}
                {!isWalk && leg.intermediateStops && leg.intermediateStops.length > 2 && (
                  <div className="my-2 ml-1 pl-3 border-l-2 border-border/80">
                    <button
                      type="button"
                      onClick={() => toggleLegExpansion(leg.id)}
                      className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-accent hover:underline"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" /> Hide{" "}
                          {leg.intermediateStops.length - 2} intermediate stops
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" /> View{" "}
                          {leg.intermediateStops.length - 2} intermediate stops
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground animate-rise">
                        {leg.intermediateStops.slice(1, -1).map((stop, sIdx) => (
                          <li
                            key={stop.stopId || sIdx}
                            className="flex items-center justify-between py-0.5"
                          >
                            <span className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                              {stop.name}
                            </span>
                            {stop.arrival && (
                              <span className="font-mono text-[11px] text-muted-foreground/80">
                                {stop.arrival.slice(0, 5)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                {/* Arrival Station */}
                <div className="mt-2 flex items-start gap-2 text-xs">
                  <span className="mt-1 h-2 w-2 rounded-full bg-destructive shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-foreground">{leg.toStation}</span>
                    {leg.arrivalTime && (
                      <span className="ml-2 text-muted-foreground font-mono">
                        {leg.arrivalTime.slice(0, 5)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Walking Transfer & Waiting Information */}
                {isWalk && (
                  <div className="mt-2 rounded-lg bg-background p-2.5 text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      <Footprints className="h-3.5 w-3.5 text-accent" />
                      Walk distance: <b>{leg.walkingDistanceMeters || 100} meters</b> (~
                      {leg.walkingDurationMinutes || 2} mins)
                    </p>
                    {leg.waitingDurationMinutes && leg.waitingDurationMinutes > 0 && (
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        Expected platform wait: ~{leg.waitingDurationMinutes} mins
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fare Breakdown Card */}
      {option.fareBreakdown && option.fareBreakdown.length > 0 && (
        <div className="mt-6 rounded-xl border bg-muted/20 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
            <Coins className="h-4 w-4 text-accent" />
            <span>Fare Breakdown</span>
          </div>
          <div className="space-y-1 text-xs">
            {option.fareBreakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between text-muted-foreground">
                <span>{item.label}</span>
                <span className="font-mono font-medium text-foreground">₹{item.amount}</span>
              </div>
            ))}
            <div className="border-t border-border pt-1.5 flex justify-between font-bold text-foreground">
              <span>Total Estimated Fare</span>
              <span className="font-mono text-accent">₹{option.fare}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grounding & Data Accuracy Disclaimer */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">
            {option.legs.some((l) => l.lineName?.toLowerCase().includes("yellow"))
              ? "Official CMRL Phase 2 Yellow Line Timetable Grounding"
              : "Static GTFS Timetable Grounding"}
          </p>
          <p className="mt-0.5">
            {option.legs.some((l) => l.lineName?.toLowerCase().includes("yellow"))
              ? "Includes the newly operational Chennai Metro Phase 2 Corridor 4 (Poonamallee Bypass ↔ Vadapalani, commenced 11 October 2026). Timetable is grounded in official CMRL frequency guidelines (10m peak, 15m off-peak, 06:00–21:00); live train GPS tracking is not active."
              : "Schedules, routes and stations are grounded in Chennai transit GTFS datasets. Fares and timings reflect official published schedules, not real-time GPS vehicle tracking."}
          </p>
        </div>
      </div>
    </div>
  );
}
