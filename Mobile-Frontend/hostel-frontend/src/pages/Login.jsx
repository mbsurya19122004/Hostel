import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api/api";
import { Button, Field, Input, ErrorNote } from "../components/UI";

const ROLES = [
  { key: "student", label: "Student" },
  { key: "admin", label: "Admin" },
  { key: "worker", label: "Worker" },
];

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const call = { student: api.loginStudent, admin: api.loginAdmin, worker: api.loginWorker }[role];
      await call(email);
      navigate("/verify-otp", { state: { email, role } });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-md bg-mustard flex items-center justify-center font-display font-bold text-navydeep text-lg">H</div>
          <div>
            <p className="font-display font-semibold text-white text-xl leading-tight">Hostelly</p>
            <p className="text-white/60 text-sm leading-tight">Your hostel, one pass away</p>
          </div>
        </div>

        <div className="bg-white rounded-pass p-6">
          <h1 className="font-display font-semibold text-xl text-ink mb-1">Sign in</h1>
          <p className="text-sm text-inkmute mb-5">We'll send a one-time code to your email.</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`rounded-card border py-2 text-sm font-medium transition-colors ${
                  role === r.key ? "border-navy bg-navy text-white" : "border-line text-inkmute"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            <ErrorNote message={error} />
            <Field label="Email address">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
            </Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending code…" : "Send code"}
            </Button>
          </form>
        </div>
        <p className="text-white/50 text-xs text-center mt-5">
          New students and workers are added by hostel admins.
        </p>
      </div>
    </div>
  );
}
