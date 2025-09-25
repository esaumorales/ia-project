import React from "react";

type Props = {
  onAlumno?: () => void;
  onProfesor?: () => void;
};

export default function Landing({ onAlumno, onProfesor }: Props) {
  return (
    <div className="min-h-[88vh] bg-gradient-to-b from-indigo-50/60 via-white to-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-10 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          Conoce tu categoría de estudio
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Ingresas tus hábitos, te mostramos tu segmento y las razones.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={onAlumno}
            className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-5 py-3 text-sm hover:bg-gray-900"
          >
            Evaluar mi categoría
            <span aria-hidden>→</span>
          </button>
          <button
            onClick={onProfesor}
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm hover:bg-gray-50"
          >
            <span aria-hidden>👨‍🏫</span>
            Vista Profesor
          </button>
        </div>
      </div>

      {/* Metodología */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2">
            <span className="text-indigo-600" aria-hidden>📊</span>
            <h3 className="text-lg font-semibold">Metodología</h3>
          </div>
          <p className="mt-2 text-gray-600">
            Nuestro sistema utiliza técnicas avanzadas de análisis de datos para categorizar estudiantes:
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Step>● Estandarización</Step>
            <span className="text-gray-400">→</span>
            <Step color="purple">● PCA (≥85% var.)</Step>
            <span className="text-gray-400">→</span>
            <Step color="green">● k-means (K por codo + silhouette)</Step>
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="max-w-6xl mx-auto px-4 mt-12 pb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Análisis Personalizado"
          icon="🎯"
          text="Evaluamos 17 variables clave de tus hábitos de estudio para crear un perfil único y preciso."
        />
        <Card
          title="Segmentación Inteligente"
          icon="🧑‍🤝‍🧑"
          text="Usamos algoritmos de machine learning para identificar patrones y agrupar estudiantes similares."
        />
        <Card
          title="Recomendaciones Específicas"
          icon="📈"
          text="Recibe consejos personalizados basados en tu categoría para mejorar tu rendimiento académico."
        />
      </div>
    </div>
  );
}

function Step({
  children,
  color = "indigo",
}: {
  children: React.ReactNode;
  color?: "indigo" | "purple" | "green";
}) {
  const styles =
    color === "indigo"
      ? "bg-indigo-50 text-indigo-700"
      : color === "purple"
      ? "bg-purple-50 text-purple-700"
      : "bg-emerald-50 text-emerald-700";
  return (
    <span className={`px-3 py-1 rounded-full ${styles}`}>
      {children}
    </span>
  );
}

function Card({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h4 className="font-semibold text-lg">{title}</h4>
      </div>
      <p className="mt-2 text-gray-600">{text}</p>
    </div>
  );
}
