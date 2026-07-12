import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "../../api/axios";

const ROLE_OPTIONS = ["FLEET_MANAGER", "SAFETY_OFFICER", "EXPENSE_MANAGER", "FINANCIAL_ANALYST"];

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  roles: z.array(z.string()).min(1, "Select at least one role"),
});

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { roles: [] },
  });

  async function loadUsers() {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.data);
    } catch {
      toast.error("Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await api.post("/users", values);
      toast.success("Manager account created.");
      reset({ roles: [] });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Managers & Employees</h1>
        <p className="text-sm text-slate-500">Create fleet managers, safety officers, and other roles.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-slate-600">Name</span>
          <input {...register("name")} className={inputClass} />
          {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Email</span>
          <input {...register("email")} type="email" className={inputClass} />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Password</span>
          <input {...register("password")} type="password" className={inputClass} />
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Phone</span>
          <input {...register("phone")} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Employee ID</span>
          <input {...register("employeeId")} className={inputClass} />
        </label>
        <fieldset className="block">
          <span className="text-sm text-slate-600">Role</span>
          <div className="mt-1 space-y-1">
            {ROLE_OPTIONS.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" value={role} {...register("roles")} />
                {role.replace("_", " ")}
              </label>
            ))}
          </div>
          {errors.roles && <span className="text-xs text-red-500">{errors.roles.message}</span>}
        </fieldset>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Creating..." : "Create user"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Roles</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.roles.join(", ")}</td>
                <td className="px-4 py-2">{u.isActive ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";