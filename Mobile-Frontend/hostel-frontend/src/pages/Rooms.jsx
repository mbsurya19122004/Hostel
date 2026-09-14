import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { Card, SectionTitle, Field, Input, Select, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Badge, Pagination, errMsg } from "../components/UI";

function CreateRoomForm({ onDone }) {
  const [form, setForm] = useState({ roomNo: "", floor: "", capacity: "", type: "standard", isAC: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.createRoom({ ...form, capacity: Number(form.capacity) });
      onDone();
      setForm({ roomNo: "", floor: "", capacity: "", type: "standard", isAC: false });
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <ErrorNote message={error} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Room number"><Input required value={form.roomNo} onChange={(e) => setForm({ ...form, roomNo: e.target.value })} /></Field>
          <Field label="Floor"><Input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} /></Field>
          <Field label="Capacity"><Input required type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
            </Select>
          </Field>
        </div>
        <label className="flex items-center gap-2 mb-4 text-sm">
          <input type="checkbox" checked={form.isAC} onChange={(e) => setForm({ ...form, isAC: e.target.checked })} />
          Air-conditioned
        </label>
        <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create room"}</Button>
      </form>
    </Card>
  );
}

function RoomCard({ room, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [capacity, setCapacity] = useState(room.capacity);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    try { await api.updateRoom(room.roomNo, { capacity: Number(capacity) }); setEditing(false); onChanged(); }
    catch (err) { setError(errMsg(err)); }
  };
  const del = async () => {
    if (!confirm(`Delete room ${room.roomNo}?`)) return;
    try { await api.deleteRoom(room.roomNo); onChanged(); } catch (err) { setError(errMsg(err)); }
  };

  const occupied = room.student?.length || 0;
  const full = occupied >= room.capacity;

  return (
    <Card accent={full ? "brick" : "pine"}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-sm">Room {room.roomNo}</p>
          <p className="text-xs text-inkmute capitalize">{room.type} · Floor {room.floor || "—"} · {room.isAC ? "AC" : "Non-AC"}</p>
        </div>
        <Badge tone={full ? "brick" : "pine"}>{occupied}/{room.capacity}</Badge>
      </div>
      {error && <p className="text-xs text-brick mt-2">{error}</p>}
      <div className="flex items-center gap-2 mt-3">
        {editing ? (
          <>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="!py-1.5" />
            <Button className="!py-1.5 !px-3 text-xs" onClick={save}>Save</Button>
            <Button variant="ghost" className="!py-1.5 !px-3 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <Button variant="subtle" className="!py-1.5 !px-3 text-xs" onClick={() => setEditing(true)}>Edit capacity</Button>
            <Button variant="danger" className="!py-1.5 !px-3 text-xs" disabled={occupied > 0} onClick={del}>Delete</Button>
          </>
        )}
      </div>
    </Card>
  );
}

export default function Rooms() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [checkRoom, setCheckRoom] = useState("");
  const [checkResult, setCheckResult] = useState(null);

  const load = (p = 1) => {
    setLoading(true);
    api.getAllRooms(p, 10)
      .then((r) => { setList(r.data.rooms); setTotalPages(r.data.totalPages); setPage(p); })
      .catch((e) => { if (e?.response?.status === 404) setList([]); else setError(errMsg(e)); })
      .finally(() => setLoading(false));
  };
  useEffect(() => load(1), []);

  const checkSpace = async () => {
    if (!checkRoom.trim()) return;
    try { const r = await api.isSpace(checkRoom.trim()); setCheckResult(r.data); }
    catch (err) { setCheckResult({ message: errMsg(err) }); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionTitle title="Check seat availability" />
        <Card>
          <div className="flex gap-2">
            <Input value={checkRoom} onChange={(e) => setCheckRoom(e.target.value)} placeholder="Room number" />
            <Button onClick={checkSpace}>Check</Button>
          </div>
          {checkResult && (
            <p className={`text-sm mt-3 ${checkResult.isAvailable ? "text-pine" : "text-brick"}`}>
              {checkResult.message} {checkResult.availableSeat !== undefined && `(${checkResult.availableSeat} seat${checkResult.availableSeat === 1 ? "" : "s"} left)`}
            </p>
          )}
        </Card>
      </div>

      <div>
        <SectionTitle title="Create a room" />
        <SuccessNote message={notice} />
        <CreateRoomForm onDone={() => { setNotice("Room created."); load(1); }} />
      </div>

      <div>
        <SectionTitle title="All rooms" />
        <ErrorNote message={error} />
        {loading ? <Spinner /> : list.length === 0 ? (
          <EmptyState title="No rooms yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((r) => <RoomCard key={r._id} room={r} onChanged={() => load(page)} />)}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={load} />
      </div>
    </div>
  );
}
