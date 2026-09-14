import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Textarea, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Pagination, errMsg } from "../components/UI";

function AnnouncementForm({ onDone }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try { await api.createAnnouncement(form); onDone(); setForm({ title: "", description: "" }); }
    catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <ErrorNote message={error} />
        <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Description"><Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Button type="submit" disabled={saving}>{saving ? "Posting…" : "Post announcement"}</Button>
      </form>
    </Card>
  );
}

function AnnouncementRow({ a, canManage, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(a.title);
  const [description, setDescription] = useState(a.description);

  const save = async () => { try { await api.updateAnnouncement(a._id, { title, description }); setEditing(false); onChanged(); } catch {} };
  const del = async () => { if (confirm("Delete this announcement?")) { try { await api.deleteAnnouncement(a._id); onChanged(); } catch {} } };

  return (
    <Card accent="mustard">
      {editing ? (
        <>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </>
      ) : (
        <>
          <p className="font-medium text-sm">{a.title}</p>
          <p className="text-sm text-inkmute mt-1">{a.description}</p>
        </>
      )}
      <p className="text-xs text-inkmute mt-2">By {a.createdBy?.username || "Admin"} · {new Date(a.createdAt).toLocaleDateString()}</p>
      {canManage && (
        <div className="flex gap-2 mt-2">
          {editing ? (
            <>
              <Button className="!py-1.5 !px-3 text-xs" onClick={save}>Save</Button>
              <Button variant="ghost" className="!py-1.5 !px-3 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          ) : (
            <>
              <Button variant="subtle" className="!py-1.5 !px-3 text-xs" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="danger" className="!py-1.5 !px-3 text-xs" onClick={del}>Delete</Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function AdminContacts() {
  const [admins, setAdmins] = useState(null);
  useEffect(() => { api.getAdminContacts().then((r) => setAdmins(r.data.admins)).catch(() => setAdmins([])); }, []);
  if (!admins || admins.length === 0) return null;
  return (
    <div>
      <SectionTitle title="Need help? Contact the wardens" />
      <div className="flex flex-col gap-2">
        {admins.map((a) => (
          <Card key={a._id} accent="line" className="flex items-center justify-between">
            <p className="text-sm font-medium">{a.username}</p>
            <a href={`tel:${a.phoneNumber}`} className="text-sm text-navy font-medium">{a.phoneNumber}</a>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Announcements() {
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
    api.getAnnouncements(p, 10)
      .then((r) => { setList(r.data.announcements); setTotalPages(r.data.totalPages); setPage(p); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(1), []);

  return (
    <div className="flex flex-col gap-5">
      {isAdmin && (
        <div>
          <SectionTitle title="Post an announcement" />
          <SuccessNote message={notice} />
          <AnnouncementForm onDone={() => { setNotice("Announcement posted."); load(1); }} />
        </div>
      )}
      <div>
        <SectionTitle title="Announcements" />
        <ErrorNote message={error} />
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState title="No announcements yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((a) => <AnnouncementRow key={a._id} a={a} canManage={isAdmin} onChanged={() => load(page)} />)}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={load} />
      </div>
      {!isAdmin && <AdminContacts />}
    </div>
  );
}
