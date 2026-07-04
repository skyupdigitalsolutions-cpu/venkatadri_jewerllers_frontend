import { useState } from "react";
import AdminLogin     from "./pages/AdminLogin";
import AdminSignup    from "./pages/AdminSignup";
import UserLogin      from "./pages/UserLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard  from "./pages/UserDashboard";

export default function App() {
  const [view,           setView]           = useState("admin-login");
  const [isAdminLoggedIn,setIsAdminLoggedIn] = useState(() => !!sessionStorage.getItem("adminToken"));
  const [isUserLoggedIn, setIsUserLoggedIn]  = useState(() => !!sessionStorage.getItem("userToken"));

  // ── Admin dashboard ──
  if (isAdminLoggedIn)
    return <AdminDashboard onLogout={() => {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminInfo");
      setIsAdminLoggedIn(false);
      setView("admin-login");
    }} />;

  // ── User dashboard ──
  if (isUserLoggedIn)
    return <UserDashboard onLogout={() => {
      sessionStorage.removeItem("userToken");
      sessionStorage.removeItem("userInfo");
      setIsUserLoggedIn(false);
      setView("user-login");
    }} />;

  // ── Admin signup ──
  if (view === "admin-signup")
    return <AdminSignup onBack={() => setView("admin-login")} />;

  // ── User login / register ──
  if (view === "user-login")
    return (
      <UserLogin
        onLogin={(data) => {
          setIsUserLoggedIn(true);
        }}
        onAdminLogin={() => setView("admin-login")}
      />
    );

  // ── Admin login (default) ──
  return (
    <AdminLogin
      onLogin={() => setIsAdminLoggedIn(true)}
      onSignup={() => setView("admin-signup")}
      onUserLogin={() => setView("user-login")}
    />
  );
}