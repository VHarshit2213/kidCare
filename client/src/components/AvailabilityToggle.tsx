import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function AvailabilityToggle() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!user || user.userType !== "babysitter") {
    return null;
  }

  const isAvailable = user.availabilityStatus === "available";
  const isBusy = user.availabilityStatus === "busy";
  const isOffline = user.availabilityStatus === "offline";

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availabilityStatus: string) => {
      const response = await apiRequest("PATCH", "/api/users/availability", {
        availabilityStatus
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Availability Updated",
        description: isAvailable ? "You are now offline" : "You are now available for bookings",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (checked: boolean) => {
    const newStatus = checked ? "available" : "offline";
    updateAvailabilityMutation.mutate(newStatus);
  };

  const getStatusBadge = () => {
    if (isBusy) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Busy with Family</Badge>;
    } else if (isAvailable) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Offline</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Availability Status</h3>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {isBusy && (
                <span className="text-xs text-muted-foreground">
                  You'll automatically be available when your booking ends
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {isAvailable ? "Online" : "Offline"}
            </span>
            <Switch
              checked={isAvailable}
              onCheckedChange={handleToggle}
              disabled={isBusy || updateAvailabilityMutation.isPending}
              className="data-[state=checked]:bg-[#ed4aea]"
            />
          </div>
        </div>
        
        {isBusy && (
          <div className="mt-3 p-2 bg-orange-50 rounded-md">
            <p className="text-xs text-orange-800">
              You're currently busy with a family. You'll be automatically set to available when the booking is completed.
            </p>
          </div>
        )}
        
        <div className="mt-3 text-xs text-muted-foreground">
          Turn on to receive booking requests from parents
        </div>
      </CardContent>
    </Card>
  );
}