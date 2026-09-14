import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Card, SectionTitle, Field, Input, Textarea, Button, Spinner, ErrorNote, SuccessNote,
  EmptyState, Badge, statusTone, Pagination, errMsg,
} from "../components/UI";

function ComplaintRow({ c, canManage, onResolve, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(c.title);
  const [description, setDescription] = useState(c.description);

  return (
    <Card accent={statusTone(c.status)} className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {editing ? (
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2" />
          ) : (
            <p className="font-medium text-sm text-ink">{c.title}</p>
          )}
          <p className="text-xs text-inkmute">Room {c.roomNo} · {new Date(c.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
      </div>
      {editing ? (
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      ) : (
        c.description && <p className="text-sm text-inkmute">{c.description}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {c.status !== "resolved" && (
          <Button variant="subtle" className="!py-1.5 !px-3 text-xs" onClick={() => onResolve(c._id)}>Mark resolved</Button>
        )}
        {onEdit && c.status !== "resolved" && !editing && (
          <Button variant="subtle" className="!py-1.5 !px-3 text-xs" onClick={() => setEditing(true)}>Edit</Button>
        )}
        {editing && (
          <>
            <Button variant="primary" className="!py-1.5 !px-3 text-xs" onClick={() => { onEdit(c._id, { title, description }); setEditing(false); }}>Save</Button>
            <Button variant="ghost" className="!py-1.5 !px-3 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </>
        )}
        {onDelete && (
          <Button variant="danger" className="!py-1.5 !px-3 text-xs" onClick={() => onDelete(c._id)}>Delete</Button>
        )}
      </div>
    </Card>
  );
}

function StudentComplaints() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ roomNo: "", title: "", description: "" });
  const [filing, setFiling] = useState(false);

  const load = (p = 1) => {
    setLoading(true);
    api.myComplaints(p, 10)
      .then((r) => { setList(r.data.complaints); setTotalPages(r.data.totalPages); setPage(p); })
      .catch((e) => { if (e?.response?.status === 404) { setList([]); } else setError(errMsg(e)); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), []);

  const file = async (e) => {
    e.preventDefault();
    setError(""); setNotice(""); setFiling(true);
    try {
      await api.fileComplaint(form);
      setNotice("Complaint filed.");
      setForm({ roomNo: "", title: "", description: "" });
      load(1);
    } catch (err) { setError(errMsg(err)); } finally { setFiling(false); }
  };

  const resolve = async (id) => { try { await api.resolveComplaint(id); load(page); } catch (e) { setError(errMsg(e)); } };
  const remove = async (id) => { try { await api.deleteComplaint(id); load(page); } catch (e) { setError(errMsg(e)); } };
  const edit = async (id, data) => { try { await api.updateComplaint(id, data); load(page); } catch (e) { setError(errMsg(e)); } };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionTitle title="File a complaint" />
        <Card>
          <form onSubmit={file}>
            <ErrorNote message={error} />
            <SuccessNote message={notice} />
            <Field label="Room number"><Input required value={form.roomNo} onChange={(e) => setForm({ ...form, roomNo: e.target.value })} placeholder="e.g. B-204" /></Field>
            <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Leaking tap" /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Any extra detail" /></Field>
            <Button type="submit" disabled={filing}>{filing ? "Filing…" : "File complaint"}</Button>
          </form>
        </Card>
      </div>

      <div>
        <SectionTitle title="My complaints" />
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState title="No complaints yet" hint="Complaints you file will show up here." />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((c) => <ComplaintRow key={c._id} c={c} onResolve={resolve} onDelete={remove} onEdit={edit} />)}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={load} />
      </div>
    </div>
  );
}

function AdminComplaints() {
  const [tab, setTab] = useState("all");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [roomQuery, setRoomQuery] = useState("");

  const load = (p = 1, tabOverride) => {
    const t = tabOverride || tab;
    setLoading(true); setError("");
    let call;
    if (t === "status") call = api.viewComplaintByStatus(p, 10);
    else if (t === "room") {
      if (!roomQuery.trim()) { setLoading(false); setList([]); return; }
      call = api.viewRoomComplaint(roomQuery.trim().toUpperCase(), p, 10);
    } else call = api.viewComplaint(p, 10);

    call
      .then((r) => { setList(r.data.complaints); setTotalPages(r.data.totalPages || 1); setPage(p); })
      .catch((e) => { if (e?.response?.status === 404) setList([]); else setError(errMsg(e)); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { api.complaintStats().then((r) => setStats(r.data)).catch(() => {}); }, []);
  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [tab]);

  const resolve = async (id) => { try { await api.resolveComplaint(id); load(page); } catch (e) { setError(errMsg(e)); } };
  const update = async (id, data) => { try { await api.updateComplaint(id, data); load(page); } catch (e) { setError(errMsg(e)); } };

  return (
    <div className="flex flex-col gap-5">
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <Card accent="navy" className="text-center"><p className="text-lg font-display font-semibold">{stats.totalComplaints}</p><p className="text-[11px] text-inkmute">Total</p></Card>
          <Card accent="mustard" className="text-center"><p className="text-lg font-display font-semibold">{stats.pending}</p><p className="text-[11px] text-inkmute">Pending</p></Card>
          <Card accent="line" className="text-center"><p className="text-lg font-display font-semibold">{stats.inProgress}</p><p className="text-[11px] text-inkmute">In progress</p></Card>
          <Card accent="pine" className="text-center"><p className="text-lg font-display font-semibold">{stats.resolved}</p><p className="text-[11px] text-inkmute">Resolved</p></Card>
        </div>
      )}

      <div className="flex gap-2">
        {[["all", "All"], ["status", "By status"], ["room", "By room"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-card px-3 py-1.5 text-xs font-medium border ${tab === k ? "bg-navy text-white border-navy" : "border-line text-inkmute"}`}>{label}</button>
        ))}
      </div>

      {tab === "room" && (
        <div className="flex gap-2">
          <Input value={roomQuery} onChange={(e) => setRoomQuery(e.target.value)} placeholder="Room number, e.g. B-204" />
          <Button onClick={() => load(1)}>Search</Button>
        </div>
      )}

      <ErrorNote message={error} />
      {loading ? <Spinner /> : list.length === 0 ? (
        <EmptyState title="No complaints found" hint="Try a different filter." />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((c) => <ComplaintRow key={c._id} c={c} onResolve={resolve} onEdit={update} />)}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={(p) => load(p)} />
    </div>
  );
}

export default function Complaints() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminComplaints /> : <StudentComplaints />;
}
