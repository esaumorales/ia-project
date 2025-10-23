import  { useMemo, useRef, useState, useEffect } from "react";
import type { EnrichedStudent } from "../../shared/types";
import { useAppStore } from "../../shared/store";

// Paleta consistente con tu leyenda:
// Cluster 0 (indigo), 1 (rose), 2 (amber), 3 (emerald)
const clusterColor = (c: number) =>
  c === 0
    ? "#6366f1" // indigo-500
    : c === 1
    ? "#f43f5e" // rose-500
    : c === 2
    ? "#f59e0b" // amber-500
    : "#10b981"; // emerald-500

type Props = {
  data: EnrichedStudent[];
  height?: number; // px
  pointRadius?: number; // px
  colorBy?: "cluster"; // se deja extensible (segment) si luego quisieras
};

export default function PCAScatter({
  data,
  height = 320,
  pointRadius = 4,
  colorBy = "cluster",
}: Props) {
  const { setSelectedId, setDetailOpen } = useAppStore();
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

  // Escalas
  const { xScale, yScale, xTicks, yTicks, bounds } = useMemo(() => {
    const pad = 0.08; // padding en espacio PCA
    const xs = data.map((d) => d.pcaX);
    const ys = data.map((d) => d.pcaY);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);

    // Se agrega margen para que no queden pegados
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
    // y invertido (SVG top→down)
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
  }, [data, containerWidth, height]);

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
          Distribución PCA (color por categoría)
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <LegendDot color="#6366f1" label="Cluster 0" />
          <LegendDot color="#f43f5e" label="Cluster 1" />
          <LegendDot color="#f59e0b" label="Cluster 2" />
          <LegendDot color="#10b981" label="Cluster 3" />
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
          {data.map((s) => {
            const cx = xScale(s.pcaX);
            const cy = yScale(s.pcaY);
            const color = colorBy === "cluster" ? clusterColor(s.cluster) : "#555";

            const isHover = hoverId === s.id;
            const r = isHover ? pointRadius + 2 : pointRadius;

            return (
              <circle
                key={s.id}
                cx={cx}
                cy={cy}
                r={r}
                fill={color}
                fillOpacity={isHover ? 0.95 : 0.75}
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
                containerWidth - 200,
                Math.max(8, tip.x - (ref.current?.getBoundingClientRect().left ?? 0) + 8)
              ),
              top:
                (tip.y - (ref.current?.getBoundingClientRect().top ?? 0)) - 24,
            }}
          >
            <div className="font-medium text-gray-800">
              {tip.s.name} <span className="text-gray-400">({tip.s.student_id})</span>
            </div>
            <div className="text-gray-600">
              Cat: <span className="font-medium">Cluster {tip.s.cluster}</span> · Score:{" "}
              <span className="font-medium">{tip.s.exam_score.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
        <span>PCA • pcaX vs pcaY</span>
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
