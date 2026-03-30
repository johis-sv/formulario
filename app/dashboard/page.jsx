"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { STATUSES, PIE_COLORS, DEPARTMENTS } from "@/lib/constants";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Search, ChevronDown, Download, Eye, RefreshCw, Layers,
  BarChart2, TrendingUp, Check, X, Paperclip, Mail, ChevronUp,
  AlertTriangle,
} from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── Detail / Status Modal ──────────────────────────────────────────────────── */
function DetailModal({ record, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(record.estado);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdateStatus(record.id, newStatus);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "white", maxHeight: "90vh", width: "100%", maxWidth: "680px" }}
        className="rounded-2xl shadow-2xl overflow-y-auto">
        <div style={{ background: "linear-gradient(135deg,#1E3A5F,#2563EB)" }}
          className="p-5 text-white rounded-t-2xl flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-xs mb-1">{record.id?.slice(0,8).toUpperCase()} · {fmtDate(record.fecha_iniciativa)}</p>
            <h3 style={{ fontFamily: "'Playfair Display',serif" }} className="text-xl font-bold">{record.nombre_iniciativa}</h3>
            <p className="text-blue-100 text-sm mt-1">{record.nombre_postulante} · {record.departamento}</p>
          </div>
          <button onClick={onClose} className="ml-4 hover:opacity-70 transition mt-1"><X size={22} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }} className="rounded-xl p-4 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">Correo</p>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1"><Mail size={13} className="text-slate-400"/>{record.correo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Estado actual</p>
              <StatusBadge status={record.estado} />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Registrado</p>
              <p className="text-sm font-medium text-slate-700">{fmtDate(record.created_at)}</p>
            </div>
          </div>

          {[
            ["🔍 Descripción del Problema", record.problema],
            ["💡 Descripción de la Solución", record.solucion],
            ["🎯 Beneficio Esperado",         record.beneficio],
          ].map(([title, content]) => (
            <div key={title}>
              <p className="text-sm font-semibold text-slate-700 mb-2">{title}</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
          ))}

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">⚠️ Impacto si NO se Realiza</p>
            <div className="flex flex-wrap gap-2">
              {(record.impacto || []).map((i) => (
                <span key={i} style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize">{i}</span>
              ))}
            </div>
            {record.impacto_otros_texto && (
              <p className="text-xs text-slate-500 mt-2 italic">Otros: {record.impacto_otros_texto}</p>
            )}
          </div>

          {record.archivos?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">📎 Archivos Adjuntos</p>
              <div className="flex flex-wrap gap-2">
                {record.archivos.map((f, i) => (
                  <span key={i} style={{ background: "#F0F4FF", border: "1px solid #DBEAFE", color: "#1E40AF" }}
                    className="text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Paperclip size={11} />{f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status updater */}
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }} className="rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Actualizar Estado</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(STATUSES).map((s) => (
                <button key={s} onClick={() => setNewStatus(s)}
                  style={{
                    background: newStatus === s ? STATUSES[s].bg : "white",
                    color: newStatus === s ? STATUSES[s].text : "#64748B",
                    border: `1px solid ${newStatus === s ? STATUSES[s].border : "#E2E8F0"}`,
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80">
                  {s}
                </button>
              ))}
            </div>
            <button onClick={save} disabled={saving}
              style={{ background: saving ? "#94A3B8" : "linear-gradient(135deg,#1E3A5F,#2563EB)", color: "white" }}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold shadow hover:opacity-90 transition flex items-center justify-center gap-2 disabled:cursor-not-allowed">
              {saving ? <><RefreshCw size={14} className="animate-spin" /> Guardando...</> : <><Check size={16} /> Guardar Estado</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Page ─────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterDept, setFilterDept]     = useState("Todos");
  const [sortCol, setSortCol]       = useState("created_at");
  const [sortDir, setSortDir]       = useState("desc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/iniciativas");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStatus = async (id, estado) => {
    await fetch(`/api/iniciativas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    await fetchData();
  };

  // Filter + sort
  const filtered = records
    .filter((r) => filterStatus === "Todos" || r.estado === filterStatus)
    .filter((r) => filterDept === "Todos" || r.departamento === filterDept)
    .filter((r) => {
      const q = search.toLowerCase();
      return !q || r.nombre_iniciativa?.toLowerCase().includes(q)
        || r.nombre_postulante?.toLowerCase().includes(q)
        || r.correo?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const av = a[sortCol] || ""; const bv = b[sortCol] || "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const counts = Object.keys(STATUSES).reduce((acc, s) => {
    acc[s] = records.filter((r) => r.estado === s).length; return acc;
  }, {});

  const byDept = DEPARTMENTS
    .filter((d) => records.some((r) => r.departamento === d))
    .map((d) => ({ name: d.split(" ")[0], count: records.filter((r) => r.departamento === d).length }))
    .sort((a, b) => b.count - a.count).slice(0, 6);

  const byStatus = Object.keys(STATUSES).map((s, i) => ({
    name: s, value: counts[s], fill: PIE_COLORS[i],
  })).filter((x) => x.value > 0);

  const allDepts = ["Todos", ...new Set(records.map((r) => r.departamento).filter(Boolean))];

  const sortBy = (col) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };
  const SortIcon = ({ col }) => sortCol !== col ? null : sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;

  const exportCSV = () => {
    const headers = ["ID","Iniciativa","Postulante","Correo","Departamento","Estado","Impacto","Fecha"];
    const rows = records.map((r) => [
      r.id, r.nombre_iniciativa, r.nombre_postulante, r.correo,
      r.departamento, r.estado, (r.impacto || []).join("|"), r.fecha_iniciativa,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `iniciativas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar totalRecords={records.length} />
      {selected && (
        <DetailModal record={selected} onClose={() => setSelected(null)} onUpdateStatus={handleUpdateStatus} />
      )}

      <div className="py-6 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#0F172A" }} className="text-2xl font-bold">
              Dashboard de Iniciativas
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {loading ? "Cargando..." : `${records.length} iniciativa${records.length !== 1 ? "s" : ""} registrada${records.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData}
              style={{ border: "1px solid #E2E8F0", background: "white" }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
            <button onClick={exportCSV}
              style={{ border: "1px solid #E2E8F0", background: "white" }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <Download size={15} /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-5">
          {Object.entries(STATUSES).map(([s, c]) => (
            <div key={s} onClick={() => setFilterStatus(filterStatus === s ? "Todos" : s)}
              style={{
                background: filterStatus === s ? c.bg : "white",
                border: `1px solid ${filterStatus === s ? c.border : "#E2E8F0"}`,
                cursor: "pointer",
              }}
              className="rounded-xl p-4 shadow-sm hover:shadow-md transition text-center select-none">
              <p style={{ color: c.dot }} className="text-2xl font-bold">{counts[s]}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-tight">{s}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
            <div style={{ background: "white", border: "1px solid #E2E8F0" }} className="rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-500" />Iniciativas por Departamento
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={byDept} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#F1F5F9" }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4,4,0,0]} name="Iniciativas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "white", border: "1px solid #E2E8F0" }} className="rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-500" />Distribución por Estado
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                    {byStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ background: "white", border: "1px solid #E2E8F0" }}
          className="rounded-2xl p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, postulante o correo..."
              style={{ border: "1px solid #E2E8F0" }}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              style={{ border: "1px solid #E2E8F0" }}
              className="pl-3 pr-8 py-2 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
              {["Todos", ...Object.keys(STATUSES)].map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              style={{ border: "1px solid #E2E8F0" }}
              className="pl-3 pr-8 py-2 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer max-w-48">
              {allDepts.map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>
          <p className="text-xs text-slate-400 ml-auto">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Table */}
        <div style={{ background: "white", border: "1px solid #E2E8F0" }} className="rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw size={32} className="mx-auto text-blue-400 animate-spin mb-3" />
              <p className="text-slate-400">Cargando iniciativas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Layers size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 font-medium">No se encontraron iniciativas</p>
              <p className="text-slate-300 text-sm mt-1">Ajusta los filtros o registra una nueva iniciativa</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                    {[
                      ["ID","id"],["Iniciativa","nombre_iniciativa"],
                      ["Postulante","nombre_postulante"],["Departamento","departamento"],
                      ["Impacto",null],["Fecha","fecha_iniciativa"],
                      ["Estado","estado"],["",null],
                    ].map(([label, col]) => (
                      <th key={label} onClick={() => col && sortBy(col)}
                        className={`px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide ${col ? "cursor-pointer hover:text-slate-700 select-none" : ""}`}>
                        <span className="flex items-center gap-1">{label}{col && <SortIcon col={col} />}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                      className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.id?.slice(0,8).toUpperCase()}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 max-w-48">
                        <p className="truncate">{r.nombre_iniciativa}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <p className="font-medium">{r.nombre_postulante}</p>
                        <p className="text-xs text-slate-400 truncate max-w-36">{r.correo}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-32">
                        <span className="truncate block">{r.departamento}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-32">
                          {(r.impacto || []).slice(0, 2).map((imp) => (
                            <span key={imp}
                              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #DBEAFE" }}
                              className="text-xs px-1.5 py-0.5 rounded-md capitalize">{imp}</span>
                          ))}
                          {(r.impacto || []).length > 2 && (
                            <span className="text-xs text-slate-400">+{r.impacto.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(r.fecha_iniciativa)}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.estado} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(r)}
                          style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE" }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">
                          <Eye size={13} /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
