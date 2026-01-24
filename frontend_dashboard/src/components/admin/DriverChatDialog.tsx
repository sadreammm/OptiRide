import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export type DriverChatTarget = {
  driverId: string;
  driverName: string;
  status?: string;
  location?: string;
};

export type DriverChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: DriverChatTarget | null;
};

type ChatMessage = {
  id: string;
  sender: "Dispatch" | "Driver";
  text: string;
  time: string;
};

const chatTemplates: Record<string, Omit<ChatMessage, "id">[]> = {
  "DRV-1021": [
    { sender: "Dispatch", text: "Ahmed, fatigue was detected around {location}. Confirm you're pulled over.", time: "Now" },
    { sender: "Driver", text: "Pulled over near the rest stop. Doing stretches.", time: "Just now" },
    { sender: "Dispatch", text: "Thanks. Take 10 minutes before resuming. We'll monitor vitals.", time: "Just now" },
  ],
  "DRV-1034": [
    { sender: "Dispatch", text: "Mathew, you've been driving long. Schedule a break within 10 minutes.", time: "Now" },
    { sender: "Driver", text: "Service area ahead; I'll stop there.", time: "Just now" },
    { sender: "Dispatch", text: "Copy. Let us know once parked so we can mark you resting.", time: "Just now" },
  ],
  "DRV-1045": [
    { sender: "Dispatch", text: "Omar, sensors flagged an impact in {location}. Are you safe?", time: "Now" },
    { sender: "Driver", text: "Minor fender bender. No injuries. Parked on the shoulder.", time: "Just now" },
    { sender: "Dispatch", text: "Understood. Keep hazards on; we can send roadside if needed.", time: "Just now" },
  ],
  "DRV-1052": [
    { sender: "Dispatch", text: "Camera obstruction in {location}. Please check the lens feed.", time: "Now" },
    { sender: "Driver", text: "Pulling over to clean it now.", time: "Just now" },
    { sender: "Dispatch", text: "Thanks. Tell us when video looks clear.", time: "Just now" },
  ],
  "DRV-1067": [
    { sender: "Dispatch", text: "Samuel, mild fatigue indicators in {location}. Can you take a short pause?", time: "Now" },
    { sender: "Driver", text: "Yes, I'll pause after this block.", time: "Just now" },
    { sender: "Dispatch", text: "Great. Ping when stopped so we log the break.", time: "Just now" },
  ],
  "DRV-1078": [
    { sender: "Dispatch", text: "Raj, you're offline in {location}. Need assistance getting back online?", time: "Now" },
    { sender: "Driver", text: "Battery was low. Charging now.", time: "Just now" },
    { sender: "Dispatch", text: "Thanks. Let us know when you're back online.", time: "Just now" },
  ],
  "DRV-1089": [
    { sender: "Dispatch", text: "Miguel, keep an eye on pace in {location}. How's traffic?", time: "Now" },
    { sender: "Driver", text: "Flowing fine, staying at limit.", time: "Just now" },
    { sender: "Dispatch", text: "Good. Maintain posted speeds and update if conditions change.", time: "Just now" },
  ],
  "DRV-1095": [
    { sender: "Dispatch", text: "Speed alert in {location}. Please confirm current speed, David.", time: "Now" },
    { sender: "Driver", text: "Dropping to 50 now; missed the sign.", time: "Just now" },
    { sender: "Dispatch", text: "Copy. Hold posted speed and report stability.", time: "Just now" },
  ],
  "DRV-1101": [
    { sender: "Dispatch", text: "Faisal, strong performance today. Any issues in {location}?", time: "Now" },
    { sender: "Driver", text: "All good. Light traffic.", time: "Just now" },
    { sender: "Dispatch", text: "Great. Keep comms open and call out delays.", time: "Just now" },
  ],
  "DRV-1112": [
    { sender: "Dispatch", text: "Michael, you're idle in {location}. Ready for next task?", time: "Now" },
    { sender: "Driver", text: "Yes, available. Waiting in A1.", time: "Just now" },
    { sender: "Dispatch", text: "Noted. We'll assign the next nearby order.", time: "Just now" },
  ],
  "DRV-1123": [
    { sender: "Dispatch", text: "Pranav, confirm status in {location}. Any delays?", time: "Now" },
    { sender: "Driver", text: "Running on schedule. Clear roads.", time: "Just now" },
    { sender: "Dispatch", text: "Perfect. Keep posted if ETA shifts.", time: "Just now" },
  ],
  "DRV-1134": [
    { sender: "Dispatch", text: "John, fatigue warning earlier. Are you resting now?", time: "Now" },
    { sender: "Driver", text: "Yes, on break in C5.", time: "Just now" },
    { sender: "Dispatch", text: "Good. Resume only when alert; we'll keep monitoring.", time: "Just now" },
  ],
  "DRV-1145": [
    { sender: "Dispatch", text: "Arif, solid metrics in {location}. Any assistance needed?", time: "Now" },
    { sender: "Driver", text: "All smooth. Continuing route.", time: "Just now" },
    { sender: "Dispatch", text: "Thanks. Ping if conditions change.", time: "Just now" },
  ],
  "DRV-1156": [
    { sender: "Dispatch", text: "Carlos, mild fatigue noted. Can you stretch in {location}?", time: "Now" },
    { sender: "Driver", text: "I'll take a 5-minute pause.", time: "Just now" },
    { sender: "Dispatch", text: "Logged. Resume when alert.", time: "Just now" },
  ],
  "DRV-1167": [
    { sender: "Dispatch", text: "Emil, you're cruising in {location}. Any obstacles ahead?", time: "Now" },
    { sender: "Driver", text: "Roads clear. Maintaining speed.", time: "Just now" },
    { sender: "Dispatch", text: "Great. Keep safe spacing and update if congestion builds.", time: "Just now" },
  ],
  "DRV-1178": [
    { sender: "Dispatch", text: "Hassan, you're offline near {location}. Need help with network?", time: "Now" },
    { sender: "Driver", text: "Signal dropped. Rebooting device.", time: "Just now" },
    { sender: "Dispatch", text: "Understood. Notify once reconnected so we can track again.", time: "Just now" },
  ],
  "DRV-1189": [
    { sender: "Dispatch", text: "Lucas, mild fatigue flagged. Can you plan a brief stop?", time: "Now" },
    { sender: "Driver", text: "Yes, stopping after this delivery.", time: "Just now" },
    { sender: "Dispatch", text: "Okay. Confirm when paused so we log it.", time: "Just now" },
  ],
  "DRV-1190": [
    { sender: "Dispatch", text: "Mohammed, maintain current pace in {location}. Any issues?", time: "Now" },
    { sender: "Driver", text: "No issues. Traffic light.", time: "Just now" },
    { sender: "Dispatch", text: "Great. Stay within limits and keep us updated.", time: "Just now" },
  ],
  "DRV-1201": [
    { sender: "Dispatch", text: "Nikolas, on break in {location}. How long until you're ready?", time: "Now" },
    { sender: "Driver", text: "About 10 minutes to wrap up.", time: "Just now" },
    { sender: "Dispatch", text: "Noted. We'll queue the next task accordingly.", time: "Just now" },
  ],
  "DRV-1212": [
    { sender: "Dispatch", text: "Kevin, fatigue warning in {location}. Please slow and confirm status.", time: "Now" },
    { sender: "Driver", text: "Slowing now. Will stop in a safe spot.", time: "Just now" },
    { sender: "Dispatch", text: "Thank you. Take at least 10 minutes before resuming.", time: "Just now" },
  ],
  "DRV-1223": [
    { sender: "Dispatch", text: "Yuki, you're online in {location}. Ready for another assignment?", time: "Now" },
    { sender: "Driver", text: "Yes, standing by.", time: "Just now" },
    { sender: "Dispatch", text: "Great. We'll dispatch the next nearest order.", time: "Just now" },
  ],
};

const buildMessages = (target: DriverChatTarget | null): ChatMessage[] => {
  if (!target) return [];

  const template = chatTemplates[target.driverId];
  const base = (template ?? [
    { sender: "Dispatch", text: "Hi {name}, please confirm you are safe.", time: "Now" },
    { sender: "Driver", text: "All good here.", time: "Just now" },
    { sender: "Dispatch", text: "Acknowledged. Keep us posted and drive carefully.", time: "Just now" },
  ]).map((message) => ({
    ...message,
    text: message.text
      .replace("{name}", target.driverName)
      .replace("{id}", target.driverId)
      .replace("{location}", target.location ?? "your area")
      .replace("{status}", target.status ?? "Active"),
  }));

  return base.map((message, index) => ({
    ...message,
    id: `${target.driverId}-${index}`,
  }));
};

export function DriverChatDialog({ open, onOpenChange, target }: DriverChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setMessages(buildMessages(target));
    setInput("");
  }, [target]);

  const title = useMemo(() => {
    if (!target) return "Chat";
    return `Chat with ${target.driverName}`;
  }, [target]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !target) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        sender: "Dispatch",
        text: trimmed,
        time: "Now",
      },
    ]);
    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {target ? `${target.driverId}${target.location ? ` · ${target.location}` : ""}` : "Send a quick check-in."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-72 rounded border bg-muted/20 px-3 py-2">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "Dispatch" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                    message.sender === "Dispatch"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border text-foreground"
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="mt-1 text-[10px] opacity-80">{message.time}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">Start a conversation with the driver.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Input
            placeholder="Send a quick message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
