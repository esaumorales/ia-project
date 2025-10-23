import { Icon } from '@iconify/react';
import { useAppStore } from '../../shared/store';

export default function ProfessorFilters() {
  const {
    // filtros de lista
    search, setSearch,
    segmentFilter, setSegmentFilter,
    genderFilter, setGenderFilter,
    attendanceRange, setAttendanceRange,
    studyRange, setStudyRange,
    orderBy, setOrderBy,
    viewMode, setViewMode,

    // NUEVO: controles de visualización/selección
    selectedCluster, setSelectedCluster,
    pcaScale, setPcaScale,
    pcaJitter, setPcaJitter,

    // (opcionales si luego quieres recalcular análisis)
    // kClusters, setKClusters, pcaComponents, setPcaComponents, seed, setSeed,
  } = useAppStore();

  const onLeft = (cur:[number,number], set:(v:[number,number])=>void, v:number) =>
    set([Math.min(v, cur[1]), cur[1]]);
  const onRight = (cur:[number,number], set:(v:[number,number])=>void, v:number) =>
    set([cur[0], Math.max(v, cur[0])]);

  const resetAll = () => {
    setSearch('');
    setSegmentFilter('All');
    setGenderFilter('All');
    setAttendanceRange([0, 100]);
    setStudyRange([0, 300]);
    setOrderBy('Nombre');
    setViewMode('table');
    setSelectedCluster('All');
    setPcaScale(1);
    setPcaJitter(0);
  };

  return (
    <div className="bg-white border rounded-[4px] shadow-xl p-4 border-gray-300">
      {/* Fila superior */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* izquierda */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Buscar por nombre o ID..."
              className="w-72 rounded-xl border border-gray-300 px-10 py-2 text-sm"
            />
            <Icon icon="material-symbols-light:search" width="20" height="20" className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <select
            value={segmentFilter}
            onChange={(e)=>setSegmentFilter(e.target.value as any)}
            className="rounded-xl border px-3 py-2 text-sm border-gray-300"
          >
            <option value="All">Todas las categorías</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Needs Support">Needs Support</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e)=>setGenderFilter(e.target.value as any)}
            className="rounded-xl border px-3 py-2 text-sm border-gray-300"
          >
            <option value="All">Todos los géneros</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={orderBy}
            onChange={(e)=>setOrderBy(e.target.value as any)}
            className="rounded-xl border px-3 py-2 text-sm border-gray-300"
          >
            <option>Nombre</option>
            <option>Estudio</option>
            <option>Asistencia</option>
            <option>Score</option>
          </select>
        </div>

        {/* derecha */}
        <div className="flex items-center gap-4 text-sm">
          <span>Vista:</span>
          <label className="flex items-center gap-1">
            <input type="radio" checked={viewMode==="table"} onChange={()=>setViewMode("table")} />
            <span>Tabla</span>
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={viewMode==="cards"} onChange={()=>setViewMode("cards")} />
            <span>Tarjetas</span>
          </label>

          <button
            onClick={resetAll}
            className="ml-2 inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            title="Reiniciar filtros y controles"
          >
            <Icon icon="material-symbols:restart-alt-rounded" width="16" height="16" />
            Reset
          </button>
        </div>
      </div>

      {/* sliders de rangos */}
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-1 flex justify-between text-sm text-gray-600">
            <span>Rango de asistencia: 0% - 100%</span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
              {attendanceRange[0].toFixed(0)}% – {attendanceRange[1].toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={100} value={attendanceRange[0]} onChange={(e)=>onLeft(attendanceRange,setAttendanceRange,Number(e.target.value))} className="w-full" />
            <input type="range" min={0} max={100} value={attendanceRange[1]} onChange={(e)=>onRight(attendanceRange,setAttendanceRange,Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm text-gray-600">
            <span>Tiempo de estudio: 0 - 300 min/día</span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
              {studyRange[0].toFixed(0)} – {studyRange[1].toFixed(0)} min/día
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={300} value={studyRange[0]} onChange={(e)=>onLeft(studyRange,setStudyRange,Number(e.target.value))} className="w-full" />
            <input type="range" min={0} max={300} value={studyRange[1]} onChange={(e)=>onRight(studyRange,setStudyRange,Number(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>

      {/* NUEVO: Controles de visualización del scatter */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">Resaltar cluster</label>
          <select
            value={selectedCluster as any}
            onChange={(e)=>setSelectedCluster(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            className="rounded-xl border px-3 py-2 text-sm border-gray-300"
          >
            <option value="All">Todos</option>
            <option value={0}>Cluster 0</option>
            <option value={1}>Cluster 1</option>
            <option value={2}>Cluster 2</option>
          </select>
          <p className="text-[11px] text-gray-500">
            Atenúa los puntos de otros clusters en el gráfico PCA.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">
            PCA Scale <span className="text-gray-400">(0.5 – 2.0)</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={pcaScale}
            onChange={(e)=>setPcaScale(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-[11px] text-gray-600">
            Valor actual: <span className="font-medium">{pcaScale.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">
            PCA Jitter <span className="text-gray-400">(0 – 1.0)</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={pcaJitter}
            onChange={(e)=>setPcaJitter(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-[11px] text-gray-600">
            Valor actual: <span className="font-medium">{pcaJitter.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
