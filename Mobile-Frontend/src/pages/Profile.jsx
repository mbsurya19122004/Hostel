import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Button, Spinner, ErrorNote, SuccessNote, errMsg } from "../components/UI";

function StudentProfile() {
  const { user, login } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.studentDashboard().then((r) => {
      setData(r.data);
      setForm({
        username: r.data.profile?.userId?.username || "",
        email: r.data.profile?.userId?.email || "",
        phoneNumber: r.data.profile?.userId?.phoneNumber || "",
        profilePic: r.data.profile?.userId?.profilePic || "",
      });
    }).catch((e) => setError(errMsg(e)));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNotice(""); setSaving(true);
    try {
      const res = await api.updateMyProfile(form);
      setNotice("Profile updated.");
      login({ ...user, username: res.data.user.username, email: res.data.user.email, phoneNumber: res.data.user.phoneNumber });
      load();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (error && !data) return <ErrorNote message={error} />;
  if (!data || !form) return <Spinner label="Loading profile" />;
  const { profile } = data;

  return (
    <div className="flex flex-col gap-5">
      <Card accent="navy">
        <p className="text-xs text-inkmute mb-2">Hostel & course details (contact admin to change)</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-inkmute">Room</p><p className="font-medium">{profile.roomNo}</p></div>
          <div><p className="text-xs text-inkmute">Course</p><p className="font-medium">{profile.course}</p></div>
          <div><p className="text-xs text-inkmute">College</p><p className="font-medium">{profile.collegeName}</p></div>
          <div><p className="text-xs text-inkmute">Year</p><p className="font-medium">{profile.year}</p></div>
          <div><p className="text-xs text-inkmute">Guardian</p><p className="font-medium">{profile.guardianName}</p></div>
          <div><p className="text-xs text-inkmute">Guardian phone</p><p className="font-medium">{profile.guardianPhone}</p></div>
        </div>
      </Card>

      <div>
        <SectionTitle title="Your details" subtitle="Editable once every 7 days for a photo change" />
        <Card>
          <form onSubmit={submit}>
            <ErrorNote message={error} />
            <SuccessNote message={notice} />
            <Field label="Full name"><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone number"><Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></Field>
            <Field label="Profile photo URL" hint="Cooldown of 7 days between changes"><Input value={form.profilePic} onChange={(e) => setForm({ ...form, profilePic: e.target.value })} /></Field>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function AdminProfile() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminProfile().then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorNote message={error} />;
  if (!data) return <Spinner label="Loading profile" />;

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Admin profile" />
      <Card>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div><p className="text-xs text-inkmute">Name</p><p className="font-medium">{data.username}</p></div>
          <div><p className="text-xs text-inkmute">Email</p><p className="font-medium">{data.email}</p></div>
          <div><p className="text-xs text-inkmute">Phone</p><p className="font-medium">{data.phoneNumber}</p></div>
          <div><p className="text-xs text-inkmute">Address</p><p className="font-medium">{[data.address?.city, data.address?.state, data.address?.pincode].filter(Boolean).join(", ") || "—"}</p></div>
        </div>
      </Card>
      <p className="text-xs text-inkmute">To edit your own record, ask another admin to update it, or update it directly in the database — self-editing isn't exposed for admins yet.</p>
    </div>
  );
}

function WorkerProfile() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Worker profile" />
      <Card>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div><p className="text-xs text-inkmute">Name</p><p className="font-medium">{user?.username}</p></div>
          <div><p className="text-xs text-inkmute">Email</p><p className="font-medium">{user?.email}</p></div>
          <div><p className="text-xs text-inkmute">Phone</p><p className="font-medium">{user?.phoneNumber}</p></div>
        </div>
      </Card>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminProfile />;
  if (user?.role === "worker") return <WorkerProfile />;
  return <StudentProfile />;
}
