import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Scatter } from "recharts";
import type { EnrichedStudent } from "../shared/types";

export default function PCAChart({ data, onSelect }: { data: EnrichedStudent[]; onSelect?: (id:number)=>void }) {
  const groups = {
    "Good": data.filter(d => d.segment === "Good"),
    "Average": data.filter(d => d.segment === "Average"),
    "Needs Support": data.filter(d => d.segment === "Needs Support"),
  };
  const fmt = (d: EnrichedStudent) => ({ x: d.pcaX, y: d.pcaY, id: d.id, name: d.name });

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="PC1" />
          <YAxis type="number" dataKey="y" name="PC2" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          <Scatter name="Good" data={groups["Good"].map(fmt)} onClick={(e:any)=>onSelect?.(e?.payload?.id)} />
          <Scatter name="Average" data={groups["Average"].map(fmt)} onClick={(e:any)=>onSelect?.(e?.payload?.id)} />
          <Scatter name="Needs Support" data={groups["Needs Support"].map(fmt)} onClick={(e:any)=>onSelect?.(e?.payload?.id)} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
  