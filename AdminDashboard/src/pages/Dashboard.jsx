import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Header />
                <main className="overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
