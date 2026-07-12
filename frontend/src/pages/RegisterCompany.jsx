import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  companyName: z.string().min(2, "Company name required"),
  registrationNumber: z.string().min(2, "Registration number required"),
  companyEmail: z.string().email("Valid company email required"),
  companyPhone: z.string().min(7, "Valid phone required"),
  address: z.string().optional(),
  adminName: z.string().min(2, "Your name required"),
  adminEmail: z.string().email("Valid email required"),
  adminPhone: z.string().min(7, "Valid phone required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterCompany() {
  const { registerCompany } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const user = await registerCompany({
        company: {
          name: values.companyName,
          registrationNumber: values.registrationNumber,
          email: values.companyEmail,
          phone: values.companyPhone,
          address: values.address,
        },
        admin: {
          name: values.adminName,
          email: values.adminEmail,
          phone: values.adminPhone,
          password: values.password,
        },
      });
      toast.success("Company registered! Welcome aboard.");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-800">Register your company</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">You'll be set up as the company admin.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-slate-700 mb-2">Company details</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company name" error={errors.companyName}>
                <input {...register("companyName")} className={inputClass} />
              </Field>
              <Field label="Registration number" error={errors.registrationNumber}>
                <input {...register("registrationNumber")} className={inputClass} />
              </Field>
              <Field label="Company email" error={errors.companyEmail}>
                <input {...register("companyEmail")} type="email" className={inputClass} />
              </Field>
              <Field label="Company phone" error={errors.companyPhone}>
                <input {...register("companyPhone")} className={inputClass} />
              </Field>
            </div>
            <Field label="Address (optional)" error={errors.address}>
              <input {...register("address")} className={inputClass} />
            </Field>
          </fieldset>

          <fieldset className="space-y-4 pt-4 border-t border-slate-100">
            <legend className="text-sm font-medium text-slate-700 mb-2">Admin (your) details</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Your name" error={errors.adminName}>
                <input {...register("adminName")} className={inputClass} />
              </Field>
              <Field label="Your email" error={errors.adminEmail}>
                <input {...register("adminEmail")} type="email" className={inputClass} />
              </Field>
              <Field label="Your phone" error={errors.adminPhone}>
                <input {...register("adminPhone")} className={inputClass} />
              </Field>
              <Field label="Password" error={errors.password}>
                <input {...register("password")} type="password" className={inputClass} />
              </Field>
            </div>
          </fieldset>

          <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-800 disabled:opacity-50">
            {submitting ? "Creating..." : "Create company"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Already registered? <Link to="/login" className="text-slate-900 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-red-500 mt-1 block">{error.message}</span>}
    </label>
  );
}