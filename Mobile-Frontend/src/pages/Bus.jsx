import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Pagination, errMsg } from "../components/UI";

function BusForm({ onDone }) {
  const [form, setForm] = useState({ busNo: "", route: "", hostelToCollege: "", collegeToHostel: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.createBus(form);
      onDone();
      setForm({ busNo: "", route: "", hostelToCollege: "", collegeToHostel: "" });
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <ErrorNote message={error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bus number"><Input required value={form.busNo} onChange={(e) => setForm({ ...form, busNo: e.target.value })} /></Field>
          <Field label="Route"><Input required value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} placeholder="Hostel — City Campus" /></Field>
          <Field label="Hostel → College"><Input required value={form.hostelToCollege} onChange={(e) => setForm({ ...form, hostelToCollege: e.target.value })} placeholder="8:00 AM" /></Field>
          <Field label="College → Hostel"><Input required value={form.collegeToHostel} onChange={(e) => setForm({ ...form, collegeToHostel: e.target.value })} placeholder="5:30 PM" /></Field>
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add bus schedule"}</Button>
      </form>
    </Card>
  );
}

function BusRow({ bus, canManage, onChanged }) {
  const del = async () => { if (confirm(`Remove bus ${bus.busNo}?`)) { try { await api.deleteBus(bus._id); onChanged(); } catch {} } };
  return (
    <Card accent="navy">
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold text-sm">Bus {bus.busNo}</p>
        {canManage && <Button variant="danger" className="!py-1 !px-2.5 text-xs" onClick={del}>Delete</Button>}
      </div>
      <p className="text-xs text-inkmute mt-1">{bus.route}</p>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div><p className="text-xs text-inkmute">Hostel → College</p><p className="font-medium">{bus.hostelToCollege}</p></div>
        <div><p className="text-xs text-inkmute">College → Hostel</p><p className="font-medium">{bus.collegeToHostel}</p></div>
      </div>
    </Card>
  );
}

export default function Bus() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = (p = 1) => {
    setLoading(true);
    api.viewBus(p, 10)
      .then((r) => { setList(r.data.busSchedule); setTotalPages(r.data.totalPages); setPage(p); })
      .catch((e) => { if (e?.response?.status === 404) setList([]); else setError(errMsg(e)); })
      .finally(() => setLoading(false));
  };
  useEffect(() => load(1), []);

  return (
    <div className="flex flex-col gap-5">
      {isAdmin && (
        <div>
          <SectionTitle title="Add bus schedule" />
          <SuccessNote message={notice} />
          <BusForm onDone={() => { setNotice("Bus schedule added."); load(1); }} />
        </div>
      )}
      <div>
        <SectionTitle title="Bus schedule" />
        <ErrorNote message={error} />
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState title="No bus schedule yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((b) => <BusRow key={b._id} bus={b} canManage={isAdmin} onChanged={() => load(page)} />)}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={load} />
      </div>
    </div>
  );
}
