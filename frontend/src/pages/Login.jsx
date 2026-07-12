import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      if (user.roles.includes("COMPANY_ADMIN")) navigate("/admin");
      else navigate("/fleet");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-800">Log in</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Welcome back to TransitOps.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          New company? <Link to="/register" className="text-slate-900 font-medium">Register here</Link>
        </p>
      </div>
    </div>
  );
}

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";