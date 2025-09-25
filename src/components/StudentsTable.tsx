import React, { useMemo, useState } from 'react';
import type { EnrichedStudent } from '../shared/types';
import { useAppStore } from '../shared/store';
import { Icon } from '@iconify/react';

export default function StudentsTable({ data }: { data: EnrichedStudent[] }) {
  const { setSelectedId, setDetailOpen } = useAppStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  return (
    <div className="rounded-[4px] border border-gray-300 shadow-sm overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <Th>ID</Th>
            <Th>Nombre</Th>
            <Th>Estudio (min/día)</Th>
            <Th>Redes Sociales (min)</Th>
            <Th>Netflix (min)</Th>
            <Th>Asistencia (%)</Th>
            <Th>Sueño (h)</Th>
            <Th>Puntuación Examen</Th>
            <Th>Categoría</Th>
            <Th className="text-center">Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((s) => (
            <tr key={s.id} className="border-b">
              <Td>{s.student_id}</Td>
              <Td className="font-medium">{s.name}</Td>
              <Td>{s.study_minutes_per_day}</Td>
              <Td>{s.social_media_minutes}</Td>
              <Td>{s.netflix_minutes}</Td>
              <Td>{s.attendance_percentage.toFixed(1)}%</Td>
              <Td>{s.sleep_hours}</Td>
              <Td>{s.exam_score.toFixed(1)}</Td>
              <Td>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${badgeForSegment(
                    s.segment
                  )}`}>
                  {segmentHuman(s.segment)}
                </span>
              </Td>
              <Td className="text-center">
                <button
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => {
                    setSelectedId(s.id);
                    setDetailOpen(true);
                  }}
                  title="Ver detalle">
                  <Icon icon="weui:eyes-on-outlined" width="16" height="16" />{' '}
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* footer paginación */}
      <div className="flex items-center justify-between px-3 py-2 text-sm">
        <div className="text-gray-600">
          Mostrando {data.length ? (page - 1) * pageSize + 1 : 0} a{' '}
          {Math.min(page * pageSize, data.length)} de {data.length} estudiantes
        </div>
        <div className="flex items-center gap-3">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border px-2 py-1">
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 rounded border hover:bg-gray-50"
              onClick={() => setPage(Math.max(1, page - 1))}>
              Anterior
            </button>
            <span className="text-gray-500">
              Página {page} de {totalPages}
            </span>
            <button
              className="px-2 py-1 rounded border hover:bg-gray-50"
              onClick={() => setPage(Math.min(totalPages, page + 1))}>
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-left font-semibold px-3 py-2 text-sm text-gray-700 ${
        className ?? ''
      }`}>
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
  return <td className={`px-3 py-2 text-sm ${className ?? ''}`}>{children}</td>;
}
function badgeForSegment(seg: EnrichedStudent['segment']) {
  return seg === 'Good'
    ? 'bg-emerald-100 text-emerald-700'
    : seg === 'Average'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-rose-100 text-rose-700';
}
function segmentHuman(seg: EnrichedStudent['segment']) {
  if (seg === 'Good') return 'Muy comprometidos en clase';
  if (seg === 'Average') return 'Participación baja/intermitente';
  return 'Baja dedicación y ánimo bajo';
}
