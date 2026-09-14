import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Button, ErrorNote, SuccessNote, Input } from "../components/UI";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (!email) navigate("/login", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.verifyOtp(email, otp);
      login(res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setNotice("");
    try {
      await api.resendOtp(email);
      setNotice("A new code is on its way.");
      setCooldown(30);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm bg-white rounded-pass p-6">
        <h1 className="font-display font-semibold text-xl text-ink mb-1">Enter your code</h1>
        <p className="text-sm text-inkmute mb-5">We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>.</p>

        <form onSubmit={submit}>
          <ErrorNote message={error} />
          <SuccessNote message={notice} />
          <Input
            inputMode="numeric"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="6-digit code"
            className="text-center tracking-[0.5em] text-lg font-display mb-4"
          />
          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying…" : "Verify & continue"}
          </Button>
        </form>

        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="w-full text-center text-sm text-navy font-medium mt-4 disabled:text-inkmute"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
