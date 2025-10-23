import React from "react";
import type { EnrichedStudent } from "../../shared/types";
import { useAppStore } from "../../shared/store";

export default function StudentList({ data }: { data: EnrichedStudent[] }) {
  const { selectedId, setSelectedId, setDetailOpen } = useAppStore();

  const onRowClick = (id: number) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <Th>Cluster</Th>
            <Th>ID</Th>
            <Th>Nombre</Th>
            <Th>Asistencia %</Th>
            <Th>Estudio (min/d)</Th>
            <Th>Redes (min/d)</Th>
            <Th>Score</Th>
            <Th>Segmento</Th>
            <Th>Clase</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr
              key={s.id}
              onClick={() => onRowClick(s.id)}
              className={`cursor-pointer border-b hover:bg-gray-50 ${
                selectedId === s.id ? "bg-gray-50" : ""
              }`}
            >
              <Td>
                <ClusterChip cluster={s.cluster} />
              </Td>
              <Td>{s.student_id}</Td>
              <Td className="font-medium">{s.name}</Td>
              <Td>{s.attendance_percentage.toFixed(1)}%</Td>
              <Td>{s.study_minutes_per_day}</Td>
              <Td>{s.social_media_minutes}</Td>
              <Td>{s.exam_score.toFixed(1)}</Td>
              <Td>
                <Pill label={s.segment} />
              </Td>
              <Td className="text-xs uppercase">{s.classLabel}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 text-sm ${className ?? ""}`}>{children}</td>;
}

// Chip de segmento (Good / Average / Needs Support)
export function Pill({
  label,
}: {
  label: "Good" | "Average" | "Needs Support";
}) {
  const styles =
    {
      Good: "bg-emerald-100 text-emerald-700",
      Average: "bg-amber-100 text-amber-700",
      "Needs Support": "bg-rose-100 text-rose-700",
    }[label] || "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2 py-1 text-xs ${styles}`}>{label}</span>
  );
}

// Chip de cluster (0..2) con colores consistentes
function ClusterChip({ cluster }: { cluster: number }) {
  const c =
    cluster === 0
      ? { dot: "#6366f1", base: "bg-indigo-50 text-indigo-700 ring-indigo-200" }
      : cluster === 1
      ? { dot: "#f43f5e", base: "bg-rose-50 text-rose-700 ring-rose-200" }
      : { dot: "#f59e0b", base: "bg-amber-50 text-amber-800 ring-amber-200" };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ring-1 ${c.base}`}
      title="Cluster asignado (k=3)"
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: c.dot }}
      />
      <span className="font-medium">C{cluster}</span>
    </span>
  );
}
