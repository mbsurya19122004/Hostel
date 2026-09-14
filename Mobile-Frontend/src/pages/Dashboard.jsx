import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/api";
import { Card, errMsg, ErrorNote, money, SectionTitle, Spinner } from "../components/UI";
import { useAuth } from "../context/AuthContext";

function Stat({ label, value, accent }) {
  return (
    <Card accent={accent} className="flex flex-col gap-0.5">
      <span className="text-xs text-inkmute font-medium">{label}</span>
      <span className="font-display font-semibold text-2xl text-ink">{value}</span>
    </Card>
  );
}

function StudentHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.studentDashboard().then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorNote message={error} />;
  if (!data) return <Spinner label="Loading your dashboard" />;

  const { profile, room, complaints, fees, messMenu } = data;
  const pendingAmount = (fees || []).reduce((sum, fee) => {
    const p = (fee.installments || []).filter((i) => i.status === "pending").reduce((s, i) => s + Number(i.amount || 0), 0);
    return sum + p;
  }, 0);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysMenu = (messMenu || [])[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-navy rounded-pass p-5 text-white">
        <p className="text-white/60 text-xs font-medium">Welcome back</p>
        <p className="font-display font-semibold text-2xl">{profile?.userId?.username}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
          <span>Room {room?.roomNo || "—"}</span>
          <span>·</span>
          <span>{profile?.collegeName}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Pending fee" value={money(pendingAmount)} accent="brick" />
        <Stat label="Open complaints" value={complaints?.pendingComplaints ?? 0} accent="mustard" />
      </div>

      <div>
        <SectionTitle title={`${today}'s mess menu`} action={<Link to="/mess" className="text-sm font-medium text-navy">See week</Link>} />
        {todaysMenu ? (
          <Card>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-inkmute mb-1">Breakfast</p>{todaysMenu.breakfast?.join(", ") || "—"}</div>
              <div><p className="text-xs text-inkmute mb-1">Lunch</p>{todaysMenu.lunch?.join(", ") || "—"}</div>
              <div><p className="text-xs text-inkmute mb-1">Snacks</p>{todaysMenu.snacks?.join(", ") || "—"}</div>
              <div><p className="text-xs text-inkmute mb-1">Dinner</p>{todaysMenu.dinner?.join(", ") || "—"}</div>
            </div>
          </Card>
        ) : (
          <Card accent="line"><p className="text-sm text-inkmute">Menu not posted yet.</p></Card>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/complaints"><Card accent="navy"><p className="font-medium text-sm">File a complaint</p><p className="text-xs text-inkmute mt-0.5">Report a room or mess issue</p></Card></Link>
        <Link to="/mess"><Card accent="pine"><p className="font-medium text-sm">Book lunchbox</p><p className="text-xs text-inkmute mt-0.5">For when you'll miss lunch</p></Card></Link>
        <Link to="/leave"><Card accent="mustard"><p className="font-medium text-sm">Apply for outing</p><p className="text-xs text-inkmute mt-0.5">Let the hostel know</p></Card></Link>
        <Link to="/kyc"><Card accent="line"><p className="font-medium text-sm">KYC status</p><p className="text-xs text-inkmute mt-0.5">Verify your identity docs</p></Card></Link>
      </div>
    </div>
  );
}

function AdminHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminDashboard().then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorNote message={error} />;
  if (!data) return <Spinner label="Loading dashboard" />;

  const { students, rooms, complaints, fees } = data;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-navy rounded-pass p-5 text-white">
        <p className="text-white/60 text-xs font-medium">Hostel overview</p>
        <p className="font-display font-semibold text-2xl">{students.activeStudents} residents today</p>
      </div>

      <div>
        <SectionTitle title="Students" action={<Link to="/students" className="text-sm font-medium text-navy">Manage</Link>} />
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Resident" value={students.activeStudents} accent="pine" />
          <Stat label="Past" value={students.pastStudents} accent="line" />
          <Stat label="Total" value={students.totalStudents} accent="navy" />
        </div>
      </div>

      <div>
        <SectionTitle title="Rooms" action={<Link to="/rooms" className="text-sm font-medium text-navy">Manage</Link>} />
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Available" value={rooms.availableRooms} accent="pine" />
          <Stat label="Occupied" value={rooms.occupiedRooms} accent="mustard" />
          <Stat label="Total" value={rooms.totalRooms} accent="navy" />
        </div>
      </div>

      <div>
        <SectionTitle title="Complaints" action={<Link to="/complaints" className="text-sm font-medium text-navy">Review</Link>} />
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Pending" value={complaints.pendingComplaints} accent="brick" />
          <Stat label="Resolved" value={complaints.resolvedComplaints} accent="pine" />
          <Stat label="Total" value={complaints.totalComplaints} accent="navy" />
        </div>
      </div>

      <div>
        <SectionTitle title="Fees" action={<Link to="/fees" className="text-sm font-medium text-navy">Review</Link>} />
        <Stat label="Pending across hostel" value={money(fees.pendingFees)} accent="brick" />
      </div>
    </div>
  );
}

function WorkerHome() {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    api.getTodayLunchBoxSummary().then((r) => setSummary(r.data)).catch(() => {});
  }, []);
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-navy rounded-pass p-5 text-white">
        <p className="text-white/60 text-xs font-medium">Lunchbox desk</p>
        <p className="font-display font-semibold text-2xl">Today's collections</p>
      </div>
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Booked" value={summary.totalBooked} accent="navy" />
          <Stat label="Collected" value={summary.totalCollected} accent="pine" />
          <Stat label="Pending" value={summary.totalPending} accent="mustard" />
        </div>
      )}
      <Link to="/lunchbox"><Card accent="navy"><p className="font-medium text-sm">Open lunchbox desk</p><p className="text-xs text-inkmute mt-0.5">Search students and mark collections</p></Card></Link>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminHome />;
  if (user?.role === "worker") return <WorkerHome />;
  return <StudentHome />;
}
