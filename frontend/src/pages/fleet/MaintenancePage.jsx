import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "../../api/axios";

const TYPES = ["PREVENTIVE", "REPAIR", "INSPECTION", "OTHER"];

const schema = z.object({
  vehicle: z.string().min(1, "Select a vehicle"),
  type: z.string().min(1, "Select a type"),
  title: z.string().min(2, "Required"),
  description: z.string().optional(),
  vendor: z.string().optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
});

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [closingId, setClosingId] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v._id, v]));

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [maintenanceRes, availableRes, allVehiclesRes] = await Promise.all([
        api.get("/api/maintenance"),
        api.get("/vehicles", { params: { status: "AVAILABLE", limit: 100 } }),
        api.get("/vehicles", { params: { limit: 100 } }),
      ]);
      setRecords(maintenanceRes.data.maintenance);
      setVehicles(availableRes.data.data);
      // merge in all vehicles too, so closed/in-shop records still show a name
      setVehicles((prev) => {
        const map = new Map(prev.map((v) => [v._id, v]));
        allVehiclesRes.data.data.forEach((v) => map.set(v._id, v));
        return [...map.values()];
      });
    } catch {
      toast.error("Could not load maintenance records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await api.post("/api/maintenance", values);
      toast.success("Maintenance record created. Vehicle moved to In Shop.");
      reset();
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create record.");
    } finally {
      setSubmitting(false);
    }
  }

  async function closeRecord(id) {
    if (!window.confirm("Close this maintenance record and mark the vehicle Available?")) return;
    setClosingId(id);
    try {
      await api.put(`/api/maintenance/${id}/close`);
      toast.success("Maintenance closed. Vehicle is Available again.");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not close record.");
    } finally {
      setClosingId(null);
    }
  }

  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Maintenance</h1>
        <p className="text-sm text-slate-500">Opening a record moves the vehicle to "In Shop" and hides it from dispatch.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Vehicle" error={errors.vehicle}>
          <select {...register("vehicle")} className={inputClass}>
            <option value="">Select available vehicle</option>
            {availableVehicles.map((v) => (
              <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Type" error={errors.type}>
          <select {...register("type")} className={inputClass}>
            <option value="">Select type</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Title" error={errors.title}>
          <input {...register("title")} placeholder="Oil change" className={inputClass} />
        </Field>
        <Field label="Vendor" error={errors.vendor}>
          <input {...register("vendor")} className={inputClass} />
        </Field>
        <Field label="Estimated cost" error={errors.estimatedCost}>
          <input {...register("estimatedCost")} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Description" error={errors.description}>
          <input {...register("description")} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Creating..." : "Open maintenance record"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Opened</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No maintenance records yet.</td></tr>
            ) : records.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{vehicleMap[r.vehicle?._id || r.vehicle]?.registrationNumber || r.vehicle?.registrationNumber}</td>
                <td className="px-4 py-2">{r.type}</td>
                <td className="px-4 py-2">{r.title}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.status === "ACTIVE" ? "bg-amber-100 text-amber-700" : r.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>{r.status}</span>
                </td>
                <td className="px-4 py-2">{new Date(r.openedAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  {r.status === "ACTIVE" && (
                    <button
                      disabled={closingId === r._id}
                      onClick={() => closeRecord(r._id)}
                      className="text-xs font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2 disabled:opacity-40"
                    >
                      Close (mark Available)
                    </button>
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