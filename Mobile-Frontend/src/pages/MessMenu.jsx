import { useEffect, useState } from "react";

import * as api from "../api/api";

import {
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  Input,
  Pagination,
  SectionTitle,
  Select,
  Spinner,
  SuccessNote,
  errMsg,
} from "../components/UI";

import { useAuth } from "../context/AuthContext";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

function toList(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* =========================================================
   STUDENT LUNCH BOX
   ========================================================= */

function LunchBoxCard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.getMyLunchBoxStatus();

      setStatus(res.data);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const book = async () => {
    try {
      setActionLoading(true);
      setError("");
      setNotice("");

      await api.bookLunchBox();

      setNotice("Lunch box booked successfully.");

      await loadStatus();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  const cancel = async () => {
    try {
      setActionLoading(true);
      setError("");
      setNotice("");

      await api.cancelLunchBox();

      setNotice("Lunch box cancelled successfully.");

      await loadStatus();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Spinner />
      </Card>
    );
  }

  const booked = status?.booked === true;
  const collected = status?.status === "collected";

  return (
    <Card accent="pine">
      <SectionTitle title="Lunch Box" />

      <ErrorNote message={error} />
      <SuccessNote message={notice} />

      {booked ? (
        <div className="flex flex-col gap-3">
          <div className="text-sm">
            <span className="font-medium text-ink">
              Today's lunch box:
            </span>{" "}
            <span className="font-semibold capitalize">
              {status?.status || "booked"}
            </span>
          </div>

          {collected ? (
            <p className="text-sm text-inkmute">
              Your lunch box has already been collected.
            </p>
          ) : (
            <Button
              variant="danger"
              onClick={cancel}
              disabled={actionLoading}
            >
              {actionLoading ? "Cancelling…" : "Cancel Lunch Box"}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-inkmute">
            You haven't booked a lunch box for today.
          </p>

          <Button onClick={book} disabled={actionLoading}>
            {actionLoading ? "Booking…" : "Book Lunch Box"}
          </Button>
        </div>
      )}
    </Card>
  );
}

/* =========================================================
   ADMIN MENU FORM
   ========================================================= */

function MenuForm({ onCreated }) {
  const [form, setForm] = useState({
    day: "Monday",
    type: "veg",
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      await api.createMenu({
        day: form.day,
        type: form.type,
        breakfast: toList(form.breakfast),
        lunch: toList(form.lunch),
        snacks: toList(form.snacks),
        dinner: toList(form.dinner),
      });

      onCreated();

      setForm({
        day: "Monday",
        type: "veg",
        breakfast: "",
        lunch: "",
        snacks: "",
        dinner: "",
      });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <ErrorNote message={error} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Day">
            <Select
              value={form.day}
              onChange={(e) =>
                setForm({
                  ...form,
                  day: e.target.value,
                })
              }
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Type">
            <Select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-veg</option>
            </Select>
          </Field>
        </div>

        {MEALS.map((m) => (
          <Field
            key={m}
            label={
              m[0].toUpperCase() +
              m.slice(1) +
              " (comma separated)"
            }
          >
            <Input
              value={form[m]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [m]: e.target.value,
                })
              }
              placeholder="Idli, Sambar, Chutney"
            />
          </Field>
        ))}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Add menu"}
        </Button>
      </form>
    </Card>
  );
}

/* =========================================================
   MENU CARD
   ========================================================= */

function MenuCard({ m, canManage, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const del = async () => {
    try {
      setDeleting(true);

      await api.deleteMenu(m.day, m.type);

      onDeleted();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card accent="pine">
      <div className="flex items-center justify-between mb-2">
        <p className="font-display font-semibold text-sm">
          {m.day} ·{" "}
          <span className="capitalize">{m.type}</span>
        </p>

        {canManage && (
          <Button
            variant="danger"
            className="!py-1 !px-2.5 text-xs"
            onClick={del}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-inkmute">
        <div>
          <span className="font-medium text-ink">
            Breakfast:{" "}
          </span>
          {(m.breakfast || []).join(", ") || "—"}
        </div>

        <div>
          <span className="font-medium text-ink">
            Lunch:{" "}
          </span>
          {(m.lunch || []).join(", ") || "—"}
        </div>

        <div>
          <span className="font-medium text-ink">
            Snacks:{" "}
          </span>
          {(m.snacks || []).join(", ") || "—"}
        </div>

        <div>
          <span className="font-medium text-ink">
            Dinner:{" "}
          </span>
          {(m.dinner || []).join(", ") || "—"}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   MAIN MESS MENU
   ========================================================= */

export default function MessMenu() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [dayFilter, setDayFilter] = useState("");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = (p = 1) => {
    setLoading(true);
    setError("");

    const call = dayFilter
      ? api.getMenuByDay(dayFilter)
      : api.getMenu(p, 10);

    call
      .then((r) => {
        setList(r.data.menu || []);
        setTotalPages(r.data.totalPages || 1);
        setPage(p);
      })
      .catch((e) => {
        if (e?.response?.status === 404) {
          setList([]);
        } else {
          setError(errMsg(e));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load(1);
  }, [dayFilter]);

  return (
    <div className="flex flex-col gap-5">

      {/* =====================================================
          STUDENT LUNCH BOX
          ===================================================== */}

      {!isAdmin && <LunchBoxCard />}

      {/* =====================================================
          ADMIN ADD MENU
          ===================================================== */}

      {isAdmin && (
        <div>
          <SectionTitle title="Add a menu" />

          <SuccessNote message={notice} />

          <MenuForm
            onCreated={() => {
              setNotice("Menu added.");
              load(1);
            }}
          />
        </div>
      )}

      {/* =====================================================
          MESS MENU
          ===================================================== */}

      <div>
        <SectionTitle
          title="Mess menu"
          action={
            <Select
              value={dayFilter}
              onChange={(e) =>
                setDayFilter(e.target.value)
              }
              className="!w-auto"
            >
              <option value="">All days</option>

              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          }
        />

        <ErrorNote message={error} />

        {loading ? (
          <Spinner />
        ) : list.length === 0 ? (
          <EmptyState
            title="No menu found"
            hint="Check back once the hostel posts this week's menu."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((m) => (
              <MenuCard
                key={m._id}
                m={m}
                canManage={isAdmin}
                onDeleted={() => load(page)}
              />
            ))}
          </div>
        )}

        {!dayFilter && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={load}
          />
        )}
      </div>
    </div>
  );
}