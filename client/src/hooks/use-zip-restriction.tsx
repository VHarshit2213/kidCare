import { useState, useEffect, MouseEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { allowedZipCodes } from "@/config/allowedZipCodes";

interface UseZipRestrictionOptions {
  profile: any;
}

export function useZipRestriction({ profile }: UseZipRestrictionOptions) {
  const { toast } = useToast();

  const [isZipRestrictionEvaluated, setIsZipRestrictionEvaluated] = useState(false);
  const [isZipRestricted, setIsZipRestricted] = useState(false);
  const [zipError, setZipError] = useState<"missingZip" | null>(null);

  useEffect(() => {
    if (!profile) {
      setIsZipRestricted(true);
      setIsZipRestrictionEvaluated(false);
      setZipError(null);
      return;
    }

    const zip = profile.zipCode ? String(profile.zipCode).trim() : "";

    if (!zip) {
      setIsZipRestricted(true);
      setIsZipRestrictionEvaluated(true);
      setZipError("missingZip");
      return;
    }

    const allowed = allowedZipCodes.includes(zip);

    setIsZipRestricted(!allowed);
    setZipError(null);
    setIsZipRestrictionEvaluated(true);
  }, [profile]);

  const showZipRestrictionToast = () => {
    if (zipError === "missingZip") {
      toast({
        title: "ZIP code required",
        description: "Please complete your profile with your ZIP code to continue.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Service unavailable in your area",
      description: `We're currently not available in your region.`,
      variant: "destructive",
    });
  };

  const showZipCheckToast = () =>
    toast({
      title: "Checking service availability",
      description: "Please wait while we verify your ZIP code.",
    });

  const shouldBlockNavigation = !isZipRestrictionEvaluated || isZipRestricted;

  const guardNavigation = (event?: MouseEvent) => {
    if (shouldBlockNavigation) {
      event?.preventDefault();
      if (isZipRestrictionEvaluated && isZipRestricted) {
        showZipRestrictionToast();
      } else {
        showZipCheckToast();
      }
      return true;
    }
    return false;
  };

  return {
    isZipRestrictionEvaluated,
    isZipRestricted,
    shouldBlockNavigation,
    guardNavigation,
  };
}
