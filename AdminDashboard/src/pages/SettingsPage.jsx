import { Settings } from "../components/Settings/settingsComponent";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return <Settings onLogout={handleLogout} />;
};

export default SettingsPage;
