import React from "react";
import { useClusterStats, useClusterTextMap } from "../../shared/hooks";

// Colores consistentes con la leyenda
const CLUSTER_COLORS: Record<number, string> = {
  0: "#6366f1", // indigo-500
  1: "#f43f5e", // rose-500
  2: "#f59e0b", // amber-500
};

export default function ProfessorKPIs() {
  const stats = useClusterStats();                 // [{ cluster, n, avgScore, ... }]
  const textMap = useClusterTextMap();             // { [cluster]: { title, text } }

  const total = stats.reduce((a, b) => a + b.n, 0);
   // lo calcularemos sumando desde stats? -> mejor derivar directo de datos si lo necesitas
  // Como useClusterStats no trae lowAttend, lo sacamos de DOM externo si lo necesitas.
  // Mantendremos una KPI proxy: % asistencia promedio total.
  const avgAttendanceOverall =
    stats.length ? stats.reduce((a, b) => a + b.avgAttendance, 0) / stats.length : 0;

  // Distribución por cluster (conteo + %)
  const distribution = stats
    .slice()
    .sort((a, b) => a.cluster - b.cluster)
    .map((r) => ({
      cluster: r.cluster,
      label: textMap[r.cluster]?.title ?? `Cluster ${r.cluster}`,
      n: r.n,
      pct: total ? (r.n / total) * 100 : 0,
      color: CLUSTER_COLORS[r.cluster] ?? "#10b981",
    }));

  // Promedio de score por cluster (ordenado por rendimiento)
  const avgByCluster = stats
    .slice()
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((r) => ({
      cluster: r.cluster,
      label: textMap[r.cluster]?.title ?? `Cluster ${r.cluster}`,
      avg: r.avgScore,
      color: CLUSTER_COLORS[r.cluster] ?? "#10b981",
    }));

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Card title="Total Estudiantes" icon="👥">
        <div className="mt-1 text-3xl font-bold">{total}</div>
        <p className="mt-1 text-xs text-gray-500">Muestra completa analizada</p>
      </Card>

      <Card title="Distribución por Cluster" icon="🧭">
        <ul className="mt-2 space-y-1 text-sm">
          {distribution.map((r) => (
            <li key={r.cluster} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Dot color={r.color} />
                <span className="truncate">{r.label}</span>
              </span>
              <span className="tabular-nums">
                <span className="font-medium">{r.n}</span>{" "}
                <span className="text-gray-500">({r.pct.toFixed(1)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Score Promedio por Cluster" icon="📈">
        <ul className="mt-2 space-y-1 text-sm">
          {avgByCluster.map((r) => (
            <li key={r.cluster} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Dot color={r.color} />
                <span className="truncate">{r.label}</span>
              </span>
              <span className="font-medium tabular-nums">{r.avg.toFixed(1)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-gray-500">
          Ordenado de mayor a menor rendimiento.
        </p>
      </Card>

      <Card title="Asistencia promedio" icon="🕘">
        <div className="mt-1 text-3xl font-bold">{avgAttendanceOverall.toFixed(1)}%</div>
        <p className="mt-1 text-xs text-gray-500">
          Promedio global (todas las categorías)
        </p>
      </Card>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
      style={{ backgroundColor: color }}
    />
  );
}
