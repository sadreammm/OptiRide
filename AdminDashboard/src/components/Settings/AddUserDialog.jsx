import { useState } from "react";
import { Plus, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/utils/hooks/use-toast";
import { authService } from "@/utils/services/auth.service";

export function AddUserDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get current user info to determine access level
  const user = JSON.parse(localStorage.getItem("optiride_user") || "{}");
  const currentUserAccessLevel = user.access_level || 1;
  const isAdminHead = currentUserAccessLevel >= 2;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone_number: "",
    name: "",
    role: "driver", // Default to driver
    department: "",
    access_level: 1,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      phone_number: "",
      name: "",
      role: "driver",
      department: "",
      access_level: 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate phone number format
      if (formData.phone_number && !formData.phone_number.startsWith("+")) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must start with + and country code (e.g., +1234567890)",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Prepare the data to send
      const userData = {
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number || null,
        name: formData.name,
        role: formData.role,
      };

      // Add admin-specific fields if creating an administrator
      if (formData.role === "administrator") {
        userData.department = formData.department;
        userData.access_level = formData.access_level;
      }

      // Call the API
      const response = await authService.createUser(userData);

      toast({
        title: "Success!",
        description: `${formData.role === "driver" ? "Driver" : "Administrator"} created successfully.`,
      });

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new {isAdminHead ? "driver or administrator" : "driver"} account.
            {!isAdminHead && " (Only admin heads can create administrator accounts)"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* User Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">User Type *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={!isAdminHead}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Driver</span>
                    </div>
                  </SelectItem>
                  {isAdminHead && (
                    <SelectItem value="administrator">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Administrator</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                />
              </div>
            </div>

            {/* Administrator-Specific Fields */}
            {formData.role === "administrator" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="Operations"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access_level">Access Level *</Label>
                    <Select
                      value={formData.access_level.toString()}
                      onValueChange={(value) => handleInputChange("access_level", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Level 1 - Admin (Can create drivers)</SelectItem>
                        <SelectItem value="2">Level 2 - Admin Head (Can create admins & drivers)</SelectItem>
                        <SelectItem value="3">Level 3 - Senior Admin Head</SelectItem>
                        <SelectItem value="4">Level 4 - Director</SelectItem>
                        <SelectItem value="5">Level 5 - Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
