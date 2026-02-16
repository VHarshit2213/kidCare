import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import logo from "../assets/enchanted-logo.png";
import { useAuth } from "@/hooks/use-auth";
import supabase from "@/config/supabaseClient";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useSignedUrl } from "@/hooks/use-signedUrl";
import { useToast } from "@/hooks/use-toast";
import { useZipRestriction } from "@/hooks/use-zip-restriction";
import { useBadgeCounts } from "@/contexts/badge-context";
import { BsInfoCircle } from "react-icons/bs";
import { CalendarIcon, ChevronDown, Clock, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaChildren, FaRegCalendarCheck, FaRegUser } from "react-icons/fa6";
import { HiOutlineLogout } from "react-icons/hi";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { getSignedUrl } = useSignedUrl();
  const { unreadCount, bookingUnreadCount, playGreetUnreadCount } = useBadgeCounts();
  const [isOpen, setIsOpen] = useState(false)

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const hasMembership =
    !!user &&
    (user.membershipStatus === "active" ||
      user.membershipStatus === "installment_2");
  const isPaymentSuccess = user?.user_metadata?.isPayment;
  const isParent = user?.user_metadata?.userType === "parent";
  const isBabySitter = user?.user_metadata?.userType === "babysitter";

  const {
    isZipRestrictionEvaluated,
    isZipRestricted,
    guardNavigation,
  } = useZipRestriction({ profile });

  const [isOnline, setIsOnline] = useState(false);
  const userId = user?.id;
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Convert GPS → ZIP Code
  const getZipFromCoords = async (latitude: number, longitude: number) => {
    if (!mapboxToken) return "";
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`,
    );
    const data = await res.json();
    let postcode = data.features?.[0]?.context?.find((c: any) =>
      c.id.startsWith("postcode."),
    )?.text;
    if (!postcode) {
      const postcodeFeature = data.features?.find((f: any) =>
        f.place_type.includes("postcode"),
      );
      postcode = postcodeFeature?.text || "";
    }
    return String(postcode || "").trim();
  };

  // Calculate distance between two GPS points in miles.
  const getDistanceInMiles = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Updates babysitter's live location
  const updateSitterLocation = async (latitude: number, longitude: number) => {
    const now = Date.now();
    const last = lastUpdateRef.current;
    const lastCoords = lastCoordsRef.current;

    // Check if user moved at least 0.1 mile
    const movedEnough =
      !lastCoords ||
      getDistanceInMiles(
        lastCoords.latitude,
        lastCoords.longitude,
        latitude,
        longitude,
      ) >= 0.1;

    // Check if 1 minute has passed since last update
    // const timeEnough = now - last >= 60_000;

    if (!movedEnough) return;

    // Save latest update time & coordinates
    lastUpdateRef.current = now;
    lastCoordsRef.current = { latitude, longitude };

    // Convert GPS to ZIP code
    const zipCode = await getZipFromCoords(latitude, longitude);

    await supabase
      .from("babySitterProfile")
      .update({
        location: { latitude, longitude },
        zipCode,
      })
      .eq("user_id", user?.id);
  };

  const startTracking = () => {
    if (watchIdRef.current !== null) return;
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateSitterLocation(latitude, longitude);
      },
      (error) => {
        console.error("Location tracking error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current === null) return;
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  };

  const handleToggle = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    // Update the user's online status in the database
    const { error } = await supabase
      .from("babySitterProfile")
      .update({ isAvailable: newStatus })
      .eq("user_id", user?.id);

    if (error) {
      console.error("Update failed:", error.message);
      // Optionally revert UI on error
      setIsOnline(!newStatus);
    }
  };

  // real time GPS tracking for babysitter 
  useEffect(() => {
    if (!isBabySitter) return;
    if (isOnline) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isOnline, isBabySitter]);

  const handleLogout = () => {
    // logoutMutation.mutate();
    logoutMutation();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const isActive = (path: string) => location === path;

  const handleZipCodeRestriction = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isBabySitter) return;
    guardNavigation(event);
  };

  const handleCareRequest = (type: "instant" | "scheduled") => {
    // if (guardNavigation()) return;

    if (!isAuthenticated) {
      setLocation("/auth");
      return;
    }

    if (!isPaymentSuccess) {
      setLocation("/membership");
      return;
    }

    if (!profile) {
      window.dispatchEvent(
        new CustomEvent(type === "instant" ? "open-sitter-request" : "open-scheduled-care")
      );
      return;
    }

    if (!profile?.isApproved) {
      toast({
        title: "Access Denied",
        description: "Your profile is under review you cannot book babysitter.",
        variant: "destructive",
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent(type === "instant" ? "open-sitter-request" : "open-scheduled-care")
    );
  };

  const fetchProfile = async () => {
    if (!user?.id) return;

    setLoading(true);

    const userType = user.user_metadata?.userType;

    let tableName = "";
    if (userType === "parent") tableName = "parentprofile";
    else if (userType === "babysitter") tableName = "babySitterProfile";
    else return;

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      setLoading(false);
      return;
    }

    if (data?.profile_image) {
      const signedUrl = await getSignedUrl(data.profile_image);
      data.profileImageUrl = signedUrl;
    }

    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isBabySitter) return;
    if (profile?.isAvailable === undefined || profile?.isAvailable === null) return;
    setIsOnline(Boolean(profile.isAvailable));
  }, [isBabySitter, profile?.isAvailable]);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return (
    <header className="bg-white sticky top-0 z-10 border-b border-neutral-100">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <img src={logo} alt="The Enchanted Co. Logo" className="h-16 w-16" />
          </Link>
          <nav className="hidden xxl:flex xxl:items-center xxl:space-x-10">
            <Link
              href="/"
              className={`${isActive("/")
                ? "text-brand-blue font-medium"
                : "text-neutral-700 hover:text-brand-blue"
                } px-1 pt-1 text-sm tracking-wide`}
            >
              Home
            </Link>
            {isParent && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center bg-brand-blue hover:bg-[#2c4059] text-white rounded-[4px] px-4 py-2 text-sm tracking-wide font-medium shadow-sm">
                    <Clock className="mr-2 h-4 w-4" />
                    Request a Sitter
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-4 shadow-lg border-neutral-200">
                  <div className="grid gap-3">
                    <Button
                      onClick={() => handleCareRequest("instant")}
                      className="justify-start bg-[#D4AEA8] hover:bg-[#AA8780] text-white font-medium tracking-wide rounded-[4px]"
                      size="sm"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Instant Care
                    </Button>
                    <Button
                      onClick={() => handleCareRequest("scheduled")}
                      variant="outline"
                      className="justify-start border-[#D4AEA8] text-[#D4AEA8] hover:bg-pink-50 font-medium tracking-wide rounded-[4px]"
                      size="sm"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Scheduled Care
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Link
              href="/bookings"
              className={`${isActive("/bookings")
                ? "text-brand-blue font-medium"
                : "text-neutral-700 hover:text-brand-blue"
                } px-1 pt-1 text-sm tracking-wide`}
              onClick={handleZipCodeRestriction}
            >
              My Bookings
            </Link>
            <Link
              href="/messages"
              className={`${isActive("/messages")
                ? "text-brand-blue font-medium"
                : "text-neutral-700 hover:text-brand-blue"
                } px-1 pt-1 text-sm tracking-wide flex items-center gap-2 relative`}
              onClick={handleZipCodeRestriction}
            >
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-1.5 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            {isBabySitter && (
              <Link
                href="/reviews"
                className={`${isActive("/reviews")
                  ? "text-brand-blue font-medium"
                  : "text-neutral-700 hover:text-brand-blue"
                  } px-1 pt-1 text-sm tracking-wide`}
                onClick={handleZipCodeRestriction}
              >
                Reviews
              </Link>
            )}
            <Link
              href="/booking-notification"
              className={`${isActive("/booking-notification")
                ? "text-brand-blue font-medium"
                : "text-neutral-700 hover:text-brand-blue"
                } px-1 pt-1 text-sm tracking-wide flex items-center gap-2 relative`}
              onClick={handleZipCodeRestriction}
            >
              <span>Notification</span>
              {bookingUnreadCount > 0 && (
                <span className="absolute -right-3 -top-1.5 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                  {bookingUnreadCount > 99 ? "99+" : bookingUnreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/play-and-greet"
              className={`${isActive("/play-and-greet")
                ? "text-brand-blue font-medium"
                : "text-neutral-700 hover:text-brand-blue"
                } px-1 pt-1 text-sm tracking-wide flex items-center gap-2 relative`}
              onClick={handleZipCodeRestriction}
            >
              <span>Play And Greet</span>
              {playGreetUnreadCount > 0 && (
                <span className="absolute -right-3 -top-1.5 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                  {playGreetUnreadCount > 99 ? "99+" : playGreetUnreadCount}
                </span>
              )}
            </Link>
          </nav>
          <div className="hidden xxl:flex xxl:items-center">
            {isAuthenticated ? (
              <div className="ml-4 flex items-center">
                {/* online offline toggle */}
                {isBabySitter && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {isOnline ? "Online" : "Offline"}
                    </span>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOnline}
                        onChange={handleToggle}
                        className="sr-only peer"
                      />
                      <div
                        className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-500
                      after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border 
                      after:rounded-full after:h-5 after:w-5 after:transition-all 
                      peer-checked:after:translate-x-full peer-checked:after:border-white"
                      ></div>
                    </label>
                  </div>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center max-w-xs rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#ed4aea] focus:ring-offset-1 px-2 py-1 hover:bg-pink-50 transition-colors">
                      <Avatar className="h-8 w-8 rounded-md">
                        {profile?.profileImageUrl ? (
                          <AvatarImage
                            src={profile.profileImageUrl}
                            alt={profile.fullName}
                            className="rounded-md"
                          />
                        ) : (
                          <AvatarFallback className="rounded-md bg-[#ed4aea]/10 text-[#ed4aea]">
                            {getInitials(
                              user?.user_metadata?.fullName || "User"
                            )}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex items-center">
                        <span className="ml-2 text-neutral-700 font-medium tracking-wide">
                          {user?.user_metadata?.fullName?.split(" ")[0]}
                        </span>
                        {user?.username === "ecadmin" && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 rounded-sm px-2 py-0.5">
                            Admin
                          </span>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-4 mx-4 shadow-lg border-neutral-200">
                    <div className="grid gap-3">
                      <Link
                        href="/profile"
                        className="text-sm font-medium text-neutral-700 hover:text-[#ed4aea] flex items-center"
                      >
                        <FaRegUser className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      {user?.username === "ecadmin" && (
                        <Link
                          href="/admin"
                          className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start px-0 text-neutral-700 hover:text-[#ed4aea] hover:bg-pink-50"
                        onClick={handleLogout}
                      >
                        <HiOutlineLogout className="h-5 w-5 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#3c5679] hover:text-[#3c5679]/90 hover:bg-blue-50 font-medium tracking-wide"
                  onClick={() => setLocation("/auth")}
                >
                  Login
                </Button>
                <Button
                  className="bg-[#3c5679] hover:bg-[#2c4059] text-white font-medium tracking-wide rounded-[4px]"
                  onClick={() => setLocation("/auth?tab=register")}
                >
                  Sign Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50 rounded-[4px]"
                  /* onClick={() => setLocation("/admin")} */
                  onClick={() => setLocation("/auth?tab=login&admin=true")}
                >
                  Admin
                </Button>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="xxl:hidden flex items-center space-x-1">
            {!isAuthenticated && (
              <Button
                className="bg-[#3c5679] hover:bg-[#2c4059] text-white font-medium tracking-wide rounded-[4px]"
                onClick={() => setLocation("/auth")}
              >
                Login
              </Button>
            )}
            {isBabySitter && (
              <div className="flex items-center gap-3 py-2 px-3">
                <span className="text-sm font-medium">
                  {isOnline ? "Online" : "Offline"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnline}
                    onChange={handleToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="inline-flex items-center justify-center p-2 rounded-[4px] text-neutral-700 hover:text-[#ed4aea] hover:bg-pink-50 focus:outline-none">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] h-screen overflow-y-auto"
              >
                <div className="flex flex-col space-y-4 mt-8">
                  {isParent && (
                    <Link
                      href="/bookings"
                      className={`${isActive("/bookings")
                        ? "text-brand-blue font-bold"
                        : "text-neutral-700 hover:text-brand-blue"
                        } p-2 rounded-lg tracking-wide`}
                      onClick={handleZipCodeRestriction}
                    >
                      <span className="flex items-center gap-3"><FaRegCalendarCheck className="w-5 h-5" />My Bookings</span>
                    </Link>
                  )}
                  <Link
                    href="/booking-notification"
                    className={`${isActive("/booking-notification")
                      ? "text-brand-blue font-bold"
                      : "text-neutral-700 hover:text-brand-blue"
                      } p-2 rounded-lg tracking-wide relative w-fit`}
                    onClick={handleZipCodeRestriction}
                  >
                    <span className="flex items-center gap-3"><IoMdNotificationsOutline className="w-5 h-5" />
                      Notification</span>
                    {bookingUnreadCount > 0 && (
                      <span className="absolute -right-2 top-0 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                        {bookingUnreadCount > 99 ? "99+" : bookingUnreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/play-and-greet"
                    className={`${isActive("/play-and-greet")
                      ? "text-brand-blue font-bold"
                      : "text-neutral-700 hover:text-brand-blue"
                      } p-2 rounded-lg tracking-wide relative w-fit`}
                    onClick={handleZipCodeRestriction}
                  >
                    <span className="flex items-center gap-3"><FaChildren className="w-5 h-5" />Play And Greet</span>
                    {playGreetUnreadCount > 0 && (
                      <span className="absolute -right-2 top-0 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                        {playGreetUnreadCount > 99 ? "99+" : playGreetUnreadCount}
                      </span>
                    )}
                  </Link>
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start p-2 text-neutral-700 hover:text-brand-blue text-base outline-none"
                      onClick={handleLogout}
                    >
                      <HiOutlineLogout className="h-5 w-5 mr-3" />
                      Logout
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {isAuthenticated && profile?.isApproved === false && profile?.isProfileCompleted === true && (
        <div className="w-full bg-orange-50 border border-orange-200 rounded-lg py-2 px-4 flex items-center justify-center shadow-sm font-semibold text-base xs:text-lg text-brand-blue absolute">
          Your Profile is Under Review
        </div>
      )}
      {/* {isZipRestrictionEvaluated && isZipRestricted && (
        <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div>
              <BsInfoCircle className="text-xl text-brand-blue" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-blue">
                We're currently not available in your region.
              </h3>
              <p className="text-sm text-gray-600">
                We'll be expanding soon! Stay tuned for updates.
              </p>
            </div>
          </div>
        </div>
      )} */}
    </header>
  );
}
