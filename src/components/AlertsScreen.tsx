import React, { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/lib/alertService";
import { useToast } from "@/hooks/use-toast";
import type { UserAlert } from "@/lib/supabase";

interface AlertsScreenProps {
  onBack?: () => void;
}

const AlertsScreen: React.FC<AlertsScreenProps> = ({ onBack }) => {
  const { t, currentLanguage } = useTranslation();
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  // Static fallback alerts
  const staticAlerts = [
    {
      id: "static-1",
      user_id: "",
      alert_type: "pest",
      title: "Pest Attack Detected",
      message:
        "High aphid activity detected in tomato field. Immediate action required.",
      crop: "Tomato",
      severity: "high",
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: "static-2",
      user_id: "",
      alert_type: "weather",
      title: "Weather Alert",
      message: "Heavy rainfall expected in next 48 hours. Protect crops.",
      crop: "All Crops",
      severity: "high",
      is_read: false,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    },
    {
      id: "static-3",
      user_id: "",
      alert_type: "irrigation",
      title: "Irrigation Reminder",
      message: "Scheduled irrigation for onion field due tomorrow morning.",
      crop: "Onion",
      severity: "low",
      is_read: false,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: "static-4",
      user_id: "",
      alert_type: "harvest",
      title: "Harvest Ready",
      message: "Chilli crop is ready for harvest. Optimal time window.",
      crop: "Chilli",
      severity: "medium",
      is_read: false,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ];

  // Load alerts
  useEffect(() => {
    loadAlerts();
  }, [firebaseUser]);

  const loadAlerts = async () => {
    if (!firebaseUser) {
      setAlerts(staticAlerts as UserAlert[]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userAlerts = await alertService.getUserAlerts(firebaseUser.uid);
      
      // If no user alerts, use static alerts as fallback
      if (userAlerts.length === 0) {
        setAlerts(staticAlerts as UserAlert[]);
      } else {
        setAlerts(userAlerts);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
      setAlerts(staticAlerts as UserAlert[]);
      toast({
        title: "Error",
        description: "Failed to load alerts. Showing sample data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!firebaseUser) {
      toast({
        title: "Login Required",
        description: "Please login to mark alerts as read.",
        variant: "destructive",
      });
      return;
    }

    try {
      setMarkingRead(true);
      const success = await alertService.markAllAsRead(firebaseUser.uid);
      
      if (success) {
        // Update local state
        setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
        toast({
          title: "Success",
          description: "All alerts marked as read.",
        });
      } else {
        throw new Error("Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking alerts as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark alerts as read.",
        variant: "destructive",
      });
    } finally {
      setMarkingRead(false);
    }
  };

  // Mark single alert as read
  const handleMarkAsRead = async (alertId: string) => {
    if (!firebaseUser || alertId.startsWith("static-")) {
      return;
    }

    try {
      const success = await alertService.markAsRead(alertId);
      if (success) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ));
      }
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  // Get time ago string
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Get alert icon and color based on type and severity
  const getAlertDisplay = (alert: UserAlert) => {
    const displays: Record<string, { icon: any; color: string; badge: string }> = {
      pest: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", badge: "urgent" },
      weather: { icon: Info, color: "text-orange-600 dark:text-orange-400", badge: "warning" },
      irrigation: { icon: CheckCircle, color: "text-blue-600 dark:text-blue-400", badge: "info" },
      harvest: { icon: CheckCircle, color: "text-green-600 dark:text-green-400", badge: "success" },
      disease: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", badge: "urgent" },
      market: { icon: Info, color: "text-purple-600 dark:text-purple-400", badge: "info" },
    };

    // Override based on severity
    if (alert.severity === "high") {
      return { ...displays[alert.alert_type] || displays.pest, badge: "urgent" };
    }
    
    return displays[alert.alert_type] || { icon: Bell, color: "text-gray-600", badge: "info" };
  };

  // Calculate stats
  const stats = {
    urgent: alerts.filter(a => a.severity === "high" && !a.is_read).length,
    warning: alerts.filter(a => a.severity === "medium" && !a.is_read).length,
    info: alerts.filter(a => a.severity === "low" && !a.is_read).length,
  };

  // Translation helper for Tamil
  const getTranslatedText = (englishText: string): string => {
    if (currentLanguage !== "ta") return englishText;

    const translations: { [key: string]: string } = {
      // Header
      Updates: "புதுப்பிப்புகள்",

      // Alert counts
      Urgent: "அவசர",
      Warning: "எச்சரிக்கை",
      Info: "தகவல்",
      Success: "வெற்றி",

      // Alert titles
      "Pest Attack Detected": "பூச்சி தாக்குதல் கண்டறியப்பட்டது",
      "Weather Alert": "வானிலை எச்சரிக்கை",
      "Irrigation Reminder": "நீர்ப்பாசன நினைவூட்டல்",
      "Harvest Ready": "அறுவடை தயார்",

      // Alert messages
      "High aphid activity detected in tomato field. Immediate action required.":
        "தக்காளி வயலில் அதிக அசுவினி செயல்பாடு கண்டறியப்பட்டது. உடனடி நடவடிக்கை தேவை.",
      "Heavy rainfall expected in next 48 hours. Protect crops.":
        "அடுத்த 48 மணி நேரத்தில் அதிக மழை எதிர்பார்க்கப்படுகிறது. பயிர்களைப் பாதுகாக்கவும்.",
      "Scheduled irrigation for onion field due tomorrow morning.":
        "நாளை காலை வெங்காய வயலுக்கு திட்டமிடப்பட்ட நீர்ப்பாசனம்.",
      "Chilli crop is ready for harvest. Optimal time window.":
        "மிளகாய் பயிர் அறுவடைக்கு தயார். உகந்த நேரம்.",

      // Crops
      Tomato: "தக்காளி",
      "All Crops": "அனைத்து பயிர்கள்",
      Onion: "வெங்காயம்",
      Chilli: "மிளகாய்",

      // Time
      "hours ago": "மணி நேரங்களுக்கு முன்பு",
      "day ago": "நாள் முன்பு",
      "days ago": "நாட்களுக்கு முன்பு",
      "2 hours ago": "2 மணி நேரத்திற்கு முன்",
      "4 hours ago": "4 மணி நேரத்திற்கு முன்",
      "1 day ago": "1 நாளுக்கு முன்",

      // Quick Actions
      "Quick Actions": "விரைவு செயல்கள்",
      "Configure Alert Settings": "எச்சரிக்கை அமைப்புகளை உள்ளமைக்கவும்",
    };

    return translations[englishText] || englishText;
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const getAlertBadgeClass = (type: string) => {
    const classes = {
      urgent:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
      warning:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
      info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      success:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    };
    return classes[type as keyof typeof classes] || classes.info;
  };

  if (loading) {
    return (
      <div className="pb-20 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">
              {getTranslatedText("Updates")}
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Alert Stats */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.urgent}
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {getTranslatedText("Urgent")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.warning}
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {getTranslatedText("Warning")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.info}
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {getTranslatedText("Info")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <Card className="dark:bg-card dark:border-border shadow-sm">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No alerts at the moment</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => {
              const { icon: Icon, color, badge } = getAlertDisplay(alert);
              return (
                <Card
                  key={alert.id}
                  className={`dark:bg-card dark:border-border shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    alert.is_read ? "opacity-60" : ""
                  }`}
                  onClick={() => handleMarkAsRead(alert.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-full bg-gray-100 dark:bg-accent ${color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-800 dark:text-foreground">
                            {getTranslatedText(alert.title)}
                          </h3>
                          <Badge className={getAlertBadgeClass(badge)}>
                            {getTranslatedText(
                              badge.charAt(0).toUpperCase() + badge.slice(1)
                            )}
                          </Badge>
                          {alert.is_read && (
                            <Badge variant="outline" className="text-xs">
                              Read
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">
                          {getTranslatedText(alert.message)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground">
                          <span>{getTimeAgo(alert.created_at)}</span>
                          {alert.crop && (
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {getTranslatedText(alert.crop)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              {getTranslatedText("Quick Actions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Alert settings configuration will be available soon.",
                });
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              {getTranslatedText("Configure Alert Settings")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground"
              onClick={handleMarkAllAsRead}
              disabled={markingRead || unreadCount === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {markingRead ? "Marking..." : "Mark All as Read"}
              {unreadCount > 0 && !markingRead && (
                <Badge className="ml-auto bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertsScreen;