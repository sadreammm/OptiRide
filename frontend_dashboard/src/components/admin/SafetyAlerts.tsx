import { useMemo, useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Activity,
  Battery,
  Camera,
  CheckCircle,
  Clock,
  CloudRain,
  Download,
  Eye,
  MapPin,
  Navigation,
  Package,
  Search,
  TrendingUp,
  Wifi,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DriverChatDialog, DriverChatTarget } from "./DriverChatDialog";

interface Alert {
  id: string;
  type: "fatigue" | "accident" | "fall" | "speeding" | "device" | "environmental";
  title: string;
  driver: string;
  driverId: string;
  description: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  status: "active" | "acknowledged" | "resolved";
}

interface Driver {
  id: string;
  name: string;
  photo: string;
  status: "online" | "offline" | "on-delivery" | "break";
  location: string;
  fatigueLevel: "normal" | "mild" | "warning" | "severe";
  speed: number;
  lastActivity: string;
  safetyScore: number;
  ordersToday: number;
  acceptanceRate: number;
  idleTime: string;
  distanceTraveled: number;
  battery: number;
  network: string;
  cameraActive: boolean;
}

const severityOrder: Record<Alert["severity"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const severityBorderColor: Record<Alert["severity"], string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
};

const tabActiveClasses: Record<string, string> = {
  all: "data-[state=active]:bg-slate-900 data-[state=active]:text-white",
  fatigue: "data-[state=active]:bg-red-600 data-[state=active]:text-white",
  accident: "data-[state=active]:bg-amber-600 data-[state=active]:text-white",
  fall: "data-[state=active]:bg-purple-600 data-[state=active]:text-white",
  speeding: "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
  device: "data-[state=active]:bg-indigo-600 data-[state=active]:text-white",
  environmental: "data-[state=active]:bg-emerald-600 data-[state=active]:text-white",
};

const parseMinutesAgo = (timestamp: string) => {
  const match = timestamp.match(/(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const getAlertIcon = (type: Alert["type"]) => {
  switch (type) {
    case "fatigue":
      return <Activity className="w-5 h-5" />;
    case "accident":
      return <AlertCircle className="w-5 h-5" />;
    case "fall":
      return <AlertTriangle className="w-5 h-5" />;
    case "speeding":
      return <TrendingUp className="w-5 h-5" />;
    case "device":
      return <Camera className="w-5 h-5" />;
    case "environmental":
      return <CloudRain className="w-5 h-5" />;
    default:
      return <AlertTriangle className="w-5 h-5" />;
  }
};

const getSeverityColor = (severity: Alert["severity"]) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
    case "high":
      return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700";
    case "medium":
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
    case "low":
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700";
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600";
  }
};

const getStatusBadge = (status: Driver["status"]) => {
  const variants = {
    online: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    offline: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    "on-delivery": "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    break: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  };
  return variants[status] || "";
};

const getFatigueBadge = (level: Driver["fatigueLevel"]) => {
  const variants = {
    normal: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    mild: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    warning: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
    severe: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  };
  return variants[level] || "";
};

const getAlertStatusBadge = (status: Alert["status"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">Active</Badge>;
    case "acknowledged":
      return <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">Acknowledged</Badge>;
    case "resolved":
      return <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">Resolved</Badge>;
    default:
      return null;
  }
};

export function SafetyAlerts() {
  const driversData: Record<string, Driver> = {
    "DRV-1021": {
      id: "DRV-1021",
      name: "Ahmed Khan",
      photo: "AK",
      status: "break",
      location: "Zone C2",
      fatigueLevel: "warning",
      speed: 0,
      lastActivity: "2 min ago",
      safetyScore: 87,
      ordersToday: 12,
      acceptanceRate: 94,
      idleTime: "45 min",
      distanceTraveled: 124,
      battery: 67,
      network: "4G Strong",
      cameraActive: true,
    },
    "DRV-1045": {
      id: "DRV-1045",
      name: "Omar Hassan",
      photo: "OH",
      status: "on-delivery",
      location: "Zone B1",
      fatigueLevel: "severe",
      speed: 45,
      lastActivity: "1 min ago",
      safetyScore: 78,
      ordersToday: 15,
      acceptanceRate: 91,
      idleTime: "30 min",
      distanceTraveled: 156,
      battery: 82,
      network: "4G Strong",
      cameraActive: true,
    },
    "DRV-1034": {
      id: "DRV-1034",
      name: "L. Mathew",
      photo: "LM",
      status: "on-delivery",
      location: "Zone A3",
      fatigueLevel: "mild",
      speed: 35,
      lastActivity: "5 min ago",
      safetyScore: 92,
      ordersToday: 8,
      acceptanceRate: 89,
      idleTime: "1.2 hrs",
      distanceTraveled: 98,
      battery: 45,
      network: "4G",
      cameraActive: true,
    },
    "DRV-1052": {
      id: "DRV-1052",
      name: "J. Francis",
      photo: "JF",
      status: "on-delivery",
      location: "Zone D5",
      fatigueLevel: "normal",
      speed: 42,
      lastActivity: "3 min ago",
      safetyScore: 95,
      ordersToday: 10,
      acceptanceRate: 96,
      idleTime: "25 min",
      distanceTraveled: 115,
      battery: 73,
      network: "4G Strong",
      cameraActive: false,
    },
    "DRV-1095": {
      id: "DRV-1095",
      name: "David Chen",
      photo: "DC",
      status: "on-delivery",
      location: "Zone C2",
      fatigueLevel: "normal",
      speed: 55,
      lastActivity: "1 min ago",
      safetyScore: 85,
      ordersToday: 14,
      acceptanceRate: 88,
      idleTime: "40 min",
      distanceTraveled: 142,
      battery: 91,
      network: "5G",
      cameraActive: true,
    },
    "DRV-1067": {
      id: "DRV-1067",
      name: "Samuel Martinez",
      photo: "SM",
      status: "on-delivery",
      location: "Zone E2",
      fatigueLevel: "mild",
      speed: 38,
      lastActivity: "6 min ago",
      safetyScore: 89,
      ordersToday: 11,
      acceptanceRate: 92,
      idleTime: "35 min",
      distanceTraveled: 108,
      battery: 58,
      network: "4G",
      cameraActive: true,
    },
    "DRV-1078": {
      id: "DRV-1078",
      name: "Raj Patel",
      photo: "RP",
      status: "offline",
      location: "Zone F9",
      fatigueLevel: "normal",
      speed: 0,
      lastActivity: "25 min ago",
      safetyScore: 93,
      ordersToday: 9,
      acceptanceRate: 94,
      idleTime: "2 hrs",
      distanceTraveled: 87,
      battery: 34,
      network: "3G",
      cameraActive: false,
    },
    "DRV-1089": {
      id: "DRV-1089",
      name: "Miguel Garcia",
      photo: "MG",
      status: "on-delivery",
      location: "Zone A3",
      fatigueLevel: "normal",
      speed: 40,
      lastActivity: "4 min ago",
      safetyScore: 90,
      ordersToday: 13,
      acceptanceRate: 90,
      idleTime: "50 min",
      distanceTraveled: 132,
      battery: 68,
      network: "4G",
      cameraActive: true,
    },
  };

  const initialAlerts: Alert[] = [
    {
      id: "ALT-1001",
      type: "fatigue",
      title: "High Fatigue Detected",
      driver: "Ahmed Khan",
      driverId: "DRV-1021",
      description: "Blink rate exceeded threshold at 14:32",
      location: "Zone C2",
      severity: "high",
      timestamp: "2 min ago",
      status: "acknowledged",
    },
    {
      id: "ALT-1002",
      type: "accident",
      title: "Accident Detection",
      driver: "Omar Hassan",
      driverId: "DRV-1045",
      description: "Sudden impact detected with high G-force reading",
      location: "Zone B1",
      severity: "critical",
      timestamp: "5 min ago",
      status: "resolved",
    },
    {
      id: "ALT-1003",
      type: "fatigue",
      title: "Fatigue Warning",
      driver: "L. Mathew",
      driverId: "DRV-1034",
      description: "Prolonged driving without breaks - 4 hours continuous",
      location: "Zone A3",
      severity: "medium",
      timestamp: "8 min ago",
      status: "active",
    },
    {
      id: "ALT-1004",
      type: "device",
      title: "Camera Blocked",
      driver: "J. Francis",
      driverId: "DRV-1052",
      description: "Driver camera view obstructed for 15 minutes",
      location: "Zone D5",
      severity: "high",
      timestamp: "12 min ago",
      status: "acknowledged",
    },
    {
      id: "ALT-1005",
      type: "speeding",
      title: "Excessive Speed Detected",
      driver: "David Chen",
      driverId: "DRV-1095",
      description: "Speed exceeded 80 km/h in 50 km/h zone",
      location: "Zone C2",
      severity: "high",
      timestamp: "15 min ago",
      status: "acknowledged",
    },
    {
      id: "ALT-1006",
      type: "environmental",
      title: "Extreme Heat Warning",
      driver: "Samuel Martinez",
      driverId: "DRV-1067",
      description: "External temperature 44°C - Heat stress risk",
      location: "Zone E2",
      severity: "medium",
      timestamp: "20 min ago",
      status: "active",
    },
    {
      id: "ALT-1007",
      type: "fall",
      title: "Sudden Fall Detected",
      driver: "Raj Patel",
      driverId: "DRV-1078",
      description: "Accelerometer detected sudden fall/impact",
      location: "Zone F9",
      severity: "critical",
      timestamp: "25 min ago",
      status: "resolved",
    },
    {
      id: "ALT-1008",
      type: "device",
      title: "GPS Signal Lost",
      driver: "Miguel Garcia",
      driverId: "DRV-1089",
      description: "No GPS signal for 10 minutes",
      location: "Zone A3",
      severity: "medium",
      timestamp: "30 min ago",
      status: "active",
    },
    {
      id: "ALT-1009",
      type: "speeding",
      title: "Sudden Acceleration",
      driver: "Ahmed Khan",
      driverId: "DRV-1021",
      description: "0-60 km/h in under 3 seconds",
      location: "Zone C2",
      severity: "low",
      timestamp: "35 min ago",
      status: "active",
    },
    {
      id: "ALT-1010",
      type: "fatigue",
      title: "Drowsiness Alert",
      driver: "Omar Hassan",
      driverId: "DRV-1045",
      description: "Eye closure duration exceeded safe threshold",
      location: "Zone B1",
      severity: "critical",
      timestamp: "40 min ago",
      status: "resolved",
    },
  ];

  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [sortBy, setSortBy] = useState<string>("time");
  const [chatTarget, setChatTarget] = useState<DriverChatTarget | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const filteredAlerts = useMemo(() => {
    const matches = alerts.filter((alert) => {
      const matchesTab = activeTab === "all" || alert.type === activeTab;
      const matchesSearch =
        alert.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.driverId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      return matchesTab && matchesSearch && matchesSeverity;
    });

    const sorted = [...matches];
    if (sortBy === "severity") {
      sorted.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    } else if (sortBy === "time") {
      sorted.sort((a, b) => parseMinutesAgo(a.timestamp) - parseMinutesAgo(b.timestamp));
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [activeTab, alerts, searchQuery, severityFilter, sortBy]);

  const alertCounts = useMemo(
    () => ({
      all: alerts.length,
      fatigue: alerts.filter((a) => a.type === "fatigue").length,
      accident: alerts.filter((a) => a.type === "accident").length,
      fall: alerts.filter((a) => a.type === "fall").length,
      speeding: alerts.filter((a) => a.type === "speeding").length,
      device: alerts.filter((a) => a.type === "device").length,
      environmental: alerts.filter((a) => a.type === "environmental").length,
    }),
    [alerts]
  );

  const criticalCount = useMemo(
    () => alerts.filter((a) => a.severity === "critical" && a.status === "active").length,
    [alerts]
  );

  const openChatForAlert = (alert: Alert) => {
    setChatTarget({
      driverId: alert.driverId,
      driverName: alert.driver,
      location: alert.location,
      status: alert.status,
    });
    setIsChatOpen(true);
  };

  const handleAcknowledge = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      openChatForAlert(alert);
    }
    setAlerts((prev) =>
      prev.map((alertItem) =>
        alertItem.id === alertId ? { ...alertItem, status: "acknowledged" } : alertItem
      )
    );
  };

  const handleMarkSafe = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const handleExport = () => {
    console.log("Exporting alerts to CSV");
  };

  const handleViewDriver = (driverId: string) => {
    const driver = driversData[driverId];
    if (driver) {
      setSelectedDriver(driver);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">Safety Alerts Panel</h2>
          <p className="text-muted-foreground">Monitor and respond to safety events in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by driver, ID, or alert title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Newest</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabs and Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="all" className={tabActiveClasses.all}>
            All ({alertCounts.all})
          </TabsTrigger>
          <TabsTrigger value="fatigue" className={tabActiveClasses.fatigue}>
            Fatigue ({alertCounts.fatigue})
          </TabsTrigger>
          <TabsTrigger value="accident" className={tabActiveClasses.accident}>
            Accident ({alertCounts.accident})
          </TabsTrigger>
          <TabsTrigger value="fall" className={tabActiveClasses.fall}>
            Fall ({alertCounts.fall})
          </TabsTrigger>
          <TabsTrigger value="speeding" className={tabActiveClasses.speeding}>
            Speeding ({alertCounts.speeding})
          </TabsTrigger>
          <TabsTrigger value="device" className={tabActiveClasses.device}>
            Device ({alertCounts.device})
          </TabsTrigger>
          <TabsTrigger value="environmental" className={tabActiveClasses.environmental}>
            Environmental ({alertCounts.environmental})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredAlerts.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No alerts in this category</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className="p-4 border-l-4"
                  style={{ borderLeftColor: severityBorderColor[alert.severity] }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-foreground font-semibold">{alert.title}</h4>
                            {getAlertStatusBadge(alert.status)}
                          </div>
                          <p className="text-muted-foreground">
                            Driver: <span className="text-foreground">{alert.driver}</span> ({alert.driverId})
                          </p>
                        </div>
                        <Badge className={`${getSeverityColor(alert.severity)} border`}>{alert.severity.toUpperCase()}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">"{alert.description}"</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{alert.location}</span>
                          </div>
                          <span>•</span>
                          <span>{alert.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDriver(alert.driverId)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Driver
                          </Button>
                          {(alert.status === "active" || alert.status === "acknowledged") && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Acknowledge
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleMarkSafe(alert.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Safe
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Alert Timeline */}
      <Card className="p-6">
        <h3 className="text-foreground mb-4">Alert Timeline</h3>
        <div className="space-y-4">
          {alerts.slice(0, 5).map((alert, index) => (
            <div key={alert.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    alert.severity === "critical"
                      ? "bg-red-600"
                      : alert.severity === "high"
                        ? "bg-orange-600"
                        : "bg-yellow-600"
                  }`}
                />
                {index < 4 && <div className="w-0.5 h-12 bg-slate-200 mt-2" />}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-muted-foreground">{alert.timestamp}</p>
                <p className="text-foreground">
                  {alert.title} - <span className="text-muted-foreground">{alert.driver}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Driver Details Dialog */}
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
                  {selectedDriver.photo}
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground">{selectedDriver.name}</h3>
                  <p className="text-muted-foreground">{selectedDriver.id}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusBadge(selectedDriver.status)}>
                      {selectedDriver.status.replace("-", " ").toUpperCase()}
                    </Badge>
                    <Badge className={getFatigueBadge(selectedDriver.fatigueLevel)}>
                      Fatigue: {selectedDriver.fatigueLevel.toUpperCase()}
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
                    <p className="text-muted-foreground">Speed: {selectedDriver.speed} km/h</p>
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
                  <p className="text-foreground text-2xl">{selectedDriver.ordersToday}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-muted-foreground">Acceptance Rate</span>
                  </div>
                  <p className="text-foreground text-2xl">{selectedDriver.acceptanceRate}%</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-muted-foreground">Idle Time</span>
                  </div>
                  <p className="text-foreground text-2xl">{selectedDriver.idleTime}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-purple-600" />
                    <span className="text-muted-foreground">Distance</span>
                  </div>
                  <p className="text-foreground text-2xl">{selectedDriver.distanceTraveled} km</p>
                </Card>
              </div>

              {/* Device Status */}
              <Card className="p-4">
                <h4 className="text-foreground mb-4">Device Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Battery
                      className={`w-5 h-5 ${
                        selectedDriver.battery > 50
                          ? "text-green-600"
                          : selectedDriver.battery > 20
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    />
                    <div>
                      <p className="text-muted-foreground">Battery</p>
                      <p className="text-foreground">{selectedDriver.battery}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-muted-foreground">Network</p>
                      <p className="text-foreground">{selectedDriver.network}</p>
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
              <Card className="p-4 bg-blue-500/10 dark:bg-blue-900/20 border-blue-500/20">
                <h4 className="text-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  AI-Generated Recommendations
                </h4>
                <div className="space-y-2">
                  {selectedDriver.fatigueLevel === "severe" && (
                    <div className="p-3 bg-card rounded border border-red-500/20">
                      <p className="text-red-700 dark:text-red-400">⚠️ Driver has shown critical fatigue levels. Recommend immediate 20-minute break.</p>
                    </div>
                  )}
                  {selectedDriver.fatigueLevel === "warning" && (
                    <div className="p-3 bg-card rounded border border-orange-500/20">
                      <p className="text-orange-700 dark:text-orange-400">⚠️ Driver has shown increased fatigue in the past hour. Recommend a 10-minute break.</p>
                    </div>
                  )}
                  {selectedDriver.battery < 40 && (
                    <div className="p-3 bg-card rounded border border-yellow-500/20">
                      <p className="text-yellow-700 dark:text-yellow-400">🔋 Low battery detected. Suggest driver charges device during next break.</p>
                    </div>
                  )}
                  {!selectedDriver.cameraActive && (
                    <div className="p-3 bg-card rounded border border-red-500/20">
                      <p className="text-red-700 dark:text-red-400">📷 Camera is inactive. Safety monitoring may be compromised.</p>
                    </div>
                  )}
                  {selectedDriver.idleTime.includes("hr") && (
                    <div className="p-3 bg-card rounded border border-blue-500/20">
                      <p className="text-blue-700 dark:text-blue-400">💡 Driver is consistently staying in low-demand areas. Suggest relocating to Zone A3.</p>
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
                    <Badge variant="secondary">{selectedDriver.fatigueLevel === "severe" ? 8 : selectedDriver.fatigueLevel === "warning" ? 4 : 1}</Badge>
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
                    <Badge variant="secondary">{selectedDriver.fatigueLevel === "severe" ? 5 : 0}</Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DriverChatDialog open={isChatOpen} onOpenChange={setIsChatOpen} target={chatTarget} />
    </div>
  );
}
