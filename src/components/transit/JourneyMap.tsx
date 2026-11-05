import { useMemo, useState } from "react";
import {
  Bus,
  Compass,
  Footprints,
  Info,
  MapPin,
  RotateCcw,
  TrainFront,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type {
  JourneyStop,
  MultimodalJourneyOption,
  TransportMode,
} from "@/lib/transit/multimodal-types";

interface JourneyMapProps {
  option: MultimodalJourneyOption;
}

export function JourneyMap({ option }: JourneyMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedStop, setSelectedStop] = useState<{
    stop: JourneyStop;
    mode: TransportMode;
    lineName: string;
  } | null>(null);

  // Extract all stops with valid coordinates
  const stopsWithCoords = useMemo(() => {
    const list: Array<{
      stop: JourneyStop;
      mode: TransportMode;
      lineName: string;
      color: string;
      isStart?: boolean;
      isEnd?: boolean;
    }> = [];

    option.legs.forEach((leg, legIdx) => {
      leg.intermediateStops.forEach((stop, sIdx) => {
        if (stop.latitude && stop.longitude) {
          list.push({
            stop,
            mode: leg.mode,
            lineName: leg.lineName,
            color: leg.color,
            isStart: legIdx === 0 && sIdx === 0,
            isEnd: legIdx === option.legs.length - 1 && sIdx === leg.intermediateStops.length - 1,
          });
        }
      });
    });

    return list;
  }, [option]);

  // Compute map bounding box
  const bounds = useMemo(() => {
    if (stopsWithCoords.length === 0) {
      return { minLat: 12.92, maxLat: 13.15, minLon: 80.12, maxLon: 80.3 };
    }
    let minLat = Infinity,
      maxLat = -Infinity,
      minLon = Infinity,
      maxLon = -Infinity;

    for (const item of stopsWithCoords) {
      const lat = item.stop.latitude!;
      const lon = item.stop.longitude!;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }

    // Add safe margin
    const latSpan = Math.max(0.015, maxLat - minLat);
    const lonSpan = Math.max(0.015, maxLon - minLon);

    return {
      minLat: minLat - latSpan * 0.15,
      maxLat: maxLat + latSpan * 0.15,
      minLon: minLon - lonSpan * 0.15,
      maxLon: maxLon + lonSpan * 0.15,
    };
  }, [stopsWithCoords]);

  // Project lat/lon to SVG coordinate space [width: 600, height: 420]
  const svgWidth = 600;
  const svgHeight = 420;

  const project = (lat: number, lon: number) => {
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (svgWidth - 80) + 40;
    // Invert Y axis for screen space
    const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (svgHeight - 80) + 40;
    return { x, y };
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.75, prev + delta)));
  };

  const resetView = () => {
    setZoomLevel(1);
    setSelectedStop(null);
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft">
      {/* Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-accent" />
          <span className="font-display text-xs font-semibold text-foreground">
            Multimodal Route Map
          </span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent truncate max-w-[180px]">
            {option.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleZoom(0.25)}
            className="rounded-lg border bg-background p-1.5 text-foreground hover:bg-muted"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.25)}
            className="rounded-lg border bg-background p-1.5 text-foreground hover:bg-muted"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="rounded-lg border bg-background p-1.5 text-foreground hover:bg-muted"
            title="Reset map view"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative h-80 w-full overflow-hidden bg-slate-50 sm:h-96">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#94a3b8 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, #f8fafc 0.75px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-full w-full transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          {/* Leg polylines */}
          {option.legs.map((leg) => {
            const validStops = leg.intermediateStops.filter((s) => s.latitude && s.longitude);
            if (validStops.length < 2) return null;

            const pathPoints = validStops
              .map((s) => {
                const pt = project(s.latitude!, s.longitude!);
                return `${pt.x},${pt.y}`;
              })
              .join(" ");

            const isWalk = leg.mode === "walk";

            return (
              <g key={`poly-${leg.id}`}>
                {/* Glow under line */}
                <polyline
                  points={pathPoints}
                  fill="none"
                  stroke={leg.color}
                  strokeWidth={isWalk ? "4" : "8"}
                  strokeOpacity={isWalk ? "0.2" : "0.25"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main line */}
                <polyline
                  points={pathPoints}
                  fill="none"
                  stroke={leg.color}
                  strokeWidth={isWalk ? "2.5" : "4.5"}
                  strokeDasharray={isWalk ? "5,5" : "none"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Station Nodes */}
          {stopsWithCoords.map((item, idx) => {
            const pt = project(item.stop.latitude!, item.stop.longitude!);
            const isOrigin = item.isStart;
            const isDestination = item.isEnd;

            return (
              <g
                key={`node-${idx}`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() =>
                  setSelectedStop({
                    stop: item.stop,
                    mode: item.mode,
                    lineName: item.lineName,
                  })
                }
              >
                {/* Pin for Start/End */}
                {isOrigin ? (
                  <g transform={`translate(${pt.x - 10}, ${pt.y - 24})`}>
                    <circle cx="10" cy="10" r="10" fill="#10B981" />
                    <text
                      x="10"
                      y="14"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      A
                    </text>
                  </g>
                ) : isDestination ? (
                  <g transform={`translate(${pt.x - 10}, ${pt.y - 24})`}>
                    <circle cx="10" cy="10" r="10" fill="#EF4444" />
                    <text
                      x="10"
                      y="14"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      B
                    </text>
                  </g>
                ) : (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={item.mode === "walk" ? "3" : "4.5"}
                    fill="#FFFFFF"
                    stroke={item.color}
                    strokeWidth="2.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Station Popover Tooltip */}
        {selectedStop && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur animate-rise">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                  {selectedStop.mode === "metro" && <TrainFront className="h-3 w-3" />}
                  {selectedStop.mode === "bus" && <Bus className="h-3 w-3" />}
                  {selectedStop.mode === "train" && <TrainFront className="h-3 w-3" />}
                  {selectedStop.mode === "walk" && <Footprints className="h-3 w-3" />}
                  {selectedStop.lineName}
                </span>
                <h5 className="font-display text-xs font-semibold text-foreground">
                  {selectedStop.stop.name}
                </h5>
                {selectedStop.stop.arrival && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Scheduled Arrival:{" "}
                    <span className="font-mono">{selectedStop.stop.arrival.slice(0, 5)}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedStop(null)}
                className="text-xs text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 border border-amber-500" />
            Metro Yellow (Corridor 4)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Metro Blue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            Metro Green
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-600" />
            MTC Bus
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
            Suburban Train
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 border-b-2 border-dashed border-slate-500" />
            Walk
          </span>
        </div>

        <span className="text-[11px] font-medium text-muted-foreground/80">
          Click station dot to inspect
        </span>
      </div>
    </div>
  );
}
