import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "../../api/axios";

const EXPENSE_CATEGORIES = ["TOLL", "MAINTENANCE", "FOOD", "LODGING", "PARKING", "OTHER"];

const fuelSchema = z.object({
  vehicle: z.string().min(1, "Select a vehicle"),
  liters: z.coerce.number().positive("Must be greater than 0"),
  totalCost: z.coerce.number().min(0, "Required"),
  odometerKm: z.coerce.number().min(0, "Required"),
  fuelStation: z.string().optional(),
  filledAt: z.string().optional(),
});

const expenseSchema = z.object({
  vehicle: z.string().optional(),
  category: z.string().min(1, "Select a category"),
  amount: z.coerce.number().min(0, "Required"),
  expenseDate: z.string().optional(),
  description: z.string().optional(),
});

export default function FuelExpensePage() {
  const [tab, setTab] = useState("fuel");
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [vehiclesRes, fuelRes, expenseRes] = await Promise.all([
        api.get("/vehicles", { params: { limit: 100 } }),
        api.get("/api/fuel"),
        api.get("/api/expenses"),
      ]);
      setVehicles(vehiclesRes.data.data);
      setFuelLogs(fuelRes.data.fuelLogs);
      setExpenses(expenseRes.data.expenses);
    } catch {
      toast.error("Could not load fuel/expense data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Fuel & Expenses</h1>
        <p className="text-sm text-slate-500">Log fuel fill-ups and other operational expenses.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <TabButton active={tab === "fuel"} onClick={() => setTab("fuel")}>Fuel logs</TabButton>
        <TabButton active={tab === "expense"} onClick={() => setTab("expense")}>Expenses</TabButton>
      </div>

      {tab === "fuel" ? (
        <FuelSection vehicles={vehicles} fuelLogs={fuelLogs} loading={loading} onSaved={loadAll} />
      ) : (
        <ExpenseSection vehicles={vehicles} expenses={expenses} loading={loading} onSaved={loadAll} />
      )}
    </div>
  );
}

function FuelSection({ vehicles, fuelLogs, loading, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(fuelSchema) });

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await api.post("/api/fuel", values);
      toast.success("Fuel log added.");
      reset();
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add fuel log.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Vehicle" error={errors.vehicle}>
          <select {...register("vehicle")} className={inputClass}>
            <option value="">Select vehicle</option>
            {vehicles.map((v) => <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name}</option>)}
          </select>
        </Field>
        <Field label="Fuel station" error={errors.fuelStation}>
          <input {...register("fuelStation")} className={inputClass} />
        </Field>
        <Field label="Liters" error={errors.liters}>
          <input {...register("liters")} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Total cost" error={errors.totalCost}>
          <input {...register("totalCost")} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Odometer (km)" error={errors.odometerKm}>
          <input {...register("odometerKm")} type="number" className={inputClass} />
        </Field>
        <Field label="Filled at" error={errors.filledAt}>
          <input {...register("filledAt")} type="date" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Saving..." : "Add fuel log"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Liters</th>
              <th className="px-4 py-2">Cost</th>
              <th className="px-4 py-2">₹/L</th>
              <th className="px-4 py-2">Station</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : fuelLogs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No fuel logs yet.</td></tr>
            ) : fuelLogs.map((f) => (
              <tr key={f._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{f.vehicle?.registrationNumber}</td>
                <td className="px-4 py-2">{new Date(f.filledAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">{f.liters}</td>
                <td className="px-4 py-2">₹{f.totalCost}</td>
                <td className="px-4 py-2">₹{f.costPerLiter?.toFixed(2)}</td>
                <td className="px-4 py-2">{f.fuelStation || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpenseSection({ vehicles, expenses, loading, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(expenseSchema) });

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await api.post("/api/expenses", values);
      toast.success("Expense recorded.");
      reset();
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add expense.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category" error={errors.category}>
          <select {...register("category")} className={inputClass}>
            <option value="">Select category</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Vehicle (optional)" error={errors.vehicle}>
          <select {...register("vehicle")} className={inputClass}>
            <option value="">Not vehicle-specific</option>
            {vehicles.map((v) => <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name}</option>)}
          </select>
        </Field>
        <Field label="Amount" error={errors.amount}>
          <input {...register("amount")} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Date" error={errors.expenseDate}>
          <input {...register("expenseDate")} type="date" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description" error={errors.description}>
            <input {...register("description")} className={inputClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Saving..." : "Add expense"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No expenses yet.</td></tr>
            ) : expenses.map((e) => (
              <tr key={e._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{e.category}</td>
                <td className="px-4 py-2">{e.vehicle?.registrationNumber || "—"}</td>
                <td className="px-4 py-2">₹{e.amount}</td>
                <td className="px-4 py-2">{new Date(e.expenseDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    e.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : e.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                  }`}>{e.status}</span>
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

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
        active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}