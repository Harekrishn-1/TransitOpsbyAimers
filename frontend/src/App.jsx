import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import RegisterCompany from "./pages/RegisterCompany";
import Login from "./pages/Login";
import AdminOverview from "./pages/admin/AdminOverview";
import ManageUsers from "./pages/admin/ManageUsers";
import FleetOverview from "./pages/fleet/FleetOverview";
import AddVehicle from "./pages/fleet/AddVehicle";
import AddDriver from "./pages/fleet/AddDriver";
import TripsPage from "./pages/trips/TripsPage";
import MaintenancePage from "./pages/fleet/MaintenancePage";
import FuelExpensePage from "./pages/fleet/FuelExpensePage";
<Route path="/admin/fuel-expenses" element={<FuelExpensePage />} />

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/register" element={<RegisterCompany />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute roles={["COMPANY_ADMIN"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/trips" element={<TripsPage />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/vehicles" element={<AddVehicle />} />
            <Route path="/admin/drivers" element={<AddDriver />} />
            <Route path="/admin/maintenance" element={<MaintenancePage />} />
            <Route path="/admin/fuel-expenses" element={<FuelExpensePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["COMPANY_ADMIN", "FLEET_MANAGER"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/fleet" element={<FleetOverview />} />
            <Route path="/fleet/trips" element={<TripsPage />} />
            <Route path="/fleet/vehicles" element={<AddVehicle />} />
            <Route path="/fleet/drivers" element={<AddDriver />} />
          <Route path="/fleet/maintenance" element={<MaintenancePage />} />
          <Route path="/fleet/fuel-expenses" element={<FuelExpensePage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}