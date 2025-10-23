import React from "react";
import type { EnrichedStudent } from "../shared/types";
import { useAppStore } from "../shared/store";

export default function StudentList({ data }: { data: EnrichedStudent[] }) {
  const { selectedId, setSelectedId } = useAppStore();
  return (
    <div className="bg-white border rounded-2xl shadow-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
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
          {data.map(s => (
            <tr key={s.id} onClick={()=>setSelectedId(s.id)} className={`border-b hover:bg-gray-50 cursor-pointer ${selectedId===s.id?"bg-gray-50":""}`}>
              <Td>{s.student_id}</Td>
              <Td className="font-medium">{s.name}</Td>
              <Td>{s.attendance_percentage.toFixed(1)}%</Td>
              <Td>{s.study_minutes_per_day}</Td>
              <Td>{s.social_media_minutes}</Td>
              <Td>{s.exam_score}</Td>
              <Td><Pill label={s.segment} /></Td>
              <Td className="uppercase text-xs">{s.classLabel}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) { return <th className="text-left font-semibold px-3 py-2 text-sm text-gray-700">{children}</th>; }
function Td({ children, className }: { children: React.ReactNode; className?: string }) { return <td className={`px-3 py-2 text-sm ${className??""}`}>{children}</td>; }

export function Pill({ label }: { label: "Good" | "Average" | "Needs Support" }) {
  const styles = {
    "Good":"bg-green-100 text-green-700",
    "Average":"bg-amber-100 text-amber-700",
    "Needs Support":"bg-rose-100 text-rose-700"
  }[label];
  return <span className={`text-xs px-2 py-1 rounded-full ${styles}`}>{label}</span>;
}
