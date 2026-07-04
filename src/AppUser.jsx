import { useState } from "react";
import UserLogin from "./pages/UserLogin";
import UserDashboard from "./pages/UserDashboard";

export default function AppUser() {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(
        () => !!sessionStorage.getItem("userToken")
    );

    if (isUserLoggedIn)
        return (
            <UserDashboard
                onLogout={() => {
                    sessionStorage.removeItem("userToken");
                    sessionStorage.removeItem("userInfo");
                    setIsUserLoggedIn(false);
                }}
            />
        );

    // onAdminLogin NOT passed → the "Go to Admin Login" button auto-hides
    return <UserLogin onLogin={() => setIsUserLoggedIn(true)} />;
}