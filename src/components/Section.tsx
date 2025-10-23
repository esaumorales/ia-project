import React from "react";

export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="bg-white border rounded-2xl p-4 shadow-xll">{children}</div>
    </section>
  );
}
