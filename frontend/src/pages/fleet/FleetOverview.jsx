import { useEffect, useState } from "react";
import api from "../../api/axios";
import KpiCard from "../../components/KpiCard";

export default function FleetOverview() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/dashboard")
      .then(({ data }) => setDashboard(data.dashboard))
      .catch(() => setError("Could not load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400 text-sm">Loading dashboard...</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!dashboard) return null;

  const { vehicles, drivers, trips, fleetUtilization } = dashboard;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Fleet Overview</h1>
        <p className="text-sm text-slate-500">Your vehicles and drivers at a glance.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KpiCard label="Available Vehicles" value={vehicles.available} sublabel={`${vehicles.total} total`} />
        <KpiCard label="Vehicles In Shop" value={vehicles.maintenance} />
        <KpiCard label="Fleet Utilization" value={`${fleetUtilization}%`} />
        <KpiCard label="Available Drivers" value={drivers.available} sublabel={`${drivers.total} total`} />
        <KpiCard label="Drivers On Trip" value={drivers.active} />
        <KpiCard label="Pending Trips" value={trips.pending} />
      </div>
    </div>
  );
}