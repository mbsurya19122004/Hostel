import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import * as api from "../api/api";
import { Card, SectionTitle, Field, Input, Button, Spinner, ErrorNote, SuccessNote, Badge, statusTone, money, errMsg } from "../components/UI";

export default function StudentDetail() {
  const { studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [profile, setProfile] = useState(null);
  const [pendingFees, setPendingFees] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [newRoom, setNewRoom] = useState("");
  const [installAmounts, setInstallAmounts] = useState({});
  const [busy, setBusy] = useState("");

  const load = () => {
    api.studentProfile(studentId).then((r) => {
      setProfile(r.data);
      setEditForm({
        course: r.data.course || "", collegeName: r.data.collegeName || "", year: r.data.year || "",
        guardianName: r.data.guardianName || "", guardianPhone: r.data.guardianPhone || "",
      });
    }).catch((e) => setError(errMsg(e)));
    api.getStudentPendingFees(studentId).then((r) => setPendingFees(r.data)).catch(() => setPendingFees({ fees: [], totalPending: 0 }));
  };
  useEffect(load, [studentId]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!userId) { setError("Missing user reference — reopen this page from the students list."); return; }
    setBusy("profile"); setError(""); setNotice("");
    try {
      await api.updateProfileByAdmin(userId, editForm);
      setNotice("Profile updated.");
      load();
    } catch (err) { setError(errMsg(err)); } finally { setBusy(""); }
  };

  const shiftRoom = async () => {
    if (!newRoom.trim()) return;
    setBusy("room"); setError(""); setNotice("");
    try {
      await api.shiftStudentRoom(studentId, newRoom.trim().toUpperCase());
      setNotice("Room shifted.");
      setNewRoom("");
      load();
    } catch (err) { setError(errMsg(err)); } finally { setBusy(""); }
  };

  const updateInstallment = async (feeId, installmentId, markAsPaid) => {
    const amount = installAmounts[installmentId];
    if (!amount) { setError("Enter an amount first."); return; }
    setBusy(installmentId); setError(""); setNotice("");
    try {
      await api.updateStudentInstallmentByAdmin(studentId, installmentId, { amount: Number(amount), markAsPaid });
      setNotice(markAsPaid ? "Installment marked as paid." : "Installment amount updated.");
      load();
    } catch (err) { setError(errMsg(err)); } finally { setBusy(""); }
  };

  const removeStudent = async () => {
    if (!userId) { setError("Missing user reference — reopen this page from the students list."); return; }
    if (!confirm("Remove this student from the hostel? This marks them as a past resident.")) return;
    setBusy("delete"); setError("");
    try {
      await api.deleteStudent(userId);
      navigate("/students");
    } catch (err) { setError(errMsg(err)); setBusy(""); }
  };

  if (error && !profile) return <ErrorNote message={error} />;
  if (!profile) return <Spinner label="Loading student" />;

  return (
    <div className="flex flex-col gap-5">
      <ErrorNote message={error} />
      <SuccessNote message={notice} />

      <Card accent="navy">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-semibold text-lg">{profile.username}</p>
            <p className="text-xs text-inkmute">{profile.email} · {profile.phoneNumber}</p>
          </div>
          <Button variant="danger" className="!py-1.5 !px-3 text-xs" disabled={busy === "delete"} onClick={removeStudent}>Remove</Button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <div><p className="text-xs text-inkmute">Room</p><p className="font-medium">{profile.roomNo}</p></div>
          <div><p className="text-xs text-inkmute">Aadhaar</p><p className="font-medium">{profile.aadhar}</p></div>
        </div>
      </Card>

      <div>
        <SectionTitle title="Shift room" />
        <Card>
          <div className="flex gap-2">
            <Input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="New room number" />
            <Button disabled={busy === "room"} onClick={shiftRoom}>{busy === "room" ? "Shifting…" : "Shift"}</Button>
          </div>
        </Card>
      </div>

      <div>
        <SectionTitle title="Course & guardian details" />
        <Card>
          <form onSubmit={saveProfile}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Course"><Input value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} /></Field>
              <Field label="Year"><Input value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} /></Field>
              <Field label="College"><Input value={editForm.collegeName} onChange={(e) => setEditForm({ ...editForm, collegeName: e.target.value })} /></Field>
              <Field label="Guardian name"><Input value={editForm.guardianName} onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })} /></Field>
              <Field label="Guardian phone"><Input value={editForm.guardianPhone} onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })} /></Field>
            </div>
            <Button type="submit" disabled={busy === "profile"}>{busy === "profile" ? "Saving…" : "Save"}</Button>
          </form>
        </Card>
      </div>

      <div>
        <SectionTitle title="Pending fees" subtitle={`Total pending: ${money(pendingFees?.totalPending || 0)}`} />
        {(pendingFees?.fees || []).length === 0 ? (
          <Card><p className="text-sm text-inkmute">No pending installments.</p></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingFees.fees.map((fee) => (
              <div key={fee._id}>
                <p className="text-xs font-medium text-inkmute mb-2 capitalize">{fee.feeType} fee</p>
                <div className="flex flex-col gap-2">
                  {fee.installments.filter((i) => i.status === "pending").map((inst) => (
                    <Card key={inst._id} accent={statusTone(inst.status)}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">Currently {money(inst.amount)}</p>
                        <Badge tone="mustard">pending</Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="number" placeholder="New amount"
                          value={installAmounts[inst._id] || ""}
                          onChange={(e) => setInstallAmounts({ ...installAmounts, [inst._id]: e.target.value })}
                        />
                        <Button variant="subtle" className="!px-3 text-xs" disabled={busy === inst._id} onClick={() => updateInstallment(fee._id, inst._id, false)}>Update</Button>
                        <Button className="!px-3 text-xs" disabled={busy === inst._id} onClick={() => updateInstallment(fee._id, inst._id, true)}>Mark paid</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
