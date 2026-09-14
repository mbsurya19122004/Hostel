import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Complaints from "./pages/Complaints";
import MessMenu from "./pages/MessMenu";
import Fees from "./pages/Fees";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Rooms from "./pages/Rooms";
import Bus from "./pages/Bus";
import Kyc from "./pages/Kyc";
import Announcements from "./pages/Announcements";
import Workers from "./pages/Workers";
import LunchBox from "./pages/LunchBox";
import Leave from "./pages/Leave";

function Protected({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/complaints" element={<Protected><Complaints /></Protected>} />
      <Route path="/mess" element={<Protected><MessMenu /></Protected>} />
      <Route path="/fees" element={<Protected><Fees /></Protected>} />
      <Route path="/bus" element={<Protected><Bus /></Protected>} />
      <Route path="/kyc" element={<Protected><Kyc /></Protected>} />
      <Route path="/announcements" element={<Protected><Announcements /></Protected>} />
      <Route path="/leave" element={<Protected><Leave /></Protected>} />
      <Route path="/lunchbox" element={<Protected roles={["student", "worker"]}><LunchBox /></Protected>} />
      <Route path="/students" element={<Protected roles={["admin", "student"]}><Students /></Protected>} />
      <Route path="/students/:studentId" element={<Protected roles={["admin"]}><StudentDetail /></Protected>} />
      <Route path="/rooms" element={<Protected roles={["admin"]}><Rooms /></Protected>} />
      <Route path="/workers" element={<Protected roles={["admin"]}><Workers /></Protected>} />

      <Route path="*" element={<Protected><Dashboard /></Protected>} />
    </Routes>
  );
}
