import React, { useMemo } from "react";
import type { EnrichedStudent } from "../shared/types";

export default function ProfessorKPIs({ data }: { data: EnrichedStudent[] }) {
  const { total, byCluster, avgByCluster, lowAttendancePct } = useMemo(() => {
    const total = data.length;
    const byCluster: Record<number, number> = {};
    const agg: Record<number, {sum:number; n:number}> = {};
    let lowAttend = 0;

    data.forEach(d => {
      byCluster[d.cluster] = (byCluster[d.cluster] ?? 0) + 1;
      agg[d.cluster] = agg[d.cluster] ?? {sum:0, n:0};
      agg[d.cluster].sum += d.exam_score;
      agg[d.cluster].n += 1;
      if (d.attendance_percentage < 75) lowAttend++;
    });

    const avgByCluster = Object.keys(agg).map(c => ({
      cluster: Number(c),
      avg: agg[Number(c)].sum / agg[Number(c)].n
    })).sort((a,b)=>a.cluster-b.cluster);

    const lowAttendancePct = total ? (lowAttend/total)*100 : 0;
    return { total, byCluster, avgByCluster, lowAttendancePct };
  }, [data]);

  return (
    <div className="grid gap-4 lg:grid-cols-4 ">
      <Card title="Total Estudiantes" icon="𐀪𐀪">
        <div className="text-3xl font-bold mt-1">{total}</div>
      </Card>

      <Card title="Distribución por Categoría" icon="〽">
        <ul className="mt-2 text-sm">
          {Object.keys(byCluster).sort().map(k=>(
            <li key={k} className="flex justify-between">
              <span>Cluster {k}</span>
              <span className="font-medium">{byCluster[Number(k)]}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Puntuación Media por Categoría" icon="⚡︎">
        <ul className="mt-2 text-sm">
          {avgByCluster.map(r=>(
            <li key={r.cluster} className="flex justify-between">
              <span>Cluster {r.cluster}</span>
              <span className="font-medium">{r.avg.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Asistencia < 75%" icon="⏱">
        <div className="text-3xl font-bold mt-1">{lowAttendancePct.toFixed(1)}%</div>
      </Card>
    </div>
  );
}

function Card({ title, icon, children }:{title:string; icon:string; children:React.ReactNode}) {
  return (
    <div className="bg-white border border-gray-300 rounded-2xl p-4 shadow-xl">
      <div className="text-sm text-gray-500 flex items-center flex-row-reverse justify-between">
        <span>{icon}</span><span>{title}</span>
      </div>
      {children}
    </div>
  );
}
