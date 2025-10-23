import { useMemo, useRef, useState, useEffect } from "react";
import type { EnrichedStudent } from "../../shared/types";
import { useAppStore } from "../../shared/store";

// Paleta consistente con la leyenda (0..2)
const clusterColor = (c: number) =>
  c === 0
    ? "#6366f1" // indigo-500
    : c === 1
    ? "#f43f5e" // rose-500
    : "#f59e0b"; // amber-500

// PRNG determinista para jitter estable por id
function rand01(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type Props = {
  data: EnrichedStudent[];
  height?: number; // px
  pointRadius?: number; // px
  colorBy?: "cluster"; // extensible si luego usas "segment"
};

export default function PCAScatter({
  data,
  height = 320,
  pointRadius = 4,
  colorBy = "cluster",
}: Props) {
  const {
    setSelectedId,
    setDetailOpen,
    selectedCluster,
    pcaScale,
    pcaJitter,
  } = useAppStore();

  const [hoverId, setHoverId] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const ref = useRef<HTMLDivElement>(null);

  // Responsive width
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const el = entries[0]?.contentRect;
      if (el?.width) setContainerWidth(el.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  // Aplica scale/jitter sobre las coordenadas sin mutar el array original
  const points = useMemo(() => {
    const j = pcaJitter;
    const s = pcaScale || 1;
    return data.map((d) => {
      const jx = (rand01(d.id * 3.17) - 0.5) * j;
      const jy = (rand01(d.id * 7.91) - 0.5) * j;
      return {
        ...d,
        _px: d.pcaX * s + jx,
        _py: d.pcaY * s + jy,
      };
    });
  }, [data, pcaJitter, pcaScale]);

  // Escalas
  const { xScale, yScale, xTicks, yTicks, bounds } = useMemo(() => {
    const pad = 0.08; // padding en espacio PCA
    const xs = points.map((d) => d._px);
    const ys = points.map((d) => d._py);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    const ixMin = xMin - xRange * pad;
    const ixMax = xMax + xRange * pad;
    const iyMin = yMin - yRange * pad;
    const iyMax = yMax + yRange * pad;

    const bounds = { left: 44, right: 12, top: 12, bottom: 28 };
    const plotW = Math.max(50, containerWidth - bounds.left - bounds.right);
    const plotH = Math.max(50, height - bounds.top - bounds.bottom);

    const xScale = (v: number) =>
      bounds.left + ((v - ixMin) / (ixMax - ixMin)) * plotW;
    const yScale = (v: number) =>
      bounds.top + (1 - (v - iyMin) / (iyMax - iyMin)) * plotH;

    const makeTicks = (n: number, min: number, max: number) => {
      const step = (max - min) / (n - 1);
      return Array.from({ length: n }, (_, i) => +(min + i * step).toFixed(2));
    };

    return {
      xScale,
      yScale,
      xTicks: makeTicks(5, ixMin, ixMax),
      yTicks: makeTicks(5, iyMin, iyMax),
      bounds,
    };
  }, [points, containerWidth, height]);

  // Tooltip state
  const [tip, setTip] = useState<{
    x: number;
    y: number;
    s?: EnrichedStudent;
  } | null>(null);

  return (
    <div ref={ref} className="w-full shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">
          Distribución PCA (PC1 vs PC2)
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <LegendDot color="#6366f1" label="Cluster 0" />
          <LegendDot color="#f43f5e" label="Cluster 1" />
          <LegendDot color="#f59e0b" label="Cluster 2" />
        </div>
      </div>

      <div className="rounded-[6px] border border-gray-200 bg-white shadow-sm relative overflow-hidden">
        <svg width="100%" height={height}>
          {/* Grid + ejes */}
          {/* Eje X ticks */}
          {xTicks.map((tx, i) => (
            <g key={`xt-${i}`}>
              <line
                x1={xScale(tx)}
                x2={xScale(tx)}
                y1={bounds.top}
                y2={height - bounds.bottom}
                className="stroke-gray-200"
                strokeWidth={1}
              />
              <text
                x={xScale(tx)}
                y={height - bounds.bottom + 16}
                className="fill-gray-500 text-[10px]"
                textAnchor="middle"
              >
                {tx}
              </text>
            </g>
          ))}
          {/* Eje Y ticks */}
          {yTicks.map((ty, i) => (
            <g key={`yt-${i}`}>
              <line
                x1={bounds.left}
                x2={containerWidth - bounds.right}
                y1={yScale(ty)}
                y2={yScale(ty)}
                className="stroke-gray-200"
                strokeWidth={1}
              />
              <text
                x={bounds.left - 6}
                y={yScale(ty) + 3}
                className="fill-gray-500 text-[10px]"
                textAnchor="end"
              >
                {ty}
              </text>
            </g>
          ))}

          {/* Ejes base */}
          <line
            x1={bounds.left}
            x2={containerWidth - bounds.right}
            y1={height - bounds.bottom}
            y2={height - bounds.bottom}
            className="stroke-gray-300"
          />
          <line
            x1={bounds.left}
            x2={bounds.left}
            y1={bounds.top}
            y2={height - bounds.bottom}
            className="stroke-gray-300"
          />

          {/* Puntos */}
          {points.map((s) => {
            const cx = xScale(s._px);
            const cy = yScale(s._py);
            const color = colorBy === "cluster" ? clusterColor(s.cluster) : "#555";
            const isHover = hoverId === s.id;

            // Atenuar si hay cluster seleccionado
            const dim =
              selectedCluster === "All" || selectedCluster === s.cluster ? 1 : 0.25;

            const r = isHover ? pointRadius + 2 : pointRadius;

            return (
              <circle
                key={s.id}
                cx={cx}
                cy={cy}
                r={r}
                fill={color}
                fillOpacity={isHover ? 0.95 * dim : 0.75 * dim}
                stroke={isHover ? "#111827" : "white"}
                strokeWidth={isHover ? 1 : 1}
                className="cursor-pointer transition-[r,opacity]"
                onMouseEnter={(e) => {
                  setHoverId(s.id);
                  const rect = (e.target as SVGCircleElement)
                    .ownerSVGElement!
                    .getBoundingClientRect();
                  setTip({
                    x: rect.left + cx,
                    y: rect.top + cy,
                    s,
                  });
                }}
                onMouseMove={(e) => {
                  const svg = (e.target as SVGCircleElement).ownerSVGElement!;
                  const rect = svg.getBoundingClientRect();
                  setTip({
                    x: rect.left + cx,
                    y: rect.top + cy,
                    s,
                  });
                }}
                onMouseLeave={() => {
                  setHoverId(null);
                  setTip(null);
                }}
                onClick={() => {
                  setSelectedId(s.id);
                  setDetailOpen(true);
                }}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {tip?.s && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border bg-white px-2 py-1 text-xs shadow-md"
            style={{
              left: Math.min(
                containerWidth - 220,
                Math.max(8, tip.x - (ref.current?.getBoundingClientRect().left ?? 0) + 8)
              ),
              top:
                (tip.y - (ref.current?.getBoundingClientRect().top ?? 0)) - 28,
            }}
          >
            <div className="font-medium text-gray-800">
              {tip.s.name} <span className="text-gray-400">({tip.s.student_id})</span>
            </div>
            <div className="text-gray-600">
              Cluster <span className="font-medium">{tip.s.cluster}</span> ·{" "}
              <span className="font-medium">{tip.s.segment}</span>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
              <span className="text-gray-500">Score:</span>
              <span className="font-medium">{tip.s.exam_score.toFixed(1)}</span>
              <span className="text-gray-500">Estudio:</span>
              <span className="font-medium">
                {(tip.s.study_minutes_per_day / 60).toFixed(1)} h/día
              </span>
              <span className="text-gray-500">Asistencia:</span>
              <span className="font-medium">{tip.s.attendance_percentage.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
        <span>PCA • PC1 vs PC2</span>
        <span>Click en un punto abre el detalle</span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}
