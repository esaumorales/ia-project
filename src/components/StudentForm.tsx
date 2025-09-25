import React, { useState } from "react";
import { useAppStore } from "../shared/store";
import type { Student } from "../shared/types";
import { buildAnalytics } from "../shared/analytics";

export default function StudentForm() {
  const { data, setData, setSelectedId } = useAppStore();

  const [form, setForm] = useState({
    study_minutes_per_day: 180,
    social_media_minutes: 120,
    netflix_minutes: 90,
    attendance_percentage: 85,
    sleep_hours: 7.5,
    exercise_frequency: 3,
    mental_health_rating: 7,
    academic_motivation: 4,
    time_management: 3,
    procrastination_level: 2,
    focus_level: 4,
    test_anxiety_level: 5,
    academic_self_efficacy: 7,
    study_techniques_usage: 3,
    home_study_environment: 4,
    study_resources_availability: 4,
    financial_stress_level: 2,
    diet_quality: 3,
    age: 20,
    gender: "Female",
    part_time_job: false,
    parental_education_level: "Tertiary",
    internet_quality: "Good",
    extracurricular_participation: 1,
    exam_score: 75
  });

  const edit = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: Number(e.target.value) });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: data.length + 1,
      student_id: `SELF${data.length + 1}`,
      name: "Yo (Alumno)",
      ...form,
    } as Student;

    const enriched = buildAnalytics([...data, newStudent], 3);
    setData(enriched);
    setSelectedId(newStudent.id);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <h2 className="text-2xl font-semibold">Autoevaluación de Hábitos de Estudio</h2>
      <p className="text-gray-600">Completa todos los campos para obtener tu categoría.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Num label="Minutos de estudio por día" value={form.study_minutes_per_day} onChange={edit("study_minutes_per_day")} />
        <Num label="Minutos en redes sociales" value={form.social_media_minutes} onChange={edit("social_media_minutes")} />
        <Num label="Minutos Netflix/TV" value={form.netflix_minutes} onChange={edit("netflix_minutes")} />
        <Num label="Porcentaje de asistencia (%)" value={form.attendance_percentage} onChange={edit("attendance_percentage")} />
        <Num label="Horas de sueño" value={form.sleep_hours} onChange={edit("sleep_hours")} step="0.1" />
        <Num label="Frecuencia de ejercicio (d/sem)" value={form.exercise_frequency} onChange={edit("exercise_frequency")} />
        <Num label="Salud mental (1–10)" value={form.mental_health_rating} onChange={edit("mental_health_rating")} />
        <Num label="Motivación académica (1–5)" value={form.academic_motivation} onChange={edit("academic_motivation")} />
        <Num label="Gestión del tiempo (1–5)" value={form.time_management} onChange={edit("time_management")} />
        <Num label="Procrastinación (1–5)" value={form.procrastination_level} onChange={edit("procrastination_level")} />
        <Num label="Concentración (1–5)" value={form.focus_level} onChange={edit("focus_level")} />
        <Num label="Ansiedad en exámenes (1–10)" value={form.test_anxiety_level} onChange={edit("test_anxiety_level")} />
        <Num label="Autoeficacia (1–10)" value={form.academic_self_efficacy} onChange={edit("academic_self_efficacy")} />
        <Num label="Técnicas de estudio (1–5)" value={form.study_techniques_usage} onChange={edit("study_techniques_usage")} />
        <Num label="Ambiente en casa (1–5)" value={form.home_study_environment} onChange={edit("home_study_environment")} />
        <Num label="Recursos (1–5)" value={form.study_resources_availability} onChange={edit("study_resources_availability")} />
        <Num label="Estrés financiero (1–5)" value={form.financial_stress_level} onChange={edit("financial_stress_level")} />
      </div>

      <button className="rounded-xl bg-black text-white px-5 py-3 hover:bg-gray-900">
        Calcular mi categoría
      </button>
    </form>
  );
}

function Num({
  label, value, onChange, step
}: { label:string; value:number; onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void; step?:string }) {
  return (
    <label className="flex flex-col text-sm">
      <span className="text-gray-700 mb-1">{label}</span>
      <input type="number" value={value} onChange={onChange} step={step}
             className="rounded-[8px] border border-gray-300 px-3 py-2" />
    </label>
  );
}
