import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Header() {
    const user = JSON.parse(localStorage.getItem("optiride_user"));
    const initials = user.name.split(" ")[0][0] + user.name.split(" ")[1][0];
    return (
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
            {/* Search */}
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 bg-secondary border-0" />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user.user_type}</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {initials}
                </Badge>
            </div>
        </header>
    );
}
