import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../../api/axios";
import KpiCard from "../../components/KpiCard";

const COLORS = ["#0f172a", "#64748b", "#94a3b8", "#cbd5e1"];

export default function AdminOverview() {
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

  const { vehicles, drivers, trips, costs, fleetUtilization } = dashboard;

  const vehicleChartData = [
    { name: "Available", value: vehicles.available },
    { name: "On Trip", value: vehicles.active },
    { name: "In Shop", value: vehicles.maintenance },
    { name: "Retired", value: vehicles.retired },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Admin Overview</h1>
        <p className="text-sm text-slate-500">Fleet-wide snapshot for your company.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Vehicles" value={vehicles.total} sublabel={`${vehicles.available} available`} />
        <KpiCard label="Vehicles In Shop" value={vehicles.maintenance} />
        <KpiCard label="Fleet Utilization" value={`${fleetUtilization}%`} />
        <KpiCard label="Total Drivers" value={drivers.total} sublabel={`${drivers.available} available`} />
        <KpiCard label="Drivers On Trip" value={drivers.active} />
        <KpiCard label="Active Trips" value={trips.active} sublabel={`${trips.pending} pending`} />
        <KpiCard label="Completed Trips" value={trips.completed} />
        <KpiCard label="Total Operational Cost" value={`₹${costs.total.toLocaleString("en-IN")}`} sublabel={`Fuel ₹${costs.fuel} · Maint. ₹${costs.maintenance} · Exp. ₹${costs.expenses}`} />
      </div>

      {vehicleChartData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Vehicle status breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={vehicleChartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                {vehicleChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}