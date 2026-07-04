import { useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import AdminDashboard from "./pages/AdminDashboard";

export default function AppAdmin() {
    const [view, setView] = useState("admin-login");
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
        () => !!sessionStorage.getItem("adminToken")
    );

    if (isAdminLoggedIn)
        return (
            <AdminDashboard
                onLogout={() => {
                    sessionStorage.removeItem("adminToken");
                    sessionStorage.removeItem("adminInfo");
                    setIsAdminLoggedIn(false);
                    setView("admin-login");
                }}
            />
        );

    if (view === "admin-signup")
        return <AdminSignup onBack={() => setView("admin-login")} />;

    return (
        <AdminLogin
            onLogin={() => setIsAdminLoggedIn(true)}
            onSignup={() => setView("admin-signup")}
            onUserLogin={() => { }}
        />
    );
}