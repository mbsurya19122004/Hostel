import { useEffect, useState } from "react";
import * as api from "../api/api";
import { errMsg } from "./UI";

function LunchBoxCard() {
  const [booked, setBooked] = useState(false);
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

      setBooked(res.data.booked);
      setStatus(res.data.status);
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

      setNotice("Lunchbox booked successfully!");
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

      setNotice("Lunchbox booking cancelled.");
      await loadStatus();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card accent="pine">
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-inkmute">
            Checking lunchbox status...
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card accent="pine">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display font-semibold text-sm">
            Today's Lunchbox
          </p>

          <p className="text-xs text-inkmute mt-1">
            Book your lunchbox before 9:00 AM.
          </p>
        </div>

        {booked ? (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "collected"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {status === "collected" ? "Collected" : "Booked"}
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Not booked
          </span>
        )}
      </div>

      <div className="mt-4">
        {error && <ErrorNote message={error} />}
        {notice && <SuccessNote message={notice} />}

        {!booked ? (
          <Button
            onClick={book}
            disabled={actionLoading}
          >
            {actionLoading ? "Booking..." : "Book Lunchbox"}
          </Button>
        ) : status === "collected" ? (
          <p className="text-sm text-inkmute">
            Your lunchbox has already been collected.
          </p>
        ) : (
          <Button
            variant="danger"
            onClick={cancel}
            disabled={actionLoading}
          >
            {actionLoading ? "Cancelling..." : "Cancel Lunchbox"}
          </Button>
        )}
      </div>
    </Card>
  );
}

