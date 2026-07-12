import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "../../api/axios";

const schema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
  contactNumber: z.string().min(7, "Required"),
  licenseNumber: z.string().min(2, "Required"),
  licenseCategory: z.string().min(1, "Required"),
  licenseExpiryDate: z.string().min(1, "Required"),
});

export default function AddDriver() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function loadDrivers() {
    setLoading(true);
    try {
      const { data } = await api.get("/drivers");
      setDrivers(data.data);
    } catch {
      toast.error("Could not load drivers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDrivers(); }, []);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      // 1) driver ka login account
      const { data: userRes } = await api.post("/users", {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.contactNumber,
        roles: ["DRIVER"],
      });

      // 2) operational driver profile, usi account se linked
      await api.post("/drivers", {
        user: userRes.data._id,
        contactNumber: values.contactNumber,
        licenseNumber: values.licenseNumber,
        licenseCategory: values.licenseCategory,
        licenseExpiryDate: values.licenseExpiryDate,
      });

      toast.success("Driver added.");
      reset();
      loadDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add driver.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Drivers</h1>
        <p className="text-sm text-slate-500">Ye ek submit me login + driver profile dono bana deta hai.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" error={errors.name}>
          <input {...register("name")} className={inputClass} />
        </Field>
        <Field label="Email (login)" error={errors.email}>
          <input {...register("email")} type="email" className={inputClass} />
        </Field>
        <Field label="Password (login)" error={errors.password}>
          <input {...register("password")} type="password" className={inputClass} />
        </Field>
        <Field label="Contact number" error={errors.contactNumber}>
          <input {...register("contactNumber")} className={inputClass} />
        </Field>
        <Field label="License number" error={errors.licenseNumber}>
          <input {...register("licenseNumber")} className={inputClass} />
        </Field>
        <Field label="License category" error={errors.licenseCategory}>
          <input {...register("licenseCategory")} placeholder="LMV, HMV..." className={inputClass} />
        </Field>
        <Field label="License expiry date" error={errors.licenseExpiryDate}>
          <input {...register("licenseExpiryDate")} type="date" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Adding..." : "Add driver"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">License No.</th>
              <th className="px-4 py-2">Expiry</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : drivers.map((d) => (
              <tr key={d._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{d.user?.name}</td>
                <td className="px-4 py-2">{d.licenseNumber}</td>
                <td className="px-4 py-2">{new Date(d.licenseExpiryDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{d.status}</td>
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