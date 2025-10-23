import { useClusterStats, useClusterTextMap } from '../../shared/hooks';

export default function ClusterLegend() {
  const map = useClusterTextMap();
  const stats = useClusterStats();

  // Mapeo estable de colores por cluster
  const palette: Record<number, PillColor> = {
    0: 'indigo', // dedicados / organizados
    1: 'rose',   // estrés / procrastinación
    2: 'amber',  // saludables / entorno positivo
  };

  const items: LegendItem[] = stats.map((st) => ({
    color: palette[st.cluster] ?? 'emerald',
    title: map[st.cluster]?.title ?? `Cluster ${st.cluster}`,
    desc: map[st.cluster]?.text ?? 'Sin descripción disponible.',
  }));

  return (
    <div className="mt-4">
      <div className="text-sm text-gray-600 mb-2">Leyenda de categorías</div>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <LegendPill key={it.title} {...it} />
        ))}
      </div>
    </div>
  );
}

type PillColor = 'indigo' | 'rose' | 'amber' | 'emerald';
type LegendItem = { color: PillColor; title: string; desc: string };

function LegendPill({ color, title, desc }: LegendItem) {
  const palette = {
    indigo:  { base: 'bg-indigo-100 text-indigo-800',  ring: 'ring-indigo-200',  dot: 'bg-indigo-500' },
    rose:    { base: 'bg-rose-100 text-rose-800',      ring: 'ring-rose-200',    dot: 'bg-rose-500' },
    amber:   { base: 'bg-amber-100 text-amber-900',    ring: 'ring-amber-200',   dot: 'bg-amber-500' },
    emerald: { base: 'bg-emerald-100 text-emerald-800',ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  } as const;

  const c = palette[color];

  return (
    <div className="flex items-start gap-3">
      <span
        className={`text-[12px] inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full ${c.base} ring-1 ${c.ring}`}
      >
        <span className={`h-2 w-2 rounded-full ${c.dot}`} />
        <span className="font-medium">{title}</span>
      </span>
      <span className="text-[12px] text-gray-700 leading-snug">{desc}</span>
    </div>
  );
}
