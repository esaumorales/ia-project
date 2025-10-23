import { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  Legend,
} from "recharts";
import type { EnrichedStudent } from "../../shared/types";
import { useAppStore } from "../../shared/store";

// Colores consistentes con la leyenda (aprox Tailwind 500)
const CLUSTER_COLORS: Record<number, string> = {
  0: "#6366F1", // indigo-500
  1: "#F43F5E", // rose-500
  2: "#F59E0B", // amber-500
};

// PRNG determinista basado en id para jitter estable
function pseudoRand01(n: number) {
  // hash simple determinista
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x); // fract
}

export default function PCAChart({
  data,
  onSelect,
}: {
  data: EnrichedStudent[];
  onSelect?: (id: number) => void;
}) {
  const { selectedCluster, pcaScale, pcaJitter } = useAppStore();

  // Mapeo por clusterId
  const groups = useMemo(() => {
    const byC = new Map<number, EnrichedStudent[]>();
    for (const d of data) {
      const arr = byC.get(d.cluster) ?? [];
      arr.push(d);
      byC.set(d.cluster, arr);
    }
    return byC;
  }, [data]);

  // Formatea punto con jitter/scale y payload enriquecido
  const fmt = (d: EnrichedStudent) => {
    const jx = (pseudoRand01(d.id * 3.17) - 0.5) * pcaJitter;
    const jy = (pseudoRand01(d.id * 7.91) - 0.5) * pcaJitter;
    return {
      x: d.pcaX * pcaScale + jx,
      y: d.pcaY * pcaScale + jy,
      id: d.id,
      name: d.name,
      cluster: d.cluster,
      segment: d.segment,
      exam_score: d.exam_score,
      studyH: d.study_minutes_per_day / 60,
      attendance: d.attendance_percentage,
    };
  };

  // Prepara series por cluster (0..2); si no existe, queda vacío
  const series = [0, 1, 2].map((cid) => {
    const arr = (groups.get(cid) ?? []).map(fmt);
    const dimOpacity =
      selectedCluster === "All" || selectedCluster === cid ? 1 : 0.25;
    return { cid, arr, opacity: dimOpacity, color: CLUSTER_COLORS[cid] ?? "#10B981" }; // fallback emerald
  });

  // Tooltip custom
  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload;
    if (!p) return null;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-md">
        <div className="font-medium">{p.name}</div>
        <div className="text-gray-600">
          Cluster {p.cluster} · {p.segment}
        </div>
        <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
          <span className="text-gray-500">Score:</span>
          <span className="font-medium">{Math.round(p.exam_score)}</span>
          <span className="text-gray-500">Estudio:</span>
          <span className="font-medium">{p.studyH.toFixed(1)} h/día</span>
          <span className="text-gray-500">Asistencia:</span>
          <span className="font-medium">{p.attendance.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  const handlePointClick = (e: any) => {
    const id = e?.payload?.id ?? e?.id;
    if (typeof id === "number") onSelect?.(id);
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="PC1" />
          <YAxis type="number" dataKey="y" name="PC2" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={renderTooltip} />
          <Legend />
          {series.map(({ cid, arr, opacity, color }) => (
            <Scatter
              key={cid}
              name={`Cluster ${cid}`}
              data={arr}
              fill={color}
              fillOpacity={opacity}
              onClick={handlePointClick}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
