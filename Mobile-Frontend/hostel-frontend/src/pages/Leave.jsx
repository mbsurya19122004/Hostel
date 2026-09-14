import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Select, Textarea, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Pagination, errMsg } from "../components/UI";

function StudentLeave() {
  const [form, setForm] = useState({ category: "personal", customReason: "", expectedReturnTime: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeOuting, setActiveOuting] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hostelly_outing") || "null"); } catch { return null; }
  });
  const [returning, setReturning] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNotice(""); setSaving(true);
    try {
      const r = await api.applyLeave(form);
      setNotice("Outing recorded. Have a safe trip!");
      setActiveOuting(r.data.outing);
      localStorage.setItem("hostelly_outing", JSON.stringify(r.data.outing));
      setForm({ category: "personal", customReason: "", expectedReturnTime: "" });
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  const markReturned = async () => {
    if (!activeOuting?._id) return;
    setReturning(true); setError("");
    try {
      await api.returnToHostel(activeOuting._id);
      setNotice("Welcome back! Marked as returned.");
      setActiveOuting(null);
      localStorage.removeItem("hostelly_outing");
    } catch (err) { setError(errMsg(err)); } finally { setReturning(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title="Outings" />
      <ErrorNote message={error} />
      <SuccessNote message={notice} />

      {activeOuting && (
        <Card accent="mustard">
          <p className="font-medium text-sm">You're currently marked out</p>
          <p className="text-xs text-inkmute mt-1">{activeOuting.category} · expected back {activeOuting.expectedReturnTime || "—"}</p>
          <Button className="mt-2 !py-1.5 !px-3 text-xs" disabled={returning} onClick={markReturned}>{returning ? "Updating…" : "I'm back at the hostel"}</Button>
        </Card>
      )}

      <Card>
        <form onSubmit={submit}>
          <Field label="Reason">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="personal">Personal</option>
              <option value="medical">Medical</option>
              <option value="family">Family visit</option>
              <option value="academic">Academic</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          {form.category === "other" && (
            <Field label="Details"><Textarea value={form.customReason} onChange={(e) => setForm({ ...form, customReason: e.target.value })} /></Field>
          )}
          <Field label="Expected return"><Input value={form.expectedReturnTime} onChange={(e) => setForm({ ...form, expectedReturnTime: e.target.value })} placeholder="e.g. Today 9 PM" /></Field>
          <Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Log outing"}</Button>
        </form>
      </Card>
    </div>
  );
}

function AdminLeave() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (p = 1) => {
    setLoading(true);
    api.studentsOnLeave(p, 10)
      .then((r) => { setList(r.data.students); setTotalPages(r.data.totalPages); setPage(p); })
      .catch((e) => { if (e?.response?.status === 404) setList([]); else setError(errMsg(e)); })
      .finally(() => setLoading(false));
  };
  useEffect(() => load(1), []);

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title="Students currently on leave" />
      <ErrorNote message={error} />
      {loading ? <Spinner /> : list.length === 0 ? (
        <EmptyState title="Everyone's in" hint="No one is currently on an outing." />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((o) => {
            const u = o.studentId?.userId;
            return (
              <Card key={o._id} accent="mustard">
                <p className="font-medium text-sm">{u?.username}</p>
                <p className="text-xs text-inkmute">{o.category} · {o.customReason}</p>
                <p className="text-xs text-inkmute mt-1">Expected back: {o.expectedReturnTime || "—"}</p>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={load} />
    </div>
  );
}

export default function Leave() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminLeave /> : <StudentLeave />;
}
