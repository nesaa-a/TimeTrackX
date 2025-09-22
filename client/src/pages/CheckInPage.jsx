import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

function CheckInPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [timer, setTimer] = useState("");

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    let interval;
    if (checkInTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - new Date(checkInTime).getTime();
        setTimer(formatDuration(elapsed));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkInTime]);

  useEffect(() => {
    const fetchCheckIn = async () => {
      try {
        const res = await fetch("http://localhost:5051/api/attendance/active", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.checkInTime) {
          setCheckInTime(data.checkInTime);
        }
      } catch (err) {
        console.error("Error fetching active check-in:", err);
      }
    };
    fetchCheckIn();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("http://localhost:5051/api/attendance/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.message);
      } else {
        setStatus(data.message);
        setCheckInTime(data.record.checkInTime);
      }
    } catch (err) {
      setStatus("Server error during check-in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("http://localhost:5051/api/attendance/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.message);
      } else {
        setStatus(data.message);
        setCheckInTime(null);
        setTimer("");
      }
    } catch (err) {
      setStatus("Server error during check-out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-xl p-10 shadow-lg w-full max-w-md border border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl opacity-10 blur-md animate-pulse pointer-events-none"></div>

          <h2 className="text-3xl font-bold mb-6 text-center text-blue-300">
            Attendance Tracker
          </h2>

          <div className="flex flex-col space-y-5">
            <button
              onClick={handleCheckIn}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-semibold transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : "Check In"}
            </button>

            <button
              onClick={handleCheckOut}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : "Check Out"}
            </button>
          </div>

          {checkInTime && (
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">
                Checked in at:{" "}
                <span className="text-white font-medium">
                  {new Date(checkInTime).toLocaleTimeString()}
                </span>
              </p>
              <p className="mt-1 text-lg font-mono text-green-400">
                Elapsed: <span className="font-bold">{timer}</span>
              </p>
            </div>
          )}

          {status && (
            <div
              className={`mt-6 text-center text-sm font-semibold ${
                status.includes("Checked") ? "text-green-400" : "text-red-400"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckInPage;