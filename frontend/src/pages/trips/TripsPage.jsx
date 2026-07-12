import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "../../api/axios";

const schema = z.object({
  vehicle: z.string().min(1, "Select a vehicle"),
  driver: z.string().min(1, "Select a driver"),
  source: z.string().min(1, "Required"),
  destination: z.string().min(1, "Required"),
  cargoWeightKg: z.coerce.number().positive("Must be greater than 0"),
  plannedDistanceKm: z.coerce.number().positive("Must be greater than 0"),
  revenue: z.coerce.number().min(0).optional(),
});

const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-600",
  DISPATCHED: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get("/api/trips"),
        api.get("/vehicles", { params: { status: "AVAILABLE", limit: 100 } }),
        api.get("/drivers", { params: { status: "AVAILABLE", limit: 100 } }),
      ]);
      setTrips(tripsRes.data.data);
      setVehicles(vehiclesRes.data.data);
      setDrivers(driversRes.data.data);
    } catch {
      toast.error("Could not load trips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await api.post("/api/trips", values);
      toast.success("Trip created as DRAFT.");
      reset();
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create trip.");
    } finally {
      setSubmitting(false);
    }
  }

  async function dispatchTrip(trip) {
    const dispatchOdometerKm = window.prompt("Dispatch odometer (km)?", trip.vehicle?.odometerKm ?? "0");
    if (dispatchOdometerKm === null) return;
    setActionId(trip._id);
    try {
      await api.post(`/api/trips/${trip._id}/dispatch`, { dispatchOdometerKm: Number(dispatchOdometerKm) });
      toast.success("Trip dispatched.");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not dispatch trip.");
    } finally {
      setActionId(null);
    }
  }

  async function completeTrip(trip) {
    const completionOdometerKm = window.prompt("Completion odometer (km)?");
    if (completionOdometerKm === null) return;
    setActionId(trip._id);
    try {
      await api.post(`/api/trips/${trip._id}/complete`, { completionOdometerKm: Number(completionOdometerKm) });
      toast.success("Trip completed.");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not complete trip.");
    } finally {
      setActionId(null);
    }
  }

  async function cancelTrip(trip) {
    if (!window.confirm("Cancel this trip?")) return;
    setActionId(trip._id);
    try {
      await api.post(`/api/trips/${trip._id}/cancel`, {});
      toast.success("Trip cancelled.");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel trip.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Trips</h1>
        <p className="text-sm text-slate-500">Create, dispatch, and complete trips.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Vehicle" error={errors.vehicle}>
          <select {...register("vehicle")} className={inputClass}>
            <option value="">Select available vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name} ({v.maximumLoadCapacityKg}kg)</option>
            ))}
          </select>
        </Field>
        <Field label="Driver" error={errors.driver}>
          <select {...register("driver")} className={inputClass}>
            <option value="">Select available driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>{d.user?.name} — {d.licenseNumber}</option>
            ))}
          </select>
        </Field>
        <Field label="Source" error={errors.source}>
          <input {...register("source")} className={inputClass} />
        </Field>
        <Field label="Destination" error={errors.destination}>
          <input {...register("destination")} className={inputClass} />
        </Field>
        <Field label="Cargo weight (kg)" error={errors.cargoWeightKg}>
          <input {...register("cargoWeightKg")} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Planned distance (km)" error={errors.plannedDistanceKm}>
          <input {...register("plannedDistanceKm")} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Revenue (optional)" error={errors.revenue}>
          <input {...register("revenue")} type="number" step="0.01" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Creating..." : "Create trip (Draft)"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Trip #</th>
              <th className="px-4 py-2">Route</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : trips.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No trips yet.</td></tr>
            ) : trips.map((t) => (
              <tr key={t._id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{t.tripNumber}</td>
                <td className="px-4 py-2">{t.source} → {t.destination}</td>
                <td className="px-4 py-2">{t.vehicle?.registrationNumber}</td>
                <td className="px-4 py-2">{t.driver?.licenseNumber}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[t.status]}`}>{t.status}</span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  {t.status === "DRAFT" && (
                    <>
                      <ActionButton disabled={actionId === t._id} onClick={() => dispatchTrip(t)}>Dispatch</ActionButton>
                      <ActionButton disabled={actionId === t._id} onClick={() => cancelTrip(t)} tone="danger">Cancel</ActionButton>
                    </>
                  )}
                  {t.status === "DISPATCHED" && (
                    <>
                      <ActionButton disabled={actionId === t._id} onClick={() => completeTrip(t)}>Complete</ActionButton>
                      <ActionButton disabled={actionId === t._id} onClick={() => cancelTrip(t)} tone="danger">Cancel</ActionButton>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      {children}
      {error && <span className="text-xs text-red-500 mt-1 block">{error.message}</span>}
    </label>
  );
}

function ActionButton({ children, tone = "default", ...props }) {
  const toneClass = tone === "danger" ? "text-red-600 hover:text-red-800" : "text-slate-700 hover:text-slate-900";
  return (
    <button {...props} className={`text-xs font-medium underline underline-offset-2 disabled:opacity-40 ${toneClass}`}>
      {children}
    </button>
  );
}