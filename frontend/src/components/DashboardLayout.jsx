import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_LINKS = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/trips", label: "Trips" },
  { to: "/admin/maintenance", label: "Maintenance" },
  { to: "/admin/fuel-expenses", label: "Fuel & Expenses" },
  { to: "/admin/users", label: "Managers & Employees" },
  { to: "/admin/vehicles", label: "Vehicles" },
  { to: "/admin/drivers", label: "Drivers" },
];

const FLEET_LINKS = [
 { to: "/fleet", label: "Overview", end: true },
  { to: "/fleet/trips", label: "Trips" },
  { to: "/fleet/maintenance", label: "Maintenance" },
  { to: "/fleet/fuel-expenses", label: "Fuel & Expenses" },
  { to: "/fleet/vehicles", label: "Vehicles" },
  { to: "/fleet/drivers", label: "Drivers" },
];

export default function DashboardLayout() {
  const { user, company, hasRole, logout } = useAuth();
  const links = hasRole("COMPANY_ADMIN") ? ADMIN_LINKS : FLEET_LINKS;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <p className="font-semibold text-slate-800">{company?.name || "TransitOps"}</p>
          <p className="text-xs text-slate-400 mt-0.5">{user?.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={logout} className="w-full text-sm text-slate-500 hover:text-slate-800 px-3 py-2 text-left">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}