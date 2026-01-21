import { useState } from "react";
import { User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "code" | "password">("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const resetForgotState = () => {
    setForgotEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetStep("email");
  };

  const handleForgotOpenChange = (open: boolean) => {
    setForgotOpen(open);
    if (!open) {
      resetForgotState();
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setResetError("Please enter your email.");
      return;
    }
    setResetError("");
    setResetStep("code");
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setResetError("Enter the verification code we sent to your email.");
      return;
    }
    setResetError("");
    setResetStep("password");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setResetError("Enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetError("");
    // Placeholder: send email + code + newPassword to backend
    handleForgotOpenChange(false);
  };

  return (
    <div className="min-h-screen gradient-login flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo Card */}
        <div className="bg-card rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/optiride.png"
              alt="OptiRide logo"
              className="h-15 w-15 drop-shadow-xl"
              loading="lazy"
            />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12 bg-secondary border-0"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-secondary border-0"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
            >
              LOGIN
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => handleForgotOpenChange(true)}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={handleForgotOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              {resetStep === "email" && "Enter the email associated with your account to receive a code."}
              {resetStep === "code" && `We sent a verification code to ${forgotEmail || "your email"}.`}
              {resetStep === "password" && "Enter the code and set your new password."}
            </DialogDescription>
          </DialogHeader>

          {resetStep === "email" && (
            <form className="space-y-4" onSubmit={handleEmailSubmit}>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              {resetError && <p className="text-sm text-destructive">{resetError}</p>}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => handleForgotOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Send code</Button>
              </DialogFooter>
            </form>
          )}

          {resetStep === "code" && (
            <form className="space-y-4" onSubmit={handleCodeSubmit}>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              {resetError && <p className="text-sm text-destructive">{resetError}</p>}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setResetStep("email")}>Back</Button>
                <Button type="submit">Verify code</Button>
              </DialogFooter>
            </form>
          )}

          {resetStep === "password" && (
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {resetError && <p className="text-sm text-destructive">{resetError}</p>}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setResetStep("code")}>Back</Button>
                <Button type="submit">Change password</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}