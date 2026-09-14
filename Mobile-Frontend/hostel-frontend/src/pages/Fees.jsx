import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Select, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Badge, statusTone, Pagination, money, errMsg } from "../components/UI";

function StudentFees() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => api.getMyFees().then((r) => setData(r.data)).catch((e) => { if (e?.response?.status === 404) setData({ fees: [], totalPending: 0 }); else setError(errMsg(e)); });
  useEffect(() => { load(); }, []);

  const pay = async (feeId, installmentId) => {
    setPayingId(installmentId); setError(""); setNotice("");
    try {
      await api.payFee(feeId, installmentId);
      setNotice("Installment marked as paid.");
      load();
    } catch (err) { setError(errMsg(err)); } finally { setPayingId(""); }
  };

  if (error && !data) return <ErrorNote message={error} />;
  if (!data) return <Spinner label="Loading fees" />;

  return (
    <div className="flex flex-col gap-5">
      <Card accent="brick">
        <p className="text-xs text-inkmute">Total pending</p>
        <p className="font-display font-semibold text-2xl">{money(data.totalPending)}</p>
      </Card>
      <ErrorNote message={error} />
      <SuccessNote message={notice} />
      {(data.fees || []).length === 0 ? (
        <EmptyState title="No fee records yet" />
      ) : data.fees.map((fee) => (
        <div key={fee._id}>
          <SectionTitle title={`${fee.feeType[0].toUpperCase()}${fee.feeType.slice(1)} fee`} subtitle={`${money(fee.totalPaid)} paid of ${money(fee.totalAmount)}`} />
          <div className="flex flex-col gap-2">
            {fee.installments.map((inst) => (
              <Card key={inst._id} accent={statusTone(inst.status)} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{money(inst.amount)}</p>
                  <p className="text-xs text-inkmute">{inst.status === "paid" ? `Paid ${inst.paidAt ? new Date(inst.paidAt).toLocaleDateString() : ""}` : "Not yet paid"}</p>
                </div>
                {inst.status === "pending" ? (
                  <Button className="!py-1.5 !px-3 text-xs" disabled={payingId === inst._id} onClick={() => pay(fee._id, inst._id)}>
                    {payingId === inst._id ? "Paying…" : "Pay now"}
                  </Button>
                ) : <Badge tone="pine">Paid</Badge>}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateFeeForm({ onDone }) {
  const [form, setForm] = useState({ studentId: "", feeType: "hostel", totalAmount: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.createFeeStructure({ ...form, totalAmount: Number(form.totalAmount) });
      onDone();
      setForm({ studentId: "", feeType: "hostel", totalAmount: "" });
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <ErrorNote message={error} />
        <Field label="Student ID (Mongo _id)"><Input required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fee type">
            <Select value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })}>
              <option value="hostel">Hostel</option>
              <option value="registration">Registration</option>
            </Select>
          </Field>
          <Field label="Total amount (₹)"><Input required type="number" min="1" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} /></Field>
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create fee structure"}</Button>
      </form>
    </Card>
  );
}

function AdminFees() {
  const [list, setList] = useState([]);
  const [totalPendingFees, setTotalPendingFees] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = (p = 1) => {
    setLoading(true);
    api.getPendingFees(p, 10)
      .then((r) => { setList(r.data.pendingFees); setTotalPendingFees(r.data.totalPendingFees); setTotalPages(r.data.totalPages); setPage(p); })
      .catch((e) => { if (e?.response?.status === 404) setList([]); else setError(errMsg(e)); })
      .finally(() => setLoading(false));
  };
  useEffect(() => load(1), []);

  return (
    <div className="flex flex-col gap-5">
      <Card accent="brick">
        <p className="text-xs text-inkmute">Total pending across hostel</p>
        <p className="font-display font-semibold text-2xl">{money(totalPendingFees)}</p>
      </Card>

      <div>
        <SectionTitle title="Create fee structure" subtitle="Find a student's ID from the Students page" />
        <SuccessNote message={notice} />
        <CreateFeeForm onDone={() => { setNotice("Fee structure created."); load(1); }} />
      </div>

      <div>
        <SectionTitle title="Students with pending fees" />
        <ErrorNote message={error} />
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState title="No pending fees" hint="Everyone is settled up." />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((fee) => {
              const u = fee.studentId?.userId;
              const pending = (fee.installments || []).filter((i) => i.status === "pending").reduce((s, i) => s + Number(i.amount), 0);
              return (
                <Card key={fee._id} accent="mustard">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{u?.username || "Unknown student"}</p>
                      <p className="text-xs text-inkmute">{u?.email} · {fee.feeType} fee</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-semibold">{money(pending)}</p>
                      {fee.studentId?._id && <Link to={`/students/${fee.studentId._id}`} state={{ userId: u?._id }} className="text-xs text-navy font-medium">View student</Link>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={load} />
      </div>
    </div>
  );
}

export default function Fees() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminFees /> : <StudentFees />;
}
