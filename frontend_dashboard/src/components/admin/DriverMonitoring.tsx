import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  MessageSquare,
  MapPin,
  Navigation,
  Package,
  TrendingUp,
  Clock,
  Battery,
  Wifi,
  Camera,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DriverChatDialog, DriverChatTarget } from "./DriverChatDialog";
import { useDrivers, usePolling } from "@/hooks/use-api";
import { DriverResponse } from "@/services/driver.service";

type Driver = {
  id: string;
  name: string;
  status: string;
  location: string;
  fatigue: string;
  speed: string;
  lastActivity: string;
  safetyScore: number;
  ordersToday?: number;
  acceptanceRate?: number;
  idleTime?: string;
  distanceTraveled?: number;
  battery?: number;
  network?: string;
  cameraActive?: boolean;
};

const drivers: Driver[] = [
  { id: "DRV-1021", name: "Ahmed Khan", status: "BREAK", location: "Zone C2", fatigue: "WARNING", speed: "0 km/h", lastActivity: "2 min ago", safetyScore: 87, ordersToday: 12, acceptanceRate: 94, idleTime: "45 min", distanceTraveled: 124, battery: 67, network: "4G Strong", cameraActive: true },
  { id: "DRV-1034", name: "L. Mathew", status: "ON DELIVERY", location: "Zone A3", fatigue: "MILD", speed: "35 km/h", lastActivity: "5 min ago", safetyScore: 92, ordersToday: 8, acceptanceRate: 89, idleTime: "1.2 hrs", distanceTraveled: 98, battery: 82, network: "5G Excellent", cameraActive: true },
  { id: "DRV-1045", name: "Omar Hassan", status: "ON DELIVERY", location: "Zone B1", fatigue: "SEVERE", speed: "45 km/h", lastActivity: "1 min ago", safetyScore: 78, ordersToday: 15, acceptanceRate: 91, idleTime: "30 min", distanceTraveled: 156, battery: 82, network: "4G Strong", cameraActive: true },
  { id: "DRV-1052", name: "J. Francis", status: "ON DELIVERY", location: "Zone D5", fatigue: "NORMAL", speed: "42 km/h", lastActivity: "3 min ago", safetyScore: 95, ordersToday: 10, acceptanceRate: 96, idleTime: "25 min", distanceTraveled: 115, battery: 73, network: "4G Strong", cameraActive: false },
  { id: "DRV-1067", name: "Samuel Martinez", status: "ON DELIVERY", location: "Zone E2", fatigue: "MILD", speed: "38 km/h", lastActivity: "6 min ago", safetyScore: 89, ordersToday: 11, acceptanceRate: 92, idleTime: "35 min", distanceTraveled: 108, battery: 58, network: "4G", cameraActive: true },
  { id: "DRV-1078", name: "Raj Patel", status: "OFFLINE", location: "Zone F9", fatigue: "NORMAL", speed: "0 km/h", lastActivity: "25 min ago", safetyScore: 93, ordersToday: 9, acceptanceRate: 94, idleTime: "2 hrs", distanceTraveled: 87, battery: 34, network: "3G", cameraActive: false },
  { id: "DRV-1089", name: "Miguel Garcia", status: "ON DELIVERY", location: "Zone A3", fatigue: "NORMAL", speed: "40 km/h", lastActivity: "4 min ago", safetyScore: 90, ordersToday: 13, acceptanceRate: 90, idleTime: "50 min", distanceTraveled: 132, battery: 68, network: "4G", cameraActive: true },
  { id: "DRV-1095", name: "David Chen", status: "ON DELIVERY", location: "Zone C2", fatigue: "NORMAL", speed: "55 km/h", lastActivity: "1 min ago", safetyScore: 85, ordersToday: 14, acceptanceRate: 88, idleTime: "40 min", distanceTraveled: 142, battery: 91, network: "5G", cameraActive: true },
  { id: "DRV-1101", name: "Faisal Al-Rashid", status: "ON DELIVERY", location: "Zone B4", fatigue: "NORMAL", speed: "48 km/h", lastActivity: "2 min ago", safetyScore: 96, ordersToday: 16, acceptanceRate: 98, idleTime: "20 min", distanceTraveled: 167, battery: 88, network: "5G Excellent", cameraActive: true },
  { id: "DRV-1112", name: "Michael Torres", status: "ONLINE", location: "Zone A1", fatigue: "MILD", speed: "0 km/h", lastActivity: "10 min ago", safetyScore: 84, ordersToday: 7, acceptanceRate: 86, idleTime: "1.8 hrs", distanceTraveled: 92, battery: 52, network: "4G", cameraActive: true },
  { id: "DRV-1123", name: "Pranav Sharma", status: "ON DELIVERY", location: "Zone E5", fatigue: "NORMAL", speed: "43 km/h", lastActivity: "3 min ago", safetyScore: 91, ordersToday: 12, acceptanceRate: 93, idleTime: "38 min", distanceTraveled: 128, battery: 75, network: "4G Strong", cameraActive: true },
  { id: "DRV-1134", name: "John Williams", status: "BREAK", location: "Zone C5", fatigue: "WARNING", speed: "0 km/h", lastActivity: "7 min ago", safetyScore: 82, ordersToday: 11, acceptanceRate: 87, idleTime: "55 min", distanceTraveled: 119, battery: 61, network: "4G", cameraActive: true },
  { id: "DRV-1145", name: "Arif Mohammed", status: "ON DELIVERY", location: "Zone D2", fatigue: "NORMAL", speed: "37 km/h", lastActivity: "2 min ago", safetyScore: 97, ordersToday: 15, acceptanceRate: 97, idleTime: "28 min", distanceTraveled: 145, battery: 84, network: "5G Excellent", cameraActive: true },
  { id: "DRV-1156", name: "Carlos Rodriguez", status: "ONLINE", location: "Zone F3", fatigue: "MILD", speed: "0 km/h", lastActivity: "12 min ago", safetyScore: 88, ordersToday: 9, acceptanceRate: 91, idleTime: "1.3 hrs", distanceTraveled: 101, battery: 48, network: "4G Moderate", cameraActive: true },
  { id: "DRV-1167", name: "Emil Popov", status: "ON DELIVERY", location: "Zone A5", fatigue: "NORMAL", speed: "46 km/h", lastActivity: "1 min ago", safetyScore: 93, ordersToday: 13, acceptanceRate: 95, idleTime: "32 min", distanceTraveled: 136, battery: 79, network: "5G", cameraActive: true },
  { id: "DRV-1178", name: "Hassan Ibrahim", status: "OFFLINE", location: "Zone B6", fatigue: "NORMAL", speed: "0 km/h", lastActivity: "45 min ago", safetyScore: 89, ordersToday: 10, acceptanceRate: 89, idleTime: "1.5 hrs", distanceTraveled: 112, battery: 29, network: "Offline", cameraActive: false },
  { id: "DRV-1189", name: "Lucas Anderson", status: "ON DELIVERY", location: "Zone C3", fatigue: "MILD", speed: "41 km/h", lastActivity: "4 min ago", safetyScore: 86, ordersToday: 12, acceptanceRate: 88, idleTime: "42 min", distanceTraveled: 126, battery: 71, network: "4G Strong", cameraActive: true },
  { id: "DRV-1190", name: "Mohammed Al-Farsi", status: "ON DELIVERY", location: "Zone E3", fatigue: "NORMAL", speed: "44 km/h", lastActivity: "2 min ago", safetyScore: 94, ordersToday: 14, acceptanceRate: 96, idleTime: "35 min", distanceTraveled: 139, battery: 86, network: "5G Excellent", cameraActive: true },
  { id: "DRV-1201", name: "Nikolas Kowalski", status: "BREAK", location: "Zone D4", fatigue: "MILD", speed: "0 km/h", lastActivity: "8 min ago", safetyScore: 90, ordersToday: 11, acceptanceRate: 92, idleTime: "1 hr", distanceTraveled: 118, battery: 63, network: "4G", cameraActive: true },
  { id: "DRV-1212", name: "Kevin O'Brien", status: "ON DELIVERY", location: "Zone F5", fatigue: "WARNING", speed: "39 km/h", lastActivity: "5 min ago", safetyScore: 81, ordersToday: 10, acceptanceRate: 85, idleTime: "48 min", distanceTraveled: 107, battery: 55, network: "4G", cameraActive: true },
  { id: "DRV-1223", name: "Yuki Tanaka", status: "ONLINE", location: "Zone A2", fatigue: "NORMAL", speed: "0 km/h", lastActivity: "11 min ago", safetyScore: 92, ordersToday: 8, acceptanceRate: 94, idleTime: "1.6 hrs", distanceTraveled: 95, battery: 59, network: "4G Strong", cameraActive: true },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ON DELIVERY":
      return "bg-primary/10 text-primary";
    case "ONLINE":
      return "bg-success/10 text-success";
    case "BREAK":
      return "bg-warning/10 text-warning";
    case "OFFLINE":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getFatigueColor = (level: string) => {
  switch (level) {
    case "NORMAL":
      return "bg-success/10 text-success";
    case "MILD":
      return "bg-primary/10 text-primary";
    case "WARNING":
      return "bg-warning/10 text-warning";
    case "SEVERE":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function DriverMonitoring() {
  const [chatTarget, setChatTarget] = useState<DriverChatTarget | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch drivers from API
  const { data: driversData, refetch } = useDrivers(page * limit, limit);

  // Auto-refresh every 5 seconds
  usePolling(refetch, 5000);

  const drivers = driversData?.drivers || [];
  const totalDrivers = driversData?.total || 0;

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch = 
      driver.vehicle_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.driver_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all-status" || 
      driver.status.toLowerCase() === statusFilter.toLowerCase().replace(" ", "_");

    return matchesSearch && matchesStatus;
  });

  const activeDeliveries = drivers.filter(d => d.status === "BUSY").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Driver Monitoring System</h1>
          <p className="text-muted-foreground">Real-time tracking and safety monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
            {activeDeliveries} Active Deliveries
          </Badge>
          <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">
            {totalDrivers} Total Drivers
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID, plate, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="on_break">On Break</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fatigue Level</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Safety Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        driver.fatigue === 'SEVERE' ? 'bg-destructive/20 text-destructive' :
                        driver.fatigue === 'WARNING' ? 'bg-warning/20 text-warning' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-xs text-muted-foreground">{driver.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(driver.status)} border-0`}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {driver.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getFatigueColor(driver.fatigue)} border-0`}>
                      {driver.fatigue}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{driver.speed}</TableCell>
                  <TableCell className="text-muted-foreground">{driver.lastActivity}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      driver.safetyScore >= 90 ? 'text-success' :
                      driver.safetyScore >= 80 ? 'text-warning' :
                      'text-destructive'
                    }`}>
                      {driver.safetyScore}/100
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setSelectedDriver(driver)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setChatTarget({
                            driverId: driver.id,
                            driverName: driver.name,
                            status: driver.status,
                            location: driver.location,
                          });
                          setIsChatOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DriverChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        target={chatTarget}
      />

      {/* Driver Detail Modal */}
      <Dialog open={selectedDriver !== null} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Driver Profile: {selectedDriver?.name}</DialogTitle>
            <DialogDescription>Real-time monitoring and safety insights</DialogDescription>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-6">
              {/* Driver Info Header */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                  {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground">{selectedDriver.name}</h3>
                  <p className="text-muted-foreground">{selectedDriver.id}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getStatusColor(selectedDriver.status)} border-0`}>
                      {selectedDriver.status}
                    </Badge>
                    <Badge className={`${getFatigueColor(selectedDriver.fatigue)} border-0`}>
                      {selectedDriver.fatigue}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-foreground">Safety Score</div>
                  <div
                    className={`text-3xl ${
                      selectedDriver.safetyScore >= 90
                        ? "text-green-600"
                        : selectedDriver.safetyScore >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {selectedDriver.safetyScore}
                  </div>
                </div>
              </div>

              {/* Live Map Tracking */}
              <Card className="p-4">
                <h4 className="text-foreground mb-4 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Live GPS Tracking
                </h4>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-muted-foreground">Current Location: {selectedDriver.location}</p>
                    <p className="text-muted-foreground">Speed: {selectedDriver.speed}</p>
                  </div>
                </div>
              </Card>

              {/* Operational Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-muted-foreground">Orders Today</span>
                  </div>
                  <p className="text-foreground text-2xl">{selectedDriver.ordersToday ?? 0}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-muted-foreground">Acceptance Rate</span>
                  </div>
                  <p className="text-foreground text-2xl">{selectedDriver.acceptanceRate ?? 0}%</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-muted-foreground">Idle Time</span>
                  </div>
                  <p className="text-foreground text-2xl">{selectedDriver.idleTime ?? 'N/A'}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-purple-600" />
                    <span className="text-muted-foreground">Distance</span>
                  </div>
                  <p className="text-foreground text-2xl">{selectedDriver.distanceTraveled ?? 0} km</p>
                </Card>
              </div>

              {/* Device Status */}
              <Card className="p-4">
                <h4 className="text-foreground mb-4">Device Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Battery
                      className={`w-5 h-5 ${
                        (selectedDriver.battery ?? 0) > 50
                          ? "text-green-600"
                          : (selectedDriver.battery ?? 0) > 20
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    />
                    <div>
                      <p className="text-muted-foreground">Battery</p>
                      <p className="text-foreground">{selectedDriver.battery ?? 0}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-muted-foreground">Network</p>
                      <p className="text-foreground">{selectedDriver.network ?? 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Camera className={`w-5 h-5 ${selectedDriver.cameraActive ? "text-green-600" : "text-red-600"}`} />
                    <div>
                      <p className="text-muted-foreground">Camera</p>
                      <p className="text-foreground">{selectedDriver.cameraActive ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI Recommendations */}
              <Card className="p-4 bg-blue-500/10 border-blue-500/20">
                <h4 className="text-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  AI-Generated Recommendations
                </h4>
                <div className="space-y-2">
                  {selectedDriver.fatigue === "SEVERE" && (
                    <div className="p-3 bg-card rounded border border-red-500/20">
                      <p className="text-red-700">⚠️ Driver has shown critical fatigue levels. Recommend immediate 20-minute break.</p>
                    </div>
                  )}
                  {selectedDriver.fatigue === "WARNING" && (
                    <div className="p-3 bg-card rounded border border-orange-500/20">
                      <p className="text-orange-700">⚠️ Driver has shown increased fatigue in the past hour. Recommend a 10-minute break.</p>
                    </div>
                  )}
                  {(selectedDriver.battery ?? 100) < 40 && (
                    <div className="p-3 bg-card rounded border border-yellow-500/20">
                      <p className="text-yellow-700">🔋 Low battery detected. Suggest driver charges device during next break.</p>
                    </div>
                  )}
                  {!selectedDriver.cameraActive && (
                    <div className="p-3 bg-card rounded border border-red-500/20">
                      <p className="text-red-700">📷 Camera is inactive. Safety monitoring may be compromised.</p>
                    </div>
                  )}
                  {selectedDriver.idleTime?.includes("hr") && (
                    <div className="p-3 bg-card rounded border border-blue-500/20">
                      <p className="text-blue-700">💡 Driver is consistently staying in low-demand areas. Suggest relocating to Zone A3.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Safety History */}
              <Card className="p-4">
                <h4 className="text-foreground mb-4">Safety History (Last 7 Days)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Fatigue Alerts</span>
                    <Badge variant="secondary">{selectedDriver.fatigue === "SEVERE" ? 8 : selectedDriver.fatigue === "WARNING" ? 4 : 1}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Sudden Braking Events</span>
                    <Badge variant="secondary">{selectedDriver.safetyScore < 70 ? 12 : 3}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Phone Movement Irregularities</span>
                    <Badge variant="secondary">{selectedDriver.cameraActive ? 2 : 7}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="text-muted-foreground">Camera-based Drowsiness Events</span>
                    <Badge variant="secondary">{selectedDriver.fatigue === "SEVERE" ? 5 : 0}</Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}