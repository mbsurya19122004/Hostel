import React, { useState } from "react";
import * as api from "../api/api";
import { Card, SectionTitle, Field, Input, Button, ErrorNote, SuccessNote, errMsg } from "../components/UI";

export default function Workers() {
  const [form, setForm] = useState({
    username: "", email: "", phoneNumber: "", aadhar: "", city: "", state: "", pincode: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const [removeId, setRemoveId] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [removeNotice, setRemoveNotice] = useState("");
  const [removing, setRemoving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNotice(""); setSaving(true);
    try {
      const { city, state, pincode, ...rest } = form;
      await api.registerWorker({ ...rest, address: { city, state, pincode } });
      setNotice("Worker registered. They'll receive a login OTP by email once they sign in.");
      setForm({ username: "", email: "", phoneNumber: "", aadhar: "", city: "", state: "", pincode: "" });
    } catch (err) { setError(errMsg(err)); } finally { setSaving(false); }
  };

  const remove = async (e) => {
    e.preventDefault();
    setRemoveError(""); setRemoveNotice(""); setRemoving(true);
    try {
      await api.removeWorker(removeId.trim());
      setRemoveNotice("Worker removed.");
      setRemoveId("");
    } catch (err) { setRemoveError(errMsg(err)); } finally { setRemoving(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionTitle title="Register a worker" subtitle="Mess, lunchbox, and facility staff logins" />
        <Card>
          <form onSubmit={submit}>
            <ErrorNote message={error} />
            <SuccessNote message={notice} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name"><Input required value={form.username} onChange={set("username")} /></Field>
              <Field label="Email"><Input required type="email" value={form.email} onChange={set("email")} /></Field>
              <Field label="Phone"><Input required value={form.phoneNumber} onChange={set("phoneNumber")} /></Field>
              <Field label="Aadhaar"><Input required value={form.aadhar} onChange={set("aadhar")} /></Field>
              <Field label="City"><Input required value={form.city} onChange={set("city")} /></Field>
              <Field label="State"><Input required value={form.state} onChange={set("state")} /></Field>
              <Field label="Pincode"><Input required value={form.pincode} onChange={set("pincode")} /></Field>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Registering…" : "Register worker"}</Button>
          </form>
        </Card>
      </div>

      <div>
        <SectionTitle title="Remove a worker" />
        <Card>
          <form onSubmit={remove}>
            <ErrorNote message={removeError} />
            <SuccessNote message={removeNotice} />
            <Field label="Worker's user ID (Mongo _id)">
              <Input required value={removeId} onChange={(e) => setRemoveId(e.target.value)} />
            </Field>
            <Button type="submit" variant="danger" disabled={removing}>{removing ? "Removing…" : "Remove worker"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
