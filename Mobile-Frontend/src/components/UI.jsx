import React from "react";

export function Button({ variant = "primary", className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-navy text-white hover:bg-navydeep",
    accent: "bg-mustard text-navydeep hover:bg-mustarkdark",
    ghost: "bg-transparent text-navy border border-line hover:bg-white",
    danger: "bg-brick text-white hover:bg-[#8f2e24]",
    subtle: "bg-white text-ink border border-line hover:border-navy",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
      {children}
      {hint && <span className="block text-xs text-inkmute mt-1">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-inkmute/70 focus:border-navy outline-none"
      {...props}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-inkmute/70 focus:border-navy outline-none"
      rows={4}
      {...props}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-navy outline-none"
      {...props}
    >
      {children}
    </select>
  );
}

export function Card({ accent = "navy", className = "", children }) {
  const accents = {
    navy: "border-l-navy",
    mustard: "border-l-mustard",
    brick: "border-l-brick",
    pine: "border-l-pine",
    line: "border-l-line",
  };
  return (
    <div className={`bg-card border border-line ${accents[accent]} border-l-4 rounded-card p-4 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h2 className="font-display font-semibold text-lg text-ink leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-inkmute mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ tone = "navy", children }) {
  const tones = {
    navy: "bg-navy/10 text-navy",
    mustard: "bg-mustard/20 text-mustarkdark",
    brick: "bg-brick/10 text-brick",
    pine: "bg-pine/10 text-pine",
    grey: "bg-line/60 text-inkmute",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function statusTone(status) {
  if (!status) return "grey";
  const s = status.toLowerCase();
  if (["resolved", "paid", "approved", "collected", "available"].includes(s)) return "pine";
  if (["pending", "booked", "out"].includes(s)) return "mustard";
  if (["rejected", "full"].includes(s)) return "brick";
  return "navy";
}

export function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-2.5 text-inkmute text-sm py-6 justify-center">
      <span className="h-4 w-4 rounded-full border-2 border-line border-t-navy animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="text-center py-10 px-4 border border-dashed border-line rounded-card bg-white/60">
      <p className="font-display font-medium text-ink">{title}</p>
      {hint && <p className="text-sm text-inkmute mt-1">{hint}</p>}
    </div>
  );
}

export function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <div className="bg-brick/10 border border-brick/30 text-brick text-sm rounded-card px-3.5 py-2.5 mb-4">
      {message}
    </div>
  );
}

export function SuccessNote({ message }) {
  if (!message) return null;
  return (
    <div className="bg-pine/10 border border-pine/30 text-pine text-sm rounded-card px-3.5 py-2.5 mb-4">
      {message}
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</Button>
      <span className="text-inkmute">Page {page} of {totalPages}</span>
      <Button variant="ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  );
}

export function money(n) {
  const v = Number(n) || 0;
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function errMsg(err, fallback = "Something went wrong. Try again.") {
  return err?.response?.data?.message || err?.message || fallback;
}
