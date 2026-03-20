import React, { useState, useReducer, useCallback, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { Trash2, PenLine, Images, Star, Mail, Instagram, FileText, Youtube, Eye, EyeOff, Pencil, FilePlus, Flag, Bell, Clock, Play, BarChart2, ThumbsUp, MessageSquare, TrendingUp, DollarSign, Lock } from "lucide-react";
const SAGE = "#4A6B4A";

// ─── THEME SYSTEM ─────────────────────────────────────────────────────────────

const THEMES = {
  slate: {
    key: "slate", label: "Padrão", swatch: "#f8fafc",
    appBg:       "#f8fafc",
    panelBg:     "#ffffff",
    panelAlt:    "#f8fafc",
    border:      "#e2e8f0",
    borderFaint: "#f1f5f9",
    text:        "#1e293b",
    textMuted:   "#64748b",
    textFaint:   "#94a3b8",
    cellBg:      "#ffffff",
    cellOff:     "#f8fafc",
    todayBorder: "#1e293b",
    todayCircle: "#1e293b",
    todayText:   "#ffffff",
    inputBg:     "#f8fafc",
    overlayBg:   "rgba(15,23,42,0.4)",
    scrollThumb: "#e2e8f0",
  },
  sage: {
    key: "sage", label: "Sálvia", swatch: "#4A6B4A",
    appBg:       "#4A6B4A",
    panelBg:     "#ffffff",
    panelAlt:    "#f0f5f0",
    border:      "#ddd0bc",
    borderFaint: "#ddeadd",
    text:        "#1e2e1e",
    textMuted:   "#4a6b4a",
    textFaint:   "#7a9f7a",
    cellBg:      "#ffffffee",
    cellOff:     "#f0f5f0cc",
    todayBorder: "#F5F6F4",
    todayCircle: "#F5F6F4",
    todayText:   "#1e2e1e",
    inputBg:     "#f0f5f0",
    overlayBg:   "rgba(20,40,20,0.45)",
    scrollThumb: "#ddd0bc",
  },
  cream: {
    key: "cream", label: "Creme", swatch: "#F9F1E4",
    appBg:       "#F9F1E4",
    panelBg:     "#ffffff",
    panelAlt:    "#faf6ee",
    border:      "#e8d9c0",
    borderFaint: "#f2ead8",
    text:        "#2d2013",
    textMuted:   "#7a5c38",
    textFaint:   "#b09070",
    cellBg:      "#ffffffee",
    cellOff:     "#faf6eecc",
    todayBorder: "#2d2013",
    todayCircle: "#2d2013",
    todayText:   "#ffffff",
    inputBg:     "#faf6ee",
    overlayBg:   "rgba(40,25,10,0.4)",
    scrollThumb: "#e8d9c0",
  },
  dark: {
    key: "dark", label: "Escuro", swatch: "#0f172a",
    appBg:       "#0f172a",
    panelBg:     "#1e293b",
    panelAlt:    "#162032",
    border:      "#334155",
    borderFaint: "#1e2d40",
    text:        "#f1f5f9",
    textMuted:   "#94a3b8",
    textFaint:   "#475569",
    cellBg:      "#1e293b",
    cellOff:     "#162032",
    todayBorder: "#60a5fa",
    todayCircle: "#60a5fa",
    todayText:   "#0f172a",
    inputBg:     "#162032",
    overlayBg:   "rgba(0,0,0,0.6)",
    scrollThumb: "#334155",
  },
};

const ThemeCtx = createContext(THEMES.slate);
const useTheme = () => useContext(ThemeCtx);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const BROLL_COLOR  = "#50956E";

// Shared description — persists across all notes in the session
let sharedDescriptionStore = "";

const CAMERA_COLOR = "#1e293b";

const DEFAULT_STATUSES = [
  { key:"ideia",       label:"Ideia",         color:"#9db4c0" },
  { key:"roteiro",     label:"Roteiro",       color:"#b8a4d8" },
  { key:"aroll",       label:"A-roll",        color:"#d4b896" },
  { key:"broll",       label:"B-roll",        color:"#c9a882" },
  { key:"edicao",      label:"Editar",        color:"#c49494" },
  { key:"faltapostar", label:"Editado",       color:"#8ab0c8" },
  { key:"agendado",    label:"Agendado",      color:"#7ec8c8" },
  { key:"publicado",   label:"Publicado",     color:"#86c49a" },
];
// Built dynamically from state — use useStatusMap() hook inside components
// or statusesToMap() for non-component contexts
function statusesToMap(statuses) {
  return Object.fromEntries((statuses||DEFAULT_STATUSES).map(s => [s.key, {
    label: s.label, color: s.color,
    bg: s.color + "22",
  }]));
}
const StatusMapContext = createContext(statusesToMap(DEFAULT_STATUSES));
function useStatusMap() { return useContext(StatusMapContext); }
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}
// Fallback for legacy static references (replaced below)
let STATUS_MAP = statusesToMap(DEFAULT_STATUSES);


// ─── MILESTONE FILLED ICONS ──────────────────────────────────────────────────
const _MI = ({size, color, d}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill={color} d={d}/>
  </svg>
);
const MI = {
  star:      ({size=16,color="#fff"}) => <_MI size={size} color={color} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>,
  mail:      ({size=16,color="#fff"}) => <_MI size={size} color={color} d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>,
  heart:     ({size=16,color="#fff"}) => <_MI size={size} color={color} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>,
  users:     ({size=16,color="#fff"}) => <_MI size={size} color={color} d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>,
  trophy:    ({size=16,color="#fff"}) => <_MI size={size} color={color} d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.22 5 8zm14 0c0 1.22-.84 2.4-2 2.82V7h2v1z"/>,
  box:       ({size=16,color="#fff"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

      <path fill={color} d="M3 13v7a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-7H3z"/>

      <path fill={color} d="M2 8l3 4h4L7 8z" opacity="0.85"/>

      <path fill={color} d="M22 8l-3 4h-4l2-4z" opacity="0.85"/>

      <path fill={color} d="M8 3l-6 5h5l2-4zM16 3l6 5h-5l-2-4z" opacity="0.6"/>

      <rect fill={color} x="10" y="13" width="4" height="7" opacity="0.3"/>
    </svg>
  ),
};













const MILESTONE_ICONS = { seguidores: MI.users, parceria: MI.heart, contato: MI.mail, conquista: MI.trophy, outro: MI.star };
const MILESTONE_CATEGORIES = {
  seguidores: { label: "Seguidores",       color: "#7c3aed", bg: "#f5f3ff" },
  parceria:   { label: "Parceria",         color: "#059669", bg: "#f0fdf4" },
  contato:    { label: "Contato de marca", color: "#0891b2", bg: "#ecfeff" },
  conquista:  { label: "Conquista",        color: "#ca8a04", bg: "#fefce8" },
  outro:      { label: "Outro",            color: "#475569", bg: "#f8fafc" },
};
function MilestoneIcon({ category, size=16, color }) {
  const Icon = MILESTONE_ICONS[category] || MI.star;
  return <Icon size={size} color={color} />;
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function generateId() { return Math.random().toString(36).slice(2, 10); }
function toISODate(y, m, d) { return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
function todayISO() { const d = new Date(); return toISODate(d.getFullYear(), d.getMonth(), d.getDate()); }

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const pm = month===0?11:month-1, py = month===0?year-1:year;
  const nm = month===11?0:month+1, ny = month===11?year+1:year;

  const cells = [];

  // Previous month padding — just enough to fill the first partial week
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({ date: toISODate(py, pm, day), day, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: toISODate(year, month, d), day: d, isCurrentMonth: true });

  // Next month padding — just enough to complete the last partial week
  const rem = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= rem; d++) cells.push({ date: toISODate(ny, nm, d), day: d, isCurrentMonth: false });

  return cells;
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m-1, d).toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}
function getMonthLabel(year, month) {
  const s = new Date(year, month, 1).toLocaleDateString("pt-BR", { month:"long", year:"numeric" }); return s.charAt(0).toUpperCase() + s.slice(1);
}
function htmlToPlainText(html) {
  if (!html) return "";
  const tmp = document.createElement("div"); tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}
function countStats(html) {
  const text = htmlToPlainText(html).trim();
  return { chars: text.length, words: text===""?0:text.split(/\s+/).filter(Boolean).length };
}
function copyToClipboard(text, onSuccess) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => onSuccess && onSuccess(true)).catch(() => fallbackCopy(text, onSuccess));
  } else {
    fallbackCopy(text, onSuccess);
  }
}
function fallbackCopy(text, onSuccess) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand("copy"); onSuccess && onSuccess(true); } catch(e) {}
  document.body.removeChild(ta);
}

function formatNumber(n) {
  if (!n && n !== 0) return "";
  const num = Number(n); if (isNaN(num)) return String(n);
  if (num >= 1_000_000) return (num/1_000_000).toLocaleString("pt-BR",{maximumFractionDigits:1})+"M";
  if (num >= 1_000)     return (num/1_000).toLocaleString("pt-BR",{maximumFractionDigits:1})+"k";
  return num.toLocaleString("pt-BR");
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────

function mergeStatuses(saved) {
  const defaults = Object.fromEntries(DEFAULT_STATUSES.map(s => [s.key, s]));
  const merged = (saved || DEFAULT_STATUSES).map(s => defaults[s.key] ? { ...s, color: defaults[s.key].color, label: defaults[s.key].label } : s);
  DEFAULT_STATUSES.forEach(d => { if (!merged.find(s => s.key === d.key)) merged.push(d); });
  return merged;
}

function appReducer(state, action) {
  switch (action.type) {
    case "HYDRATE": return { ...action.state, statuses: mergeStatuses(action.state.statuses) };
    case "ADD_NOTE": {
      const { note } = action;
      // Guard: never add a note whose id already exists on that date
      const existing = (state.notes[note.date]||[]);
      if (existing.some(n => n.id === note.id)) return state;
      return { ...state, notes: { ...state.notes, [note.date]: [...existing, note] } };
    }
    case "UPDATE_NOTE": {
      const { note, oldDate } = action;
      if (oldDate && oldDate !== note.date) {
        // Date changed: remove from old, add to new
        return { ...state, notes: { ...state.notes,
          [oldDate]: (state.notes[oldDate]||[]).filter(n => n.id !== note.id),
          [note.date]: [...(state.notes[note.date]||[]).filter(n => n.id !== note.id), note],
        }};
      }
      const src = oldDate || note.date;
      const existing = (state.notes[src]||[]);
      const found = existing.some(n => n.id === note.id);
      // If not found (shouldn't happen but guard against it), don't duplicate — just replace whole list with note appended
      const updated = found
        ? existing.map(n => n.id === note.id ? note : n)
        : [...existing.filter(n => n.id !== note.id), note];
      return { ...state, notes: { ...state.notes, [src]: updated } };
    }
    case "DELETE_NOTE": {
      const { id, date } = action;
      return { ...state, notes: { ...state.notes, [date]: (state.notes[date]||[]).filter(n => n.id!==id) } };
    }
    case "MOVE_NOTE": {
      const { noteId, fromDate, toDate } = action;
      if (fromDate===toDate) return state;
      const note = (state.notes[fromDate]||[]).find(n => n.id===noteId);
      if (!note) return state;
      return { ...state, notes: { ...state.notes,
        [fromDate]: (state.notes[fromDate]||[]).filter(n => n.id!==noteId),
        [toDate]:   [...(state.notes[toDate]||[]), { ...note, date: toDate }],
      }};
    }
    case "ADD_REMINDER": {
      const { reminder } = action;
      return { ...state, reminders: { ...state.reminders, [reminder.date]: [...(state.reminders[reminder.date]||[]), reminder] } };
    }
    case "DELETE_REMINDER": {
      const { id, date } = action;
      return { ...state, reminders: { ...state.reminders, [date]: (state.reminders[date]||[]).filter(r => r.id!==id) } };
    }
    case "UPDATE_REMINDER": {
      const { reminder } = action;
      return { ...state, reminders: { ...state.reminders, [reminder.date]: (state.reminders[reminder.date]||[]).map(r => r.id===reminder.id?reminder:r) } };
    }
    case "ADD_MILESTONE": {
      const { milestone } = action;
      return { ...state, milestones: { ...state.milestones, [milestone.date]: [...(state.milestones[milestone.date]||[]), milestone] } };
    }
    case "UPDATE_MILESTONE": {
      const { milestone } = action;
      return { ...state, milestones: { ...state.milestones, [milestone.date]: (state.milestones[milestone.date]||[]).map(m => m.id===milestone.id?milestone:m) } };
    }
    case "DELETE_MILESTONE": {
      const { id, date } = action;
      return { ...state, milestones: { ...state.milestones, [date]: (state.milestones[date]||[]).filter(m => m.id!==id) } };
    }
    case "MOVE_REMINDER": {
      const { reminderId, fromDate, toDate } = action;
      if (fromDate===toDate) return state;
      const r = (state.reminders[fromDate]||[]).find(r => r.id===reminderId);
      if (!r) return state;
      return { ...state, reminders: { ...state.reminders,
        [fromDate]: (state.reminders[fromDate]||[]).filter(r2 => r2.id!==reminderId),
        [toDate]:   [...(state.reminders[toDate]||[]), { ...r, date: toDate }],
      }};
    }
    case "MOVE_MILESTONE": {
      const { milestoneId, fromDate, toDate } = action;
      if (fromDate===toDate) return state;
      const m = (state.milestones[fromDate]||[]).find(m => m.id===milestoneId);
      if (!m) return state;
      return { ...state, milestones: { ...state.milestones,
        [fromDate]: (state.milestones[fromDate]||[]).filter(m2 => m2.id!==milestoneId),
        [toDate]:   [...(state.milestones[toDate]||[]), { ...m, date: toDate }],
      }};
    }
    case "SOFT_DELETE_NOTE": {
      const { id, date } = action;
      const note = (state.notes[date]||[]).find(n => n.id===id);
      if (!note) return state;
      const deletedNote = { ...note, deletedAt: new Date().toISOString() };
      return { ...state,
        notes: { ...state.notes, [date]: (state.notes[date]||[]).filter(n => n.id!==id) },
        trash: [...(state.trash||[]).filter(n=>n.id!==id), deletedNote],
      };
    }
    case "RESTORE_NOTE": {
      const { id } = action;
      const note = (state.trash||[]).find(n=>n.id===id);
      if (!note) return state;
      const { deletedAt, ...restored } = note;
      return { ...state,
        trash: (state.trash||[]).filter(n=>n.id!==id),
        notes: { ...state.notes, [restored.date]: [...(state.notes[restored.date]||[]), restored] },
      };
    }

    case "UPDATE_SETTINGS": return { ...state, settings: { ...(state.settings||{}), ...action.settings } };
    case "UPDATE_STATUSES": return { ...state, statuses: action.statuses };
    case "PURGE_TRASH": {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-30);
      return { ...state, trash: (state.trash||[]).filter(n => new Date(n.deletedAt) > cutoff) };
    }
    default: return state;
  }
}

const STORAGE_KEY = "calendarNotesState_v1";

// ─── SUPABASE SYNC ────────────────────────────────────────────────────────────
const SUPA_URL  = "https://nmnilywctfwilgnwlbjd.supabase.co";
const SUPA_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tbmlseXdjdGZ3aWxnbndsYmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjc1NzYsImV4cCI6MjA4OTYwMzU3Nn0.nvfvIm67kC4zs8P8VcMVMY3yfYNOLUlW-5HCXf3-SV4";
const SUPA_ROW  = "default"; // single-row key for the whole state

async function supaLoad() {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/calendar_state?id=eq.${SUPA_ROW}&select=data`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
    });
    const rows = await res.json();
    if (rows && rows[0]?.data) {
      const parsed = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
      if (parsed?.notes && parsed?.milestones) return { reminders:{}, ...parsed, statuses: mergeStatuses(parsed.statuses) };
    }
  } catch(e) {}
  return null;
}

async function supaSave(state) {
  try {
    await fetch(`${SUPA_URL}/rest/v1/calendar_state`, {
      method: "POST",
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ id: SUPA_ROW, data: JSON.stringify(state) }),
    });
  } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.notes && parsed.milestones) return { reminders:{}, ...parsed, statuses: mergeStatuses(parsed.statuses) };
    }
  } catch(e) {}
  return buildSampleState();
}

async function loadStateFromStorage() {
  // Try Supabase first, fall back to window.storage
  const fromSupabase = await supaLoad();
  if (fromSupabase) return fromSupabase;
  try {
    const result = await window.storage?.get(STORAGE_KEY);
    if (result && result.value) {
      const parsed = JSON.parse(result.value);
      if (parsed && parsed.notes && parsed.milestones) return { reminders:{}, ...parsed, statuses: mergeStatuses(parsed.statuses) };
    }
  } catch(e) {}
  return null;
}

async function saveState(state) {
  // Save to both local storage and Supabase
  try { await window.storage?.set(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  await supaSave(state);
}

function buildSampleState() {
  const today = todayISO(); const [y, m, d] = today.split("-").map(Number);
  const yesterday = toISODate(y, m-1, d-1), tomorrow = toISODate(y, m-1, d+1), lastWeek = toISODate(y, m-1, d-7);
  return {
    trash: [],
    settings: {},
    notes: {
      [today]: [
        { id:"a1", date:today, title:"Roteiro — Produtividade com IA", content:`<p><strong>Introdução</strong></p><p>Olá pessoal! Hoje vou mostrar como uso IA para triplicar minha produtividade.</p><p><span style="color:${BROLL_COLOR}">[ B-roll: tela do computador ]</span></p>`, size:"large", status:"roteiro" },
        { id:"a2", date:today, title:"Thumbnail ideas", content:"", size:"small", status:"ideia" },
        { id:"a3", date:today, title:"Postar story",    content:"", size:"small", status:"faltapostar" },
      ],
      [yesterday]: [{ id:"b1", date:yesterday, title:"Roteiro — Setup do editor", content:`<p>Fala galera!</p><p><span style="color:${BROLL_COLOR}">[ B-roll: mesa de trabalho ]</span></p>`, size:"large", status:"edicao" }],
      [tomorrow]:  [{ id:"c1", date:tomorrow, title:"Revisão final roteiro", content:"", size:"small", status:"agendado" }],
    },
    milestones: {
      [today]:    [{ id:"m1", date:today,    title:"10k seguidores no Instagram!", category:"seguidores", value:"10000", description:"Chegamos! Um mês mais cedo do que o planejado.", image:null }],
      [lastWeek]: [{ id:"m2", date:lastWeek, title:"Primeiro contato da Nike",     category:"contato",    value:"",      description:"Recebi e-mail do time de marketing da Nike.", image:null }],
    },
    reminders: {
      "2025-03-04": [{ id:"r1", date:"2025-03-04", title:"Reunião com Letícia — Huawei", time:"14:00" }],
    },
  };
}


// ─── RICH TEXT EDITOR ─────────────────────────────────────────────────────────

function RichEditor({ value, onChange, title, isMobile }) {
  const editorRef   = useRef(null);
  const focusRef    = useRef(null);
  const initialized = useRef(false);
  const [focusMode, setFocusMode] = useState(false);
  const [colorMode, setColorMode] = useState("camera"); // "camera" = a-roll (black), "broll" = b-roll (green)
  const [isEditing, setIsEditing] = useState(false);
  const toolbarHideTimer = useRef(null);

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || "";
      initialized.current = true;
    }
  }, []);

  // Sync focus editor content when entering/exiting focus mode
  useEffect(() => {
    if (focusMode && focusRef.current) {
      focusRef.current.innerHTML = editorRef.current?.innerHTML || "";
      focusRef.current.focus();
    }
    if (!focusMode && editorRef.current && focusRef.current) {
      editorRef.current.innerHTML = focusRef.current.innerHTML;
    }
  }, [focusMode]);

  // Escape to exit focus mode
  useEffect(() => {
    if (!focusMode) return;
    const h = e => { if (e.key === "Escape") setFocusMode(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [focusMode]);

  // Listen for external focus mode trigger (from editor menu)
  useEffect(() => {
    const h = () => setFocusMode(true);
    document.addEventListener("calendarNotes:focusMode", h);
    return () => document.removeEventListener("calendarNotes:focusMode", h);
  }, []);

  const exec = (cmd, ref) => { ref?.focus(); document.execCommand(cmd, false, null); sync(ref); };
  const sync = ref => onChange((ref || editorRef.current)?.innerHTML || "");
  const toggleColor = ref => {
    const nextColor = colorMode === "camera" ? BROLL_COLOR : CAMERA_COLOR;
    ref?.focus();
    document.execCommand("foreColor", false, nextColor);
    sync(ref);
    setColorMode(prev => prev === "camera" ? "broll" : "camera");
  };

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
  const mod   = isMac ? "Command" : "Ctrl";

  const btn = { border:"1px solid #c8d8c8", background:"#faf6ef", borderRadius:"6px", padding:"6px 11px", cursor:"pointer", fontSize:"13px", color:"#4a3728", fontFamily:"'Inter', sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:"5px", lineHeight:1 };

  const TooltipBtn = ({ children, shortcut, isFocus, ...props }) => {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top:0, left:0 });
    const wrapRef = useRef(null);
    const timerRef = useRef(null);
    return (
      <div ref={wrapRef} style={{ position:"relative", display:"inline-flex" }}
        onMouseEnter={() => { timerRef.current = setTimeout(() => {
          if (wrapRef.current) {
            const r = wrapRef.current.getBoundingClientRect();
            setPos({ top: r.top - 8, left: r.left + r.width / 2 });
          }
          setVisible(true);
        }, 900); }}
        onMouseLeave={() => { clearTimeout(timerRef.current); setVisible(false); }}>
        <button {...props}>{children}</button>
        {visible && (
          <div style={{ position:"fixed", top: pos.top, left: pos.left, transform:"translate(-50%, -100%)", backgroundColor:"#1a2a1a", color:"#e8e0d4", fontSize:"11px", fontFamily:"'DM Mono', monospace", padding:"5px 9px", borderRadius:"6px", whiteSpace:"nowrap", pointerEvents:"none", zIndex:99999, boxShadow:"0 4px 16px rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)", animation:"fadeIn 0.1s ease", letterSpacing:"0.04em" }}>
            {shortcut}
            <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"5px solid #1a2a1a" }} />
          </div>
        )}
      </div>
    );
  };

  const Toolbar = ({ targetRef, isFocus, colorMode, visible }) => (
    <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 20px", borderBottom:`1px solid ${isFocus?"rgba(255,255,255,0.1)":"#d4e4d4"}`, backgroundColor:isFocus?"rgba(255,255,255,0.04)":"#faf6ef", flexShrink:0, flexWrap:"wrap", maxHeight: visible ? "60px" : "0", overflow:"hidden", opacity: visible ? 1 : 0, transition:"max-height 0.25s ease, opacity 0.2s ease", paddingTop: visible ? "10px" : "0", paddingBottom: visible ? "10px" : "0" }}>
      <TooltipBtn shortcut={`${mod} + B`} isFocus={isFocus} style={{ ...btn, ...(isFocus?{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",color:"#e8e0d4"}:{}) }} onMouseDown={e=>{e.preventDefault();exec("bold",targetRef?.current);}}><b>N</b></TooltipBtn>
      <TooltipBtn shortcut={`${mod} + I`} isFocus={isFocus} style={{ ...btn, fontStyle:"italic", ...(isFocus?{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",color:"#e8e0d4"}:{}) }} onMouseDown={e=>{e.preventDefault();exec("italic",targetRef?.current);}}>I</TooltipBtn>
      <TooltipBtn shortcut={`${mod} + U`} isFocus={isFocus} style={{ ...btn, textDecoration:"underline", ...(isFocus?{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",color:"#e8e0d4"}:{}) }} onMouseDown={e=>{e.preventDefault();exec("underline",targetRef?.current);}}>S</TooltipBtn>
      <div style={{ width:"1px", height:"22px", background:isFocus?"rgba(255,255,255,0.15)":"#ddd0bc", margin:"0 4px", flexShrink:0 }} />
      <TooltipBtn shortcut={`${mod} + T`} isFocus={isFocus} style={{ ...btn, padding:"6px 14px", gap:"7px", ...(isFocus?{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",color:"#e8e0d4"}:{}) }} onMouseDown={e=>{e.preventDefault();toggleColor(targetRef?.current);}}>
        <span style={{ width:"10px", height:"10px", borderRadius:"50%", flexShrink:0, backgroundColor: colorMode === "camera" ? CAMERA_COLOR : BROLL_COLOR, display:"inline-block" }} />
        <span style={{ fontSize:"12px", fontFamily:"'DM Mono', monospace", fontWeight:700, color: isFocus ? "rgba(255,255,255,0.85)" : colorMode === "camera" ? CAMERA_COLOR : BROLL_COLOR }}>
          {colorMode === "camera" ? "a-roll" : "b-roll"}
        </span>
      </TooltipBtn>
      <div style={{ flex:1 }} />
      {isFocus
        ? <button onMouseDown={e=>{e.preventDefault();setFocusMode(false);}} style={{ padding:"5px 12px", borderRadius:"6px", border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:"11px", fontFamily:"'DM Mono', monospace", cursor:"pointer", letterSpacing:"0.04em" }}>Esc · Sair do foco</button>
        : <TooltipBtn shortcut="Modo Foco" isFocus={false} onMouseDown={e=>{e.preventDefault();setFocusMode(true);}} style={{ ...btn, padding:"6px 10px", marginLeft:"6px", fontSize:"13px" }}>⛶</TooltipBtn>
      }
    </div>
  );

  return (
    <>

      <div style={{ display:"flex", flexDirection:"column", flex:1, minHeight:0 }}>
        <Toolbar targetRef={editorRef} isFocus={false} colorMode={colorMode} visible={isEditing} />
        <div style={{ flex:1, overflowY: isMobile ? "visible" : "auto", backgroundColor:"#fdf9f4" }}>
          <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={() => sync(editorRef.current)}
            onFocus={() => { clearTimeout(toolbarHideTimer.current); setIsEditing(true); }}
            onBlur={() => { toolbarHideTimer.current = setTimeout(() => setIsEditing(false), 200); }}
            onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&["b","i","u"].includes(e.key.toLowerCase()))setTimeout(()=>sync(editorRef.current),0); if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="t"){e.preventDefault();toggleColor(editorRef.current);}}}
            data-placeholder="Comece a escrever seu roteiro..."
            style={{ maxWidth:"680px", margin:"0 auto", minHeight: isMobile ? "50vh" : "100%", padding: isMobile ? "28px 24px 48px" : "48px 24px 64px", fontSize:"15px", lineHeight:"1.9", color:CAMERA_COLOR, fontFamily:"'Inter', sans-serif", outline:"none", caretColor:CAMERA_COLOR, boxSizing:"border-box", width:"100%" }}
          />
        </div>
      </div>
      {focusMode && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, backgroundColor:"#1a2218", display:"flex", flexDirection:"column", animation:"fadeIn 0.2s ease" }}>
          <Toolbar targetRef={focusRef} isFocus={true} colorMode={colorMode} visible={true} />
          {title && (
            <div style={{ textAlign:"center", padding:"32px 0 0", fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,0.25)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>{title}</div>
          )}
          <div ref={focusRef} contentEditable suppressContentEditableWarning
            onInput={() => { sync(focusRef.current); if(editorRef.current) editorRef.current.innerHTML = focusRef.current.innerHTML; }}
            onKeyDown={e=>{
              if(e.key==="Escape"){setFocusMode(false);return;}
              if((e.ctrlKey||e.metaKey)&&["b","i","u"].includes(e.key.toLowerCase()))setTimeout(()=>sync(focusRef.current),0);
              if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="t"){e.preventDefault();toggleColor(focusRef.current);}
            }}
            data-placeholder="Comece a escrever..."
            style={{ flex:1, overflowY:"auto", padding:"48px max(10vw, 40px)", fontSize:"17px", lineHeight:"2.1", color:"rgba(232,224,212,0.9)", fontFamily:"'Inter', sans-serif", outline:"none", caretColor:"rgba(255,255,255,0.7)", maxWidth:"820px", margin:"0 auto", width:"100%", boxSizing:"border-box" }}
          />
          <div style={{ textAlign:"center", padding:"16px 0 20px", fontSize:"11px", color:"rgba(255,255,255,0.18)", fontFamily:"'DM Mono', monospace" }}>
            {mod} + B · {mod} + I · {mod} + U · {mod} + T (cor) · Esc para sair
          </div>
        </div>
      )}
    </>
  );
}

// ─── DESCRIÇÃO TAB ───────────────────────────────────────────────────────────

function DescricaoTab({ value, onChange }) {
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"24px 32px", gap:"16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 }}>
        <div>
          <div style={{ fontSize:"16px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>Descrição do vídeo</div>
          <div style={{ fontSize:"12px", color:"#94a3b8", fontFamily:"'Inter', sans-serif", marginTop:"2px" }}>Modelo compartilhado entre todos os roteiros</div>
        </div>
        <button onClick={handleSave}
          style={{ padding:"6px 16px", borderRadius:"8px", border:"none", backgroundColor:saved?"#059669":SAGE, color:"#fff", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"background-color 0.25s", minWidth:"80px" }}>
          {saved ? "✓ Salvo!" : "Salvar"}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={"Escreva aqui a descrição padrão do vídeo...\n\nEx: links, redes sociais, patrocinadores fixos, hashtags, etc."}
        style={{ flex:1, resize:"none", border:"1px solid #e0d5c5", borderRadius:"12px", padding:"16px", fontSize:"13px", color:"#4a3728", fontFamily:"'Inter', sans-serif", lineHeight:1.75, outline:"none", backgroundColor:"#fdf9f4", minHeight:"200px" }}
        onFocus={e=>e.target.style.borderColor="#a0b8a0"}
        onBlur={e=>e.target.style.borderColor="#e0d5c5"}
      />
    </div>
  );
}

// ─── INSERÇÕES TAB ───────────────────────────────────────────────────────────

// ─── PERFORMANCE TAB ──────────────────────────────────────────────────────────

const PERF_METRICS = [
  { key:"views",       label:"Visualizações",         Icon:Eye,            suffix:"",   hint:"Total de views" },
  { key:"watchTime",   label:"Tempo assistido (h)",   Icon:Clock,          suffix:"h",  hint:"Horas assistidas totais" },
  { key:"retention",   label:"Retenção média",        Icon:TrendingUp,     suffix:"%",  hint:"% do vídeo assistido em média" },
  { key:"likes",       label:"Curtidas",              Icon:ThumbsUp,       suffix:"",   hint:"Total de likes" },
  { key:"comments",    label:"Comentários",           Icon:MessageSquare,  suffix:"",   hint:"Total de comentários" },
  { key:"subs",        label:"Inscritos ganhos",      Icon:Bell,           suffix:"",   hint:"Novos inscritos pelo vídeo" },
  { key:"ctr",         label:"CTR da thumbnail",      Icon:BarChart2,      suffix:"%",  hint:"Click-through rate" },
  { key:"revenue",     label:"Receita estimada",      Icon:DollarSign,     suffix:"R$", hint:"Receita gerada pelo vídeo" },
];

function PerfTab({ perf, onChange, unlocked, noteDate }) {
  const [notes, setNotes] = useState(perf._notes || "");

  if (!unlocked) {
    const publishDate = noteDate ? new Date(noteDate + "T00:00:00") : null;
    const unlockDate  = publishDate ? new Date(publishDate.getTime() + 24*60*60*1000) : null;
    const fmt = d => d ? d.toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "";
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px", textAlign:"center", gap:"14px" }}>
        <Lock size={40} color="#94a3b8" strokeWidth={1.5} />
        <div style={{ fontSize:"16px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>Performance bloqueada</div>
        <div style={{ fontSize:"13px", color:"#94a3b8", fontFamily:"'Inter', sans-serif", lineHeight:1.6, maxWidth:"280px" }}>
          Esta aba é liberada 24h após a data do vídeo para você registrar as métricas reais após a publicação.
        </div>
        {unlockDate && (
          <div style={{ padding:"8px 16px", borderRadius:"20px", backgroundColor:"#f0f5f0", border:"1px solid #ddd0bc", fontSize:"12px", color:"#577757", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>
            Disponível a partir de {fmt(unlockDate)}
          </div>
        )}
      </div>
    );
  }

  const handleChange = (key, val) => onChange({ ...perf, [key]: val });
  const handleNotes  = val => { setNotes(val); onChange({ ...perf, _notes: val }); };

  const inp = { width:"100%", border:"1px solid #ddd0bc", borderRadius:"8px", padding:"8px 10px", fontSize:"14px", fontWeight:600, color:"#1e293b", fontFamily:"'DM Mono', monospace", outline:"none", background:"#fdf9f4", boxSizing:"border-box", textAlign:"right" };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"24px 32px", display:"flex", flexDirection:"column", gap:"20px" }}>
      <div>
        <div style={{ fontSize:"16px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>Performance</div>
        <div style={{ fontSize:"12px", color:"#94a3b8", fontFamily:"'Inter', sans-serif", marginTop:"2px" }}>Métricas reais após a publicação · salvas automaticamente</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
        {PERF_METRICS.map(({ key, label, Icon, suffix, hint }) => (
          <div key={key} style={{ border:"1px solid #e8d9c0", borderRadius:"10px", padding:"12px 14px", backgroundColor:"#fdfaf5", display:"flex", flexDirection:"column", gap:"6px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <Icon size={13} strokeWidth={2} color="#8a7060" />
              <span style={{ fontSize:"11px", fontWeight:600, color:"#8a7060", fontFamily:"'Inter', sans-serif" }}>{label}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
              {suffix === "R$" && <span style={{ fontSize:"12px", color:"#64748b", fontFamily:"'DM Mono', monospace" }}>R$</span>}
              <input
                type="number"
                min="0"
                value={perf[key] || ""}
                onChange={e => handleChange(key, e.target.value)}
                placeholder="—"
                title={hint}
                style={{ ...inp, flex:1 }}
              />
              {suffix && suffix !== "R$" && <span style={{ fontSize:"12px", color:"#64748b", fontFamily:"'DM Mono', monospace", flexShrink:0 }}>{suffix}</span>}
            </div>
          </div>
        ))}
      </div>
      {(perf.views || perf.retention || perf.ctr) && (
        <div style={{ border:"1px solid #ddeadd", borderRadius:"12px", padding:"14px 18px", backgroundColor:"#f0f5f0" }}>
          <div style={{ fontSize:"11px", fontWeight:700, color:SAGE, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Resumo</div>
          <div style={{ display:"flex", gap:"20px", flexWrap:"wrap" }}>
            {perf.views     && <div style={{ fontSize:"22px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>{Number(perf.views).toLocaleString("pt-BR")}<span style={{ fontSize:"11px", fontWeight:400, color:"#94a3b8", marginLeft:"4px" }}>views</span></div>}
            {perf.retention && <div style={{ fontSize:"22px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>{perf.retention}%<span style={{ fontSize:"11px", fontWeight:400, color:"#94a3b8", marginLeft:"4px" }}>retenção</span></div>}
            {perf.ctr       && <div style={{ fontSize:"22px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>{perf.ctr}%<span style={{ fontSize:"11px", fontWeight:400, color:"#94a3b8", marginLeft:"4px" }}>CTR</span></div>}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize:"12px", fontWeight:600, color:"#8a7060", fontFamily:"'Inter', sans-serif", marginBottom:"8px" }}>Observações</div>
        <textarea
          value={notes}
          onChange={e => handleNotes(e.target.value)}
          placeholder="O que funcionou? O que pode melhorar? Algo inesperado nos dados..."
          rows={4}
          style={{ width:"100%", border:"1px solid #ddd0bc", borderRadius:"10px", padding:"10px 12px", fontSize:"13px", color:"#4a3728", fontFamily:"'Inter', sans-serif", outline:"none", background:"#fdf9f4", resize:"vertical", lineHeight:1.6, boxSizing:"border-box" }}
        />
      </div>
    </div>
  );
}

// ─── REFS TAB ─────────────────────────────────────────────────────────────────

const REF_TYPES = {
  youtube:  { label:"YouTube",   color:"#dc2626", bg:"#fff1f2" },
  canal:    { label:"Canal",     color:"#ea580c", bg:"#fff7ed" },
  artigo:   { label:"Artigo",    color:"#0369a1", bg:"#f0f9ff" },
  podcast:  { label:"Podcast",   color:"#7c3aed", bg:"#f5f3ff" },
  livro:    { label:"Livro",     color:"#15803d", bg:"#f0fdf4" },
  outro:    { label:"Outro",     color:"#64748b", bg:"#f8fafc" },
};

function extractYouTubeId(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

const TypePicker = ({ value, onChange: onChangePicker }) => (
  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
    {Object.entries(REF_TYPES).map(([k, v]) => (
      <button key={k} onClick={() => onChangePicker(k)}
        style={{ padding:"3px 10px", borderRadius:"20px", border:`1px solid ${value===k?v.color+"99":"#ddd0bc"}`, backgroundColor:value===k?v.bg:"transparent", color:value===k?v.color:"#94a3b8", fontSize:"11px", fontWeight:value===k?700:400, cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.12s" }}>
        {v.label}
      </button>
    ))}
  </div>
);


// ─── TAGS TAB ─────────────────────────────────────────────────────────────────

function TagsTab({ value, onChange }) {
  const MAX = 500;
  const remaining = MAX - value.length;
  const isOver = remaining < 0;
  const isWarning = remaining >= 0 && remaining < 60;

  const handleKeyDown = e => {
    if (e.key === "Enter") { e.preventDefault(); if (value.trim() && !value.endsWith(",")) onChange(value + ", "); }
  };

  const tags = value.split(",").map(t => t.trim()).filter(Boolean);

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"24px 32px", display:"flex", flexDirection:"column", gap:"20px" }}>
      <div>
        <div style={{ fontSize:"16px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>Tags do YouTube</div>
        <div style={{ fontSize:"12px", color:"#94a3b8", fontFamily:"'Inter', sans-serif", marginTop:"2px" }}>Separe as tags com vírgula · máximo de 500 caracteres</div>
      </div>

      <div style={{ position:"relative" }}>
        <textarea
          value={value}
          onChange={e => { if (e.target.value.length <= MAX + 20) onChange(e.target.value); }}
          onKeyDown={handleKeyDown}
          placeholder="roteiro, produtividade, youtube, ia, tutorial..."
          rows={5}
          style={{ width:"100%", border:`1px solid ${isOver?"#ef4444":isWarning?"#f59e0b":"#ddd0bc"}`, borderRadius:"10px", padding:"12px 14px", fontSize:"13px", color:"#4a3728", fontFamily:"'Inter', sans-serif", outline:"none", background:"#fdf9f4", resize:"vertical", lineHeight:1.6, boxSizing:"border-box", transition:"border-color 0.15s" }}
        />
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"6px" }}>
          <span style={{ fontSize:"12px", fontFamily:"'DM Mono', monospace", fontWeight:600, color: isOver?"#ef4444":isWarning?"#f59e0b":"#94a3b8" }}>
            {isOver ? `+${-remaining} acima do limite` : `${remaining} restantes`}
          </span>
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <div style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Preview · {tags.length} tag{tags.length !== 1 ? "s" : ""}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
            {tags.map((tag, i) => (
              <span key={i} style={{ padding:"4px 10px", borderRadius:"20px", backgroundColor:"#f0f5f0", border:"1px solid #ddd0bc", fontSize:"12px", color:"#4a6b4a", fontFamily:"'Inter', sans-serif", fontWeight:500 }}>{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BLOCOS TAB ───────────────────────────────────────────────────────────────

const BLOCK_TYPES = [
  { key:"gancho",       label:"Gancho",           color:"#7c3aed", bg:"#f5f3ff", placeholder:"O que vai prender a atenção nos primeiros 30 segundos?" },
  { key:"apresentacao", label:"Apresentação",      color:"#0369a1", bg:"#f0f9ff", placeholder:"Quem você é, do que se trata o vídeo..." },
  { key:"contexto",     label:"Contexto",          color:"#0f766e", bg:"#f0fdfa", placeholder:"Por que esse assunto é relevante agora?" },
  { key:"topico",       label:"Bloco de conteúdo", color:"#15803d", bg:"#f0fdf4", placeholder:"Desenvolvimento do tema..." },
  { key:"transicao",    label:"Transição",         color:"#b45309", bg:"#fffbeb", placeholder:"Como conectar para o próximo bloco..." },
  { key:"patrocinio",   label:"Patrocínio",        color:"#be185d", bg:"#fdf2f8", placeholder:"Mencionar o patrocinador aqui..." },
  { key:"cta",          label:"CTA",               color:"#dc2626", bg:"#fff1f2", placeholder:"Inscreva-se, comente, curta..." },
  { key:"encerramento", label:"Encerramento",      color:"#64748b", bg:"#f8fafc", placeholder:"Despedida e recado final..." },
];

function BlocosTab({ onInsert }) {
  const [blocks, setBlocks] = useState([]);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const addBlock = type => {
    setBlocks(prev => [...prev, { id: generateId(), type: type.key, text: "" }]);
  };

  const updateBlock = (id, text) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, text } : b));
  const removeBlock = id => setBlocks(prev => prev.filter(b => b.id !== id));

  const handleDragStart = idx => setDraggingIdx(idx);
  const handleDragOver  = (e, idx) => { e.preventDefault(); setOverIdx(idx); };
  const handleDrop      = idx => {
    if (draggingIdx === null || draggingIdx === idx) return;
    const updated = [...blocks];
    const [moved] = updated.splice(draggingIdx, 1);
    updated.splice(idx, 0, moved);
    setBlocks(updated);
    setDraggingIdx(null); setOverIdx(null);
  };

  const buildHtml = () => blocks.map(b => {
    const type = BLOCK_TYPES.find(t => t.key === b.type);
    return `<p><strong style="color:${type.color}">[${type.label.toUpperCase()}]</strong></p><p>${b.text.replace(/\n/g, "</p><p>") || "&nbsp;"}</p>`;
  }).join("<p>&nbsp;</p>");

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"24px 32px", display:"flex", flexDirection:"column", gap:"20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:"16px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>Blocos de roteiro</div>
          <div style={{ fontSize:"12px", color:"#94a3b8", fontFamily:"'Inter', sans-serif", marginTop:"2px" }}>Monte o roteiro por seções · arraste para reordenar</div>
        </div>
        {blocks.length > 0 && (
          <button onClick={() => onInsert(buildHtml())}
            style={{ padding:"7px 14px", borderRadius:"8px", border:`1px solid ${SAGE}`, backgroundColor:SAGE, color:"#fff", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
            ↗ Inserir no roteiro
          </button>
        )}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
        {BLOCK_TYPES.map(type => (
          <button key={type.key} onClick={() => addBlock(type)}
            style={{ padding:"5px 12px", borderRadius:"20px", border:`1px solid ${type.color}55`, backgroundColor:type.bg, color:type.color, fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = type.color; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = type.bg; e.currentTarget.style.color = type.color; }}>
            + {type.label}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {blocks.map((block, idx) => {
          const type = BLOCK_TYPES.find(t => t.key === block.type);
          const isDragging = draggingIdx === idx;
          const isOver = overIdx === idx && draggingIdx !== idx;
          return (
            <div key={block.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDraggingIdx(null); setOverIdx(null); }}
              style={{ border:`1px solid ${type.color}44`, borderLeft:`4px solid ${type.color}`, borderRadius:"10px", overflow:"hidden", backgroundColor: isOver ? type.bg : "#fdfaf5", opacity: isDragging ? 0.4 : 1, transition:"opacity 0.15s, box-shadow 0.15s", boxShadow: isOver ? `0 0 0 2px ${type.color}55` : "none" }}>
              <div style={{ padding:"8px 12px", backgroundColor:type.bg, display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"grab" }}>
                <span style={{ fontSize:"11px", fontWeight:700, color:type.color, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:"6px" }}>
                  <span style={{ opacity:0.5, fontSize:"13px" }}>⠿</span>{type.label}
                </span>
                <button onClick={() => removeBlock(block.id)}
                  style={{ background:"none", border:"none", color:`${type.color}88`, fontSize:"16px", cursor:"pointer", lineHeight:1, padding:"0 2px" }}>×</button>
              </div>
              <textarea
                value={block.text}
                onChange={e => updateBlock(block.id, e.target.value)}
                placeholder={type.placeholder}
                rows={3}
                style={{ width:"100%", border:"none", borderTop:`1px solid ${type.color}22`, padding:"10px 14px", fontSize:"13px", color:"#4a3728", fontFamily:"'Inter', sans-serif", outline:"none", background:"transparent", resize:"vertical", lineHeight:1.6, boxSizing:"border-box" }}
              />
            </div>
          );
        })}
      </div>

      {blocks.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8", fontSize:"13px", fontFamily:"'Inter', sans-serif" }}>
          Clique em um tipo de bloco acima para começar a montar o roteiro
        </div>
      )}
    </div>
  );
}

function DeleteConfirmButton({ onConfirm, ghostBtn }) {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);
  if (confirming) return (
    <button onClick={onConfirm} style={{ ...ghostBtn, padding:"7px 22px", fontSize:"13px", display:"flex", alignItems:"center", gap:"5px", animation:"fadeIn 0.15s" }}>
      <Trash2 size={13} strokeWidth={2} /> Confirmar
    </button>
  );
  return (
    <button onClick={()=>setConfirming(true)} style={{ ...ghostBtn, padding:"7px", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Trash2 size={15} strokeWidth={2} />
    </button>
  );
}

// ─── CUSTOM DATE PICKER ───────────────────────────────────────────────────────

const PT_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const PT_DAYS   = ["D","S","T","Q","Q","S","S"];


function DatePicker({ value, onChange, error, light }) {
  // value: "YYYY-MM-DD" string
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top:0, left:0 });
  const ref = useRef(null);

  const parsed = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + "T12:00:00") : new Date();
  const [viewYear,  setViewYear]  = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const prevDays    = new Date(viewYear, viewMonth, 0).getDate();
  const cells       = [];
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDow - daysInMonth + 1, cur: false });

  const selectedDate = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  const todayISO2 = todayISO();

  const selectDay = (day) => {
    const iso = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    onChange(iso);
    setOpen(false);
  };

  const prevMo = () => { if(viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1); };
  const nextMo = () => { if(viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1); };

  // Display label
  const displayLabel = selectedDate
    ? (() => { const [y,m,d] = selectedDate.split("-"); return `${d}/${m}/${y}`; })()
    : "Selecionar data";

  const btnStyle = {
    display:"flex", alignItems:"center", gap:"7px",
    border: error ? "1px solid #fca5a5" : light ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.28)",
    borderRadius:"20px", padding:"6px 12px", fontSize:"12px",
    color: light ? (selectedDate ? "#5a4a3a" : "#a08060") : (selectedDate ? "#fff" : "rgba(255,255,255,0.5)"),
    fontFamily:"'DM Mono', monospace",
    background: light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.09)",
    cursor:"pointer", outline:"none", whiteSpace:"nowrap", transition:"border-color 0.15s",
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button style={btnStyle}
        onClick={()=>{ if(!open && ref.current){ const r=ref.current.getBoundingClientRect(); setPopupPos({top:r.bottom+8,left:r.left}); } setOpen(v=>!v); }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=light?"rgba(0,0,0,0.25)":"rgba(255,255,255,0.65)"}
        onMouseLeave={e=>e.currentTarget.style.borderColor=error?"#fca5a5":light?"rgba(0,0,0,0.1)":"rgba(255,255,255,0.28)"}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={light?"#a08060":"currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {displayLabel}
      </button>

      {open && (
        <>
        <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:7999, backgroundColor:"rgba(30,60,30,0.35)", backdropFilter:"blur(1px)" }} />
        <div style={{ position:"fixed", top:popupPos.top, left:popupPos.left, zIndex:8000, backgroundColor:"#1a2e1a", border:"1px solid rgba(255,255,255,0.18)", borderRadius:"12px", padding:"14px", boxShadow:"0 16px 40px rgba(0,0,0,0.45)", width:"228px", animation:"fadeIn 0.15s ease", userSelect:"none" }}>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
            <button onClick={prevMo} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:"16px", padding:"2px 6px", borderRadius:"4px" }}>‹</button>
            <span style={{ fontSize:"12px", fontWeight:700, color:"#fff", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textTransform:"uppercase", fontSize:"11px" }}>
              {PT_MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMo} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:"16px", padding:"2px 6px", borderRadius:"4px" }}>›</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:"6px" }}>
            {PT_DAYS.map((d,i) => (
              <div key={i} style={{ textAlign:"center", fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", padding:"2px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
            {cells.map((cell, i) => {
              const iso = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}`;
              const isSelected = cell.cur && iso === selectedDate;
              const isToday    = cell.cur && iso === todayISO2;
              return (
                <button key={i} onClick={()=>cell.cur&&selectDay(cell.day)}
                  style={{
                    padding:"5px 0", borderRadius:"6px", border:"none",
                    background: isSelected ? SAGE : isToday ? "rgba(87,119,87,0.35)" : "transparent",
                    color: isSelected ? "#fff" : isToday ? "#a8d4a8" : cell.cur ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
                    fontSize:"11px", fontFamily:"'DM Mono', monospace",
                    fontWeight: isSelected || isToday ? 700 : 400,
                    cursor: cell.cur ? "pointer" : "default",
                    transition:"background 0.1s",
                  }}
                  onMouseEnter={e=>{ if(cell.cur&&!isSelected) e.currentTarget.style.background="rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e=>{ if(cell.cur&&!isSelected) e.currentTarget.style.background="transparent"; }}>
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
        </>
      )}
    </div>
  );
}

function InlineDatePicker({ value, onChange, light }) {
  const parsed = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + "T12:00:00") : new Date();
  const [viewYear,  setViewYear]  = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const prevDays    = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDow - daysInMonth + 1, cur: false });

  const selectedDate = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  const todayISO2    = todayISO();
  const prevMo = () => { if(viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1); };
  const nextMo = () => { if(viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1); };
  const selectDay = day => {
    const iso = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    onChange(iso);
  };

  const c = light ? {
    nav:    "#94a3b8",
    header: "#1e293b",
    dayHdr: "#94a3b8",
    cur:    "#1e293b",
    off:    "#cbd5e1",
    todayBg:"rgba(87,119,87,0.12)",
    todayTx:"#577757",
    hover:  "rgba(87,119,87,0.08)",
  } : {
    nav:    "rgba(255,255,255,0.5)",
    header: "rgba(255,255,255,0.85)",
    dayHdr: "rgba(255,255,255,0.25)",
    cur:    "rgba(255,255,255,0.8)",
    off:    "rgba(255,255,255,0.15)",
    todayBg:"rgba(87,119,87,0.35)",
    todayTx:"#a8d4a8",
    hover:  "rgba(255,255,255,0.1)",
  };

  return (
    <div style={{ userSelect:"none" }}>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
        <button onClick={prevMo} style={{ background:"none", border:"none", color:c.nav, cursor:"pointer", fontSize:"16px", padding:"2px 4px", borderRadius:"4px", lineHeight:1 }}>‹</button>
        <span style={{ fontSize:"11px", fontWeight:700, color:c.header, fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>
          {PT_MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMo} style={{ background:"none", border:"none", color:c.nav, cursor:"pointer", fontSize:"16px", padding:"2px 4px", borderRadius:"4px", lineHeight:1 }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:"4px" }}>
        {PT_DAYS.map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontSize:"9px", fontWeight:700, color:c.dayHdr, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", padding:"2px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
        {cells.map((cell, i) => {
          const iso = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}`;
          const isSelected = cell.cur && iso === selectedDate;
          const isToday    = cell.cur && iso === todayISO2;
          return (
            <button key={i} onClick={() => cell.cur && selectDay(cell.day)}
              style={{ padding:"5px 0", borderRadius:"6px", border: isSelected ? `2px solid ${SAGE}` : "none", background: isSelected ? SAGE : "transparent", color: isSelected ? "#fff" : cell.cur ? c.cur : c.off, fontSize:"11px", fontFamily:"'DM Mono', monospace", fontWeight: isSelected ? 700 : 400, cursor: cell.cur ? "pointer" : "default", transition:"background 0.1s", textDecoration: isToday && !isSelected ? "underline" : "none", textUnderlineOffset:"2px" }}
              onMouseEnter={e=>{ if(cell.cur&&!isSelected) e.currentTarget.style.background=c.hover; }}
              onMouseLeave={e=>{ if(cell.cur&&!isSelected) e.currentTarget.style.background="transparent"; }}>
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── NOTE EDITOR ──────────────────────────────────────────────────────────────

// ─── SIDEBAR REFS ─────────────────────────────────────────────────────────────

const DarkTypePicker = ({ value, onChange }) => (
  <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
    {Object.entries(REF_TYPES).map(([k, v]) => (
      <button key={k} onClick={() => onChange(k)}
        style={{ padding:"2px 8px", borderRadius:"20px", border:`1px solid ${value===k ? v.color+"88" : "rgba(255,255,255,0.12)"}`, backgroundColor: value===k ? v.color+"22" : "transparent", color: value===k ? v.color : "rgba(255,255,255,0.4)", fontSize:"10px", fontWeight: value===k ? 700 : 400, cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.1s" }}>
        {v.label}
      </button>
    ))}
  </div>
);

function TitleField({ lbl, val, set, ph, win, dim, hasMany, onToggleWinner }) {
  return (
    <div className="title-field-wrap" style={{ display:"flex", flexDirection:"column", gap:"3px", padding:"7px 8px", borderRadius:"8px", backgroundColor: win ? "rgba(255,255,255,0.08)" : "transparent", border: win ? "1px solid rgba(255,255,255,0.22)" : "1px solid transparent", opacity: dim ? 0.35 : 1, transition:"all 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
        <span style={{ fontSize:"9px", fontWeight:700, color: win ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.12em", lineHeight:1, transition:"color 0.2s" }}>{lbl}</span>
        {hasMany && val.trim() && (
          <button className="star-btn" onClick={onToggleWinner} title={win ? "Remover seleção" : "Definir como título final"}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"0", display:"flex", alignItems:"center", lineHeight:1, transition:"opacity 0.15s, transform 0.15s", transform: win ? "scale(1.15)" : "scale(1)", opacity: win ? 1 : 0 }}>
            <Star size={11} strokeWidth={0} fill={win ? "#f5c842" : "rgba(255,255,255,0.3)"} />
          </button>
        )}
      </div>
      <textarea className="meta-title-input" value={val} placeholder={ph} rows={1}
        onChange={e => { set(e.target.value); e.target.style.height="auto"; e.target.style.height=e.target.scrollHeight+"px"; }}
        ref={el => { if (el) { el.style.height="auto"; el.style.height=el.scrollHeight+"px"; } }}
        onKeyDown={e => e.key==="Enter" && e.preventDefault()}
        style={{ width:"100%", border:"none", borderBottom: win ? "none" : "1px solid rgba(255,255,255,0.1)", outline:"none", fontSize:"13px", fontWeight: win ? 700 : 600, color: win ? "#fff" : "rgba(255,255,255,0.75)", fontFamily:"'Inter', sans-serif", background:"transparent", lineHeight:1.6, padding:"2px 0 4px", resize:"none", overflow:"hidden", display:"block", boxSizing:"border-box", transition:"color 0.2s" }} />
    </div>
  );
}




// ─── TITLE ABC ROW ────────────────────────────────────────────────────────────

function TitleABCRow({ lbl, val, set, ph, win, onToggleWinner }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ marginBottom:"10px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
        <span style={{ fontSize:"9px", fontWeight:700, color: win ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>{lbl}</span>
        <button onClick={onToggleWinner}
          style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", opacity: (hovered || win) ? 1 : 0, transition:"opacity 0.15s" }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill={win ? "#f5c842" : "none"} stroke={win ? "#f5c842" : "rgba(255,255,255,0.45)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>
      <textarea value={val} onChange={e=>{set(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}}
        ref={el=>{if(el){el.style.height="auto";el.style.height=el.scrollHeight+"px";}}}
        placeholder={ph} rows={1}
        onKeyDown={e=>e.key==="Enter"&&e.preventDefault()}
        className="green-input"
        style={{ display:"block", width:"100%", fontSize:"15px", fontWeight: win ? 700 : 500, lineHeight:"1.4", border:"none", borderBottom:`1px solid ${win ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`, outline:"none", color: win ? "#fff" : "rgba(255,255,255,0.75)", backgroundColor:"transparent", padding:"2px 0 6px", caretColor:"#fff", fontFamily:"'Inter', sans-serif", resize:"none", overflow:"hidden", boxSizing:"border-box" }} />
    </div>
  );
}

// ─── NOTE EDITOR ──────────────────────────────────────────────────────────────

function NoteEditor({ note, date: initialDate, onSave, onSaveSilent, onClose, onCloseAll, onDelete }) {
  const STATUS_MAP = useStatusMap();
  const isMobile = useIsMobile();
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [editorMenuOpen, setEditorMenuOpen] = useState(false);
  const isNew = !note;
  const [title, setTitle]           = useState(note?.title       || "");
  const [content, setContent]       = useState(note?.content     || "");
  const [size, setSize]             = useState(note?.size        || "large");
  const [status, setStatus]         = useState(note?.status      || "ideia");
  const [noteDate, setNoteDate]     = useState(note?.date        || initialDate);
  const [saved, setSaved]           = useState(false);
  const [dateError, setDateError]   = useState("");
  const [moodboard, setMoodboard]   = useState(note?.moodboard   || []);
  const [titleB, setTitleB]         = useState(note?.titleB       || "");
  const [titleC, setTitleC]         = useState(note?.titleC       || "");
  const [titleWinner, setTitleWinner] = useState(note?.titleWinner || null);
  const [tags, setTags]             = useState(note?.tags          || "");
  const [insercoes, setInsercoes]   = useState(note?.insercoes     || []);
  const [insAddingOpen, setInsAddingOpen] = useState(false);
  const [insNewLabel, setInsNewLabel]     = useState("");
  const [broll, setBroll]           = useState(note?.broll || { topdown:[], livre:[], fixo:[], detalhes:[] });
  const brollInputRefs = useRef({});
  const brollDragRef   = useRef(null); // { cat, id, idx }
  const [brollDragging, setBrollDragging] = useState(null); // { cat, id }
  const [brollDragOver, setBrollDragOver] = useState(null); // { cat, idx }
  const brollLeaveTimer = useRef(null);

  const addBrollItem    = (cat) => {
    const id = generateId();
    setBroll(p => ({ ...p, [cat]: [...p[cat], { id, text:"", done: false }] }));
    setTimeout(() => brollInputRefs.current[id]?.focus(), 30);
  };
  const updateBrollItem = (cat, id, patch) => setBroll(p => ({ ...p, [cat]: p[cat].map(i => i.id===id ? {...i,...patch} : i) }));
  const deleteBrollItem = (cat, id)        => setBroll(p => ({ ...p, [cat]: p[cat].filter(i => i.id!==id) }));
  const moveBrollItem   = (cat, fromIdx, toIdx) => setBroll(p => {
    const next = [...p[cat]];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    return { ...p, [cat]: next };
  });

  const allDone  = Object.values(broll).every(items => items.length === 0 || items.every(i => i.done));
  const anyDone  = Object.values(broll).some(items => items.some(i => i.done));
  const toggleAllBroll = () => {
    const markDone = !allDone;
    setBroll(p => Object.fromEntries(Object.entries(p).map(([cat, items]) => [cat, items.map(i => ({...i, done: markDone}))])));
  };
  const BROLL_CATS = [
    { key:"topdown",  label:"Top down" },
    { key:"livre",    label:"45° — câmera livre (na mão)" },
    { key:"fixo",     label:"45° — câmera fixa (tripé)" },
    { key:"detalhes", label:"Detalhes do objeto" },
  ];
  const [perf, setPerf]             = useState(note?.perf          || {});
  const perfUnlocked = noteDate && (Date.now() - new Date(noteDate + "T00:00:00").getTime()) >= 24*60*60*1000;
  const [titlesCollapsed, setTitlesCollapsed] = useState(true);
  const [propPatrocinador, setPropPatrocinador] = useState(note?.propPatrocinador || "");

  useEffect(() => { if (size === "small" && (status === "aroll" || status === "broll")) setStatus("ideia"); }, [size]);
  const [sidebarOrder, setSidebarOrder] = useState(["titulos","data","status","descricao","insercoes","tags","perf","moodboard"]);
  const [sidebarReorder, setSidebarReorder] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState({ moodboard: true });
  const sidebarDragRef = useRef(null);
  const [reorderHeld, setReorderHeld] = useState(null); // index being dragged

  useEffect(() => {
    const clear = () => setReorderHeld(null);
    window.addEventListener("mouseup", clear);
    return () => window.removeEventListener("mouseup", clear);
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = useState({});
  const [sharedDesc, setSharedDesc]  = useState(sharedDescriptionStore);
  const moodRef = useRef(null);
  const stats     = countStats(content);
  const statusObj = STATUS_MAP[status] || STATUS_MAP.ideia;

  // ── Original date frozen at mount — used as oldDate for UPDATE_NOTE ─────────
  const originalDate = useRef(note?.date ?? null);

  // ── Refs para sempre ter os valores mais recentes sem re-criar o timer ───────
  const latestPayload   = useRef(null);
  const latestSaveFn    = useRef(null);
  latestPayload.current = () => ({
    ...(note ? { id: note.id } : {}),
    title: title.trim(), titleB, titleC, titleWinner,
    content, size, status,
    date: noteDate,
    tags, insercoes, perf, broll,
    moodboard, propPatrocinador,
  });
  latestSaveFn.current = onSaveSilent || onSave;

  const buildPayload = () => latestPayload.current();

  // ── Moodboard handlers ─────────────────────────────────────────────────────
  const handleMoodImage = e => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const r = new FileReader();
      r.onload = ev => setMoodboard(prev => [...prev, { id: generateId(), src: ev.target.result }]);
      r.readAsDataURL(file);
    });
  };
  const removeMoodImage = id => setMoodboard(prev => prev.filter(img => img.id !== id));

  // ── Unified debounced autosave (2s após qualquer mudança de campo) ──────────
  const isFirstRender = useRef(true);
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!title.trim()) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(noteDate)) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      latestSaveFn.current(latestPayload.current(), originalDate.current);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    }, 2000);
    return () => clearTimeout(debounceTimer.current);
  }, [title, titleB, titleC, titleWinner, content, size, status, noteDate, tags, insercoes, perf, broll, moodboard, propPatrocinador]);

  // ── Cmd/Ctrl+S manual save ─────────────────────────────────────────────────
  const handleSaveWithMood = useCallback(() => {
    if (!title.trim()) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(noteDate)) { setDateError("Data inválida"); return; }
    setDateError("");
    clearTimeout(debounceTimer.current);
    latestSaveFn.current(latestPayload.current(), originalDate.current);
    setSaved(true); setTimeout(() => setSaved(false), 1600);
  }, [title, noteDate]);

  useEffect(() => {
    const h = e => { if ((e.ctrlKey||e.metaKey) && e.key==="s") { e.preventDefault(); handleSaveWithMood(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [handleSaveWithMood]);

  // Lock body scroll while editor is open
  useEffect(() => {
    document.body.classList.add("editor-open");
    return () => document.body.classList.remove("editor-open");
  }, []);

  const ghostBtn = { border:"1px solid rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.12)", borderRadius:"8px", cursor:"pointer", fontFamily:"'Inter', sans-serif", fontWeight:600, color:"#fff", transition:"all 0.12s", backdropFilter:"blur(4px)" };

  const [editorTab, setEditorTab] = useState("roteiro");

  return (
    <div style={{ position:"fixed", inset:0, zIndex:2000, display:"flex", flexDirection: isMobile ? "column" : "row", backgroundColor:SAGE, animation:"editorEnter 0.2s cubic-bezier(0.4,0,0.2,1)", overflowY: isMobile ? "auto" : "hidden" }}>

        {isMobile ? (
          <>

            <div style={{ position:"sticky", top:0, zIndex:100, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", backgroundColor:"rgba(73,103,73,0.92)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={onCloseAll || onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.7)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              {/* Tab switcher in topbar */}
              <div style={{ display:"flex", position:"relative", backgroundColor:"rgba(0,0,0,0.2)", borderRadius:"10px", padding:"3px" }}>
                <div style={{ position:"absolute", top:"3px", bottom:"3px", width:"76px", borderRadius:"7px", backgroundColor:"rgba(255,255,255,0.18)", transition:"transform 0.2s cubic-bezier(0.4,0,0.2,1)", transform: editorTab === "roteiro" ? "translateX(0)" : "translateX(76px)", pointerEvents:"none" }} />
                {[{key:"roteiro", label:"Roteiro"},{key:"broll", label:"B-roll"}].map(({key,label}) => (
                  <button key={key} onClick={()=>setEditorTab(key)}
                    style={{ position:"relative", zIndex:1, width:"76px", padding:"5px 0", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600, fontFamily:"'Inter', sans-serif", background:"transparent", transition:"color 0.2s", textAlign:"center", color: editorTab===key ? "#fff" : "rgba(255,255,255,0.4)" }}>
                    {label}
                  </button>
                ))}
              </div>
              {/* Menu button */}
              <button onClick={()=>setEditorMenuOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.7)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
              </button>
            </div>
          </>
        ) : (
        <div style={{ width:"320px", flexShrink:0, display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.08)", backgroundColor:"transparent", position:"relative" }}>

          <div style={{ flexShrink:0, display:"flex", alignItems:"center", padding:"14px 14px", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", backgroundColor:"rgba(87,119,87,0.25)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={()=>{ setSidebarReorder(v=>!v); setReorderHeld(null); }}
              style={{ ...ghostBtn, padding:"7px 14px", fontSize:"12px", border: sidebarReorder ? "1px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.35)", backgroundColor: sidebarReorder ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)", borderRadius:"8px", display:"flex", alignItems:"center", gap:"6px" }}>
              ⠿ {sidebarReorder ? "Concluído" : "Reordenar"}
            </button>
          </div>
          <div className="sidebar-scroll" style={{ flex:1, overflowY:"auto", position:"relative" }}>

            <div style={{ display:"flex", flexDirection:"column", gap: sidebarReorder ? "4px" : "20px", padding:"14px 14px 24px" }}>
                {sidebarOrder.map((sectionKey, idx) => {
                  const labelMap = { titulos:"Títulos alt.", titulo:"Título", data:"Data de publicação", status:"Status", descricao:"Descrição", insercoes:"Inserções", tags:"Tags", perf:"Performance", moodboard:"Moodboard" };

                  const isHeld    = reorderHeld === idx;

                  const handleMouseEnterReorder = () => {
                    if (reorderHeld === null || reorderHeld === idx) return;
                    const next = [...sidebarOrder];
                    const [moved] = next.splice(reorderHeld, 1);
                    next.splice(idx, 0, moved);
                    setSidebarOrder(next);
                    setReorderHeld(idx);
                  };

                  if (sidebarReorder) {
                    const isHidden = !!sidebarHidden[sectionKey];
                    return (
                    <div key={sectionKey} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div
                        onMouseDown={() => !isHidden && setReorderHeld(idx)}
                        onMouseUp={() => setReorderHeld(null)}
                        onMouseEnter={handleMouseEnterReorder}
                        style={{ flex:1, display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"8px", border:`1px solid ${isHeld ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)"}`, backgroundColor: isHeld ? "rgba(255,255,255,0.14)" : isHidden ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.05)", cursor: isHidden ? "default" : isHeld ? "grabbing" : "grab", transition:"background 0.12s, border-color 0.12s, transform 0.18s cubic-bezier(0.4,0,0.2,1)", userSelect:"none", transform: isHeld ? "scale(1.02)" : "scale(1)", boxShadow: isHeld ? "0 4px 16px rgba(0,0,0,0.3)" : "none", opacity: isHidden ? 0.4 : 1 }}>
                        <span style={{ fontSize:"14px", color: isHeld ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)", lineHeight:1, flexShrink:0, transition:"color 0.12s" }}>⠿</span>
                        <span style={{ fontSize:"11px", fontWeight:700, color: isHeld ? "#fff" : "rgba(255,255,255,0.7)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em", transition:"color 0.12s" }}>{labelMap[sectionKey]}</span>
                      </div>
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => setSidebarHidden(p => ({ ...p, [sectionKey]: !p[sectionKey] }))}
                        style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", color: isHidden ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)", display:"flex", alignItems:"center", flexShrink:0, transition:"color 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.color = isHidden ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.9)"}
                        onMouseLeave={e => e.currentTarget.style.color = isHidden ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)"}>
                        {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    );
                  }

                  const isCollapsed = !!sidebarCollapsed[sectionKey];
                  const toggleCollapse = () => setSidebarCollapsed(p => ({ ...p, [sectionKey]: !p[sectionKey] }));

                  // Skip sections toggled off
                  if (sidebarHidden[sectionKey]) return null;

                  const SectionHeader = ({ label, icon: IconComp }) => (
                    <button onClick={toggleCollapse} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"none", border:"none", cursor:"pointer", padding:"0 0 8px", marginBottom: isCollapsed ? 0 : "0" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.12em" }}>
                        {IconComp && <IconComp size={10} strokeWidth={2.5} />}
                        {label}
                      </span>
                      <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.25)", lineHeight:1, transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition:"transform 0.2s ease", display:"inline-block" }}>▾</span>
                    </button>
                  );

                  if (sectionKey === "titulos") {
                    const hasMany = (titleB.trim() || titleC.trim()) && size === "large";
                    const winA = titleWinner === "A", winB = titleWinner === "B", winC = titleWinner === "C";
                    const previewTitle = titleWinner === "B" ? titleB : titleWinner === "C" ? titleC : title;
                    return (
                      <div key="titulos">
                        <SectionHeader label="Títulos alternativos" />
                        {isCollapsed && previewTitle.trim() && (
                          <div style={{ fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', sans-serif", lineHeight:1.5, padding:"4px 2px 0", marginTop:"-4px" }}>
                            {titleWinner && <Star size={9} strokeWidth={0} fill="#f5c842" style={{ marginRight:"5px", verticalAlign:"middle", display:"inline" }} />}
                            {previewTitle}
                          </div>
                        )}
                        <div className="sidebar-section-body" style={{ maxHeight: isCollapsed ? "0" : "800px", opacity: isCollapsed ? 0 : 1, overflow: isCollapsed ? "hidden" : "visible" }}>
                          <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"10px 14px", display:"flex", flexDirection:"column", gap:"8px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:"2px" }}>
                            <TitleField lbl="A" val={title} set={setTitle} ph="Título principal..." win={winA} dim={hasMany && titleWinner && !winA} hasMany={hasMany} onToggleWinner={() => setTitleWinner(winA ? null : "A")} />
                            {size === "large" && (<>
                              <TitleField lbl="B" val={titleB} set={setTitleB} ph="Título alternativo B..." win={winB} dim={hasMany && titleWinner && !winB} hasMany={hasMany} onToggleWinner={() => setTitleWinner(winB ? null : "B")} />
                              <TitleField lbl="C" val={titleC} set={setTitleC} ph="Título alternativo C..." win={winC} dim={hasMany && titleWinner && !winC} hasMany={hasMany} onToggleWinner={() => setTitleWinner(winC ? null : "C")} />
                            </>)}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (sectionKey === "data") {
                    const datePreview = (() => {
                      if (!noteDate || !/^\d{4}-\d{2}-\d{2}$/.test(noteDate)) return null;
                      const [y, m, d] = noteDate.split("-").map(Number);
                      const dt = new Date(y, m - 1, d);
                      const raw = dt.toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
                      return raw.charAt(0).toUpperCase() + raw.slice(1);
                    })();
                    return (
                    <div key="data">
                      <SectionHeader label="Data de publicação" />
                      {isCollapsed && datePreview && (
                        <div style={{ fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', sans-serif", lineHeight:1.5, padding:"4px 2px 0", marginTop:"-4px" }}>
                          {datePreview}
                        </div>
                      )}
                      <div className="sidebar-section-body" style={{ maxHeight: isCollapsed ? "0" : "800px", opacity: isCollapsed ? 0 : 1, overflow: isCollapsed ? "hidden" : "visible" }}>
                        <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:"2px" }}>
                          <InlineDatePicker value={noteDate} onChange={v=>{setNoteDate(v);setDateError("");}} />
                          {dateError && <span style={{ fontSize:"10px", color:"#fca5a5", fontFamily:"'DM Mono', monospace", marginTop:"6px", display:"block" }}>{dateError}</span>}
                        </div>
                      </div>
                    </div>
                    );
                  }

                  if (sectionKey === "status") return (
                    <div key="status">
                      <SectionHeader label="Status" />
                      {isCollapsed && STATUS_MAP[status] && (
                        <div style={{ fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', sans-serif", padding:"4px 2px 0", marginTop:"-4px" }}>
                          {STATUS_MAP[status].label}
                        </div>
                      )}
                      <div className="sidebar-section-body" style={{ maxHeight: isCollapsed ? "0" : "800px", opacity: isCollapsed ? 0 : 1, overflow: isCollapsed ? "hidden" : "visible" }}>
                        <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px", border:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:"5px", marginBottom:"2px" }}>
                          {Object.entries(STATUS_MAP).filter(([key]) => size === "large" || (key !== "aroll" && key !== "broll")).map(([key, val]) => {
                            const a = status === key;
                            return (
                              <button key={key} onClick={()=>setStatus(key)}
                                style={{ padding:"6px 10px", borderRadius:"8px", border:a?`1px solid ${val.color}66`:"1px solid transparent", backgroundColor:a?val.bg:"transparent", color:a?val.color:"rgba(255,255,255,0.45)", fontSize:"12px", fontWeight:a?700:400, cursor:"pointer", fontFamily:"'Inter', sans-serif", whiteSpace:"nowrap", transition:"all 0.12s", display:"flex", alignItems:"center", gap:"7px", textAlign:"left" }}
                                onMouseEnter={e=>{ if(!a){e.currentTarget.style.backgroundColor="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(255,255,255,0.8)";} }}
                                onMouseLeave={e=>{ if(!a){e.currentTarget.style.backgroundColor="transparent";e.currentTarget.style.color="rgba(255,255,255,0.45)";} }}>
                                <span style={{ width:"7px", height:"7px", borderRadius:"50%", backgroundColor:a?val.color:"rgba(255,255,255,0.25)", display:"inline-block", flexShrink:0 }} />{val.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );

                  if (sectionKey === "descricao") return (
                    <div key="descricao">
                      <SectionHeader label="Descrição" />
                      <div className="sidebar-section-body" style={{ maxHeight: isCollapsed ? "0" : "800px", opacity: isCollapsed ? 0 : 1, overflow: isCollapsed ? "hidden" : "visible" }}>
                        <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:"2px", display:"flex", flexDirection:"column", gap:"8px" }}>
                          <textarea
                            value={sharedDesc} onChange={e=>{setSharedDesc(e.target.value);sharedDescriptionStore=e.target.value;}}
                            placeholder={"Descrição padrão do vídeo...\n\nEx: links, redes sociais, hashtags, patrocinadores fixos"}
                            rows={6}
                            style={{ width:"100%", resize:"vertical", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"10px 12px", fontSize:"12px", color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', sans-serif", outline:"none", background:"rgba(255,255,255,0.05)", lineHeight:1.7, boxSizing:"border-box", transition:"border-color 0.15s" }}
                            onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.35)"}
                            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
                          />
                          <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.25)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em" }}>Compartilhada entre todos os roteiros</span>
                        </div>
                      </div>
                    </div>
                  );

                  if (sectionKey === "insercoes") { if (size !== "large") return null;
                    return (
                    <div key="insercoes">
                      <SectionHeader label="Inserções" />
                      {isCollapsed && insercoes.length > 0 && (
                        <div style={{ fontSize:"13px", fontWeight:600, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', sans-serif", padding:"4px 2px 0", marginTop:"-4px" }}>
                          {insercoes.map(ins => ins.label).join(", ")}
                        </div>
                      )}
                      <div className="sidebar-section-body" style={{ maxHeight: isCollapsed ? "0" : "800px", opacity: isCollapsed ? 0 : 1, overflow: isCollapsed ? "hidden" : "visible" }}>
                        <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:"2px", display:"flex", flexDirection:"column", gap:"2px" }}>
                          {insercoes.map(ins => (
                            <div key={ins.id} className="ins-pill"
                              style={{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 10px", borderRadius:"8px", border:"1px solid transparent", backgroundColor:"transparent", transition:"background-color 0.12s" }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.07)"}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                              <span style={{ flex:1, fontSize:"12px", fontWeight:400, color:"rgba(255,255,255,0.45)", fontFamily:"'Inter', sans-serif" }}>{ins.label}</span>
                              <button className="ins-delete" onClick={() => setInsercoes(prev => prev.filter(i => i.id !== ins.id))}
                                style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", fontSize:"14px", lineHeight:1, padding:"0 2px", display:"flex", alignItems:"center", opacity:0, transition:"opacity 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.color="rgba(239,68,68,0.7)"}
                                onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.3)"}>×</button>
                            </div>
                          ))}
                          {insAddingOpen ? (
                            <div style={{ display:"flex", gap:"6px", marginTop:"4px" }}>
                              <input autoFocus value={insNewLabel} onChange={e => setInsNewLabel(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && insNewLabel.trim()) { setInsercoes(prev => [...prev, { id:generateId(), label:insNewLabel.trim() }]); setInsNewLabel(""); setInsAddingOpen(false); } if (e.key === "Escape") { setInsAddingOpen(false); setInsNewLabel(""); } }}
                                placeholder="Nome da inserção..."
                                style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"6px", padding:"5px 10px", fontSize:"12px", color:"#fff", fontFamily:"'Inter', sans-serif", outline:"none" }} />
                              <button onClick={() => { if (insNewLabel.trim()) { setInsercoes(prev => [...prev, { id:generateId(), label:insNewLabel.trim() }]); setInsNewLabel(""); setInsAddingOpen(false); } }}
                                style={{ background:"rgba(87,119,87,0.5)", border:"none", borderRadius:"6px", padding:"5px 10px", color:"#fff", fontSize:"11px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>OK</button>
                              <button onClick={() => { setInsAddingOpen(false); setInsNewLabel(""); }}
                                style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"6px", padding:"5px 8px", color:"rgba(255,255,255,0.4)", fontSize:"11px", cursor:"pointer" }}>×</button>
                            </div>
                          ) : (
                            <button onClick={() => setInsAddingOpen(true)}
                              style={{ alignSelf:"flex-start", background:"none", border:"1px dashed rgba(255,255,255,0.2)", borderRadius:"6px", padding:"4px 10px", cursor:"pointer", color:"rgba(255,255,255,0.35)", fontSize:"11px", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", transition:"all 0.15s", marginTop: insercoes.length ? "4px" : "0" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.4)"; e.currentTarget.style.color="rgba(255,255,255,0.65)"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; e.currentTarget.style.color="rgba(255,255,255,0.35)"; }}>
                              + Adicionar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    ); }

                  if (sectionKey === "tags") { if (size !== "large") return null; return (
                    <div key="tags">
                      <SectionHeader label="Tags" />
                      <div className="sidebar-section-body" style={{ maxHeight: isCollapsed ? "0" : "800px", opacity: isCollapsed ? 0 : 1, overflow: isCollapsed ? "hidden" : "visible" }}>
                        <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:"2px", display:"flex", flexDirection:"column", gap:"8px" }}>
                          {(() => {
                            const MAX = 500; const remaining = MAX - tags.length;
                            const isOver = remaining < 0; const isWarning = remaining >= 0 && remaining < 60;
                            const tagList = tags.split(",").map(t=>t.trim()).filter(Boolean);
                            return (<>
                              <textarea
                                value={tags}
                                onChange={e=>{ if(e.target.value.length <= MAX+20) setTags(e.target.value); }}
                                onKeyDown={e=>{ if(e.key==="Enter"){e.preventDefault();if(tags.trim()&&!tags.endsWith(","))setTags(tags+", ");} }}
                                placeholder="roteiro, produtividade, youtube..."
                                rows={4}
                                style={{ width:"100%", resize:"vertical", border:`1px solid ${isOver?"#ef4444":isWarning?"#f59e0b":"rgba(255,255,255,0.1)"}`, borderRadius:"8px", padding:"10px 12px", fontSize:"12px", color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', sans-serif", outline:"none", background:"rgba(255,255,255,0.05)", lineHeight:1.7, boxSizing:"border-box", transition:"border-color 0.15s" }}
                                onFocus={e=>{ if(!isOver&&!isWarning) e.target.style.borderColor="rgba(255,255,255,0.35)"; }}
                                onBlur={e=>{ if(!isOver&&!isWarning) e.target.style.borderColor="rgba(255,255,255,0.1)"; }}
                              />
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.25)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em" }}>{tagList.length} tag{tagList.length!==1?"s":""}</span>
                                <span style={{ fontSize:"10px", fontFamily:"'DM Mono', monospace", fontWeight:600, color: isOver?"#ef4444":isWarning?"#f59e0b":"rgba(255,255,255,0.3)" }}>
                                  {isOver ? `+${-remaining} acima` : `${remaining} restantes`}
                                </span>
                              </div>
                            </>);
                          })()}
                        </div>
                      </div>
                    </div>
                  ); }

                  if (sectionKey === "perf") { if (size !== "large") return null; return (
                    <div key="perf">
                      <SectionHeader label="Performance" icon={perfUnlocked ? null : Lock} />
                      <div className="sidebar-section-body" style={{ maxHeight: isCollapsed ? "0" : "900px", opacity: isCollapsed ? 0 : 1, overflow: isCollapsed ? "hidden" : "visible" }}>
                        <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:"2px" }}>
                          {!perfUnlocked ? (
                            <div style={{ textAlign:"center", padding:"16px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                              <Lock size={28} color="rgba(255,255,255,0.25)" strokeWidth={1.5} />
                              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.45)", fontFamily:"'Inter', sans-serif", lineHeight:1.6, maxWidth:"200px" }}>
                                Disponível 24h após a data do vídeo
                              </div>
                              {noteDate && (() => { const d = new Date(noteDate+"T00:00:00"); d.setDate(d.getDate()+1); return <div style={{ fontSize:"10px", fontFamily:"'DM Mono', monospace", color:"rgba(255,255,255,0.3)", padding:"4px 10px", borderRadius:"20px", border:"1px solid rgba(255,255,255,0.1)" }}>{d.toLocaleDateString("pt-BR", {day:"2-digit",month:"2-digit",year:"numeric"})}</div>; })()}
                            </div>
                          ) : (
                            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
                                {PERF_METRICS.map(({ key, label, Icon, suffix }) => (
                                  <div key={key} style={{ borderRadius:"8px", padding:"8px 10px", backgroundColor:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:"5px" }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                                      <Icon size={11} strokeWidth={2} color="rgba(255,255,255,0.4)" />
                                      <span style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</span>
                                    </div>
                                    <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                                      {suffix==="R$" && <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace" }}>R$</span>}
                                      <input type="number" min="0" value={perf[key]||""} onChange={e=>setPerf({...perf,[key]:e.target.value})} placeholder="—"
                                        style={{ flex:1, border:"none", borderBottom:"1px solid rgba(255,255,255,0.1)", outline:"none", background:"transparent", fontSize:"13px", fontWeight:700, color:"rgba(255,255,255,0.85)", fontFamily:"'DM Mono', monospace", textAlign:"right", padding:"2px 0" }} />
                                      {suffix&&suffix!=="R$"&&<span style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace" }}>{suffix}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {(perf.views||perf.retention||perf.ctr) && (
                                <div style={{ borderRadius:"8px", padding:"10px 12px", backgroundColor:"rgba(87,119,87,0.15)", border:"1px solid rgba(87,119,87,0.3)", display:"flex", gap:"16px", flexWrap:"wrap" }}>
                                  {perf.views&&<div style={{ fontSize:"16px", fontWeight:700, color:"rgba(255,255,255,0.9)", fontFamily:"'Inter', sans-serif" }}>{Number(perf.views).toLocaleString("pt-BR")}<span style={{ fontSize:"10px", fontWeight:400, color:"rgba(255,255,255,0.35)", marginLeft:"4px" }}>views</span></div>}
                                  {perf.retention&&<div style={{ fontSize:"16px", fontWeight:700, color:"rgba(255,255,255,0.9)", fontFamily:"'Inter', sans-serif" }}>{perf.retention}%<span style={{ fontSize:"10px", fontWeight:400, color:"rgba(255,255,255,0.35)", marginLeft:"4px" }}>retenção</span></div>}
                                  {perf.ctr&&<div style={{ fontSize:"16px", fontWeight:700, color:"rgba(255,255,255,0.9)", fontFamily:"'Inter', sans-serif" }}>{perf.ctr}%<span style={{ fontSize:"10px", fontWeight:400, color:"rgba(255,255,255,0.35)", marginLeft:"4px" }}>CTR</span></div>}
                                </div>
                              )}
                              <textarea value={perf._notes||""} onChange={e=>setPerf({...perf,_notes:e.target.value})}
                                placeholder="Observações: o que funcionou, o que melhorar..."
                                rows={3}
                                style={{ width:"100%", resize:"vertical", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"10px 12px", fontSize:"12px", color:"rgba(255,255,255,0.75)", fontFamily:"'Inter', sans-serif", outline:"none", background:"rgba(255,255,255,0.05)", lineHeight:1.6, boxSizing:"border-box" }}
                                onFocus={e=>e.target.style.borderColor="rgba(255,255,255,0.35)"}
                                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ); }


                  if (sectionKey === "moodboard") return (
                    <div key="moodboard">
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:"8px" }}>
                        <button onClick={toggleCollapse} style={{ display:"flex", alignItems:"center", gap:0, background:"none", border:"none", cursor:"pointer", padding:0, flex:1 }}>
                          <span style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.12em" }}>Moodboard</span>
                          <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.25)", lineHeight:1, transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition:"transform 0.2s ease", display:"inline-block", marginLeft:"auto" }}>▾</span>
                        </button>
                        <input ref={moodRef} type="file" accept="image/*" multiple onChange={handleMoodImage} style={{ display:"none" }} />
                      </div>
                      <div className="sidebar-section-body" style={{ maxHeight: isCollapsed ? "0" : "800px", opacity: isCollapsed ? 0 : 1, overflow: isCollapsed ? "hidden" : "visible" }}>
                        <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"10px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:"2px" }}>
                          {moodboard.length === 0 ? (
                            <div onClick={()=>moodRef.current?.click()}
                              style={{ border:"2px dashed rgba(255,255,255,0.15)", borderRadius:"8px", padding:"24px 12px", textAlign:"center", cursor:"pointer", transition:"all 0.15s" }}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.35)";e.currentTarget.style.backgroundColor="rgba(255,255,255,0.04)";}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.backgroundColor="transparent";}}>
                              <Images size={22} color="rgba(255,255,255,0.25)" strokeWidth={1.5} style={{ margin:"0 auto 6px" }} />
                              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", fontFamily:"'Inter', sans-serif" }}>Clique para adicionar</div>
                            </div>
                          ) : (
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
                              {moodboard.map(img => (
                                <div key={img.id} style={{ position:"relative", borderRadius:"7px", overflow:"hidden", aspectRatio:"1", backgroundColor:"rgba(0,0,0,0.2)" }}
                                  onMouseEnter={e=>e.currentTarget.querySelector(".mood-del").style.opacity="1"}
                                  onMouseLeave={e=>e.currentTarget.querySelector(".mood-del").style.opacity="0"}>
                                  <img src={img.src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                                  <button className="mood-del" onClick={()=>removeMoodImage(img.id)}
                                    style={{ position:"absolute", top:"4px", right:"4px", background:"rgba(0,0,0,0.7)", border:"none", borderRadius:"5px", color:"#fff", width:"22px", height:"22px", cursor:"pointer", fontSize:"13px", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.15s" }}>×</button>
                                </div>
                              ))}
                              <div onClick={()=>moodRef.current?.click()}
                                style={{ borderRadius:"7px", border:"2px dashed rgba(255,255,255,0.15)", aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"20px", color:"rgba(255,255,255,0.25)", transition:"all 0.15s" }}
                                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.4)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}
                                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color="rgba(255,255,255,0.25)";}}>+</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  return null;
                })}
              </div>

          </div>
        </div>
        )}

        <div style={{ flex: isMobile ? "none" : 1, display:"flex", flexDirection:"column", minWidth:0, minHeight: isMobile ? "auto" : 0, padding: isMobile ? "0 12px 32px" : "0 32px 32px" }}>

          <div style={{ display:"flex", alignItems:"center", justifyContent: isMobile ? "flex-end" : "space-between", padding:"14px 0 14px", flexShrink:0 }}>
            {!isMobile && (
              <button onClick={onCloseAll||onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.6)" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}

            {!isMobile && (
            <div style={{ display:"flex", position:"relative", backgroundColor:"rgba(0,0,0,0.2)", borderRadius:"10px", padding:"3px", gap:"0" }}>
              <div style={{ position:"absolute", top:"3px", bottom:"3px", width:"88px", borderRadius:"7px", backgroundColor:"rgba(255,255,255,0.18)", transition:"transform 0.2s cubic-bezier(0.4,0,0.2,1)", transform: editorTab === "roteiro" ? "translateX(0)" : "translateX(88px)", pointerEvents:"none" }} />
              {[{key:"roteiro", label:"Roteiro"},{key:"broll", label:"B-roll"}].map(({key,label}) => (
                <button key={key} onClick={()=>setEditorTab(key)}
                  style={{ position:"relative", zIndex:1, width:"88px", padding:"4px 0", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, fontFamily:"'Inter', sans-serif", background:"transparent", transition:"color 0.2s", textAlign:"center",
                    color: editorTab===key ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  {label}
                </button>
              ))}
            </div>
            )}
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              {saved && !isMobile && <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em" }}>✓ salvo</span>}
              {!isMobile && <button onClick={()=>setEditorMenuOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.55)" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.55)"}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
              </button>}
            </div>
          </div>
        <div style={{ flex: isMobile ? "none" : 1, display:"flex", flexDirection:"column", minHeight: isMobile ? "auto" : 0 }}>

        {/* Mobile Notion-style header — title + properties */}
        {isMobile && (
          <div style={{ flexShrink:0, marginBottom:"10px" }}>

            {/* Collapsible A/B/C titles */}
            <div style={{ marginBottom:"4px" }}>
              {titlesCollapsed ? (
                /* Collapsed: show title A as big editable heading + chevron */
                <div style={{ display:"flex", alignItems:"flex-start", gap:"8px" }}>
                  <textarea value={title} onChange={e=>{setTitle(e.target.value);e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";}}
                    ref={el=>{if(el){el.style.height="auto";el.style.height=el.scrollHeight+"px";}}}
                    placeholder="Título do vídeo..."
                    rows={1}
                    className="green-input mobile-title-input"
                    style={{ flex:1, fontSize:"26px", fontWeight:800, lineHeight:"1.2", border:"none", outline:"none", color:"#fff", backgroundColor:"transparent", padding:"8px 0 10px", caretColor:"#fff", fontFamily:"'Inter', sans-serif", resize:"none", overflow:"hidden", letterSpacing:"-0.01em" }} />
                  <button onClick={()=>setTitlesCollapsed(false)}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:"10px 0 0", color:"rgba(255,255,255,0.3)", flexShrink:0, display:"flex", alignItems:"center" }}
                    onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>
              ) : (
                /* Expanded: show all three title fields */
                <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"12px", padding:"14px 16px", marginBottom:"8px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                    <span style={{ fontSize:"10px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Teste de títulos</span>
                    <button onClick={()=>setTitlesCollapsed(true)}
                      style={{ background:"none", border:"none", cursor:"pointer", padding:"2px", color:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center" }}
                      onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"}
                      onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                  </div>
                  {[
                    { lbl:"A", val:title,  set:setTitle,  ph:"—", win:titleWinner==="A" },
                    { lbl:"B", val:titleB, set:setTitleB, ph:"—", win:titleWinner==="B" },
                    { lbl:"C", val:titleC, set:setTitleC, ph:"—", win:titleWinner==="C" },
                  ].map(({ lbl, val, set, ph, win }) => (
                    <TitleABCRow key={lbl} lbl={lbl} val={val} set={set} ph={ph} win={win}
                      onToggleWinner={()=>setTitleWinner(titleWinner===lbl ? null : lbl)} />
                  ))}
                </div>
              )}
            </div>

            {/* Properties */}
            <div style={{ display:"flex", flexDirection:"column", gap:"0px" }}>

              {/* Status */}
              <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", width:"110px", flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                  <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Status</span>
                </div>
                <div style={{ flex:1, padding:"6px 0" }}>
                  <button onClick={()=>setStatusOpen(true)}
                    style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:700, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:(STATUS_MAP[status]||STATUS_MAP.ideia).color, color:"#fff", display:"flex", alignItems:"center", gap:"5px" }}>
                    {(STATUS_MAP[status]||STATUS_MAP.ideia).label}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {statusOpen && (
                    <div onClick={()=>setStatusOpen(false)}
                      style={{ position:"fixed", inset:0, zIndex:4000, backgroundColor:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fadeIn 0.15s ease" }}>
                      <div onClick={e=>e.stopPropagation()}
                        style={{ backgroundColor:SAGE, borderRadius:"20px 20px 0 0", width:"100%", paddingBottom:"env(safe-area-inset-bottom, 16px)", boxShadow:"0 -8px 40px rgba(0,0,0,0.4)", animation:"slideUp 0.2s ease" }}>
                        <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px" }}>
                          <div style={{ width:"36px", height:"4px", borderRadius:"2px", backgroundColor:"rgba(255,255,255,0.25)" }} />
                        </div>
                        <div style={{ padding:"6px 18px 14px", fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Status</div>
                        <div style={{ display:"flex", flexDirection:"column" }}>
                          {Object.entries(STATUS_MAP).filter(([k])=>size==="large"||(k!=="aroll"&&k!=="broll")).map(([key,val])=>{
                            const a = status===key;
                            return (
                              <button key={key} onClick={()=>{ setStatus(key); setStatusOpen(false); }}
                                style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 20px", border:"none", background: a ? "rgba(255,255,255,0.08)" : "transparent", cursor:"pointer", textAlign:"left", fontFamily:"'Inter', sans-serif" }}>
                                <span style={{ width:"10px", height:"10px", borderRadius:"50%", backgroundColor:val.color, flexShrink:0 }} />
                                <span style={{ fontSize:"15px", fontWeight: a ? 700 : 400, color: a ? "#fff" : "rgba(255,255,255,0.7)" }}>{val.label}</span>
                                {a && <svg style={{ marginLeft:"auto" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ height:"20px" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", width:"110px", flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Publicação</span>
                </div>
                <div style={{ flex:1, padding:"6px 0" }}>
                  <button onClick={()=>setDateOpen(true)}
                    style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:600, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.85)", display:"flex", alignItems:"center", gap:"5px" }}>
                    {noteDate ? (() => { const [y,m,d]=noteDate.split("-"); return `${d}/${m}/${y}`; })() : "Sem data"}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {dateOpen && (
                    <div onClick={()=>setDateOpen(false)}
                      style={{ position:"fixed", inset:0, zIndex:4000, backgroundColor:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fadeIn 0.15s ease" }}>
                      <div onClick={e=>e.stopPropagation()}
                        style={{ backgroundColor:"#4C684C", borderRadius:"20px 20px 0 0", width:"100%", paddingBottom:"env(safe-area-inset-bottom, 16px)", boxShadow:"0 -8px 40px rgba(0,0,0,0.4)", animation:"slideUp 0.2s ease" }}>
                        <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px" }}>
                          <div style={{ width:"36px", height:"4px", borderRadius:"2px", backgroundColor:"rgba(255,255,255,0.25)" }} />
                        </div>
                        <div style={{ padding:"12px 24px 20px" }}>
                          <InlineDatePicker value={noteDate} onChange={v=>{ setNoteDate(v); setDateError(""); setDateOpen(false); }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Patrocinador */}
              <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
                <span style={{ width:"110px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Patrocinador</span>
                <input
                  value={propPatrocinador}
                  onChange={e => setPropPatrocinador(e.target.value)}
                  placeholder="—"
                  style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:"13px", color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', sans-serif", padding:"2px 0", caretColor:"#fff" }}
                />
              </div>

              {insercoes.length > 0 && (
                <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", width:"110px", flexShrink:0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Inserções</span>
                  </div>
                  <div style={{ flex:1, display:"flex", gap:"5px", flexWrap:"wrap", padding:"6px 0" }}>
                    {insercoes.map((ins,i) => (
                      <span key={i} style={{ fontSize:"11px", backgroundColor:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.7)", borderRadius:"4px", padding:"2px 8px", fontFamily:"'DM Mono', monospace" }}>{ins.label}</span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {editorTab === "roteiro" && (
        <div style={{ flex: isMobile ? "none" : 1, display:"flex", flexDirection:"column", backgroundColor:"#fdf9f4", minHeight: isMobile ? "60vh" : 0, overflow:"hidden", borderRadius:"16px", boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }}>
          <RichEditor value={content} onChange={setContent} title={title} isMobile={isMobile} />
        </div>
        )}

        {editorTab === "broll" && (
        <div style={{ flex:1, overflowY:"auto", borderRadius:"16px", backgroundColor:"#fdf9f4", boxShadow:"0 8px 40px rgba(0,0,0,0.2)", padding:"28px 32px", display:"flex", flexDirection:"column", gap:"28px" }}>

          {(anyDone || Object.values(broll).some(i=>i.length>0)) && (
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"-16px" }}>
              <button onClick={toggleAllBroll}
                style={{ background:"none", border:"1px solid #e0d5c5", borderRadius:"6px", padding:"3px 12px", fontSize:"10px", color:"#a08060", cursor:"pointer", fontFamily:"'DM Mono', monospace", letterSpacing:"0.05em", textTransform:"uppercase" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#8a7060";e.currentTarget.style.color="#6a5040";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#e0d5c5";e.currentTarget.style.color="#a08060";}}>
                {allDone ? "Desmarcar todos" : "Marcar todos"}
              </button>
            </div>
          )}
          {BROLL_CATS.map(({key, label}) => (
            <div key={key}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
                <span style={{ fontSize:"10px", fontWeight:700, color:"#8a7060", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
                <button onClick={()=>addBrollItem(key)}
                  style={{ background:"none", border:"1px dashed #c0aa90", borderRadius:"6px", padding:"2px 10px", fontSize:"11px", color:"#a08060", cursor:"pointer", fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#8a7060";e.currentTarget.style.color="#6a5040";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#c0aa90";e.currentTarget.style.color="#a08060";}}>
                  + Adicionar
                </button>
              </div>
              {broll[key].length === 0 && (
                <div style={{ fontSize:"12px", color:"#c0aa90", fontFamily:"'Inter', sans-serif", fontStyle:"italic", padding:"8px 0" }}>Nenhum item ainda</div>
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                {broll[key].map((item, itemIdx) => {
                  const isDragging = brollDragging?.cat === key && brollDragging?.id === item.id;
                  const isTarget   = brollDragOver?.cat === key && brollDragOver?.idx === itemIdx
                                     && brollDragging?.cat === key && !isDragging;
                  return (
                    <div key={item.id}>

                      {isTarget && (
                        <div style={{ height:"3px", borderRadius:"2px", backgroundColor:SAGE, margin:"2px 6px", opacity:0.7, transition:"height 0.1s" }} />
                      )}
                      <div
                        draggable
                        onDragStart={e => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", "");
                          brollDragRef.current = { cat: key, id: item.id, idx: itemIdx };
                          setBrollDragging({ cat: key, id: item.id });
                          setBrollDragOver(null);
                        }}
                        onDragEnd={() => { brollDragRef.current = null; setBrollDragging(null); setBrollDragOver(null); }}
                        onDragOver={e => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          clearTimeout(brollLeaveTimer.current);
                          const drag = brollDragRef.current;
                          if (!drag || drag.cat !== key) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const half = e.clientY < rect.top + rect.height / 2;
                          const targetIdx = half ? itemIdx : itemIdx + 1;
                          setBrollDragOver(prev =>
                            prev?.cat === key && prev?.idx === targetIdx ? prev : { cat: key, idx: targetIdx }
                          );
                        }}
                        onDragLeave={e => {
                          clearTimeout(brollLeaveTimer.current);
                          brollLeaveTimer.current = setTimeout(() => setBrollDragOver(null), 50);
                        }}
                        onDrop={e => {
                          e.preventDefault();
                          clearTimeout(brollLeaveTimer.current);
                          const drag = brollDragRef.current;
                          if (!drag || drag.cat !== key) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const half = e.clientY < rect.top + rect.height / 2;
                          let toIdx = half ? itemIdx : itemIdx + 1;
                          if (toIdx > drag.idx) toIdx--;
                          if (toIdx !== drag.idx) moveBrollItem(key, drag.idx, toIdx);
                          setBrollDragOver(null);
                        }}
                        className="broll-item"
                        style={{ display:"flex", alignItems:"center", gap:"10px", padding:"5px 6px", borderRadius:"7px", transition:"opacity 0.15s", opacity: isDragging ? 0.35 : 1, cursor:"grab" }}
                        onMouseEnter={e=>{ if(!isDragging) e.currentTarget.style.backgroundColor="rgba(0,0,0,0.04)"; }}
                        onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>

                        <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ flexShrink:0, opacity:0.25, cursor:"grab" }}>
                          <circle cx="2.5" cy="2.5" r="1.5" fill="#8a7060"/>
                          <circle cx="7.5" cy="2.5" r="1.5" fill="#8a7060"/>
                          <circle cx="2.5" cy="7" r="1.5" fill="#8a7060"/>
                          <circle cx="7.5" cy="7" r="1.5" fill="#8a7060"/>
                          <circle cx="2.5" cy="11.5" r="1.5" fill="#8a7060"/>
                          <circle cx="7.5" cy="11.5" r="1.5" fill="#8a7060"/>
                        </svg>
                        <div onClick={()=>updateBrollItem(key, item.id, {done:!item.done})}
                          style={{ width:"16px", height:"16px", borderRadius:"4px", border: item.done ? "none" : `1.5px solid #c0b090`, backgroundColor: item.done ? SAGE : "transparent", flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                          {item.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <input
                          ref={el => { if (el) brollInputRefs.current[item.id] = el; }}
                          value={item.text}
                          onChange={e=>updateBrollItem(key, item.id, {text:e.target.value})}
                          onKeyDown={e=>{ if (e.key === "Enter") { e.preventDefault(); addBrollItem(key); } }}
                          placeholder="Descreva o plano..."
                          style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:"14px", lineHeight:"1.85", fontFamily:"'Inter', sans-serif", color: item.done ? "#b0a090" : CAMERA_COLOR, textDecoration: item.done ? "line-through" : "none", transition:"color 0.15s", cursor:"text" }} />
                        <button className="broll-del" onClick={()=>deleteBrollItem(key, item.id)}
                          style={{ background:"none", border:"none", cursor:"pointer", color:"#c0aa90", fontSize:"14px", opacity:0, transition:"opacity 0.15s", padding:"0 2px", lineHeight:1 }}>×</button>
                      </div>
                    </div>
                  );
                })}

                {brollDragOver?.cat === key && brollDragOver?.idx === broll[key].length && brollDragging?.cat === key && (
                  <div style={{ height:"3px", borderRadius:"2px", backgroundColor:SAGE, margin:"2px 6px", opacity:0.7 }} />
                )}
              </div>
            </div>
          ))}
        </div>
        )}

        </div>
        </div>

      {/* ── EDITOR MENU ── */}
      {editorMenuOpen && (
        <div onClick={()=>setEditorMenuOpen(false)}
          style={{ position:"fixed", inset:0, zIndex:5000, backgroundColor:"rgba(0,0,0,0.35)", backdropFilter:"blur(4px)", animation:"fadeIn 0.15s ease" }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ position:"absolute", top: isMobile ? "56px" : "60px", right:"12px", width:"230px", borderRadius:"12px", backgroundColor:SAGE, border:"1px solid rgba(255,255,255,0.12)", boxShadow:"0 12px 40px rgba(0,0,0,0.45)", overflow:"hidden", animation:"slideUp 0.18s ease" }}>

            {/* Header */}
            {/* Stats block */}
            {editorTab === "roteiro" && (
              <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:"6px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono', monospace" }}>palavras</span>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.85)", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{stats.words.toLocaleString("pt-BR")}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono', monospace" }}>caracteres</span>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.85)", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{stats.chars.toLocaleString("pt-BR")}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono', monospace" }}>tempo de leitura</span>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.85)", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>~{Math.max(1, Math.round(stats.words / 173))} min</span>
                </div>
              </div>
            )}

            {/* Items */}
            <div style={{ padding:"5px 5px 5px" }}>
              {[
                ...(editorTab === "roteiro" ? [{
                  label: "Modo foco",
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3"/><path d="M21 8V5a2 2 0 00-2-2h-3"/><path d="M3 16v3a2 2 0 002 2h3"/><path d="M16 21h3a2 2 0 002-2v-3"/></svg>,
                  onClick: () => { setEditorMenuOpen(false); document.dispatchEvent(new CustomEvent("calendarNotes:focusMode")); }
                }] : []),
                {
                  label: "Mover para a lixeira",
                  icon: <Trash2 size={14} strokeWidth={2} />,
                  onClick: () => { setEditorMenuOpen(false); onDelete && onDelete(); onClose && onClose(); }
                },
                {
                  label: "Exportar nota",
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
                  onClick: () => {
                    setEditorMenuOpen(false);
                    const payload = { title, titleB, titleC, titleWinner, content, status, date: noteDate, tags, insercoes, size };
                    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `${(title||"nota").slice(0,40).replace(/[^a-z0-9]/gi,"-")}.json`;
                    a.click();
                  }
                },
                {
                  label: "Copiar link da nota",
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
                  onClick: () => {
                    setEditorMenuOpen(false);
                    const id = note?.id || "";
                    const url = `${window.location.origin}${window.location.pathname}#nota-${id}`;
                    copyToClipboard(url, setSaved);
                  }
                },
                {
                  label: "Copiar texto do roteiro",
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
                  onClick: () => {
                    setEditorMenuOpen(false);
                    const plain = htmlToPlainText(content);
                    copyToClipboard(plain, setSaved);
                  }
                },
              ].map(({label, icon, onClick}) => (
                <button key={label} onClick={onClick}
                  style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"8px", border:"none", background:"none", cursor:"pointer", width:"100%", textAlign:"left", color:"rgba(255,255,255,0.8)", fontFamily:"'Inter', sans-serif", fontSize:"13px", fontWeight:500, transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)"}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                  <span style={{ color:"rgba(255,255,255,0.4)", display:"flex", alignItems:"center", flexShrink:0 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── POST VIEW MODAL ──────────────────────────────────────────────────────────

// ─── TIME INPUT ───────────────────────────────────────────────────────────────

function TimeInput({ value, onChange }) {
  const [h, m] = (value || "00:00").split(":").map(Number);

  const setHours   = e => { const n = Math.max(0, Math.min(23, Number(e.target.value))); onChange(`${String(n).padStart(2,"0")}:${String(m).padStart(2,"0")}`); };
  const setMinutes = e => { const n = Math.max(0, Math.min(59, Number(e.target.value))); onChange(`${String(h).padStart(2,"0")}:${String(n).padStart(2,"0")}`); };

  const numStyle = { fontSize:"11px", fontFamily:"'DM Mono', monospace", fontWeight:600, color:"rgba(255,255,255,0.9)", backgroundColor:"transparent", border:"none", outline:"none", width:"22px", textAlign:"center", padding:0, cursor:"text" };

  return (
    <div style={{ padding:"2px 10px", borderRadius:"20px", backgroundColor:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", gap:"1px" }}>
      <input type="number" min={0} max={23} value={String(h).padStart(2,"0")} onChange={setHours} style={numStyle} />
      <span style={{ fontSize:"11px", fontWeight:600, color:"rgba(255,255,255,0.5)", fontFamily:"'DM Mono', monospace", lineHeight:1 }}>:</span>
      <input type="number" min={0} max={59} value={String(m).padStart(2,"0")} onChange={setMinutes} style={numStyle} />
    </div>
  );
}

// ─── DROPDOWN SHEET ──────────────────────────────────────────────────────────
// Renders as a bottom sheet on mobile, dropdown below anchor on desktop

function DropdownSheet({ anchorRef, open, onClose, children, width = 220 }) {
  const isMobile = useIsMobile();
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (panelRef.current && !panelRef.current.contains(e.target) && (!anchorRef?.current || !anchorRef.current.contains(e.target))) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || isMobile || !anchorRef?.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const panelW = width;
    let left = r.right - panelW;
    if (left < 8) left = r.left;
    setPos({ top: r.bottom + 6, left });
  }, [open, isMobile, width]);

  if (!open) return null;

  if (isMobile) {
    return (
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:4000, backgroundColor:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fadeIn 0.15s ease" }}>
        <div ref={panelRef} onClick={e=>e.stopPropagation()} style={{ backgroundColor:SAGE, borderRadius:"20px 20px 0 0", width:"100%", paddingBottom:"env(safe-area-inset-bottom, 16px)", boxShadow:"0 -8px 40px rgba(0,0,0,0.4)", animation:"slideUp 0.2s ease" }}>
          <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px" }}>
            <div style={{ width:"36px", height:"4px", borderRadius:"2px", backgroundColor:"rgba(255,255,255,0.25)" }} />
          </div>
          {children}
          <div style={{ height:"8px" }} />
        </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} style={{ position:"fixed", top: pos.top, left: pos.left, zIndex:4000, width: `${width}px`, backgroundColor:"#2d4a2d", border:"1px solid rgba(255,255,255,0.14)", borderRadius:"12px", boxShadow:"0 12px 40px rgba(0,0,0,0.45)", animation:"fadeIn 0.12s ease", overflow:"hidden" }}>
      {children}
    </div>
  );
}

function PostViewModal({ note, onClose, onSave, onDelete }) {
  const STATUS_MAP = useStatusMap();
  const overlayRef = useRef(null);
  const titleRef   = useRef(null);
  const IG_PINK    = "#ffffff";
  const statusAnchorRef = useRef(null);
  const dateAnchorRef   = useRef(null);
  const formatAnchorRef = useRef(null);

  const [title,    setTitle]   = useState(note.title     || "");
  const [caption,  setCaption] = useState(note.igCaption || "");
  const [status,   setStatus]  = useState(note.status    || "agendado");
  const [pubTime,  setPubTime] = useState(note.pubTime   || "09:00");
  const [date,     setDate]    = useState(note.date      || todayISO());
  const [igFormat, setIgFormat]= useState(note.igFormat  || "post");
  const [saved,    setSaved]   = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 80); }, []);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = () => {
    onSave({ ...note, title:title.trim(), igCaption:caption, igHashtags:[], status, pubTime, date, igFormat });
    setSaved(true); setTimeout(() => setSaved(false), 1600);
  };

  const displayDate = (() => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Data";
    const [y,m,d] = date.split("-"); return `${d}/${m}/${y}`;
  })();

  return (
    <div ref={overlayRef} onClick={e=>e.target===overlayRef.current&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:3000, backgroundColor:"rgba(20,40,20,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.15s ease" }}>
      <div style={{ backgroundColor:SAGE, borderRadius:"16px", width:"100%", maxWidth:"360px", display:"flex", flexDirection:"column", boxShadow:"0 30px 70px rgba(0,0,0,0.4)", overflow:"visible", animation:"slideUp 0.2s ease", fontFamily:"'Inter', sans-serif" }}>

        <div style={{ padding:"16px 18px 13px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:"rgba(87,119,87,0.3)", backdropFilter:"blur(12px)", borderRadius:"16px 16px 0 0" }}>
          <span style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Postagem</span>
          <button onClick={onClose} style={{ border:"none", background:"rgba(255,255,255,0.1)", borderRadius:"6px", width:"26px", height:"26px", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.6)" }}>×</button>
        </div>
        <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:"10px" }}>

          <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"11px 13px" }}>
            <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)}
              placeholder="Título do post"
              className="green-input"
              style={{ fontSize:"14px", fontWeight:600, border:"none", outline:"none", color:"#fff", backgroundColor:"transparent", width:"100%", padding:0, caretColor:"#fff", fontFamily:"'Inter', sans-serif" }} />
          </div>

          {/* Format selector */}

          <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"11px 13px" }}>
            <textarea value={caption} onChange={e=>setCaption(e.target.value)} rows={3}
              placeholder="Legenda do post..."
              className="green-input"
              style={{ fontSize:"13px", border:"none", outline:"none", color:"rgba(255,255,255,0.85)", backgroundColor:"transparent", width:"100%", padding:0, caretColor:"#fff", fontFamily:"'Inter', sans-serif", resize:"none", lineHeight:"1.55" }} />
          </div>

          {/* Properties — Notion style */}
          <div style={{ display:"flex", flexDirection:"column" }}>

            {/* Criar (format) */}
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Criar</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <button ref={formatAnchorRef} onClick={()=>setFormatOpen(v=>!v)}
                  style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:700, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:"rgba(255,255,255,0.18)", color:"#fff", display:"flex", alignItems:"center", gap:"5px" }}>
                  {igFormat.charAt(0).toUpperCase() + igFormat.slice(1)}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            </div>

            {/* Status */}
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Status</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <button ref={statusAnchorRef} onClick={()=>setStatusOpen(v=>!v)}
                  style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:700, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:(STATUS_MAP[status]||STATUS_MAP.ideia).color, color:"#fff", display:"flex", alignItems:"center", gap:"5px" }}>
                  {(STATUS_MAP[status]||STATUS_MAP.ideia).label}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            </div>

            {/* Data */}
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Data</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <button ref={dateAnchorRef} onClick={()=>setDatePickerOpen(v=>!v)}
                  style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:600, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.85)", display:"flex", alignItems:"center", gap:"5px" }}>
                  {date ? (() => { const [y,m,d]=date.split("-"); return `${d}/${m}/${y}`; })() : "Sem data"}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            </div>

            {/* Horário */}
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Horário</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <TimeInput value={pubTime} onChange={setPubTime} />
              </div>
            </div>

          </div>

          {/* Format dropdown */}
          <DropdownSheet anchorRef={formatAnchorRef} open={formatOpen} onClose={()=>setFormatOpen(false)} width={180}>
            <div style={{ padding:"6px 6px" }}>
              {[{key:"post",label:"Post"},{key:"stories",label:"Stories"},{key:"reels",label:"Reels"},{key:"live",label:"Live"}].map(({key,label}) => {
                const a = igFormat === key;
                return (
                  <button key={key} onClick={()=>{ setIgFormat(key); setFormatOpen(false); }}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px", padding:"9px 12px", borderRadius:"8px", border:"none", background: a?"rgba(255,255,255,0.1)":"transparent", cursor:"pointer", width:"100%", textAlign:"left", fontFamily:"'Inter', sans-serif", color:"rgba(255,255,255,0.85)", fontSize:"13px", fontWeight: a?700:400 }}>
                    {label}
                    {a && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                );
              })}
            </div>
          </DropdownSheet>

          {/* Status dropdown */}
          <DropdownSheet anchorRef={statusAnchorRef} open={statusOpen} onClose={()=>setStatusOpen(false)} width={200}>
            <div style={{ padding:"6px 6px" }}>
              {Object.entries(STATUS_MAP).map(([key, val]) => {
                const a = status === key;
                return (
                  <button key={key} onClick={()=>{ setStatus(key); setStatusOpen(false); }}
                    style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"8px", border:"none", background: a?"rgba(255,255,255,0.1)":"transparent", cursor:"pointer", width:"100%", textAlign:"left", fontFamily:"'Inter', sans-serif", color:"rgba(255,255,255,0.85)", fontSize:"13px", fontWeight: a?700:400 }}>
                    <span style={{ width:"8px", height:"8px", borderRadius:"50%", backgroundColor:val.color, flexShrink:0 }} />
                    {val.label}
                    {a && <svg style={{ marginLeft:"auto" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                );
              })}
            </div>
          </DropdownSheet>

          {/* Date picker dropdown */}
          <DropdownSheet anchorRef={dateAnchorRef} open={datePickerOpen} onClose={()=>setDatePickerOpen(false)} width={240}>
            <div style={{ padding:"12px 16px 16px" }}>
              <InlineDatePicker value={date} onChange={v=>{ setDate(v); setDatePickerOpen(false); }} />
            </div>
          </DropdownSheet>

        </div>
        <div style={{ padding:"0 16px 16px", display:"flex", gap:"8px" }}>
          {onDelete && (
            <button onClick={()=>{ onDelete(); onClose(); }}
              style={{ padding:"9px 13px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.15)", backgroundColor:"rgba(0,0,0,0.13)", color:"rgba(255,255,255,0.45)", cursor:"pointer", display:"flex", alignItems:"center" }}>
              <Trash2 size={13} strokeWidth={2} />
            </button>
          )}
          <button onClick={onClose}
            style={{ flex:1, padding:"9px 0", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.2)", backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
            Fechar
          </button>
          <button onClick={handleSave}
            style={{ flex:2, padding:"9px 0", borderRadius:"8px", border:"none", backgroundColor:saved?"rgba(5,150,105,0.6)":"rgba(255,255,255,0.22)", color:"#fff", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.2s" }}>
            {saved ? "✓ Salvo!" : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── MILESTONE EDITOR ─────────────────────────────────────────────────────────

function NoteQuickModal({ note, onSave, onClose, onDelete, onOpenFull }) {
  const STATUS_MAP = useStatusMap();
  const overlayRef = useRef(null);
  const titleRef   = useRef(null);
  const statusAnchorRef = useRef(null);
  const dateAnchorRef   = useRef(null);

  const [title,   setTitle]   = useState(note.title  || "");
  const [date,    setDate]    = useState(note.date    || todayISO());
  const [pubTime, setPubTime] = useState(note.pubTime || "09:00");
  const [status,  setStatus]  = useState(note.status  || "ideia");
  const [saved,   setSaved]   = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const statusKeys = Object.keys(STATUS_MAP).filter(k => note.size !== "small" || (k !== "aroll" && k !== "broll"));

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 80); }, []);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...note, title: title.trim(), date, pubTime, status });
    setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div ref={overlayRef} onClick={e=>e.target===overlayRef.current&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:3000, backgroundColor:"rgba(20,40,20,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.15s ease" }}>
      <div style={{ backgroundColor:SAGE, borderRadius:"16px", width:"100%", maxWidth:"360px", display:"flex", flexDirection:"column", boxShadow:"0 30px 70px rgba(0,0,0,0.4)", overflow:"visible", animation:"slideUp 0.2s ease", fontFamily:"'Inter', sans-serif" }}>

        <div style={{ padding:"16px 18px 13px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:"rgba(87,119,87,0.3)", backdropFilter:"blur(12px)", borderRadius:"16px 16px 0 0" }}>
          <div style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Roteiro</div>
          <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
            <button onClick={onOpenFull}
              style={{ border:"none", background:"rgba(255,255,255,0.1)", borderRadius:"6px", padding:"4px 10px", cursor:"pointer", color:"rgba(255,255,255,0.7)", fontSize:"11px", fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em" }}>
              Abrir editor
            </button>
            <button onClick={onClose} style={{ border:"none", background:"rgba(255,255,255,0.1)", borderRadius:"6px", width:"26px", height:"26px", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.6)" }}>×</button>
          </div>
        </div>
        <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:"10px" }}>

          <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"11px 13px" }}>
            <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && title.trim()) handleSave(); }}
              placeholder="Título do roteiro"
              className="green-input"
              style={{ fontSize:"14px", fontWeight:600, border:"none", outline:"none", color:"#fff", backgroundColor:"transparent", width:"100%", padding:0, caretColor:"#fff", fontFamily:"'Inter', sans-serif" }} />
          </div>

          {/* Properties */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Status</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <button ref={statusAnchorRef} onClick={()=>setStatusOpen(v=>!v)}
                  style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:700, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:(STATUS_MAP[status]||STATUS_MAP.ideia).color, color:"#fff", display:"flex", alignItems:"center", gap:"5px" }}>
                  {(STATUS_MAP[status]||STATUS_MAP.ideia).label}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Publicação</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <button ref={dateAnchorRef} onClick={()=>setDatePickerOpen(v=>!v)}
                  style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:600, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.85)", display:"flex", alignItems:"center", gap:"5px" }}>
                  {date ? (() => { const [y,m,d]=date.split("-"); return `${d}/${m}/${y}`; })() : "Sem data"}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Horário</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <TimeInput value={pubTime} onChange={setPubTime} />
              </div>
            </div>
          </div>

          <DropdownSheet anchorRef={statusAnchorRef} open={statusOpen} onClose={()=>setStatusOpen(false)} width={200}>
            <div style={{ padding:"6px 6px" }}>
              {statusKeys.map(key => { const val = STATUS_MAP[key]; const a = status===key; return (
                <button key={key} onClick={()=>{ setStatus(key); setStatusOpen(false); }}
                  style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"8px", border:"none", background:a?"rgba(255,255,255,0.1)":"transparent", cursor:"pointer", width:"100%", textAlign:"left", fontFamily:"'Inter', sans-serif", color:"rgba(255,255,255,0.85)", fontSize:"13px", fontWeight:a?700:400 }}>
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", backgroundColor:val.color, flexShrink:0 }} />
                  {val.label}
                  {a && <svg style={{ marginLeft:"auto" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
              ); })}
            </div>
          </DropdownSheet>
          <DropdownSheet anchorRef={dateAnchorRef} open={datePickerOpen} onClose={()=>setDatePickerOpen(false)} width={240}>
            <div style={{ padding:"12px 16px 16px" }}>
              <InlineDatePicker value={date} onChange={v=>{ setDate(v); setDatePickerOpen(false); }} />
            </div>
          </DropdownSheet>

        </div>
        <div style={{ padding:"0 16px 16px", display:"flex", gap:"8px" }}>
          <button onClick={()=>{ onDelete(); onClose(); }}
            style={{ padding:"9px 13px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.15)", backgroundColor:"rgba(0,0,0,0.13)", color:"rgba(255,255,255,0.45)", cursor:"pointer", display:"flex", alignItems:"center" }}>
            <Trash2 size={13} strokeWidth={2} />
          </button>
          <button onClick={onClose}
            style={{ flex:1, padding:"9px 0", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.2)", backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!title.trim()}
            style={{ flex:2, padding:"9px 0", borderRadius:"8px", border:"none", backgroundColor: saved?"rgba(5,150,105,0.6)":title.trim()?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.06)", color:title.trim()?"#fff":"rgba(255,255,255,0.25)", fontSize:"13px", fontWeight:700, cursor:title.trim()?"pointer":"default", fontFamily:"'Inter', sans-serif", transition:"all 0.2s" }}>
            {saved ? "✓ Salvo!" : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}

function MilestoneEditor({ milestone, date: initialDate, onSave, onClose, onDelete }) {
  const isNew = !milestone;
  const overlayRef = useRef(null);
  const titleRef = useRef(null);
  const [title, setTitle] = useState(milestone?.title || "");
  const [icon,  setIcon]  = useState(milestone?.icon  || "star");
  const [date,  setDate]  = useState(milestone?.date  || initialDate || todayISO());
  const [saved, setSaved] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 80); }, []);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title:title.trim(), icon, image:null, date, category:icon, value:"", description:"" });
    setSaved(true); setTimeout(()=>{ setSaved(false); onClose(); }, 800);
  };

  const ICONS = [
    {key:"star",   Icon:MI.star},  {key:"mail",   Icon:MI.mail},
    {key:"heart",  Icon:MI.heart}, {key:"users",  Icon:MI.users},
    {key:"trophy", Icon:MI.trophy},{key:"box",    Icon:MI.box},
  ];
  const dateAnchorRef = useRef(null);

  return (
    <div ref={overlayRef} onClick={e=>e.target===overlayRef.current&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:3000, backgroundColor:"rgba(20,40,20,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.15s ease" }}>
      <div style={{ backgroundColor:SAGE, borderRadius:"16px", width:"100%", maxWidth:"380px", maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 30px 70px rgba(0,0,0,0.4)", overflow:"hidden", animation:"slideUp 0.2s ease", fontFamily:"'Inter', sans-serif" }}>

        <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:"rgba(87,119,87,0.3)", backdropFilter:"blur(12px)", flexShrink:0 }}>
          <div style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Marco</div>
          <button onClick={onClose} style={{ border:"none", background:"rgba(255,255,255,0.1)", borderRadius:"6px", width:"26px", height:"26px", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.6)" }}>×</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:"12px" }}>

          <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px" }}>
            <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && title.trim()) handleSave(); }}
              placeholder="Ex: 10k seguidores no YouTube"
              className="green-input"
              style={{ fontSize:"14px", fontWeight:600, border:"none", outline:"none", color:"#fff", backgroundColor:"transparent", width:"100%", padding:0, caretColor:"#fff", fontFamily:"'Inter', sans-serif" }} />
          </div>

          {/* Properties */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Data</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <button ref={dateAnchorRef} onClick={()=>setDatePickerOpen(v=>!v)}
                  style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:600, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.85)", display:"flex", alignItems:"center", gap:"5px" }}>
                  {date ? (() => { const [y,m,d]=date.split("-"); return `${d}/${m}/${y}`; })() : "Sem data"}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            </div>
          </div>

          <DropdownSheet anchorRef={dateAnchorRef} open={datePickerOpen} onClose={()=>setDatePickerOpen(false)} width={240}>
            <div style={{ padding:"12px 16px 16px" }}>
              <InlineDatePicker value={date} onChange={v=>{ setDate(v); setDatePickerOpen(false); }} />
            </div>
          </DropdownSheet>

        </div>
        <div style={{ padding:"14px 18px 18px", display:"flex", gap:"8px", flexShrink:0 }}>
          {!isNew && (
            <button onClick={()=>{ onDelete(); onClose(); }}
              style={{ padding:"9px 14px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.15)", backgroundColor:"rgba(0,0,0,0.13)", color:"rgba(255,255,255,0.45)", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif", display:"flex", alignItems:"center", gap:"6px" }}>
              <Trash2 size={13} strokeWidth={2} />
            </button>
          )}
          <button onClick={onClose}
            style={{ flex:1, padding:"9px 0", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.2)", backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!title.trim()}
            style={{ flex:2, padding:"9px 0", borderRadius:"8px", border:"none", backgroundColor: saved ? "rgba(5,150,105,0.6)" : title.trim() ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)", color: title.trim() ? "#fff" : "rgba(255,255,255,0.25)", fontSize:"13px", fontWeight:700, cursor:title.trim()?"pointer":"default", fontFamily:"'Inter', sans-serif", transition:"all 0.2s" }}>
            {saved ? "✓ Salvo!" : isNew ? "Criar marco" : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── QUICK CREATE MODAL ──────────────────────────────────────────────────────


// ─── FEED CELL ────────────────────────────────────────────────────────────────
function QuickCreateModal({ initialDate, initialType, onClose, onAddNote, onUpdateNote, onAddMilestone, onUpdateMilestone, onAddReminder, statuses=DEFAULT_STATUSES, onUpdateStatuses }) {
  const T = useTheme();
  const overlayRef = useRef(null);
  const titleRef = useRef(null);

  const [type, setType]         = useState(initialType || "note");
  const [title, setTitle]       = useState("");
  const [date, setDate]         = useState(initialDate || todayISO());
  const [time, setTime]         = useState("09:00");
  const [caption, setCaption]   = useState("");
  const [hashtags, setHashtags] = useState("");
  const [step, setStep]         = useState("form");
  const [created, setCreated]   = useState(null);
  const [openEditor, setOpenEditor] = useState(null);

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 80); }, []);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const IG_PINK = "#e1306c";

  const TYPE_OPTIONS = [
    { key:"note",      label:"Roteiro",  Icon:FilePlus,  color:SAGE },
    { key:"post",      label:"Post",     Icon:Instagram, color:IG_PINK },
    { key:"milestone", label:"Marco",    Icon:Flag,      color:"#ca8a04" },
    { key:"reminder",  label:"Lembrete", Icon:Bell,      color:"#79A679" },
  ];

  const [managingStatuses, setManagingStatuses] = useState(false);
  const [editStatuses, setEditStatuses] = useState(statuses);
  const PALETTE = ["#94a3b8","#7c3aed","#ca8a04","#ea580c","#dc2626","#2563eb","#0891b2","#16a34a","#db2777","#059669","#d97706","#64748b","#9333ea","#ef4444","#f97316","#84cc16"];

  const addStatus = () => {
    const id = "s" + Date.now();
    setEditStatuses(p => [...p, { key:id, label:"Novo status", color:"#64748b" }]);
  };
  const updateStatus = (idx, patch) => setEditStatuses(p => p.map((s,i) => i===idx ? {...s,...patch} : s));
  const deleteStatus = (idx) => setEditStatuses(p => p.filter((_,i) => i!==idx));
  const saveStatuses = () => { onUpdateStatuses(editStatuses); setManagingStatuses(false); };

  const openStatusManager = () => { setEditStatuses(statuses); setManagingStatuses(true); };

  const canSubmit = title.trim() && date;

  const handleCreate = () => {
    if (!canSubmit) return;
    const id = type === "reminder" ? "r"+Date.now() : generateId();
    if (type === "note") {
      const note = { id, date, title:title.trim(), content:"", size:"large", status:"ideia" };
      onAddNote(note);
      setCreated(note);
    } else if (type === "post") {
      const tags = hashtags.split(/[\s,]+/).map(t=>t.replace(/^#+/,"").trim().toLowerCase()).filter(Boolean);
      const note = { id, date, title:title.trim(), platform:"instagram", size:"small", status:"agendado",
                     content:"", igCaption:caption.trim(), igHashtags:tags, pubTime:time };
      onAddNote(note);
      setCreated(note);
    } else if (type === "milestone") {
      const m = { id, date, title:title.trim(), category:"outro", value:"", description:"", image:null };
      onAddMilestone(m);
      setCreated(m);
    } else {
      const r = { id, date, title:title.trim(), time };
      onAddReminder(r);
      setCreated(r);
    }
    setStep("done");
  };

  const handleOpen = () => {
    if (!created) return;
    if (type === "note")      setOpenEditor({ type:"note",      item:created });
    if (type === "milestone") setOpenEditor({ type:"milestone", item:created });
    if (type === "reminder")  onClose();
  };

  const activeType = TYPE_OPTIONS.find(t => t.key === type);

  if (openEditor?.type === "note") {
    const handleSave = (fields, oldDate) => { onUpdateNote({...openEditor.item,...fields}, oldDate ?? openEditor.item.date); onClose(); };
    return <NoteEditor note={openEditor.item} date={openEditor.item.date} onSave={handleSave} onSaveSilent={handleSave} onClose={()=>setOpenEditor(null)} onCloseAll={onClose} onDelete={null} />;
  }
  if (openEditor?.type === "milestone") {
    const handleSave = fields => { onUpdateMilestone({...openEditor.item,...fields}); onClose(); };
    return <MilestoneEditor milestone={openEditor.item} date={openEditor.item.date} onSave={handleSave} onClose={()=>setOpenEditor(null)} onDelete={null} />;
  }

  return (
    <div ref={overlayRef} onClick={e=>e.target===overlayRef.current&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:2000, backgroundColor:"rgba(20,40,20,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.15s ease" }}>
      <div style={{ position:"relative", backgroundColor:SAGE, borderRadius:"16px", width:"100%", maxWidth:"380px", boxShadow:"0 30px 70px rgba(0,0,0,0.4)", animation:"slideUp 0.2s ease", overflow:"hidden", fontFamily:"'Inter', sans-serif" }}>

        {step === "form" ? (<>

          <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", backdropFilter:"blur(12px)", backgroundColor:"rgba(87,119,87,0.3)" }}>
            <span style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.5)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>Criar novo</span>
            <button onClick={onClose} style={{ border:"none", background:"rgba(255,255,255,0.1)", borderRadius:"6px", width:"26px", height:"26px", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.6)" }}>×</button>
          </div>

          <div style={{ padding:"16px 18px 20px", display:"flex", flexDirection:"column", gap:"12px" }}>

            <div style={{ display:"flex", gap:"4px", backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"4px" }}>
              {TYPE_OPTIONS.map(({ key, label, Icon }) => {
                const active = type === key;
                return (
                  <button key={key} onClick={()=>setType(key)}
                    style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"5px", padding:"9px 4px", borderRadius:"7px", border:"none", backgroundColor: active ? "rgba(255,255,255,0.18)" : "transparent", cursor:"pointer", transition:"all 0.12s" }}>
                    <Icon size={13} color={active ? "#fff" : "rgba(255,255,255,0.4)"} strokeWidth={2} />
                    <span style={{ fontSize:"8px", fontWeight:active?700:400, color:active ? "#fff" : "rgba(255,255,255,0.4)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>
                {type === "post" ? "Título / descrição curta" : "Título"}
              </div>
              <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter" && canSubmit && type !== "post") handleCreate(); }}
                placeholder={type==="note" ? "Título do roteiro..." : type==="post" ? "Ex: Anúncio de parceria..." : type==="milestone" ? "Nome do marco..." : "Título do lembrete..."}
                className="green-input"
                style={{ fontSize:"14px", fontFamily:"'Inter', sans-serif", fontWeight:600, border:"none", outline:"none", color:"#fff", backgroundColor:"transparent", boxSizing:"border-box", width:"100%", padding:0, caretColor:"#fff" }}
              />
            </div>
            {type === "post" && (<>
              <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px" }}>
                <div style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Legenda</div>
                <textarea value={caption} onChange={e=>setCaption(e.target.value)} rows={3}
                  placeholder="Texto da legenda do post..."
                  className="green-input"
                  style={{ width:"100%", resize:"none", border:"none", outline:"none", color:"rgba(255,255,255,0.85)", backgroundColor:"transparent", fontSize:"13px", fontFamily:"'Inter', sans-serif", padding:0, caretColor:"#fff", lineHeight:"1.5", boxSizing:"border-box" }} />
              </div>
              <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px" }}>
                <div style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Hashtags</div>
                <input value={hashtags} onChange={e=>setHashtags(e.target.value)}
                  placeholder="#hashtag1 #hashtag2..."
                  className="green-input"
                  style={{ width:"100%", border:"none", outline:"none", color:"rgba(255,255,255,0.85)", backgroundColor:"transparent", fontSize:"13px", fontFamily:"'DM Mono', monospace", padding:0, caretColor:"#fff", boxSizing:"border-box" }} />
              </div>
            </>)}

            <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Data</div>
              <DatePicker value={date} onChange={setDate} />
            </div>
            {(type === "reminder" || type === "post") && (
              <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"12px 14px" }}>
                <div style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Horário</div>
                <input type="time" value={time} onChange={e=>setTime(e.target.value)}
                  className="green-time"
                  style={{ fontSize:"13px", fontFamily:"'DM Mono', monospace", border:"none", outline:"none", color:"#fff", backgroundColor:"transparent", width:"100%", padding:0, caretColor:"#fff" }} />
              </div>
            )}

            <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
              <button onClick={onClose} style={{ flex:1, padding:"9px 0", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.2)", backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.12s" }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor="rgba(255,255,255,0.14)"}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor="rgba(255,255,255,0.08)"}>Cancelar</button>
              <button onClick={handleCreate} disabled={!canSubmit}
                style={{ flex:2, padding:"9px 0", borderRadius:"8px", border:"none", backgroundColor: canSubmit ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)", color: canSubmit ? "#fff" : "rgba(255,255,255,0.25)", fontSize:"13px", fontWeight:700, cursor:canSubmit?"pointer":"default", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" }}>
                Criar {activeType.label}
              </button>
            </div>
            {onUpdateStatuses && (
              <button onClick={openStatusManager}
                style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", fontSize:"10px", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textDecoration:"underline", textUnderlineOffset:"3px", padding:0, alignSelf:"center" }}
                onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
                Gerenciar status
              </button>
            )}
          </div>
        </>) : (<>

          <div style={{ padding:"32px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", textAlign:"center" }}>
            <div style={{ width:"48px", height:"48px", borderRadius:"50%", backgroundColor:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <activeType.Icon size={22} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize:"15px", fontWeight:700, color:"#fff", fontFamily:"'Inter', sans-serif", marginBottom:"6px" }}>{title}</div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em" }}>
                {activeType.label.toUpperCase()} · {formatDate(date)}{(type==="reminder"||type==="post")&&time ? ` · ${time}` : ""}
              </div>
            </div>
            <div style={{ display:"flex", gap:"8px", width:"100%", marginTop:"4px" }}>
              <button onClick={onClose} style={{ flex:1, padding:"9px 0", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.2)", backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>Fechar</button>
              {type === "note" && (
                <button onClick={handleOpen}
                  style={{ flex:2, padding:"9px 0", borderRadius:"8px", border:"none", backgroundColor:"rgba(255,255,255,0.22)", color:"#fff", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
                  Abrir {activeType.label}
                </button>
              )}
              {type === "milestone" && (
                <button onClick={handleOpen}
                  style={{ flex:2, padding:"9px 0", borderRadius:"8px", border:"none", backgroundColor:"rgba(255,255,255,0.22)", color:"#fff", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
                  Abrir {activeType.label}
                </button>
              )}
            </div>
          </div>
        </>)}

        {managingStatuses && (
          <div style={{ position:"absolute", inset:0, backgroundColor:SAGE, borderRadius:"16px", display:"flex", flexDirection:"column", zIndex:10, animation:"fadeIn 0.15s ease" }}>
            <div style={{ padding:"16px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:"rgba(87,119,87,0.3)", flexShrink:0 }}>
              <span style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.5)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>Gerenciar status</span>
              <button onClick={()=>setManagingStatuses(false)} style={{ border:"none", background:"rgba(255,255,255,0.1)", borderRadius:"6px", width:"26px", height:"26px", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.6)" }}>×</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"6px" }}>
              {editStatuses.map((s, idx) => (
                <div key={s.key} style={{ display:"flex", alignItems:"center", gap:"8px", backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"9px", padding:"8px 10px" }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div style={{ width:"20px", height:"20px", borderRadius:"50%", backgroundColor:s.color, border:"2px solid rgba(255,255,255,0.25)" }} />
                    <input type="color" value={s.color} onChange={e=>updateStatus(idx,{color:e.target.value})}
                      style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"20px", height:"20px", padding:0, border:"none" }} />
                  </div>
                  <input value={s.label} onChange={e=>updateStatus(idx,{label:e.target.value})}
                    style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:"13px", fontFamily:"'Inter', sans-serif", fontWeight:500, caretColor:"#fff" }} />
                  <button onClick={()=>deleteStatus(idx)}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", padding:"0 2px", flexShrink:0, display:"flex", alignItems:"center" }}
                    onMouseEnter={e=>e.currentTarget.style.color="rgba(239,68,68,0.8)"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              ))}
              <button onClick={addStatus}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"8px", borderRadius:"9px", border:"1px dashed rgba(255,255,255,0.2)", background:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:"12px", fontFamily:"'DM Mono', monospace", marginTop:"2px" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.4)"; e.currentTarget.style.color="rgba(255,255,255,0.7)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}>
                + Adicionar status
              </button>
            </div>
            <div style={{ padding:"12px 14px 16px", display:"flex", gap:"8px", flexShrink:0, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={()=>setManagingStatuses(false)}
                style={{ flex:1, padding:"9px 0", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.2)", backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
                Cancelar
              </button>
              <button onClick={saveStatuses}
                style={{ flex:2, padding:"9px 0", borderRadius:"8px", border:"none", backgroundColor:"rgba(255,255,255,0.22)", color:"#fff", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
                Salvar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const ICON_MAP_SMALL = {
  star: MI.star, mail: MI.mail, heart: MI.heart,
  users: MI.users, trophy: MI.trophy, box: MI.box,
};

function MilestoneIconSmall({ icon, category, dimmed }) {
  const key = icon || category || "star";
  const Icon = ICON_MAP_SMALL[key] || MI.star;
  const color = dimmed ? "rgba(255,255,255,0.3)" : "#ffffff";
  return <Icon size={9} color={color} />;
}

// ─── MILESTONE CHIP ───────────────────────────────────────────────────────────

function MilestoneChip({ milestone, isCurrentMonth, onDragStart, onQuickDelete, onContextMenu, onOpen }) {
  const dimmed = !isCurrentMonth;
  return (
    <>
    <div draggable onDragStart={e=>{e.stopPropagation();onDragStart&&onDragStart(e,milestone);}}
      onClick={e=>{ e.stopPropagation(); onOpen&&onOpen(milestone); }}
      onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContextMenu&&onContextMenu(e,milestone);}}
      style={{ display:"flex", alignItems:"center", gap:"4px", backgroundColor:dimmed?"rgba(255,255,255,0.06)":"#5F805E", border:dimmed?"1px solid rgba(255,255,255,0.08)":"none", borderRadius:"5px", padding:"2px 6px", marginBottom:"3px", overflow:"hidden", flexShrink:0, userSelect:"none", cursor:"grab" }}>
      <span style={{ fontSize:"10px", fontWeight:dimmed?400:700, color:dimmed?"rgba(255,255,255,0.3)":"#ffffff", fontFamily:"'Inter', sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{milestone.title}</span>
      {milestone.value && <span style={{ fontSize:"9px", fontWeight:700, color:dimmed?"rgba(255,255,255,0.25)":"#ffffff", fontFamily:"'DM Mono', monospace", flexShrink:0, opacity:0.8 }}>{formatNumber(milestone.value)}</span>}
    </div>
    </>
  );
}

// ─── CONTEXT MENU ─────────────────────────────────────────────────────────────

function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: y, left: x, opacity: 0 });
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const submenuRef = useRef(null);
  const [submenuPos, setSubmenuPos] = useState({ top:0, left:0, opacity:0 });
  const closeTimer = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, MARGIN = 8;
    const top  = y + height > vh - MARGIN ? Math.max(MARGIN, y - height) : y;
    const left = x + width  > vw - MARGIN ? Math.max(MARGIN, x - width)  : x;
    setPos({ top, left, opacity: 1 });
  }, [x, y]);

  useEffect(() => {
    const h = e => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        (!submenuRef.current || !submenuRef.current.contains(e.target))
      ) onClose();
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("scroll", onClose, true);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("scroll", onClose, true); };
  }, [onClose]);

  useEffect(() => {
    if (openSubmenu === null || !submenuRef.current || !ref.current) return;
    const parentRect = ref.current.getBoundingClientRect();
    const btns = ref.current.querySelectorAll("[data-menu-item]");
    const btnEl = btns[openSubmenu];
    if (!btnEl) return;
    const btnRect = btnEl.getBoundingClientRect();
    const sm = submenuRef.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, M = 8;
    let left = parentRect.right + 4;
    if (left + sm.width > vw - M) left = parentRect.left - sm.width - 4;
    let top = btnRect.top;
    if (top + sm.height > vh - M) top = vh - M - sm.height;
    setSubmenuPos({ top, left, opacity:1 });
  }, [openSubmenu]);

  const menuStyle = { position:"fixed", zIndex:99999, backgroundColor:SAGE, border:"1px solid rgba(255,255,255,0.12)", borderRadius:"12px", boxShadow:"0 12px 36px rgba(0,0,0,0.35)", padding:"5px", minWidth:"190px", fontFamily:"'Inter', sans-serif", transition:"opacity 0.05s" };
  const btnBase = (item) => ({ display:"flex", alignItems:"center", gap:"9px", width:"100%", padding:"7px 10px", border:"none", background:"transparent", textAlign:"left", fontSize:"12px", color:item.danger?"#fca5a5":"rgba(255,255,255,0.85)", cursor:"pointer", borderRadius:"7px", fontFamily:"'Inter', sans-serif", fontWeight:500 });

  // Count only non-divider items for index
  let btnIdx = -1;
  const realItems = items.filter(i => i !== "divider");

  return (
    <>
      <div ref={ref} style={{ ...menuStyle, top:pos.top, left:pos.left, opacity:pos.opacity }}>
        {items.map((item, i) => {
          if (item === "divider") return <div key={i} style={{ height:"1px", background:"rgba(255,255,255,0.1)", margin:"4px 0" }} />;
          btnIdx++;
          const myIdx = btnIdx;
          const isOpen = openSubmenu === myIdx;
          if (item.submenu) {
            return (
              <button key={i} data-menu-item
                style={{ ...btnBase(item), justifyContent:"space-between", backgroundColor: isOpen ? "rgba(255,255,255,0.1)" : "transparent" }}
                onMouseEnter={e => { clearTimeout(closeTimer.current); e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)"; setOpenSubmenu(myIdx); }}
                onMouseLeave={e => { closeTimer.current = setTimeout(() => setOpenSubmenu(null), 150); if (!isOpen) e.currentTarget.style.backgroundColor="transparent"; }}>
                <span style={{ display:"flex", alignItems:"center", gap:"9px" }}>
                  {item.icon && <item.icon size={13} strokeWidth={2} style={{ flexShrink:0, opacity:0.55 }} />}
                  {item.label}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            );
          }
          return (
            <button key={i} data-menu-item onClick={() => item.action.call(item)}
              style={btnBase(item)}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor=item.danger?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
              {item.icon && <item.icon size={13} strokeWidth={2} style={{ flexShrink:0, opacity:item.danger?0.9:0.55 }} />}
              {item.label}
            </button>
          );
        })}
      </div>
      {openSubmenu !== null && (() => {
        const sub = realItems[openSubmenu]?.submenu || [];
        return (
          <div ref={submenuRef} style={{ ...menuStyle, top:submenuPos.top, left:submenuPos.left, opacity:submenuPos.opacity, minWidth:"160px" }}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={() => { closeTimer.current = setTimeout(() => setOpenSubmenu(null), 150); }}>
            {sub.map((s, si) => (
              <button key={si} onClick={() => { s.action.call(s); setOpenSubmenu(null); }}
                style={{ ...btnBase(s) }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)"}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                {s.dot && <span style={{ width:8, height:8, borderRadius:"50%", backgroundColor:s.dot, flexShrink:0 }} />}
                {s.icon && <s.icon size={13} strokeWidth={2} style={{ flexShrink:0, opacity:0.55 }} />}
                {s.label}
              </button>
            ))}
          </div>
        );
      })()}
    </>
  );
}

// ─── NOTE CHIP ────────────────────────────────────────────────────────────────

function NoteChip({ note, onDragStart, isCurrentMonth, onQuickDelete, onQuickEditStatus, onQuickEditTitle, onContextMenu, onOpen, selected }) {
  const T = useTheme();
  const STATUS_MAP = useStatusMap();
  const isPost = note.platform === "instagram";
  const status = STATUS_MAP[note.status] || STATUS_MAP.ideia;
  const isLarge = note.size === "large";
  const dimmed = !isCurrentMonth;
  const IG_PINK = "#e1306c";
  const bg = selected ? "#3a5a3a" : dimmed ? "rgba(255,255,255,0.06)" : "#fdf9f4";

  // Determine if the event is in the past
  const isPast = note.date < todayISO();
  const labelOpacity = isPast ? 0.4 : 1;
  return (
    <>
      <div draggable onDragStart={e=>{e.stopPropagation();onDragStart(e,note);}} onDragEnd={()=>{}}
        onClick={e=>{ e.stopPropagation(); onOpen&&onOpen(note); }}
        onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContextMenu&&onContextMenu(e,note);}}
        data-note-id={note.id} data-note-date={note.date}
        style={{ backgroundColor: bg, border:`1px solid ${dimmed ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, borderRadius:"6px", padding:"5px 8px", marginBottom:"3px", overflow:"hidden", flexShrink:0, cursor:"grab", userSelect:"none", transition:"opacity 0.15s", outline: selected ? "1px solid rgba(122,184,122,0.4)" : "none" }}
        onMouseEnter={e=>{ if (!selected) e.currentTarget.style.opacity="0.75"; }}
        onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        <div style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
          <div style={{ fontSize:"11px", fontWeight: dimmed ? 400 : 600, color: selected ? "#ffffff" : dimmed ? "rgba(255,255,255,0.3)" : "#3a2e24", wordBreak:"break-word", overflowWrap:"anywhere", lineHeight:"1.35", fontFamily:"'Inter', sans-serif", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{note.title}</div>
          {!dimmed && (isLarge || isPost) && (
            <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
              <span style={{ fontSize:"8px", fontWeight:700, color:"#ffffff", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textTransform:"uppercase", backgroundColor: isPost ? "#e1306c" : "#FF0032", borderRadius:"3px", padding:"1px 4px", display:"inline-block", opacity: labelOpacity }}>{isPost ? "Post" : "Vídeo"}</span>
              {!isPost && <span style={{ fontSize:"8px", fontWeight:700, color: selected ? "#3a5a3a" : "#ffffff", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textTransform:"uppercase", backgroundColor: selected ? "rgba(255,255,255,0.25)" : status.color, borderRadius:"3px", padding:"1px 4px", display:"inline-block", opacity: labelOpacity }}>{status.label}</span>}
              {isPost && <span style={{ fontSize:"8px", fontWeight:700, color:"#ffffff", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textTransform:"uppercase", backgroundColor: status.color, borderRadius:"3px", padding:"1px 4px", display:"inline-block", opacity: labelOpacity }}>{status.label}</span>}
              {!isPast && note.pubTime && <span style={{ fontSize:"8px", color:"#b0a090", fontFamily:"'DM Mono', monospace", marginLeft:"auto" }}>{note.pubTime}</span>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── DAY CELL ─────────────────────────────────────────────────────────────────

// ─── REMINDER CHIP ────────────────────────────────────────────────────────────
const REMINDER_COLOR = "#AB988A";
const REMINDER_BG    = "rgba(171,152,138,0.13)";

function ReminderChipInline({ reminder, isCurrentMonth, onDelete }) {
  const dimmed = !isCurrentMonth;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"4px", backgroundColor: dimmed?"rgba(255,255,255,0.05)":"rgba(171,152,138,0.12)", border:`1px solid ${dimmed?"rgba(255,255,255,0.07)":"rgba(171,152,138,0.3)"}`, borderRadius:"6px", padding:"4px 7px", marginBottom:"3px", overflow:"hidden", flexShrink:0, userSelect:"none" }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={dimmed?"rgba(255,255,255,0.25)":REMINDER_COLOR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span style={{ fontSize:"9px", fontWeight:700, color: dimmed?"rgba(255,255,255,0.25)":REMINDER_COLOR, fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em", flexShrink:0 }}>{reminder.time}</span>
      <span style={{ fontSize:"10px", fontWeight:500, color: dimmed?"rgba(255,255,255,0.25)":"#3a2e24", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{reminder.title}</span>
      {!dimmed && <button onClick={e=>{e.stopPropagation();onDelete(reminder);}} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(0,0,0,0.2)",fontSize:"13px",lineHeight:1,padding:"0 0 0 2px",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.color="rgba(0,0,0,0.5)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(0,0,0,0.2)"}>×</button>}
    </div>
  );
}

// ─── MOBILE DAY MODAL ────────────────────────────────────────────────────────

function MobileDayModal({ date, notes, milestones, reminders, today, onClose, onOpenNote, onOpenMilestone, onOpenReminder, onCreateNew }) {
  const STATUS_MAP = useStatusMap();
  const overlayRef = useRef(null);
  const isToday = date === today;

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const [y, m, d] = date.split("-").map(Number);
  const dateLabel = new Date(y, m-1, d).toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" });
  const dateCapitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  const hasItems = notes.length > 0 || milestones.length > 0 || reminders.length > 0;

  const createBtnStyle = { flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", backgroundColor:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:"10px", padding:"9px 4px", color:"#fff", fontSize:"10px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif", letterSpacing:"0.02em" };

  return (
    <div ref={overlayRef} onClick={e=>e.target===overlayRef.current&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:2500, backgroundColor:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fadeIn 0.15s ease" }}>
      <div style={{ backgroundColor:SAGE, borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 -8px 40px rgba(0,0,0,0.4)", animation:"slideUp 0.2s ease" }}>

        {/* Handle bar */}
        <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px" }}>
          <div style={{ width:"36px", height:"4px", borderRadius:"2px", backgroundColor:"rgba(255,255,255,0.25)" }} />
        </div>

        {/* Header */}
        <div style={{ padding:"6px 18px 10px", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <div>
              <div style={{ fontSize:"14px", fontWeight:700, color:"#fff", fontFamily:"'Inter', sans-serif" }}>{dateCapitalized}</div>
              {isToday && <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.5)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textTransform:"uppercase", marginTop:"2px" }}>Hoje</div>}
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:"20px", lineHeight:1, padding:"4px" }}>×</button>
          </div>
          {/* Creation buttons */}
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={()=>{ onCreateNew("note"); onClose(); }} style={createBtnStyle}>
              <Youtube size={15} color="#ffffff" strokeWidth={2} />
              Roteiro
            </button>
            <button onClick={()=>{ onCreateNew("post"); onClose(); }} style={createBtnStyle}>
              <Instagram size={15} color="#ffffff" strokeWidth={2} />
              Post
            </button>
            <button onClick={()=>{ onCreateNew("reminder"); onClose(); }} style={createBtnStyle}>
              <Bell size={15} color="#ffffff" strokeWidth={2} />
              Lembrete
            </button>
            <button onClick={()=>{ onCreateNew("milestone"); onClose(); }} style={createBtnStyle}>
              <Flag size={15} color="#ffffff" strokeWidth={2} />
              Marco
            </button>
          </div>
        </div>

        {/* Items list */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 14px 24px" }}>
          {!hasItems && (
            <div style={{ textAlign:"center", padding:"32px 0", color:"rgba(255,255,255,0.35)", fontSize:"13px", fontFamily:"'Inter', sans-serif" }}>
              Nenhum item neste dia
            </div>
          )}

          {/* Notes */}
          {notes.map(n => {
            const st = STATUS_MAP[n.status] || STATUS_MAP.ideia;
            const isPost = n.platform === "instagram";
            return (
              <div key={n.id} onClick={()=>{ onOpenNote(n); onClose(); }}
                style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"12px", marginBottom:"8px", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor="rgba(0,0,0,0.22)"}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor="rgba(0,0,0,0.13)"}>
                <div style={{ width:"4px", height:"36px", borderRadius:"2px", backgroundColor: isPost ? "#e1306c" : n.size==="large" ? "#FF0032" : st.color, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"13px", fontWeight:600, color:"#fff", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.title}</div>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono', monospace", marginTop:"2px" }}>
                    {isPost ? "Post" : "Vídeo"}{n.pubTime ? ` · ${n.pubTime}` : ""}
                  </div>
                </div>
                <span style={{ fontSize:"9px", fontWeight:700, color:"#fff", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textTransform:"uppercase", backgroundColor: st.color, borderRadius:"4px", padding:"2px 6px", flexShrink:0 }}>{st.label}</span>
              </div>
            );
          })}

          {/* Milestones */}
          {milestones.map(m => (
            <div key={m.id} onClick={()=>{ onOpenMilestone(m); onClose(); }}
              style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"12px", marginBottom:"8px", cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor="rgba(0,0,0,0.22)"}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor="rgba(0,0,0,0.13)"}>
              <div style={{ width:"4px", height:"36px", borderRadius:"2px", backgroundColor:"#ca8a04", flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"13px", fontWeight:600, color:"#fff", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title}</div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono', monospace", marginTop:"2px" }}>Marco</div>
              </div>
              <MilestoneIcon category={m.category} size={16} color="rgba(255,255,255,0.5)" />
            </div>
          ))}

          {/* Reminders */}
          {[...reminders].sort((a,b)=>a.time.localeCompare(b.time)).map(r => (
            <div key={r.id} onClick={()=>{ onOpenReminder(r); onClose(); }}
              style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"12px", marginBottom:"8px", cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor="rgba(0,0,0,0.22)"}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor="rgba(0,0,0,0.13)"}>
              <div style={{ width:"4px", height:"36px", borderRadius:"2px", backgroundColor:"#AB988A", flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"13px", fontWeight:600, color:"#fff", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title}</div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Mono', monospace", marginTop:"2px" }}>Lembrete · {r.time}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function ReminderEditor({ reminder, onSave, onClose, onDelete }) {
  const overlayRef = useRef(null);
  const titleRef   = useRef(null);
  const [title,  setTitle]  = useState(reminder.title || "");
  const [notes,  setNotes]  = useState(reminder.notes || "");
  const [date,   setDate]   = useState(reminder.date  || todayISO());
  const [time,   setTime]   = useState(reminder.time  || "09:00");
  const [allDay, setAllDay] = useState(reminder.allDay || false);
  const [saved,  setSaved]  = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const dateAnchorRef = useRef(null);

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 80); }, []);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...reminder, title:title.trim(), notes, date, time, allDay });
    setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div ref={overlayRef} onClick={e=>e.target===overlayRef.current&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:3000, backgroundColor:"rgba(20,40,20,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.15s ease" }}>
      <div style={{ backgroundColor:SAGE, borderRadius:"16px", width:"100%", maxWidth:"340px", display:"flex", flexDirection:"column", boxShadow:"0 30px 70px rgba(0,0,0,0.4)", overflow:"visible", animation:"slideUp 0.2s ease", fontFamily:"'Inter', sans-serif" }}>

        <div style={{ padding:"16px 18px 13px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:"rgba(87,119,87,0.3)", backdropFilter:"blur(12px)", borderRadius:"16px 16px 0 0" }}>
          <div style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Editar lembrete</div>
          <button onClick={onClose} style={{ border:"none", background:"rgba(255,255,255,0.1)", borderRadius:"6px", width:"26px", height:"26px", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.6)" }}>×</button>
        </div>
        <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:"10px" }}>

          <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"11px 13px" }}>
            <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && title.trim()) handleSave(); }}
              placeholder="Título do lembrete"
              className="green-input"
              style={{ fontSize:"14px", fontWeight:600, border:"none", outline:"none", color:"#fff", backgroundColor:"transparent", width:"100%", padding:0, caretColor:"#fff", fontFamily:"'Inter', sans-serif" }} />
          </div>
          <div style={{ backgroundColor:"rgba(0,0,0,0.13)", borderRadius:"10px", padding:"11px 13px" }}>
            <input value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="Notas ou URL..."
              className="green-input"
              style={{ fontSize:"13px", fontWeight:400, border:"none", outline:"none", color:"rgba(255,255,255,0.85)", backgroundColor:"transparent", width:"100%", padding:0, caretColor:"#fff", fontFamily:"'Inter', sans-serif" }} />
          </div>

          {/* Properties */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Data</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                <button ref={dateAnchorRef} onClick={()=>setDatePickerOpen(v=>!v)}
                  style={{ padding:"2px 12px", borderRadius:"20px", border:"none", fontSize:"11px", fontWeight:600, fontFamily:"'DM Mono', monospace", cursor:"pointer", backgroundColor:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.85)", display:"flex", alignItems:"center", gap:"5px" }}>
                  {date ? (() => { const [y,m,d]=date.split("-"); return `${d}/${m}/${y}`; })() : "Sem data"}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", minHeight:"36px" }}>
              <span style={{ width:"100px", flexShrink:0, fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"'Inter', sans-serif" }}>Horário</span>
              <div style={{ flex:1, display:"flex", justifyContent:"flex-end", alignItems:"center", gap:"10px" }}>
                <button onClick={()=>setAllDay(v=>!v)}
                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:"11px", fontFamily:"'Inter', sans-serif", color: allDay?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.35)", padding:0 }}>
                  Dia inteiro
                </button>
                {!allDay && <TimeInput value={time} onChange={setTime} />}
              </div>
            </div>
          </div>

          <DropdownSheet anchorRef={dateAnchorRef} open={datePickerOpen} onClose={()=>setDatePickerOpen(false)} width={240}>
            <div style={{ padding:"12px 16px 16px" }}>
              <InlineDatePicker value={date} onChange={v=>{ setDate(v); setDatePickerOpen(false); }} />
            </div>
          </DropdownSheet>

        </div>
        <div style={{ padding:"0 16px 16px", display:"flex", gap:"8px" }}>
          <button onClick={()=>{ onDelete(reminder); onClose(); }}
            style={{ padding:"9px 13px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.15)", backgroundColor:"rgba(0,0,0,0.13)", color:"rgba(255,255,255,0.45)", cursor:"pointer", display:"flex", alignItems:"center" }}>
            <Trash2 size={13} strokeWidth={2} />
          </button>
          <button onClick={onClose}
            style={{ flex:1, padding:"9px 0", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.2)", backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!title.trim()}
            style={{ flex:2, padding:"9px 0", borderRadius:"8px", border:"none", backgroundColor: saved?"rgba(5,150,105,0.6)":title.trim()?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.06)", color:title.trim()?"#fff":"rgba(255,255,255,0.25)", fontSize:"13px", fontWeight:700, cursor:title.trim()?"pointer":"default", fontFamily:"'Inter', sans-serif", transition:"all 0.2s" }}>
            {saved ? "✓ Salvo!" : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}

function ReminderBadge({ reminder, isCurrentMonth, onDelete, onDragStart, onContextMenu, onOpen }) {
  const dimmed = !isCurrentMonth;
  return (
    <div draggable onDragStart={e=>{e.stopPropagation();onDragStart&&onDragStart(e,reminder);}}
      onClick={e=>{ e.stopPropagation(); onOpen&&onOpen(reminder); }}
      onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContextMenu&&onContextMenu(e,reminder);}}
      style={{ display:"inline-flex", flexDirection:"column", gap:"1px", backgroundColor: dimmed ? "rgba(255,255,255,0.06)" : "#FEF9F4", border: dimmed ? "1px solid rgba(255,255,255,0.08)" : "1px solid #79A679", borderRadius:"5px", padding:"3px 6px", marginBottom:"2px", userSelect:"none", flexShrink:0, cursor:"grab", overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"4px" }}>
        <span style={{ fontSize:"10px", fontWeight: dimmed?400:700, color: dimmed?"rgba(255,255,255,0.3)":"#79A679", fontFamily:"'Inter', sans-serif", whiteSpace:"normal", wordBreak:"break-word", lineHeight:"1.3", flex:1 }}>{reminder.title}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"3px" }}>
        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={dimmed?"rgba(255,255,255,0.2)":"rgba(121,166,121,0.7)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span style={{ fontSize:"8px", fontWeight:700, color: dimmed?"rgba(255,255,255,0.2)":"rgba(121,166,121,0.85)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em" }}>{reminder.time}</span>
      </div>
    </div>
  );
}

// Inline add form that appears inside the cell
function ReminderAddForm({ date, onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [time, setTime]   = useState("");
  const titleRef = useRef(null);
  useEffect(() => { setTimeout(()=>titleRef.current?.focus(), 50); }, []);

  const submit = e => {
    e.preventDefault(); e.stopPropagation();
    if (!title.trim() || !time) return;
    onAdd({ id:"r"+Date.now(), date, title:title.trim(), time });
    onClose();
  };

  return (
    <div onClick={e=>e.stopPropagation()}
      style={{ backgroundColor:"#1e2e1e", border:"1px solid rgba(171,152,138,0.4)", borderRadius:"8px", padding:"10px", marginTop:"4px", display:"flex", flexDirection:"column", gap:"8px" }}>
      <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Escape"){e.stopPropagation();onClose();} if(e.key==="Enter"){e.stopPropagation();submit(e);} }}
        placeholder="Título do lembrete"
        style={{ width:"100%", boxSizing:"border-box", fontSize:"11px", fontFamily:"'Inter', sans-serif", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"5px", background:"rgba(255,255,255,0.07)", color:"#fff", outline:"none", padding:"6px 8px" }} />
      <input type="time" value={time} onChange={e=>setTime(e.target.value)}
        onClick={e=>e.stopPropagation()}
        onKeyDown={e=>{ if(e.key==="Escape"){e.stopPropagation();onClose();} }}
        style={{ width:"100%", boxSizing:"border-box", fontSize:"11px", fontFamily:"'DM Mono', monospace", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"5px", background:"rgba(255,255,255,0.07)", color:REMINDER_COLOR, outline:"none", padding:"6px 8px" }} />
      <div style={{ display:"flex", gap:"6px" }}>
        <button onClick={submit} disabled={!title.trim()||!time}
          style={{ flex:1, fontSize:"11px", fontFamily:"'Inter', sans-serif", fontWeight:700, backgroundColor: (title.trim()&&time) ? REMINDER_COLOR : "rgba(171,152,138,0.3)", color:"#fff", border:"none", borderRadius:"5px", padding:"6px 0", cursor:(title.trim()&&time)?"pointer":"default", transition:"background 0.15s" }}>
          Salvar
        </button>
        <button onClick={e=>{e.stopPropagation();onClose();}}
          style={{ fontSize:"11px", fontFamily:"'Inter', sans-serif", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"5px", color:"rgba(255,255,255,0.5)", padding:"6px 10px", cursor:"pointer" }}>
          ×
        </button>
      </div>
    </div>
  );
}

function DayCell({ cellData, colIdx, isMobile, mobileGridView, notes, milestones, reminders, today, onOpen, onOpenWithAction, onOpenNote, onOpenMilestone, onOpenReminder, onDragStart, onDrop, onMilestoneDragStart, onMilestoneDrop, onReminderDragStart, onReminderDrop, onQuickDeleteNote, onQuickEditStatus, onQuickEditTitle, onQuickDeleteMilestone, onAddReminder, onDeleteReminder, selectedIds }) {
  const STATUS_MAP = useStatusMap();
  const T = useTheme();
  const { date, day, isCurrentMonth } = cellData;
  const isToday = date === today;
  const isWeekend = colIdx === 0 || colIdx === 6; // Sun or Sat
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const dragCounter = useRef(0);
  const handleNoteCtx = (e, note) => setCtxMenu({ x:e.clientX, y:e.clientY, type:"note", item:note });
  const handleMilestoneCtx = (e, m) => setCtxMenu({ x:e.clientX, y:e.clientY, type:"milestone", item:m });
  const handleReminderCtx = (e, r) => setCtxMenu({ x:e.clientX, y:e.clientY, type:"reminder", item:r });
  const handleDayCtx = e => { e.preventDefault(); setCtxMenu({ x:e.clientX, y:e.clientY, type:"day" }); };

  const handleDragEnter = e => { e.preventDefault(); dragCounter.current+=1; if(dragCounter.current===1) setIsDragOver(true); };
  const handleDragOver  = e => { e.preventDefault(); e.dataTransfer.dropEffect="move"; };
  const handleDragLeave = () => { dragCounter.current-=1; if(dragCounter.current===0) setIsDragOver(false); };
  const handleDrop = e => { e.preventDefault(); dragCounter.current=0; setIsDragOver(false); const dtype=e.dataTransfer.getData("dtype"); if(dtype==="milestone") onMilestoneDrop(date); else if(dtype==="reminder") onReminderDrop(date); else onDrop(date); };
  const handleDragEnd   = () => { dragCounter.current=0; setIsDragOver(false); };
  const sortedNotes = [...notes].sort((a,b) => a.size===b.size?0:a.size==="large"?-1:1);

  return (
    <>
    <div onClick={()=>onOpen(date)} onContextMenu={handleDayCtx} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onDragEnd={handleDragEnd}
      onMouseEnter={e=>{ setIsHovered(true); if(isDragOver) return; e.currentTarget.style.filter=isCurrentMonth?"brightness(1.08)":"brightness(0.92)"; }}
      onMouseLeave={e=>{ setIsHovered(false); if(isDragOver) return; e.currentTarget.style.filter=""; }}
      style={{ border:isDragOver?`2px solid ${BROLL_COLOR}`:isToday?`1px solid ${T.todayBorder}`:"none", borderRadius: isMobile ? "0" : "10px", padding: mobileGridView ? "4px 3px" : isMobile ? "5px 4px" : "8px", minHeight: mobileGridView ? "64px" : isMobile ? undefined : "80px", height: (isMobile && !mobileGridView) ? "100%" : undefined, backgroundColor:isDragOver?"#f0fdf4":isCurrentMonth?(isWeekend?"#6b8f6b":"#8BAB8A"):"#4a6b4a", cursor:"pointer", display:"flex", flexDirection:"column", transition:"filter 0.12s, border-color 0.12s", position:"relative", boxShadow:isDragOver?`0 0 0 3px ${BROLL_COLOR}33`:"none" }}>

      <div style={{ position:"absolute", top:"6px", right:"6px", pointerEvents:"none", opacity: isHovered && !isDragOver ? 0.85 : 0, transform: isHovered && !isDragOver ? "scale(1)" : "scale(0.6)", transition:"opacity 0.18s ease, transform 0.18s ease" }}>
        <div style={{ width:"18px", height:"18px", borderRadius:"50%", backgroundColor:isCurrentMonth?"#4A6B4A":"#8CAB8A", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.18)" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="5" y1="1" x2="5" y2="9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="5" x2="9" y2="5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
      </div>

      <div style={{ fontSize:"12px", fontWeight:isToday?700:500, color:isToday?T.todayText:T.text, backgroundColor:isToday?T.todayCircle:"transparent", borderRadius:"50%", width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom: isMobile ? "2px" : "5px", flexShrink:0, fontFamily:"'DM Mono', monospace" }}>{day}</div>
      {isMobile ? (
        mobileGridView ? (
          /* Grid mode: pills like the list view */
          <div style={{ display:"flex", flexDirection:"column", gap:"2px", marginTop:"2px", overflow:"hidden" }}>
            {sortedNotes.slice(0,2).map(n => {
              const st = STATUS_MAP[n.status] || STATUS_MAP.ideia;
              const isPost = n.platform === "instagram";
              const accent = isPost ? "#e1306c" : n.size === "large" ? "#FF0032" : st.color;
              return (
                <div key={n.id} style={{ display:"flex", alignItems:"center", gap:"3px", backgroundColor:"rgba(0,0,0,0.2)", borderRadius:"3px", padding:"2px 4px", overflow:"hidden" }}>
                  <div style={{ width:"2px", minHeight:"8px", borderRadius:"1px", backgroundColor:accent, flexShrink:0 }} />
                  <span style={{ fontSize:"9px", fontWeight:600, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, lineHeight:1.3 }}>{n.title || "—"}</span>
                </div>
              );
            })}
            {milestones.slice(0,1).map(m => (
              <div key={m.id} style={{ display:"flex", alignItems:"center", backgroundColor:"#5F805E", borderRadius:"3px", padding:"2px 4px", overflow:"hidden" }}>
                <span style={{ fontSize:"9px", fontWeight:600, color:"#ffffff", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, lineHeight:1.3 }}>{m.title}</span>
              </div>
            ))}
            {reminders.slice(0,1).map(r => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", backgroundColor:"#ffffff", borderRadius:"3px", padding:"2px 4px", overflow:"hidden" }}>
                <span style={{ fontSize:"9px", fontWeight:500, color:"#83B383", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, lineHeight:1.3 }}>{r.title}</span>
              </div>
            ))}
            {(sortedNotes.length + milestones.length + reminders.length) > 3 && (
              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono', monospace", paddingLeft:"4px", lineHeight:1.3 }}>+{sortedNotes.length + milestones.length + reminders.length - 3}</div>
            )}
          </div>
        ) : (
          /* List mode dots (legacy, not used in list view but kept as fallback) */
          <div style={{ display:"flex", flexWrap:"wrap", gap:"2px", marginTop:"1px" }}>
            {sortedNotes.map(n => {
              const st = STATUS_MAP[n.status] || STATUS_MAP.ideia;
              return <div key={n.id} style={{ width:"6px", height:"6px", borderRadius:"50%", backgroundColor: n.platform==="instagram" ? "#e1306c" : n.size==="large" ? "#FF0032" : st.color, flexShrink:0 }} />;
            })}
            {milestones.map(m => <div key={m.id} style={{ width:"6px", height:"6px", borderRadius:"50%", backgroundColor:"#ca8a04", flexShrink:0 }} />)}
            {reminders.map(r => <div key={r.id} style={{ width:"6px", height:"6px", borderRadius:"50%", backgroundColor:"#AB988A", flexShrink:0 }} />)}
          </div>
        )
      ) : (
        <>
          <div style={{ display:"flex", flexDirection:"column" }}>{sortedNotes.map(n => <NoteChip key={n.id} note={n} onDragStart={onDragStart} isCurrentMonth={isCurrentMonth} onQuickDelete={onQuickDeleteNote} onQuickEditStatus={onQuickEditStatus} onQuickEditTitle={onQuickEditTitle} onContextMenu={handleNoteCtx} onOpen={onOpenNote} selected={selectedIds&&selectedIds.has(n.id)} />)}</div>
          {milestones.length > 0 && (
            <div style={{ marginTop:sortedNotes.length > 0 ? "16px" : "0px", display:"flex", flexDirection:"column" }}>
              {milestones.map(m => <MilestoneChip key={m.id} milestone={m} isCurrentMonth={isCurrentMonth} onDragStart={onMilestoneDragStart} onQuickDelete={onQuickDeleteMilestone} onContextMenu={handleMilestoneCtx} onOpen={onOpenMilestone} />)}
            </div>
          )}
          {reminders.length > 0 && (
            <div style={{ marginTop:(sortedNotes.length > 0 || milestones.length > 0) ? "4px" : "0px", display:"flex", flexDirection:"column", gap:"2px" }}>
              {[...reminders].sort((a,b)=>a.time.localeCompare(b.time)).map(r => (
                <ReminderBadge key={r.id} reminder={r} isCurrentMonth={isCurrentMonth} onDelete={r=>onDeleteReminder(r)} onDragStart={onReminderDragStart} onContextMenu={handleReminderCtx} onOpen={onOpenReminder} />
              ))}
            </div>
          )}
        </>
      )}
      {isDragOver && (
        <div style={{ position:"absolute", inset:0, backgroundColor:"#f0fdf4dd", border:`2px dashed ${BROLL_COLOR}`, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", minHeight:"90px" }}>
          <span style={{ fontSize:"10px", color:BROLL_COLOR, fontFamily:"'DM Mono', monospace", fontWeight:700, letterSpacing:"0.04em" }}>Mover aqui</span>
        </div>
      )}
    </div>
    {ctxMenu && ctxMenu.type === "day" && (
      <ContextMenu x={ctxMenu.x} y={ctxMenu.y} onClose={()=>setCtxMenu(null)} items={[
        { icon:FilePlus,  label:"Novo roteiro",   action:()=>{ onOpenWithAction(date,"note");      setCtxMenu(null); } },
        { icon:Flag,      label:"Novo marco",     action:()=>{ onOpenWithAction(date,"milestone"); setCtxMenu(null); } },
        { icon:Bell,      label:"Novo lembrete",  action:()=>{ onOpenWithAction(date,"reminder");  setCtxMenu(null); } },
      ]} />
    )}
    {ctxMenu && ctxMenu.type === "note" && (
      <ContextMenu x={ctxMenu.x} y={ctxMenu.y} onClose={()=>setCtxMenu(null)} items={[
        { icon:Pencil, label:"Editar título", item:ctxMenu.item, action(){ onQuickEditTitle(this.item); setCtxMenu(null); } },
        { icon:BarChart2, label:"Alterar status", submenu:
            Object.entries(STATUS_MAP).map(([key,val]) => ({
              label: val.label, dot: val.color, item: ctxMenu.item,
              action(){ onQuickEditStatus(this.item, key); setCtxMenu(null); }
            }))
        },
        "divider",
        { icon:Trash2, label:"Apagar roteiro", item:ctxMenu.item, action(){ onQuickDeleteNote(this.item); setCtxMenu(null); }, danger:true },
      ]} />
    )}
    {ctxMenu && ctxMenu.type === "milestone" && (
      <ContextMenu x={ctxMenu.x} y={ctxMenu.y} onClose={()=>setCtxMenu(null)} items={[
        { icon:Trash2, label:"Apagar marco", item:ctxMenu.item, action(){ onQuickDeleteMilestone(this.item); setCtxMenu(null); }, danger:true },
      ]} />
    )}
    {ctxMenu && ctxMenu.type === "reminder" && (
      <ContextMenu x={ctxMenu.x} y={ctxMenu.y} onClose={()=>setCtxMenu(null)} items={[
        { icon:Trash2, label:"Apagar lembrete", item:ctxMenu.item, action(){ onDeleteReminder(this.item); setCtxMenu(null); }, danger:true },
      ]} />
    )}
    </>
  );
}

// ─── IDEAS PANEL ──────────────────────────────────────────────────────────────

const IDEA_CATEGORIES = {
  serie:      { label:"Série",       color:"#7c3aed", bg:"#f5f3ff" },
  tutorial:   { label:"Tutorial",    color:"#0369a1", bg:"#f0f9ff" },
  vlog:       { label:"Vlog",        color:"#15803d", bg:"#f0fdf4" },
  reacao:     { label:"Reação",      color:"#dc2626", bg:"#fff1f2" },
  review:     { label:"Review",      color:"#b45309", bg:"#fffbeb" },
  collab:     { label:"Collab",      color:"#be185d", bg:"#fdf2f8" },
  tendencia:  { label:"Tendência",   color:"#0f766e", bg:"#f0fdfa" },
  outro:      { label:"Outro",       color:"#64748b", bg:"#f8fafc" },
};


// ─── MOBILE CALENDAR LIST ─────────────────────────────────────────────────────

const PT_MONTHS_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const PT_WEEKDAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function buildMonthDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return { date: toISODate(year, month, d), day: d, dow: new Date(year, month, d).getDay() };
  });
}

function MobileYearPicker({ currentYear, currentMonth, onSelect, onClose }) {
  const isMobile = useIsMobile();
  const [selYear, setSelYear] = useState(currentYear);
  const yearScrollRef = useRef(null);
  const years = Array.from({ length: 9 }, (_, i) => currentYear - 4 + i);

  useEffect(() => {
    const el = yearScrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-year="${selYear}"]`);
    if (btn) btn.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"center" });
  }, [selYear]);

  function MiniCal({ year, month }) {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = todayISO();
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return (
      <div style={{ width:"100%" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:"2px" }}>
          {["D","S","T","Q","Q","S","S"].map((d,i) => (
            <div key={i} style={{ textAlign:"center", fontSize:"7px", color:"rgba(255,255,255,0.25)", fontFamily:"'DM Mono', monospace", fontWeight:700 }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"1px" }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const iso = toISODate(year, month, d);
            const isT = iso === todayStr;
            return (
              <div key={i} style={{ textAlign:"center", fontSize:"7px", fontFamily:"'DM Mono', monospace", color: isT ? "#fff" : "rgba(255,255,255,0.45)", fontWeight: isT ? 700 : 400, backgroundColor: isT ? "rgba(255,255,255,0.25)" : "transparent", borderRadius:"2px", lineHeight:"13px" }}>{d}</div>
            );
          })}
        </div>
      </div>
    );
  }

  const monthRows = [[0,1,2],[3,4,5],[6,7,8],[9,10,11]];

  const inner = (
    <>
      {/* Year row */}
      <div ref={yearScrollRef} style={{ display:"flex", gap:"6px", padding:"4px 20px 14px", overflowX:"auto", flexShrink:0, scrollbarWidth:"none" }}>
        {years.map(y => (
          <button key={y} data-year={y} onClick={()=>setSelYear(y)}
            style={{ flexShrink:0, padding:"6px 18px", borderRadius:"20px", border:`1px solid ${selYear===y?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.15)"}`, background: selYear===y?"rgba(255,255,255,0.2)":"transparent", color: selYear===y?"#fff":"rgba(255,255,255,0.45)", fontSize:"14px", fontWeight: selYear===y?700:400, cursor:"pointer", fontFamily:"'DM Mono', monospace", transition:"all 0.15s" }}>
            {y}
          </button>
        ))}
      </div>
      {/* Month grid */}
      <div style={{ overflowY:"auto", padding:"0 12px 8px" }}>
        {monthRows.map((row, ri) => (
          <div key={ri} style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"8px" }}>
            {row.map(mi => {
              const isCurrent = selYear === currentYear && mi === currentMonth;
              return (
                <button key={mi} onClick={()=>onSelect(selYear, mi)}
                  style={{ padding:"10px 6px 8px", borderRadius:"12px", border:`1px solid ${isCurrent?"rgba(255,255,255,0.45)":"rgba(255,255,255,0.1)"}`, background: isCurrent?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.04)", cursor:"pointer", display:"flex", flexDirection:"column", gap:"6px", alignItems:"center" }}>
                  <span style={{ fontSize:"11px", fontWeight: isCurrent?700:500, color: isCurrent?"#fff":"rgba(255,255,255,0.6)", fontFamily:"'Inter', sans-serif" }}>{PT_MONTHS_FULL[mi].slice(0,3)}</span>
                  <MiniCal year={selYear} month={mi} />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:3000, backgroundColor:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fadeIn 0.15s ease" }}>
        <div onClick={e=>e.stopPropagation()} style={{ backgroundColor:"#3a5a3a", borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"85vh", display:"flex", flexDirection:"column", paddingBottom:"env(safe-area-inset-bottom, 20px)", boxShadow:"0 -8px 40px rgba(0,0,0,0.5)", animation:"slideUp 0.2s ease" }}>
          <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px", flexShrink:0 }}>
            <div style={{ width:"36px", height:"4px", borderRadius:"2px", backgroundColor:"rgba(255,255,255,0.25)" }} />
          </div>
          <div style={{ padding:"4px 20px 10px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
            <span style={{ fontSize:"12px", fontWeight:700, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Ir para</span>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:"20px", cursor:"pointer", lineHeight:1, padding:"4px" }}>×</button>
          </div>
          {inner}
        </div>
      </div>
    );
  }

  // Desktop — centered modal, no close button
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:3000, backgroundColor:"rgba(20,40,20,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.15s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ backgroundColor:SAGE, borderRadius:"16px", width:"100%", maxWidth:"420px", maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 30px 70px rgba(0,0,0,0.4)", overflow:"hidden", animation:"slideUp 0.2s ease", fontFamily:"'Inter', sans-serif", paddingTop:"12px" }}>
        {inner}
      </div>
    </div>
  );
}

function MobileCalendarList({ year, month, today, notes, milestones, reminders, onDayOpen, statusMap, onNavigate, scrollToTodayRef }) {
  const scrollRef   = useRef(null);
  const todayRef    = useRef(null);
  const [showPicker, setShowPicker] = useState(false);

  const days = buildMonthDays(year, month);

  // Expose scroll-to-today to parent
  useEffect(() => {
    if (scrollToTodayRef) {
      scrollToTodayRef.current = () => {
        todayRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
      };
    }
  }, [scrollToTodayRef]);

  // Prev/next month labels for sentinels
  const prevM = month === 0  ? 11 : month - 1;
  const nextM = month === 11 ? 0  : month + 1;
  const prevY = month === 0  ? year - 1 : year;
  const nextY = month === 11 ? year + 1 : year;

  // Scroll to today on mount / month change
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      todayRef.current.scrollIntoView({ behavior:"auto", block:"start" });
    }
  }, [year, month]);

  const sentinelBtn = {
    display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
    width:"100%", padding:"14px 0",
    background:"none", border:"none", cursor:"pointer",
    color:"rgba(255,255,255,0.4)", fontSize:"12px", fontWeight:600,
    fontFamily:"'Inter', sans-serif", letterSpacing:"0.02em",
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, position:"relative" }}>
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>

        {/* Top sentinel — shows previous month */}
        <button style={sentinelBtn} onClick={()=>setShowPicker(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          {PT_MONTHS_FULL[prevM]}{prevY !== year ? ` ${prevY}` : ""}
        </button>

        {/* Day rows */}
        {days.map(({ date, day, dow }) => {
          const dayNotes     = (notes[date]     || []).slice().sort((a,b)=>a.size===b.size?0:a.size==="large"?-1:1);
          const dayMiles     = milestones[date] || [];
          const dayReminders = (reminders[date] || []).slice().sort((a,b)=>a.time.localeCompare(b.time));
          const isToday      = date === today;
          const isWeekend    = dow === 0 || dow === 6;
          const hasItems     = dayNotes.length > 0 || dayMiles.length > 0 || dayReminders.length > 0;

          return (
            <div key={date} ref={isToday ? todayRef : null}
              onClick={() => onDayOpen(date)}
              style={{ display:"flex", alignItems:"flex-start", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"10px 0", cursor:"pointer", minHeight:"44px", backgroundColor: isToday ? "#819981" : "transparent", transition:"background 0.1s" }}
              onMouseEnter={e=>{ if(!isToday) e.currentTarget.style.backgroundColor="rgba(255,255,255,0.04)"; }}
              onMouseLeave={e=>{ if(!isToday) e.currentTarget.style.backgroundColor="transparent"; }}>

              {/* Day column */}
              <div style={{ width:"54px", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"2px" }}>
                <div style={{ fontSize:"9px", fontWeight:700, color: isToday ? "rgba(255,255,255,0.75)" : isWeekend ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"3px" }}>
                  {PT_WEEKDAYS_SHORT[dow]}
                </div>
                <div style={{ width:"30px", height:"30px", borderRadius:"50%", backgroundColor: isToday ? "#ffffff" : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:"16px", fontWeight: isToday ? 700 : 400, color: isToday ? "#4A6B4A" : isWeekend ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.8)", fontFamily:"'DM Mono', monospace" }}>{day}</span>
                </div>
              </div>

              {/* Items column */}
              <div style={{ flex:1, paddingRight:"12px", display:"flex", flexDirection:"column", gap:"4px", paddingTop:"4px", minHeight:"30px" }}>
                {!hasItems && <div style={{ height:"30px" }} />}
                {dayNotes.map(n => {
                  const st = statusMap[n.status] || statusMap.ideia;
                  const isPost = n.platform === "instagram";
                  const accent = isPost ? "#e1306c" : n.size === "large" ? "#FF0032" : st.color;
                  return (
                    <div key={n.id} style={{ display:"flex", alignItems:"center", gap:"8px", backgroundColor:"rgba(0,0,0,0.18)", borderRadius:"6px", padding:"5px 8px" }}>
                      <div style={{ width:"3px", minHeight:"14px", borderRadius:"2px", backgroundColor:accent, flexShrink:0 }} />
                      <span style={{ fontSize:"12px", fontWeight:600, color:"rgba(255,255,255,0.9)", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{n.title || "Sem título"}</span>
                      <span style={{ fontSize:"8px", fontWeight:700, color:"#fff", fontFamily:"'DM Mono', monospace", letterSpacing:"0.05em", textTransform:"uppercase", backgroundColor:accent+"cc", borderRadius:"3px", padding:"1px 5px", flexShrink:0 }}>{isPost?"Post":st.label}</span>
                    </div>
                  );
                })}
                {dayMiles.map(m => (
                  <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"8px", backgroundColor:"#5F805E", borderRadius:"6px", padding:"5px 8px" }}>
                    <span style={{ fontSize:"12px", fontWeight:600, color:"#ffffff", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{m.title}</span>
                  </div>
                ))}
                {dayReminders.map(r => (
                  <div key={r.id} style={{ display:"flex", alignItems:"center", gap:"8px", backgroundColor:"#ffffff", borderRadius:"6px", padding:"5px 8px" }}>
                    <span style={{ fontSize:"12px", fontWeight:500, color:"#83B383", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{r.title}</span>
                    <span style={{ fontSize:"8px", color:"#83B383", fontFamily:"'DM Mono', monospace", flexShrink:0, opacity:0.7 }}>{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Bottom sentinel — shows next month */}
        <button style={sentinelBtn} onClick={()=>setShowPicker(true)}>
          {PT_MONTHS_FULL[nextM]}{nextY !== year ? ` ${nextY}` : ""}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

      </div>

      {showPicker && (
        <MobileYearPicker
          currentYear={year} currentMonth={month}
          onSelect={(y, m) => { onNavigate(y, m); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// ─── MOBILE GRID VIEW ─────────────────────────────────────────────────────────

function MobileGridView({ year, month, today, notes, milestones, reminders, onDayOpen, onNavigate, onOpenNote, onOpenMilestone, onOpenReminder, onQuickDeleteNote, onQuickEditStatus, onQuickEditTitle, onQuickDeleteMilestone, onAddReminder, onDeleteReminder, selectedIds }) {
  const STATUS_MAP = useStatusMap();
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const containerRef = useRef(null);

  // Build grid for current month only (no overflow rows)
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevM = month === 0 ? 11 : month - 1;
  const prevY = month === 0 ? year - 1 : year;
  const prevDays = new Date(prevY, prevM + 1, 0).getDate();
  const nextM = month === 11 ? 0 : month + 1;
  const nextY = month === 11 ? year + 1 : year;

  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevDays - i;
    cells.push({ date: toISODate(prevY, prevM, d), day: d, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toISODate(year, month, d), day: d, isCurrentMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const d = cells.length - firstDow - daysInMonth + 1;
    cells.push({ date: toISODate(nextY, nextM, d), day: d, isCurrentMonth: false });
  }

  const numRows = cells.length / 7;

  const handleTouchStart = e => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 60) {
      if (dx < 0) onNavigate(nextM === 0 ? nextY : year, nextM);
      else        onNavigate(prevM === 11 ? prevY : year, prevM);
    }
    touchStartX.current = null;
  };

  return (
    <div ref={containerRef} style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, padding:"4px 2px 4px", userSelect:"none" }}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* Weekday headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:"3px", flexShrink:0 }}>
        {["D","S","T","Q","Q","S","S"].map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontSize:"10px", fontWeight:700, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", padding:"2px 0" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid — fills remaining height */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"repeat(7,1fr)", gridTemplateRows:`repeat(${numRows},1fr)`, gap:"3px", minHeight:0 }}>
        {cells.map((cell, idx) => {
          const isToday = cell.date === today;
          const isCurrentMonth = cell.isCurrentMonth;
          const dayNotes     = (notes[cell.date]     || []).slice().sort((a,b)=>a.size===b.size?0:a.size==="large"?-1:1);
          const dayMiles     = milestones[cell.date] || [];
          const dayReminders = reminders[cell.date]  || [];
          const colIdx = idx % 7;
          const isWeekend = colIdx === 0 || colIdx === 6;

          return (
            <div key={idx} onClick={() => onDayOpen(cell.date)}
              style={{ backgroundColor: isCurrentMonth ? (isWeekend ? "#6b8f6b" : "#8BAB8A") : "#3d5c3d", borderRadius:"4px", display:"flex", flexDirection:"column", padding:"4px 3px", cursor:"pointer", overflow:"hidden", border: isToday ? "1.5px solid rgba(255,255,255,0.7)" : "none", minHeight:0 }}
              onTouchStart={e=>e.stopPropagation()}
              onTouchEnd={e=>{ e.stopPropagation(); onDayOpen(cell.date); }}>

              {/* Day number */}
              <div style={{ fontSize:"11px", fontWeight: isToday ? 700 : 400, color: isCurrentMonth ? (isToday ? "#fff" : "rgba(255,255,255,0.85)") : "rgba(255,255,255,0.3)", fontFamily:"'DM Mono', monospace", marginBottom:"3px", flexShrink:0, lineHeight:1 }}>{cell.day}</div>

              {/* Pills */}
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"2px", overflow:"hidden", minHeight:0 }}>
                {dayNotes.slice(0,2).map(n => {
                  const st = STATUS_MAP[n.status] || STATUS_MAP.ideia;
                  const isPost = n.platform === "instagram";
                  const accent = isPost ? "#e1306c" : n.size === "large" ? "#FF0032" : st.color;
                  return (
                    <div key={n.id} style={{ display:"flex", alignItems:"center", backgroundColor: isCurrentMonth ? accent+"99" : "rgba(255,255,255,0.08)", borderRadius:"3px", padding:"2px 4px", overflow:"hidden", flexShrink:0 }}>
                      <span style={{ fontSize:"8px", fontWeight:600, color: isCurrentMonth ? "#fff" : "rgba(255,255,255,0.3)", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.3 }}>{n.title || "—"}</span>
                    </div>
                  );
                })}
                {dayMiles.slice(0,1).map(m => (
                  <div key={m.id} style={{ display:"flex", alignItems:"center", backgroundColor: isCurrentMonth ? "#5F805E" : "rgba(255,255,255,0.08)", borderRadius:"3px", padding:"2px 4px", overflow:"hidden", flexShrink:0 }}>
                    <span style={{ fontSize:"8px", fontWeight:600, color: isCurrentMonth ? "#ffffff" : "rgba(255,255,255,0.3)", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.3 }}>{m.title}</span>
                  </div>
                ))}
                {dayReminders.slice(0,1).map(r => (
                  <div key={r.id} style={{ display:"flex", alignItems:"center", backgroundColor: isCurrentMonth ? "#ffffff" : "rgba(255,255,255,0.08)", borderRadius:"3px", padding:"2px 4px", overflow:"hidden", flexShrink:0 }}>
                    <span style={{ fontSize:"8px", fontWeight:500, color: isCurrentMonth ? "#83B383" : "rgba(255,255,255,0.3)", fontFamily:"'Inter', sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.3 }}>{r.title}</span>
                  </div>
                ))}
                {(dayNotes.length + dayMiles.length + dayReminders.length) > 3 && isCurrentMonth && (
                  <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", paddingLeft:"3px", lineHeight:1.2, flexShrink:0 }}>+{dayNotes.length + dayMiles.length + dayReminders.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function CalendarNotes() {
  const today = todayISO();
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [quickCreate, setQuickCreate] = useState(null);
  const [openEditor, setOpenEditor] = useState(null);
  const [openReminder, setOpenReminder] = useState(null);
  const handleOpenWithAction = useCallback((date, action) => { setQuickCreate({ date, type:action }); }, []);
  const T = THEMES.sage;

  const [state, dispatch] = useReducer(appReducer, null, loadState);
  // On mount: load from persistent storage and hydrate if found
  useEffect(() => {
    dispatch({type:"PURGE_TRASH"});
    // Supabase is the source of truth — always load from there first
    supaLoad().then(persisted => {
      if (persisted) {
        dispatch({type:"HYDRATE", state: persisted});
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)); } catch(e) {}
      } else {
        // Fallback to localStorage if Supabase is unreachable
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.notes && parsed?.milestones) dispatch({type:"HYDRATE", state: { reminders:{}, ...parsed, statuses: mergeStatuses(parsed.statuses) }});
          }
        } catch(e) {}
      }
    });
    // Re-sync when user returns to the tab — but not right after an import
    const onFocus = () => {
      if (importLock.current) return;
      supaLoad().then(persisted => {
        if (persisted) dispatch({type:"HYDRATE", state: persisted});
      });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const importLock = useRef(false);

  // Debounced save — waits 1.5s after last change before syncing to Supabase
  const saveTimer = useRef(null);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveState(state);
      setSavedIndicator(true);
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [state]);
  const dragRef = useRef(null);
  const grid    = buildCalendarGrid(year, month);

  const [mobileDayModal, setMobileDayModal] = useState(null); // { date }
  const [mobileView, setMobileView] = useState("list"); // "list" | "grid"
  const [showNavPicker, setShowNavPicker] = useState(false);
  const prevMonth = () => { if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
  const scrollToTodayFn = useRef(null);
  const goToday = () => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setTimeout(() => scrollToTodayFn.current?.(), 80);
  };

  const handleUpdateSettings  = useCallback(settings => dispatch({ type:"UPDATE_SETTINGS", settings }), []);
  const handleUpdateStatuses  = useCallback(statuses => dispatch({ type:"UPDATE_STATUSES", statuses }), []);
  const handleAddNote         = useCallback(note => dispatch({ type:"ADD_NOTE", note }), []);
  const handleSoftDeleteNote  = useCallback((id,date) => dispatch({ type:"SOFT_DELETE_NOTE", id, date }), []);
  const handleUpdateNote      = useCallback((note,oldDate) => dispatch({ type:"UPDATE_NOTE", note, oldDate }), []);
  const handleRestoreNote     = useCallback(id => dispatch({ type:"RESTORE_NOTE", id }), []);
  const handleAddMilestone    = useCallback(m => dispatch({ type:"ADD_MILESTONE", milestone:m }), []);
  const handleUpdateMilestone = useCallback(m => dispatch({ type:"UPDATE_MILESTONE", milestone:m }), []);
  const handleDeleteMilestone = useCallback((id,date) => dispatch({ type:"DELETE_MILESTONE", id, date }), []);
  const handleDragStart = useCallback((e,note) => { dragRef.current={noteId:note.id,fromDate:note.date}; e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain",note.id); e.dataTransfer.setData("dtype","note"); }, []);
  const handleDrop      = useCallback(toDate => { if(!dragRef.current) return; const{noteId,fromDate}=dragRef.current; dragRef.current=null; if(fromDate!==toDate) dispatch({type:"MOVE_NOTE",noteId,fromDate,toDate}); }, []);
  const milestoneDragRef = useRef(null);
  const handleMilestoneDragStart = useCallback((e,m) => { milestoneDragRef.current={milestoneId:m.id,fromDate:m.date}; e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("dtype","milestone"); }, []);
  const handleMilestoneDrop = useCallback(toDate => { if(!milestoneDragRef.current) return; const{milestoneId,fromDate}=milestoneDragRef.current; milestoneDragRef.current=null; if(fromDate!==toDate) dispatch({type:"MOVE_MILESTONE",milestoneId,fromDate,toDate}); }, []);
  const handleQuickEditStatus = useCallback((note,newStatus) => dispatch({ type:"UPDATE_NOTE", note:{...note,status:newStatus}, oldDate:note.date }), []);
  const handleQuickEditTitle  = useCallback((note,newTitle) => dispatch({ type:"UPDATE_NOTE", note:{...note,title:newTitle}, oldDate:note.date }), []);
  const handleQuickDeleteMilestone = useCallback(m => dispatch({ type:"DELETE_MILESTONE", id:m.id, date:m.date }), []);
  const handleAddReminder    = useCallback(r => dispatch({ type:"ADD_REMINDER", reminder:r }), []);
  const handleDeleteReminder = useCallback(r => dispatch({ type:"DELETE_REMINDER", id:r.id, date:r.date }), []);
  const reminderDragRef = useRef(null);
  const handleReminderDragStart = useCallback((e,r) => { reminderDragRef.current={reminderId:r.id,fromDate:r.date}; e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("dtype","reminder"); }, []);
  const handleReminderDrop = useCallback(toDate => { if(!reminderDragRef.current) return; const{reminderId,fromDate}=reminderDragRef.current; reminderDragRef.current=null; if(fromDate!==toDate) dispatch({type:"MOVE_REMINDER",reminderId,fromDate,toDate}); }, []);

  const [showTrash, setShowTrash] = useState(false);
  const [showMenu, setShowMenu]   = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  useEffect(() => { if(savedIndicator) { const t = setTimeout(()=>setSavedIndicator(false), 1800); return ()=>clearTimeout(t); } }, [savedIndicator]);
  const [quickEditNote, setQuickEditNote] = useState(null);
  const [quickEditNewTitle, setQuickEditNewTitle] = useState("");

  // ── Lasso selection ──────────────────────────────────────────────────────────
  const gridRef        = useRef(null);
  const lassoStart     = useRef(null);
  const [lasso, setLasso]           = useState(null);   // { x,y,w,h } in px relative to grid
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [showMoveDate, setShowMoveDate] = useState(false);
  const [moveTargetDate, setMoveTargetDate] = useState("");

  const handleGridMouseDown = useCallback(e => {
    // Only trigger on the grid background, not on chips or buttons
    if (e.button !== 0) return;
    if (e.target.closest("[data-note-id]") || e.target.closest("button")) return;
    const rect = gridRef.current.getBoundingClientRect();
    lassoStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setLasso(null);
    setSelectedIds(new Set());
    setShowMoveDate(false);
  }, []);

  const handleGridMouseMove = useCallback(e => {
    if (!lassoStart.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const x = Math.min(lassoStart.current.x, cx);
    const y = Math.min(lassoStart.current.y, cy);
    const w = Math.abs(cx - lassoStart.current.x);
    const h = Math.abs(cy - lassoStart.current.y);
    if (w > 4 || h > 4) setLasso({ x, y, w, h });
  }, []);

  const handleGridMouseUp = useCallback(e => {
    if (!lassoStart.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const lassoRect = lasso ? {
      left: rect.left + lasso.x, top: rect.top + lasso.y,
      right: rect.left + lasso.x + lasso.w, bottom: rect.top + lasso.y + lasso.h
    } : null;
    if (lassoRect && (lasso.w > 4 || lasso.h > 4)) {
      const chips = gridRef.current.querySelectorAll("[data-note-id]");
      const hits = new Set();
      chips.forEach(chip => {
        const cr = chip.getBoundingClientRect();
        const overlaps = cr.left < lassoRect.right && cr.right > lassoRect.left &&
                         cr.top  < lassoRect.bottom && cr.bottom > lassoRect.top;
        if (overlaps) hits.add(chip.dataset.noteId);
      });
      setSelectedIds(hits);
    }
    lassoStart.current = null;
    setLasso(null);
  }, [lasso]);

  // Collect all selected notes (across all dates) for the action bar
  const selectedNotes = useMemo(() => {
    if (!selectedIds.size) return [];
    const all = [];
    Object.values(state.notes).forEach(arr => arr.forEach(n => { if (selectedIds.has(n.id)) all.push(n); }));
    return all;
  }, [selectedIds, state.notes]);

  const handleLassoDelete = useCallback(() => {
    selectedNotes.forEach(n => dispatch({ type:"SOFT_DELETE_NOTE", id:n.id, date:n.date }));
    setSelectedIds(new Set());
  }, [selectedNotes]);

  const handleLassoDuplicate = useCallback(() => {
    selectedNotes.forEach(n => dispatch({ type:"ADD_NOTE", note:{ ...n, id:generateId() } }));
    setSelectedIds(new Set());
  }, [selectedNotes]);

  const handleLassoMove = useCallback(() => {
    if (!moveTargetDate) return;
    selectedNotes.forEach(n => dispatch({ type:"MOVE_NOTE", noteId:n.id, fromDate:n.date, toDate:moveTargetDate }));
    setSelectedIds(new Set());
    setShowMoveDate(false);
    setMoveTargetDate("");
  }, [selectedNotes, moveTargetDate]);

  const navBtn = { height:"36px", borderRadius:"8px", border:`1px solid ${T.border}`, backgroundColor:T.panelBg, color:T.textMuted, fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.12s" };

  const statusMap = useMemo(() => statusesToMap(state.statuses || DEFAULT_STATUSES), [state.statuses]);
  const STATUS_MAP = statusMap;
  const isMobile = useIsMobile();
  return (
    <StatusMapContext.Provider value={statusMap}>
    <ThemeCtx.Provider value={T}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.appBg}; min-height: 100vh; transition: background 0.3s; -webkit-tap-highlight-color: transparent; overscroll-behavior: none; }
        @media (max-width: 767px) {
          .mobile-title-input { font-size: 16px !important; }
        }
        @keyframes fadeIn       { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp      { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes editorEnter  { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes plusPop      { from { opacity: 0; transform: scale(0.6) } to { opacity: 0.85; transform: scale(1) } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes menuSlideIn  { from { transform: translateX(-24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s; }
        .sidebar-scroll:hover { scrollbar-color: #4B654B transparent; }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; transition: background 0.3s; }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb { background: #4B654B; }
        @keyframes sidebarEnter { from { transform: translateX(-100%) } to { transform: translateX(0) } }
        @keyframes slideDown { from { max-height: 0; opacity: 0 } to { max-height: 600px; opacity: 1 } }
        .sidebar-section-body { overflow: hidden; transition: max-height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease; }
        .calendar-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s; }
        .calendar-scroll:hover { scrollbar-color: #4B654B transparent; }
        .calendar-scroll::-webkit-scrollbar { width: 4px; }
        .calendar-scroll::-webkit-scrollbar-track { background: transparent; }
        .calendar-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; transition: background 0.3s; }
        .calendar-scroll:hover::-webkit-scrollbar-thumb { background: #4B654B; }
        body.editor-open { overflow: hidden; }
        ::-webkit-scrollbar { width: 0px; }
        button { transition: filter 0.12s ease, opacity 0.12s ease; }
        button:hover:not(:disabled) { filter: brightness(0.82); }
        button:active:not(:disabled) { filter: brightness(0.70); }
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #cbd5e1; pointer-events: none; }
        .meta-title-input::placeholder { color: rgba(255,255,255,0.5); }
        .title-field-wrap:hover .star-btn { opacity: 0.6 !important; }
        .title-field-wrap:hover .star-btn:hover { opacity: 1 !important; }
        .ins-pill:hover .ins-delete { opacity: 1 !important; }
        .broll-item:hover .broll-del { opacity: 1 !important; }
        [data-feed-cell]:hover .feed-overlay { opacity: 1 !important; background: rgba(0,0,0,0.38) !important; }
        [contenteditable], [contenteditable] * { font-family: 'Inter', sans-serif !important; }
        [contenteditable] p { margin-bottom: 0.7em; }
        [contenteditable] p:last-child { margin-bottom: 0; }
        [contenteditable]:focus { outline: none; }
        textarea { font-family: 'Inter', sans-serif; }
        .green-input::placeholder { color: rgba(255,255,255,0.35); }
        input[type="time"].green-time::-webkit-calendar-picker-indicator { display: none; }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>

      <div className="calendar-scroll" style={{ maxWidth:"1100px", margin:"0 auto", padding: isMobile ? "0" : "32px 24px", fontFamily:"'Inter', sans-serif", overflowY:"hidden", height:"100vh", boxSizing:"border-box", display:"flex", flexDirection:"column", minHeight:0 }}>

        {isMobile ? (
          /* ── Mobile topbar — identical to editor ── */
          <div style={{ position:"sticky", top:0, zIndex:100, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", backgroundColor:"rgba(73,103,73,0.92)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={()=>setShowMenu(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.7)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <button onClick={()=>setShowNavPicker(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:"8px" }}>
              <span style={{ fontSize:"15px", fontWeight:700, color:"#fff", fontFamily:"'Inter', sans-serif", letterSpacing:"-0.01em" }}>
                {(() => { const d=new Date(); return `${d.getDate()} de ${PT_MONTHS_FULL[d.getMonth()].toLowerCase()} de ${d.getFullYear()}`; })()}
              </span>
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              {/* View toggle */}
              <button onClick={()=>setMobileView(v => v==="list" ? "grid" : "list")}
                style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:"8px", cursor:"pointer", padding:"5px 8px", color:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center" }}>
                {mobileView === "list" ? (
                  /* Grid icon */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                ) : (
                  /* List icon */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ── Desktop header ── */
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>
            <div style={{ display:"flex", gap:"4px", alignItems:"center" }}>
              <button onClick={()=>setShowMenu(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.7)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <button onClick={prevMonth} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.7)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={nextMonth} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.7)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              {savedIndicator && <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.55)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", animation:"fadeIn 0.2s", marginLeft:"4px" }}>✓ salvo</span>}
            </div>
            <button onClick={()=>setShowNavPicker(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, textAlign:"right" }}>
              <div style={{ fontSize:"28px", fontWeight:700, color:"#ffffff", letterSpacing:"-0.01em", fontFamily:"'Inter', sans-serif" }}>
                {(() => { const d=new Date(); return `${d.getDate()} de ${PT_MONTHS_FULL[d.getMonth()].toLowerCase()} de ${d.getFullYear()}`; })()}
              </div>
            </button>
          </div>
        )}
        {isMobile ? (
          mobileView === "list" ? (
            <MobileCalendarList
              year={year} month={month} today={today}
              notes={state.notes} milestones={state.milestones} reminders={state.reminders}
              statusMap={statusMap}
              onDayOpen={date => setMobileDayModal({ date })}
              onNavigate={(y, m) => { setYear(y); setMonth(m); }}
              scrollToTodayRef={scrollToTodayFn}
            />
          ) : (
            /* Mobile grid view — full height, swipeable, current month only */
            <MobileGridView
              year={year} month={month} today={today}
              notes={state.notes} milestones={state.milestones} reminders={state.reminders}
              onDayOpen={date => setMobileDayModal({date})}
              onOpenWithAction={handleOpenWithAction}
              onOpenNote={note => { if(note.platform==="instagram") setOpenEditor({type:"post",item:note}); else setOpenEditor({type:"note-full",item:note}); }}
              onOpenMilestone={m=>setOpenEditor({type:"milestone",item:m})}
              onOpenReminder={r=>setOpenReminder(r)}
              onQuickDeleteNote={(n)=>handleSoftDeleteNote(n.id,n.date)}
              onQuickEditStatus={handleQuickEditStatus}
              onQuickEditTitle={n=>{setQuickEditNote(n);setQuickEditNewTitle(n.title);}}
              onQuickDeleteMilestone={handleQuickDeleteMilestone}
              onAddReminder={handleAddReminder}
              onDeleteReminder={handleDeleteReminder}
              selectedIds={selectedIds}
              onNavigate={(y,m)=>{setYear(y);setMonth(m);}}
            />
          )
        ) : (
        <div ref={gridRef} style={{ position:"relative", userSelect: lassoStart.current ? "none" : "auto", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}
          onMouseDown={handleGridMouseDown}
          onMouseMove={handleGridMouseMove}
          onMouseUp={handleGridMouseUp}
          onMouseLeave={handleGridMouseUp}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7, minmax(0,1fr))", gap:"12px", flex:1, minHeight:0, gridTemplateRows:`auto repeat(${grid.length / 7}, auto)` }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{ textAlign:"center", fontSize:"11px", fontWeight:700, color:T.textFaint, fontFamily:"'DM Mono', monospace", letterSpacing:"0.05em", textTransform:"uppercase", padding:"4px 0" }}>{d}</div>
          ))}
          {grid.map((cell, idx) => (
            <DayCell key={idx} colIdx={idx % 7} cellData={cell} isMobile={false} notes={state.notes[cell.date]||[]} milestones={state.milestones[cell.date]||[]} reminders={state.reminders[cell.date]||[]} today={today}
              onOpen={date => setQuickCreate({date,type:"note"})} onOpenWithAction={handleOpenWithAction} onOpenNote={note => {
                    if (note.platform === "instagram") {
                      setOpenEditor({ type:"post", item:note });
                    } else {
                      setOpenEditor({ type:"note", item:note });
                    }
                  }} onOpenMilestone={m=>setOpenEditor({type:"milestone",item:m})} onOpenReminder={r=>setOpenReminder(r)} onDragStart={handleDragStart} onDrop={handleDrop} onMilestoneDragStart={handleMilestoneDragStart} onMilestoneDrop={handleMilestoneDrop} onReminderDragStart={handleReminderDragStart} onReminderDrop={handleReminderDrop} onQuickDeleteNote={(n)=>handleSoftDeleteNote(n.id,n.date)} onQuickEditStatus={handleQuickEditStatus} onQuickEditTitle={n=>{setQuickEditNote(n);setQuickEditNewTitle(n.title);}} onQuickDeleteMilestone={handleQuickDeleteMilestone} onAddReminder={handleAddReminder} onDeleteReminder={handleDeleteReminder} selectedIds={selectedIds} />
          ))}
          </div>
          {lasso && lasso.w > 4 && lasso.h > 4 && (
            <div style={{ position:"absolute", left:lasso.x, top:lasso.y, width:lasso.w, height:lasso.h, border:"1.5px solid rgba(122,184,122,0.8)", backgroundColor:"rgba(87,119,87,0.12)", borderRadius:"4px", pointerEvents:"none", zIndex:100 }} />
          )}

          {selectedIds.size > 0 && (
            <div style={{ position:"fixed", bottom:"32px", left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center", gap:"8px", backgroundColor:"#1e2e1e", border:"1px solid rgba(122,184,122,0.35)", borderRadius:"12px", padding:"10px 16px", zIndex:999, boxShadow:"0 8px 32px rgba(0,0,0,0.5)", animation:"slideUp 0.18s ease" }}>
              <span style={{ fontSize:"11px", fontWeight:700, color:"rgba(122,184,122,0.9)", fontFamily:"'DM Mono', monospace", marginRight:"4px" }}>{selectedIds.size} roteiro{selectedIds.size!==1?"s":""}</span>
              <div style={{ width:"1px", height:"20px", backgroundColor:"rgba(255,255,255,0.1)" }} />
              <button onClick={handleLassoDuplicate} style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"7px", padding:"5px 12px", color:"rgba(255,255,255,0.75)", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>Duplicar</button>
              <div style={{ position:"relative" }}>
                <button onClick={()=>setShowMoveDate(v=>!v)} style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"7px", padding:"5px 12px", color:"rgba(255,255,255,0.75)", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>Mover</button>
                {showMoveDate && (
                  <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", backgroundColor:"#1e2e1e", border:"1px solid rgba(122,184,122,0.35)", borderRadius:"10px", padding:"12px", display:"flex", flexDirection:"column", gap:"8px", boxShadow:"0 8px 24px rgba(0,0,0,0.5)", zIndex:1000, whiteSpace:"nowrap", minWidth:"220px" }}>
                    <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em" }}>MOVER PARA</span>
                    <InlineDatePicker value={moveTargetDate} onChange={setMoveTargetDate} />
                    <button onClick={handleLassoMove} disabled={!moveTargetDate}
                      style={{ background: moveTargetDate ? "rgba(87,119,87,0.6)" : "rgba(255,255,255,0.05)", border:"none", borderRadius:"6px", padding:"6px 14px", color: moveTargetDate ? "#fff" : "rgba(255,255,255,0.3)", fontSize:"12px", fontWeight:600, cursor: moveTargetDate ? "pointer" : "default", fontFamily:"'Inter', sans-serif" }}>Confirmar</button>
                  </div>
                )}
              </div>
              <button onClick={handleLassoDelete} style={{ background:"none", border:"1px solid rgba(239,68,68,0.35)", borderRadius:"7px", padding:"5px 12px", color:"rgba(239,68,68,0.8)", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>Excluir</button>
              <button onClick={()=>{setSelectedIds(new Set());setShowMoveDate(false);}} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.25)", fontSize:"16px", cursor:"pointer", lineHeight:1, padding:"0 2px", marginLeft:"4px" }}>×</button>
            </div>
          )}
        </div>
        )} {/* end desktop-only grid */}


      </div>

      {showNavPicker && (
        <MobileYearPicker
          currentYear={year} currentMonth={month}
          onSelect={(y, m) => { setYear(y); setMonth(m); setShowNavPicker(false); setTimeout(() => scrollToTodayFn.current?.(), 80); }}
          onClose={() => setShowNavPicker(false)}
        />
      )}

      {mobileDayModal && (
        <MobileDayModal
          date={mobileDayModal.date}
          notes={state.notes[mobileDayModal.date]||[]}
          milestones={state.milestones[mobileDayModal.date]||[]}
          reminders={state.reminders[mobileDayModal.date]||[]}
          today={today}
          onClose={()=>setMobileDayModal(null)}
          onOpenNote={note=>{ setMobileDayModal(null); if(note.platform==="instagram") setOpenEditor({type:"post",item:note}); else setOpenEditor({type:"note-full",item:note}); }}
          onOpenMilestone={m=>{ setMobileDayModal(null); setOpenEditor({type:"milestone",item:m}); }}
          onOpenReminder={r=>{ setMobileDayModal(null); setOpenReminder(r); }}
          onCreateNew={type=>{ setMobileDayModal(null); setQuickCreate({date:mobileDayModal.date,type: type==="post" ? "note" : type}); if(type==="post") setTimeout(()=>setQuickCreate({date:mobileDayModal.date,type:"note",platform:"instagram"}),0); }}
        />
      )}
      {quickCreate && (
        <QuickCreateModal
          initialDate={quickCreate.date}
          initialType={quickCreate.type}
          onClose={()=>setQuickCreate(null)}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onAddMilestone={handleAddMilestone}
          onUpdateMilestone={handleUpdateMilestone}
          onAddReminder={handleAddReminder}
          statuses={state.statuses||DEFAULT_STATUSES}
          onUpdateStatuses={handleUpdateStatuses}
        />
      )}

      {openEditor?.type === "note" && (
          <NoteQuickModal note={openEditor.item}
            onSave={(fields) => { handleUpdateNote({...openEditor.item,...fields}, openEditor.item.date); setOpenEditor(null); }}
            onClose={()=>setOpenEditor(null)}
            onDelete={()=>{ handleSoftDeleteNote(openEditor.item.id, openEditor.item.date); setOpenEditor(null); }}
            onOpenFull={()=>setOpenEditor({ type:"note-full", item:openEditor.item })}
          />
      )}
      {openEditor?.type === "post" && (
        <PostViewModal note={openEditor.item}
          onSave={(fields) => { handleUpdateNote(fields, openEditor.item.date); }}
          onClose={()=>setOpenEditor(null)}
          onDelete={()=>{ handleSoftDeleteNote(openEditor.item.id, openEditor.item.date); setOpenEditor(null); }}
        />
      )}

      {openEditor?.type === "note-full" && (
        <NoteEditor note={openEditor.item} date={openEditor.item.date}
          onSave={(fields, oldDate) => { handleUpdateNote({...openEditor.item,...fields}, oldDate); setOpenEditor(null); }}
          onSaveSilent={(fields, oldDate) => { handleUpdateNote({...openEditor.item,...fields}, oldDate); }}
          onClose={()=>setOpenEditor(null)}
          onCloseAll={()=>setOpenEditor(null)}
          onDelete={()=>{ handleSoftDeleteNote(openEditor.item.id, openEditor.item.date); setOpenEditor(null); }}
        />
      )}

      {openReminder && (
        <ReminderEditor reminder={openReminder}
          onSave={updated=>{ handleDeleteReminder(openReminder); handleAddReminder(updated); setOpenReminder(null); }}
          onClose={()=>setOpenReminder(null)}
          onDelete={r=>{ handleDeleteReminder(r); setOpenReminder(null); }}
        />
      )}

      {openEditor?.type === "milestone" && (
        <MilestoneEditor milestone={openEditor.item} date={openEditor.item.date}
          onSave={fields=>{ handleUpdateMilestone({...openEditor.item,...fields}); setOpenEditor(null); }}
          onClose={()=>setOpenEditor(null)}
          onDelete={()=>{ handleDeleteMilestone(openEditor.item.id, openEditor.item.date); setOpenEditor(null); }}
        />
      )}

      {quickEditNote && (
        <div style={{ position:"fixed", inset:0, zIndex:5000, backgroundColor:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setQuickEditNote(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ backgroundColor:"#fff", borderRadius:"14px", padding:"24px", width:"420px", boxShadow:"0 20px 50px rgba(0,0,0,0.2)", animation:"slideUp 0.2s ease" }}>
            <div style={{ fontSize:"13px", fontWeight:700, color:T.textFaint, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"12px" }}>Editar título</div>
            <input autoFocus value={quickEditNewTitle} onChange={e=>setQuickEditNewTitle(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"){handleQuickEditTitle(quickEditNote,quickEditNewTitle);setQuickEditNote(null);} if(e.key==="Escape")setQuickEditNote(null); }}
              style={{ width:"100%", border:"1px solid #ddd0bc", borderRadius:"8px", padding:"10px 12px", fontSize:"16px", fontWeight:600, fontFamily:"'Inter', sans-serif", outline:"none", color:"#1e293b", boxSizing:"border-box" }} />
            <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end", marginTop:"14px" }}>
              <button onClick={()=>setQuickEditNote(null)} style={{ padding:"7px 16px", borderRadius:"8px", border:"1px solid #ddd0bc", backgroundColor:"transparent", color:"#8a7060", fontSize:"13px", cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>Cancelar</button>
              <button onClick={()=>{handleQuickEditTitle(quickEditNote,quickEditNewTitle);setQuickEditNote(null);}} style={{ padding:"7px 16px", borderRadius:"8px", border:"none", backgroundColor:SAGE, color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {showTrash && (
        <div style={{ position:"fixed", inset:0, zIndex:4000, backgroundColor:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-start", justifyContent:"flex-end", padding:"20px", animation:"fadeIn 0.15s ease" }} onClick={()=>setShowTrash(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ backgroundColor:"#fff", borderRadius:"16px", width:"380px", maxHeight:"85vh", display:"flex", flexDirection:"column", boxShadow:"0 25px 60px rgba(0,0,0,0.25)", animation:"slideUp 0.2s ease", overflow:"hidden" }}>
            <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid #f0ebe4", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:"18px", fontWeight:700, color:"#1e293b", fontFamily:"'Inter', sans-serif" }}>Lixeira</div>
                <div style={{ fontSize:"11px", color:"#94a3b8", fontFamily:"'DM Mono', monospace", marginTop:"2px" }}>Roteiros apagados nos últimos 30 dias</div>
              </div>
              <button onClick={()=>setShowTrash(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:"20px", padding:"4px" }}>×</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
              {(state.trash||[]).length === 0 ? (
                <div style={{ textAlign:"center", color:"#94a3b8", fontSize:"14px", fontFamily:"'Inter', sans-serif", padding:"32px 0" }}>Lixeira vazia</div>
              ) : (
                [...(state.trash||[])].reverse().map(note => {
                  const status = STATUS_MAP[note.status] || STATUS_MAP.ideia;
                  const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - (note.deletedAt||0)) / 86400000));
                  return (
                    <div key={note.id} style={{ backgroundColor:status.bg, border:`1px solid ${status.color}33`, borderLeft:`4px solid ${status.color}`, borderRadius:"10px", padding:"10px 12px", marginBottom:"8px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:"13px", fontWeight:600, color:"#1e293b", fontFamily:"'Inter', sans-serif", marginBottom:"2px" }}>{note.title||"Sem título"}</div>
                          <div style={{ fontSize:"11px", color:"#94a3b8", fontFamily:"'DM Mono', monospace" }}>{note.date} · expira em {daysLeft}d</div>
                        </div>
                        <button onClick={()=>handleRestoreNote(note.id)} style={{ padding:"4px 10px", borderRadius:"6px", border:`1px solid ${status.color}`, backgroundColor:"transparent", color:status.color, fontSize:"11px", fontWeight:600, cursor:"pointer", fontFamily:"'Inter', sans-serif", flexShrink:0 }}>Restaurar</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <div onClick={()=>setShowMenu(false)}
          style={{ position:"fixed", inset:0, zIndex:4500, backgroundColor:"rgba(20,40,20,0.6)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", animation:"fadeIn 0.15s ease" }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ position:"absolute", left:"16px", top:"16px", bottom:"16px", width:"260px", borderRadius:"16px", backgroundColor:SAGE, border:"1px solid rgba(255,255,255,0.12)", boxShadow:"0 30px 70px rgba(0,0,0,0.4)", display:"flex", flexDirection:"column", animation:"menuSlideIn 0.25s cubic-bezier(0.4,0,0.2,1)", overflow:"hidden" }}>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", backgroundColor:"rgba(87,119,87,0.3)", backdropFilter:"blur(12px)", flexShrink:0 }}>
              <span style={{ fontSize:"9px", fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Menu</span>
              <button onClick={()=>setShowMenu(false)} style={{ background:"rgba(255,255,255,0.1)", border:"none", borderRadius:"6px", cursor:"pointer", color:"rgba(255,255,255,0.6)", fontSize:"16px", width:"26px", height:"26px", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>×</button>
            </div>
            <div style={{ flex:1, padding:"8px 10px", display:"flex", flexDirection:"column", gap:"2px", overflowY:"auto" }}>

              {[
                { label:"Exportar dados", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
                  onClick: ()=>{ setShowMenu(false); const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`calendario-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); } },
                { label:"Lixeira", icon: <Trash2 size={14} strokeWidth={2} />,
                  onClick: ()=>{ setShowMenu(false); setShowTrash(true); } },
              ].map(({label, icon, onClick}) => (
                <button key={label} onClick={onClick}
                  style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"9px", border:"none", background:"none", cursor:"pointer", width:"100%", textAlign:"left", color:"rgba(255,255,255,0.8)", fontFamily:"'Inter', sans-serif", fontSize:"13px", fontWeight:500, transition:"background 0.12s" }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)"}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                  <span style={{ color:"rgba(255,255,255,0.45)", display:"flex", alignItems:"center", flexShrink:0 }}>{icon}</span>
                  {label}
                </button>
              ))}

              <label style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"9px", border:"none", background:"none", cursor:"pointer", width:"100%", textAlign:"left", color:"rgba(255,255,255,0.8)", fontFamily:"'Inter', sans-serif", fontSize:"13px", fontWeight:500, transition:"background 0.12s" }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)"}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                <span style={{ color:"rgba(255,255,255,0.45)", display:"flex", alignItems:"center", flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </span>
                Importar dados
                <input type="file" accept=".json" style={{display:"none"}} onChange={e=>{ const file=e.target.files[0]; if(!file) return; const reader=new FileReader(); reader.onload=ev=>{ try{ const parsed=JSON.parse(ev.target.result); if(parsed&&parsed.notes&&parsed.milestones){ const newState={reminders:{},...parsed,statuses:mergeStatuses(parsed.statuses)}; importLock.current=true; dispatch({type:"HYDRATE",state:newState}); supaSave(newState).then(()=>{ setSavedIndicator(true); setTimeout(()=>{ importLock.current=false; }, 5000); }); setShowMenu(false); }else{alert("Arquivo inválido.");} }catch{alert("Erro ao ler o arquivo.");} }; reader.readAsText(file); e.target.value=""; }} />
              </label>

              <div style={{ flex:1 }} />
              <div style={{ height:"1px", backgroundColor:"rgba(255,255,255,0.1)", margin:"8px 4px" }} />


            </div>
          </div>
        </div>
      )}

    </ThemeCtx.Provider>
    </StatusMapContext.Provider>
  );
}
