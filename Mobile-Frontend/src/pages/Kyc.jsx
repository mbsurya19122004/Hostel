import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Badge, statusTone, Textarea, Pagination, errMsg } from "../components/UI";

function StudentKyc() {
  const [kyc, setKyc] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ aadharFront: "", aadharBack: "", selfie: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.getMyKyc().then((r) => setKyc(r.data.kyc)).catch((e) => { if (e?.response?.status === 404) setNotFound(true); else setError(errMsg(e)); });
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.submitKyc(form);
      setNotice("KYC submitted for review.");
      setNotFound(false);
      load();
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  if (!kyc && !notFound && !error) return <Spinner label="Loading KYC status" />;

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title="KYC verification" subtitle="One-time identity check required for hostel access" />
      <ErrorNote message={error} />
      <SuccessNote message={notice} />
      {kyc ? (
        <Card accent={statusTone(kyc.status)}>
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">Your submission</p>
            <Badge tone={statusTone(kyc.status)}>{kyc.status}</Badge>
          </div>
          {kyc.status === "rejected" && kyc.rejectionReason && (
            <p className="text-sm text-brick mt-2">Reason: {kyc.rejectionReason}</p>
          )}
          <p className="text-xs text-inkmute mt-2">Submitted {new Date(kyc.createdAt).toLocaleDateString()}</p>
        </Card>
      ) : (
        <Card>
          <form onSubmit={submit}>
            <Field label="Aadhaar front (image URL)"><Input required value={form.aadharFront} onChange={(e) => setForm({ ...form, aadharFront: e.target.value })} /></Field>
            <Field label="Aadhaar back (image URL)"><Input required value={form.aadharBack} onChange={(e) => setForm({ ...form, aadharBack: e.target.value })} /></Field>
            <Field label="Selfie (image URL)"><Input required value={form.selfie} onChange={(e) => setForm({ ...form, selfie: e.target.value })} /></Field>
            <Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit KYC"}</Button>
          </form>
        </Card>
      )}
    </div>
  );
}

function AdminKyc() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reasonFor, setReasonFor] = useState({});
  const [busy, setBusy] = useState("");

  const load = (p = 1) => {
    setLoading(true);
    api.getPendingKyc(p, 10)
      .then((r) => { setList(r.data.kyc); setTotalPages(r.data.totalPages); setPage(p); })
      .catch((e) => { if (e?.response?.status === 404) setList([]); else setError(errMsg(e)); })
      .finally(() => setLoading(false));
  };
  useEffect(() => load(1), []);

  const approve = async (id) => { setBusy(id); try { await api.approveKyc(id); load(page); } catch (e) { setError(errMsg(e)); } finally { setBusy(""); } };
  const reject = async (id) => { setBusy(id); try { await api.rejectKyc(id, reasonFor[id] || ""); load(page); } catch (e) { setError(errMsg(e)); } finally { setBusy(""); } };

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title="Pending KYC" />
      <ErrorNote message={error} />
      {loading ? <Spinner /> : list.length === 0 ? (
        <EmptyState title="No pending KYC" hint="You're all caught up." />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((k) => (
            <Card key={k._id} accent="mustard">
              <p className="font-medium text-sm">{k.userId?.username}</p>
              <p className="text-xs text-inkmute mb-2">{k.userId?.email} · {k.userId?.phoneNumber}</p>
              <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-navy underline">
                <a href={k.aadharFront} target="_blank" rel="noreferrer">Aadhaar front</a>
                <a href={k.aadharBack} target="_blank" rel="noreferrer">Aadhaar back</a>
                <a href={k.selfie} target="_blank" rel="noreferrer">Selfie</a>
              </div>
              <Textarea placeholder="Rejection reason (optional)" value={reasonFor[k._id] || ""} onChange={(e) => setReasonFor({ ...reasonFor, [k._id]: e.target.value })} />
              <div className="flex gap-2 mt-2">
                <Button className="!py-1.5 !px-3 text-xs" disabled={busy === k._id} onClick={() => approve(k._id)}>Approve</Button>
                <Button variant="danger" className="!py-1.5 !px-3 text-xs" disabled={busy === k._id} onClick={() => reject(k._id)}>Reject</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={load} />
    </div>
  );
}

export default function Kyc() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminKyc /> : <StudentKyc />;
}
