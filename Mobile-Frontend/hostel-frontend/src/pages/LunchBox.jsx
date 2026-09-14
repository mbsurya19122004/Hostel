import React, { useEffect, useState } from "react";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Card, SectionTitle, Field, Input, Button, Spinner, ErrorNote, SuccessNote, EmptyState, Badge, statusTone, errMsg } from "../components/UI";

function StudentLunchBox() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.getMyLunchBoxStatus().then((r) => setStatus(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(load, []);

  const book = async () => { setBusy(true); setError(""); setNotice(""); try { await api.bookLunchBox(); setNotice("Lunchbox booked for today."); load(); } catch (e) { setError(errMsg(e)); } finally { setBusy(false); } };
  const cancel = async () => { setBusy(true); setError(""); setNotice(""); try { await api.cancelLunchBox(); setNotice("Booking cancelled."); load(); } catch (e) { setError(errMsg(e)); } finally { setBusy(false); } };

  if (!status) return <Spinner label="Loading lunchbox status" />;

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title="Today's lunchbox" subtitle="Booking closes at 11:00 PM" />
      <ErrorNote message={error} />
      <SuccessNote message={notice} />
      <Card accent={status.booked ? "pine" : "line"}>
        {status.booked ? (
          <>
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">You're booked in for today</p>
              <Badge tone={statusTone(status.status)}>{status.status}</Badge>
            </div>
            {status.status !== "collected" && (
              <Button variant="danger" className="mt-3 !py-1.5 !px-3 text-xs" disabled={busy} onClick={cancel}>Cancel booking</Button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-inkmute mb-3">{status.message}</p>
            <Button disabled={busy} onClick={book}>{busy ? "Booking…" : "Book lunchbox for today"}</Button>
          </>
        )}
      </Card>
    </div>
  );
}

function WorkerLunchBox() {
  const [list, setList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => {
    setLoading(true); setError("");
    api.getTodayLunchBoxes().then((r) => setList(r.data.lunchBoxes)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
    api.getTodayLunchBoxSummary().then((r) => setSummary(r.data)).catch(() => {});
  };
  useEffect(load, []);

  const runSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return load();
    setLoading(true); setError("");
    try { const r = await api.getTodayLunchBoxesByCollege(search.trim()); setList(r.data.lunchBoxes); }
    catch (err) { if (err?.response?.status === 404) setList([]); else setError(errMsg(err)); }
    finally { setLoading(false); }
  };

  const collect = async (id) => {
    setBusy(id); setError(""); setNotice("");
    try { await api.collectLunchBox(id); setNotice("Marked collected."); load(); }
    catch (err) { setError(errMsg(err)); } finally { setBusy(""); }
  };

  return (
    <div className="flex flex-col gap-5">
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <Card accent="navy" className="text-center"><p className="text-lg font-display font-semibold">{summary.totalBooked}</p><p className="text-[11px] text-inkmute">Booked</p></Card>
          <Card accent="pine" className="text-center"><p className="text-lg font-display font-semibold">{summary.totalCollected}</p><p className="text-[11px] text-inkmute">Collected</p></Card>
          <Card accent="mustard" className="text-center"><p className="text-lg font-display font-semibold">{summary.totalPending}</p><p className="text-[11px] text-inkmute">Pending</p></Card>
        </div>
      )}
      <form onSubmit={runSearch} className="flex gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student or college" />
        <Button type="submit">Search</Button>
      </form>
      <ErrorNote message={error} />
      <SuccessNote message={notice} />
      {loading ? <Spinner /> : list.length === 0 ? (
        <EmptyState title="No lunchboxes to show" />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((lb) => {
            const u = lb.studentId?.userId;
            return (
              <Card key={lb._id} accent={statusTone(lb.status)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{u?.username || "Student"}</p>
                    <p className="text-xs text-inkmute">Room {lb.studentId?.roomNo} · {lb.studentId?.collegeName}</p>
                  </div>
                  <Badge tone={statusTone(lb.status)}>{lb.status}</Badge>
                </div>
                {lb.status !== "collected" && (
                  <Button className="mt-2 !py-1.5 !px-3 text-xs" disabled={busy === lb._id} onClick={() => collect(lb._id)}>Mark collected</Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LunchBox() {
  const { user } = useAuth();
  return user?.role === "worker" ? <WorkerLunchBox /> : <StudentLunchBox />;
}
