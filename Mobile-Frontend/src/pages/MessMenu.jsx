import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Select, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Pagination, errMsg } from "../components/UI";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

function toList(str) { return str.split(",").map((s) => s.trim()).filter(Boolean); }

function MenuForm({ onCreated }) {
  const [form, setForm] = useState({ day: "Monday", type: "veg", breakfast: "", lunch: "", snacks: "", dinner: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.createMenu({
        day: form.day, type: form.type,
        breakfast: toList(form.breakfast), lunch: toList(form.lunch),
        snacks: toList(form.snacks), dinner: toList(form.dinner),
      });
      onCreated();
      setForm({ day: "Monday", type: "veg", breakfast: "", lunch: "", snacks: "", dinner: "" });
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <ErrorNote message={error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Day">
            <Select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="veg">Veg</option>
              <option value="non-veg">Non-veg</option>
            </Select>
          </Field>
        </div>
        {MEALS.map((m) => (
          <Field key={m} label={m[0].toUpperCase() + m.slice(1) + " (comma separated)"}>
            <Input value={form[m]} onChange={(e) => setForm({ ...form, [m]: e.target.value })} placeholder="Idli, Sambar, Chutney" />
          </Field>
        ))}
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Add menu"}</Button>
      </form>
    </Card>
  );
}

function MenuCard({ m, canManage, onDeleted }) {
  const del = async () => {
    try { await api.deleteMenu(m.day, m.type); onDeleted(); } catch {}
  };
  return (
    <Card accent="pine">
      <div className="flex items-center justify-between mb-2">
        <p className="font-display font-semibold text-sm">{m.day} · <span className="capitalize">{m.type}</span></p>
        {canManage && <Button variant="danger" className="!py-1 !px-2.5 text-xs" onClick={del}>Delete</Button>}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-inkmute">
        <div><span className="font-medium text-ink">Breakfast: </span>{(m.breakfast || []).join(", ") || "—"}</div>
        <div><span className="font-medium text-ink">Lunch: </span>{(m.lunch || []).join(", ") || "—"}</div>
        <div><span className="font-medium text-ink">Snacks: </span>{(m.snacks || []).join(", ") || "—"}</div>
        <div><span className="font-medium text-ink">Dinner: </span>{(m.dinner || []).join(", ") || "—"}</div>
      </div>
    </Card>
  );
}

export default function MessMenu() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [dayFilter, setDayFilter] = useState("");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = (p = 1) => {
    setLoading(true); setError("");
    const call = dayFilter ? api.getMenuByDay(dayFilter) : api.getMenu(p, 10);
    call
      .then((r) => { setList(r.data.menu); setTotalPages(r.data.totalPages || 1); setPage(p); })
      .catch((e) => { if (e?.response?.status === 404) setList([]); else setError(errMsg(e)); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [dayFilter]);

  return (
    <div className="flex flex-col gap-5">
      {isAdmin && (
        <div>
          <SectionTitle title="Add a menu" />
          <SuccessNote message={notice} />
          <MenuForm onCreated={() => { setNotice("Menu added."); load(1); }} />
        </div>
      )}

      <div>
        <SectionTitle
          title="Mess menu"
          action={
            <Select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="!w-auto">
              <option value="">All days</option>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          }
        />
        <ErrorNote message={error} />
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState title="No menu found" hint="Check back once the hostel posts this week's menu." />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((m) => <MenuCard key={m._id} m={m} canManage={isAdmin} onDeleted={() => load(page)} />)}
          </div>
        )}
        {!dayFilter && <Pagination page={page} totalPages={totalPages} onChange={load} />}
      </div>
    </div>
  );
}
