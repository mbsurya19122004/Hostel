import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Select, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Badge, Pagination, errMsg } from "../components/UI";

function RegisterStudentForm({ onDone }) {
  const [form, setForm] = useState({
    username: "", email: "", phoneNumber: "", aadhar: "", roomNo: "", course: "", year: "",
    guardianName: "", guardianPhone: "", collegeName: "", totalFee: "", registrationFee: "",
    city: "", state: "", pincode: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const { city, state, pincode, ...rest } = form;
      await api.registerStudent({
        ...rest,
        totalFee: Number(form.totalFee),
        registrationFee: Number(form.registrationFee),
        address: { city, state, pincode },
      });
      onDone();
      setForm({ username: "", email: "", phoneNumber: "", aadhar: "", roomNo: "", course: "", year: "", guardianName: "", guardianPhone: "", collegeName: "", totalFee: "", registrationFee: "", city: "", state: "", pincode: "" });
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Card>
      <form onSubmit={submit}>
        <ErrorNote message={error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name"><Input required value={form.username} onChange={set("username")} /></Field>
          <Field label="Email"><Input required type="email" value={form.email} onChange={set("email")} /></Field>
          <Field label="Phone"><Input required value={form.phoneNumber} onChange={set("phoneNumber")} /></Field>
          <Field label="Aadhaar"><Input required value={form.aadhar} onChange={set("aadhar")} /></Field>
          <Field label="Room number"><Input required value={form.roomNo} onChange={set("roomNo")} /></Field>
          <Field label="Course"><Input value={form.course} onChange={set("course")} /></Field>
          <Field label="Year"><Input value={form.year} onChange={set("year")} /></Field>
          <Field label="College"><Input value={form.collegeName} onChange={set("collegeName")} /></Field>
          <Field label="Guardian name"><Input value={form.guardianName} onChange={set("guardianName")} /></Field>
          <Field label="Guardian phone"><Input value={form.guardianPhone} onChange={set("guardianPhone")} /></Field>
          <Field label="Total hostel fee (₹)"><Input required type="number" value={form.totalFee} onChange={set("totalFee")} /></Field>
          <Field label="Registration fee (₹)"><Input required type="number" value={form.registrationFee} onChange={set("registrationFee")} /></Field>
          <Field label="City"><Input required value={form.city} onChange={set("city")} /></Field>
          <Field label="State"><Input required value={form.state} onChange={set("state")} /></Field>
          <Field label="Pincode"><Input required value={form.pincode} onChange={set("pincode")} /></Field>
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Registering…" : "Register student"}</Button>
      </form>
    </Card>
  );
}

function StudentRow({ s, isAdmin }) {
  const u = s.userId || s;
  const id = u._id;
  return (
    <Card accent={s.feeStatus === "pending" ? "brick" : "line"}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{u.username}</p>
          <p className="text-xs text-inkmute truncate">{u.email} · Room {s.roomNo}</p>
        </div>
        {s.feeStatus && <Badge tone={s.feeStatus === "pending" ? "brick" : "pine"}>{s.feeStatus}</Badge>}
      </div>
      {isAdmin && (
        <Link to={`/students/${s._id}`} state={{ userId: id }} className="inline-block mt-2 text-xs font-medium text-navy">View details</Link>
      )}
    </Card>
  );
}

function AdminStudents() {
  const [tab, setTab] = useState("resident");
  const [college, setCollege] = useState("");
  const [query, setQuery] = useState("");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = (p = 1) => {
    setLoading(true); setError("");
    let call;
    if (tab === "past") call = api.pastStudents(p, 10);
    else if (tab === "college") { if (!college.trim()) { setLoading(false); setList([]); return; } call = api.getStudentByCollege(college.trim(), p, 10); }
    else if (tab === "search") { if (!query.trim()) { setLoading(false); setList([]); return; } call = api.searchStudent(query.trim(), p, 10); }
    else call = api.allResidentStudents(p, 10);

    call.then((r) => {
      const data = r.data.students || r.data.users || [];
      setList(data);
      setTotalPages(r.data.totalPages || 1);
      setPage(p);
    }).catch((e) => { if (e?.response?.status === 404) setList([]); else setError(errMsg(e)); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [tab]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionTitle title="Register a student" action={<span className="text-xs text-inkmute">Creates login + fee schedule</span>} />
        <SuccessNote message={notice} />
        <RegisterStudentForm onDone={() => { setNotice("Student registered."); load(1); }} />
      </div>

      <div>
        <SectionTitle title="Students" />
        <div className="flex flex-wrap gap-2 mb-3">
          {[["resident", "Resident"], ["past", "Past"], ["college", "By college"], ["search", "Search"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-card px-3 py-1.5 text-xs font-medium border ${tab === k ? "bg-navy text-white border-navy" : "border-line text-inkmute"}`}>{l}</button>
          ))}
        </div>
        {tab === "college" && (
          <div className="flex gap-2 mb-3">
            <Input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="College name" />
            <Button onClick={() => load(1)}>Search</Button>
          </div>
        )}
        {tab === "search" && (
          <div className="flex gap-2 mb-3">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, phone, or email" />
            <Button onClick={() => load(1)}>Search</Button>
          </div>
        )}
        <ErrorNote message={error} />
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState title="No students found" />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((s) => <StudentRow key={s._id} s={s} isAdmin />)}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={load} />
      </div>
    </div>
  );
}

function StudentSearch() {
  const [query, setQuery] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(""); setSearched(true);
    try {
      const r = await api.searchStudent(query.trim(), 1, 20);
      setList(r.data.users || []);
    } catch (err) {
      if (err?.response?.status === 404) setList([]); else setError(errMsg(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Find a fellow resident" subtitle="Search by name, phone, or email" />
      <form onSubmit={search} className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students" />
        <Button type="submit">Search</Button>
      </form>
      <ErrorNote message={error} />
      {loading && <Spinner />}
      {!loading && searched && list.length === 0 && <EmptyState title="No matches" />}
      <div className="flex flex-col gap-3">
        {list.map((u) => (
          <Card key={u._id}>
            <p className="font-medium text-sm">{u.username}</p>
            <p className="text-xs text-inkmute">Room {u.roomNo} · {u.phoneNumber}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Students() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminStudents /> : <StudentSearch />;
}
