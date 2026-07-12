import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "../../api/axios";

const schema = z.object({
  registrationNumber: z.string().min(2, "Required"),
  name: z.string().min(2, "Required"),
  make: z.string().optional(),
  model: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  maximumLoadCapacityKg: z.coerce.number().positive("Must be greater than 0"),
  odometerKm: z.coerce.number().min(0).optional(),
  acquisitionCost: z.coerce.number().min(0, "Required"),
  region: z.string().optional(),
});

export default function AddVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function loadVehicles() {
    setLoading(true);
    try {
      const { data } = await api.get("/vehicles");
      setVehicles(data.data);
    } catch {
      toast.error("Could not load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadVehicles(); }, []);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await api.post("/vehicles", values);
      toast.success("Vehicle added.");
      reset();
      loadVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add vehicle.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Vehicles</h1>
        <p className="text-sm text-slate-500">Register a vehicle to the fleet.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Registration number" error={errors.registrationNumber}>
          <input {...register("registrationNumber")} className={inputClass} />
        </Field>
        <Field label="Vehicle name" error={errors.name}>
          <input {...register("name")} className={inputClass} />
        </Field>
        <Field label="Make" error={errors.make}>
          <input {...register("make")} className={inputClass} />
        </Field>
        <Field label="Model" error={errors.model}>
          <input {...register("model")} className={inputClass} />
        </Field>
        <Field label="Type" error={errors.type}>
          <input {...register("type")} placeholder="Van, Truck, Bike..." className={inputClass} />
        </Field>
        <Field label="Max load capacity (kg)" error={errors.maximumLoadCapacityKg}>
          <input {...register("maximumLoadCapacityKg")} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Odometer (km)" error={errors.odometerKm}>
          <input {...register("odometerKm")} type="number" className={inputClass} />
        </Field>
        <Field label="Acquisition cost" error={errors.acquisitionCost}>
          <input {...register("acquisitionCost")} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Region" error={errors.region}>
          <input {...register("region")} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Adding..." : "Add vehicle"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Reg. No.</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : vehicles.map((v) => (
              <tr key={v._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{v.registrationNumber}</td>
                <td className="px-4 py-2">{v.name}</td>
                <td className="px-4 py-2">{v.type}</td>
                <td className="px-4 py-2">{v.status}</td>
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