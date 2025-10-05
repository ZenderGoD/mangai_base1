"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Shield, Bell, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const viewer = useQuery(api.users.getCurrentUser);
  const { toast } = useToast();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    email: "",
    language: "en",
    timezone: "UTC",
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showEmail: false,
    showStats: true,
    allowComments: true,
    allowFollowers: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newFollowers: true,
    storyComments: true,
    storyLikes: true,
    systemUpdates: false,
    weeklyDigest: true,
  });

  // Initialize settings from viewer
  useState(() => {
    if (viewer) {
      setAccountSettings({
        email: viewer.email || "",
        language: "en",
        timezone: "UTC",
      });
    }
  });

  const handleSaveAccountSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement account settings update mutation
      toast({
        title: "Settings Saved",
        description: "Your account settings have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement privacy settings update mutation
      toast({
        title: "Privacy Settings Saved",
        description: "Your privacy preferences have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement notification settings update mutation
      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    toast({
      title: "Account Deletion",
      description: "This feature is coming soon.",
    });
    setShowDeleteConfirm(false);
  };

  if (!viewer) {
    return (
      <Card className="p-8 glass text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6">Account Settings</h3>
            
            <div className="space-y-4 max-w-xl">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountSettings.email}
                  disabled
                  className="mt-2 opacity-60"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed at this time
                </p>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={accountSettings.language}
                  onValueChange={(value) =>
                    setAccountSettings({ ...accountSettings, language: value })
                  }
                >
                  <SelectTrigger id="language" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={accountSettings.timezone}
                  onValueChange={(value) =>
                    setAccountSettings({ ...accountSettings, timezone: value })
                  }
                >
                  <SelectTrigger id="timezone" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSaveAccountSettings}
                disabled={isSaving}
                className="w-full mt-4"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Account Settings
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy Settings
            </h3>

            <div className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to everyone
                  </p>
                </div>
                <Switch
                  checked={privacySettings.profileVisible}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, profileVisible: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email on your profile
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showEmail: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Statistics</Label>
                  <p className="text-sm text-muted-foreground">
                    Display view and like counts publicly
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showStats}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showStats: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Let readers comment on your stories
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowComments}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, allowComments: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Followers</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to follow you
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowFollowers}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, allowFollowers: checked })
                  }
                />
              </div>

              <Button
                onClick={handleSavePrivacySettings}
                disabled={isSaving}
                className="w-full mt-4"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Privacy Settings
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </h3>

            <div className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Followers</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when someone follows you
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.newFollowers}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, newFollowers: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Story Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when someone comments on your stories
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.storyComments}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, storyComments: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Story Likes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when someone likes your stories
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.storyLikes}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, storyLikes: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Important platform updates and announcements
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.systemUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly summary of your activity
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, weeklyDigest: checked })
                  }
                />
              </div>

              <Button
                onClick={handleSaveNotificationSettings}
                disabled={isSaving}
                className="w-full mt-4"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Account
            </h3>

            <div className="space-y-6 max-w-xl">
              <div>
                <h4 className="font-medium mb-2">Sign Out</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign out of your account on this device
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                  }}
                >
                  Sign Out
                </Button>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-2 text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. All your stories, data, and followers will be permanently deleted.
                </p>
                
                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium">
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        size="sm"
                      >
                        Yes, Delete My Account
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
