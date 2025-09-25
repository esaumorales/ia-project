
export default function ClusterLegend() {
  return (
    <div className="mt-6">
      <div className="text-sm text-gray-600 mb-2">Leyenda de Categorías</div>
      <div className="flex flex-wrap gap-4 items-center">
        <LegendPill color="indigo" text="Cluster 0" desc="Productivos con rendimiento alto" />
        <LegendPill color="rose" text="Cluster 1" desc="Baja dedicación y ánimo bajo" />
        <LegendPill color="amber" text="Cluster 2" desc="Participación baja/intermitente" />
        <LegendPill color="emerald" text="Cluster 3" desc="Muy comprometidos en clase" />
      </div>
    </div>
  );
}

function LegendPill({ color, text, desc }:{color:"indigo"|"rose"|"amber"|"emerald"; text:string; desc:string}) {
  const styles = {
    indigo: "bg-indigo-100 text-indigo-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
  }[color];
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs px-3 py-1 rounded-full ${styles}`}>{text}</span>
      <span className="text-sm text-gray-600">{desc}</span>
    </div>
  );
}
