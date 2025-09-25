// Ajusta textos si cambian tus estadísticas.
// Ojo: los índices C0..C3 dependen del KMeans. Usamos seed=42 para estabilidad.
export const CLUSTER_TEXT: Record<number, { title: string; text: string }> = {
    0: {
      title: "C0 — Productivos con rendimiento alto",
      text: "Estudio alto (~4.5 h/día), distracciones bajas (redes ~2.16 h, Netflix ~1.58 h), asistencia media-alta (~82%), sueño ~6.9 h, exam_score alto (~83)."
    },
    1: {
      title: "C1 — Baja dedicación y ánimo bajo",
      text: "Estudio bajo (~2.25 h/día), distracciones altas (redes/netflix ~2.87/1.99 h), asistencia ~86.6%, salud mental baja (~4.5/10), exam_score bajo (~53)."
    },
    2: {
      title: "C2 — Participación baja/intermitente",
      text: "Estudio medio (~3.35 h/día), asistencia baja (~75%), sueño ~5.9 h, distracciones moderadas, exam_score medio-bajo (~64)."
    },
    3: {
      title: "C3 — Muy comprometidos en clase",
      text: "Estudio alto (~4.1 h/día), asistencia alta (~93.6%), sueño ~6.7 h, exam_score medio-alto (~78)."
    }
  };
  