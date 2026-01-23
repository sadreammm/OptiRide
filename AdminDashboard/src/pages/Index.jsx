import { useState } from "react";
import LoginPage from "./LoginPage";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { FleetDashboard } from "@/components/admin/FleetDashboard";
import { DriverMonitoring } from "@/components/admin/DriverMonitoring";
import { SafetyAlerts } from "@/components/admin/SafetyAlerts";
import { Analytics } from "@/components/admin/Analytics";
import { Settings } from "@/components/admin/Settings";
const Index = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const handleLogout = () => {
        setActiveTab("dashboard");
        setIsLoggedIn(false);
    };
    if (!isLoggedIn) {
        return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
    }
    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <FleetDashboard />;
            case "drivers":
                return <DriverMonitoring />;
            case "alerts":
                return <SafetyAlerts />;
            case "analytics":
                return <Analytics />;
            case "settings":
                return <Settings onLogout={handleLogout} />;
            default:
                return <FleetDashboard />;
        }
    };
    return (<div className="flex min-h-screen bg-background">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 ml-64">
            <Header />
            <main className="overflow-auto">
                {renderContent()}
            </main>
        </div>
    </div>);
};
export default Index;

