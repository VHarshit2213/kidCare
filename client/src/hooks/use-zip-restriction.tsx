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

  useEffect(() => {
    if (!profile) {
      setIsZipRestricted(true);
      setIsZipRestrictionEvaluated(false);
      return;
    }

    const zip = profile.zipCode ? String(profile.zipCode).trim() : null;
    const allowed = zip && allowedZipCodes.includes(zip);

    setIsZipRestricted(!allowed);
    setIsZipRestrictionEvaluated(true);
  }, [profile]);

  const showZipRestrictionToast = () =>
    toast({
      title: "Service unavailable in your area",
      description: `We're currently not available in your region.`,
      variant: "destructive",
    });

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
