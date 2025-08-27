import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useSignedUrl } from "@/hooks/use-signedUrl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import {
  Save,
  Loader2,
  Upload,
  AlertCircle,
  CircleUserRound,
  Camera,
  MapPin,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import supabase from "@/config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { babysitterProfile } from "@/lib/types";
import mapboxgl from "mapbox-gl";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Schema for the babysitter profile form
const profileFormSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    floor_number: z.string().optional(),
    street_name: z.string().optional(),
    // firstName: z.string().min(1, 'First name is required'),
    // lastName: z.string().min(1, 'Last name is required'),
    phoneNumber: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    bio: z
      .string()
      .min(10, "Please provide a brief bio (at least 10 characters)"),
    experienceYears: z.string().min(1, "Please select your experience level"),
    ageRangeExperience: z
      .array(z.string())
      .min(1, "Please select at least one age range"),
    enjoymentReason: z
      .string()
      .min(10, "Please share what you enjoy about working with children"),
    caregiverStyle: z.string().min(10, "Please share your caregiving style"),
    hasVideo: z.boolean().default(false),
    videoUrl: z.string().optional(), // The only optional field
    hourlyRate: z
      .string()
      .min(1, "Please specify your hourly rate")
      .refine((val) => {
        const rate = Number(val);
        return !isNaN(rate) && rate >= 35 && rate <= 50;
      }, "Hourly rate must be between $35 and $50"),
    firstAidCertified: z.enum(["yes", "no"]),
    // firstAidCertificationDoc: z
    //   .string()
    //   .min(1, "First aid certification document is required when certified"),
    firstAidCertificationDoc: z.string().optional(),
    hasTransportation: z.enum(["yes", "no"]),
    // driversLicenseDoc: z
    //   .string()
    //   .min(
    //     1,
    //     "Driver's license document is required when you have transportation",
    //   ),
    driversLicenseDoc: z.string().optional(),
    skills: z.array(z.string()).min(1, "Please select at least one skill"),
  })
  .superRefine((data, ctx) => {
    if (data.firstAidCertified === "yes" && !data.firstAidCertificationDoc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["firstAidCertificationDoc"],
        message: "First aid certification document is required",
      });
    }

    if (data.hasTransportation === "yes" && !data.driversLicenseDoc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["driversLicenseDoc"],
        message: "Driver's license document is required",
      });
    }
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Available skills for babysitters
const AVAILABLE_SKILLS = [
  "Arts & Crafts",
  "Music",
  "Sports",
  "Cooking",
  "Homework Help",
  "Special Needs Experience",
  "Multilingual",
  "Infant Care",
  "Toddler Experience",
  "Outdoor Activities",
];

// Experience years options
const EXPERIENCE_YEARS = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-2", label: "1-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "More than 10 years" },
];

// Age ranges options
const AGE_RANGES = [
  { value: "Infant (0-1 year)", label: "Infant (0-1 year)" },
  { value: "Toddler (1-3 years)", label: "Toddler (1-3 years)" },
  { value: "Preschool (3-5 years)", label: "Preschool (3-5 years)" },
  { value: "School Age (5-12 years)", label: "School Age (5-12 years)" },
  { value: "Teenager (13-18 years)", label: "Teenager (13-18 years)" },
];

export default function BabysitterProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getSignedUrl } = useSignedUrl();
  const [isUploading, setIsUploading] = useState(false);
  const [profiles, setProfiles] = useState<babysitterProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState(profiles?.[0]?.address || "");
  const [AddressLoading, setAddressLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isUploadingLicense, setIsUploadingLicense] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingCertification, setIsUploadingCertification] =
    useState(false);
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [licensePreviewUrl, setLicensePreviewUrl] = useState<string | null>(
    null,
  );
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState<
    string | null
  >(null);
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const userData = user?.user_metadata;

  // Get firstAidCertified value safely
  // const firstAidValue = user?.firstAidCertified ? "yes" : "no";
  const firstAidValue = profiles?.[0]?.certified ? "yes" : "no";

  // Get hasTransportation value safely
  // const transportationValue = user?.hasTransportation ? "yes" : "no";
  const transportationValue = profiles?.[0]?.transportation ? "yes" : "no";

  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    // --------------- old code for reference ------------
    // defaultValues: {
    //   firstName: user?.firstName || "",
    //   lastName: user?.lastName || "",
    //   phoneNumber: user?.phoneNumber || "",
    //   email: user?.email || "",
    //   bio: user?.bio || "",
    //   experienceYears: user?.yearsExperience
    //     ? String(user.yearsExperience)
    //     : "",
    //   ageRangeExperience: user?.ageRangeExperience || [],
    //   enjoymentReason: user?.enjoymentReason || "",
    //   caregiverStyle: user?.caregiverStyle || "",
    //   hasVideo: false,
    //   videoUrl: "",
    //   hourlyRate: user?.hourlyRate ? String(user.hourlyRate) : "35",
    //   firstAidCertified: firstAidValue as "yes" | "no",
    //   firstAidCertificationDoc: "",
    //   hasTransportation: transportationValue as "yes" | "no",
    //   driversLicenseDoc: "",
    //   skills: user?.skills || [],
    // },
    // -------------- old code for reference ------------

    // -------------- new code ------------
    defaultValues: {
      fullName: "",
      // lastName: user?.lastName || '',
      phoneNumber: "",
      floor_number: "",
      street_name: "",
      email: "",
      bio: "",
      experienceYears: "",
      ageRangeExperience: [],
      enjoymentReason: "",
      caregiverStyle: "",
      hasVideo: false,
      videoUrl: "",
      hourlyRate: "35",
      firstAidCertified: firstAidValue as "yes" | "no",
      firstAidCertificationDoc: "",
      hasTransportation: transportationValue as "yes" | "no",
      driversLicenseDoc: "",
      skills: user?.skills || [],
    },
    // -------------- new code ------------
  });

  // -------------- new code ------------
  useEffect(() => {
    if (userData || (profiles && profiles?.length > 0)) {
      const profile = profiles?.[0];
      form.reset({
        fullName: userData?.fullName || "",
        email: userData?.email || "",
        floor_number: profile?.floor_number || "",
        street_name: profile?.street_name || "",
        phoneNumber: profile?.phoneNumber || "",
        bio: profile?.shortBio || "",
        experienceYears: profile?.experience || "",
        ageRangeExperience: profile?.mostExperience || [],
        enjoymentReason: profile?.aboutWorking || "",
        caregiverStyle: profile?.caregiving || "",
        hasVideo: !!profile?.instrucationVideo,
        videoUrl: profile?.instrucationVideo || "",
        hourlyRate: profile?.horulyRate ? String(profile.horulyRate) : "35",
        firstAidCertified: profile?.certified ? "yes" : "no",
        firstAidCertificationDoc: profile?.certified || "",
        hasTransportation: profile?.transportation ? "yes" : "no",
        driversLicenseDoc: profile?.transportation || "",
        skills: profile?.parentSkill || [],
      });
    }
  }, [profiles]);
  // -------------- new code ------------

  // -------------- old code for reference ------------
  // Mutation to update babysitter profile
  // const profileMutation = useMutation({
  //   mutationFn: async (data: ProfileFormValues) => {
  //     // Transform some data fields for API compatibility
  //     const profileData = {
  //       ...data,
  //       yearsExperience: data.experienceYears,
  //       profileCompleted: true, // Profile is completed when form is submitted
  //       reviewStatus: "pending", // Set review status to pending
  //     };

  //     const res = await apiRequest("PATCH", "/api/users/profile", profileData);
  //     return await res.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["/api/user"] });

  //     toast({
  //       title: "Profile completed!",
  //       description:
  //         "Your profile has been sent to admin for review and will be available soon.",
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Error updating profile",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   },
  // });
  // -------------- old code for reference ------------

  // -------------- new code ------------

  // fetch Babysitter profile
  const fetchBabysitterProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("babySitterProfile")
      .select("*")
      .eq("user_id", userId) // filter by userId
      .limit(1); // expects exactly one row

    if (error) {
      console.error("Fetch error:", error.message);
      return null;
    }

    // generate signed URLs
    const profileImageUrl = await getSignedUrl(data?.[0]?.profile_image);
    const licenseUrl = await getSignedUrl(data?.[0]?.transportation);
    const certificateUrl = await getSignedUrl(data?.[0]?.certified);
    const videoUrl = await getSignedUrl(data?.[0]?.instrucationVideo);

    return {
      ...data,
      profileImageUrl,
      licenseUrl,
      certificateUrl,
      videoUrl,
    };
  };

  const loadProfile = async () => {
    const userId = user?.id;
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }
    const data = await fetchBabysitterProfile(userId);

    if (!data) {
      setProfiles([]);
      setUploadedImg(null);
      setLicensePreviewUrl(null);
      setCertificatePreviewUrl(null);
      setVideoPreviewUrl(null);
      return;
    }
    setProfiles(data);
    setUploadedImg(data.profileImageUrl ?? null);
    setLicensePreviewUrl(data.licenseUrl ?? null);
    setCertificatePreviewUrl(data.certificateUrl ?? null);
    setVideoPreviewUrl(data.videoUrl ?? null);
    setImagePath(data?.[0]?.profile_image ?? null);
    setAddress(data?.[0]?.address || "");
    setLatitude(data?.[0]?.location?.latitude ?? null);
    setLongitude(data?.[0]?.location?.longitude ?? null);
  };

  // Upload file to Supabase
  const uploadFileToSupabase = async (
    file: File,
    userId: string,
    type: "profile" | "license" | "certification" | "video",
    existingPath: string | null,
  ) => {
    const fileExt = file.name.split(".").pop();
    let filePath = "";

    if (type === "profile") {
      filePath = `${userId}/profile/profile.${fileExt}`;
    } else if (type === "license") {
      filePath = `${userId}/license/license.${fileExt}`;
    } else if (type === "certification") {
      filePath = `${userId}/certification/certification.${fileExt}`;
    } else if (type === "video") {
      filePath = `${userId}/videos/video.${fileExt}`;
    }

    // ✅ Remove old file (if path is different)
    if (existingPath && existingPath !== filePath) {
      await supabase.storage.from("user-uploads").remove([existingPath]);
    }

    const { error } = await supabase.storage
      .from("user-uploads")
      .upload(filePath, file, {
        upsert: true, // overwrite if needed
      });

    if (error) throw error;

    return filePath; // Save this path in your DB
  };
  // -------------- new code ------------

  // Function to handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    // Log form validation errors if any
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form validation errors:", form.formState.errors);
      toast({
        title: "Form validation failed",
        description: "Please check all required fields are filled correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id;

      if (!userId) {
        throw new Error("User not authenticated.");
      }

      if (!address) {
        throw new Error("Please use your current location.");
      }

      if (!imageFile && !imagePath) {
        throw new Error("Please upload a profile photo.");
      }

      // ✅ Upload files conditionally
      let profileImageUrl = imagePath;
      if (imageFile) {
        profileImageUrl = await uploadFileToSupabase(
          imageFile,
          userId,
          "profile",
          imagePath ?? null,
        );
      }

      let licenseUrl = values.driversLicenseDoc;
      if (licenseFile) {
        licenseUrl = await uploadFileToSupabase(
          licenseFile,
          userId,
          "license",
          profiles?.[0]?.transportation ?? null,
        );
      }

      let certificationUrl = values.firstAidCertificationDoc;
      if (certificationFile) {
        certificationUrl = await uploadFileToSupabase(
          certificationFile,
          userId,
          "certification",
          profiles?.[0]?.certified ?? null,
        );
      }

      let videoUrl = values.videoUrl;
      if (videoFile) {
        videoUrl = await uploadFileToSupabase(
          videoFile,
          userId,
          "video",
          profiles?.[0]?.instrucationVideo ?? null,
        );
      }

      const payload = {
        user_id: userId,
        profile_image: profileImageUrl,
        fullName: values.fullName,
        email: values.email,
        address,
        floor_number: values.floor_number,
        street_name: values.street_name,
        location: {
          latitude,
          longitude,
        },
        phoneNumber: values.phoneNumber,
        shortBio: values.bio,
        experience: values.experienceYears,
        mostExperience: values.ageRangeExperience,
        parentSkill: values.skills,
        aboutWorking: values.enjoymentReason,
        caregiving: values.caregiverStyle,
        horulyRate: values.hourlyRate,
        certified: certificationUrl,
        transportation: licenseUrl,
        instrucationVideo: videoUrl,
      };

      // ✅ Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("babySitterProfile")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      let response;
      if (Array.isArray(existingProfile) && existingProfile.length > 0) {
        response = await supabase
          .from("babySitterProfile")
          .update({ ...payload, isProfileCompleted: true })
          .eq("user_id", userId);
      } else {
        response = await supabase
          .from("babySitterProfile")
          .insert({ ...payload, isProfileCompleted: true });
      }

      const { error } = response;

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description:
          Array.isArray(existingProfile) && existingProfile.length > 0
            ? "Profile updated successfully!"
            : "Profile created successfully!",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingVideo(true);

      // Simulate upload process
      setTimeout(() => {
        const previewUrl = URL.createObjectURL(file);
        form.setValue("videoUrl", previewUrl);
        form.setValue("hasVideo", true);
        setVideoFile(file);
        setVideoPreviewUrl(previewUrl);
        setIsUploadingVideo(false);

        toast({
          title: "Video uploaded",
          description:
            "Your introduction video has been uploaded successfully.",
        });
      }, 2000);
    }
  };

  // Function to handle certification document upload
  const handleCertificationUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingCertification(true);

      // Simulate upload process
      setTimeout(() => {
        const previewUrl = URL.createObjectURL(e.target.files![0]);
        form.setValue("firstAidCertificationDoc", previewUrl);
        setCertificationFile(file);
        setCertificatePreviewUrl(previewUrl);
        setIsUploadingCertification(false);

        toast({
          title: "Document uploaded",
          description:
            "Your certification document has been uploaded successfully.",
        });
      }, 1500);
    }
  };

  // Function to handle driver's license document upload
  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setIsUploadingLicense(true);

      // Simulate upload process
      setTimeout(() => {
        const previewUrl = URL.createObjectURL(file);
        setLicensePreviewUrl(previewUrl);
        setLicenseFile(file);
        form.setValue("driversLicenseDoc", previewUrl);
        setIsUploadingLicense(false);

        toast({
          title: "Document uploaded",
          description: "Your driver's license has been uploaded successfully.",
        });
      }, 1500);
    }
  };

  // -------------- new code ------------

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setUploadedImg(URL.createObjectURL(file));
  };

  const handleUseMyLocation = () => {
    setAddressLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      setAddressLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`,
          );
          const data = await res.json();
          const placeName = data.features?.[0]?.place_name || "";
          setAddress(placeName);
        } catch (err) {
          alert("Failed to get address");
        } finally {
          setAddressLoading(false);
        }
      },
      () => {
        alert("Permission denied or location unavailable");
        setAddressLoading(false);
      },
      {
        enableHighAccuracy: true, // 📍 Request more precise location
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  // Clean up preview URLs when files change
  useEffect(() => {
    return () => {
      if (licensePreviewUrl) URL.revokeObjectURL(licensePreviewUrl);
      if (certificatePreviewUrl) URL.revokeObjectURL(certificatePreviewUrl);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [licensePreviewUrl, certificatePreviewUrl, videoPreviewUrl]);
  // -------------- new code ------------

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Please log in to access your profile.</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Complete Your Babysitter Profile
        </CardTitle>
        <CardDescription>
          Provide information about yourself, your experience, and your
          caregiving style to help parents find the perfect match.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                Basic Information
              </h3>
              {/* -------------- new code ------------ */}
              <div className="grid grid-cols-1 justify-items-center gap-4">
                <FormField
                  control={form.control}
                  name="profileImage"
                  render={() => (
                    <FormItem className="text-center">
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <div className="relative w-24 h-24 mb-3">
                          {uploadedImg ? (
                            <img
                              src={uploadedImg}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full bg-white border border-gray-300"
                            />
                          ) : (
                            <CircleUserRound
                              size={100}
                              className="text-gray-400"
                            />
                          )}

                          <div
                            className="absolute -bottom-0.5 right-0 bg-black rounded-full p-1 border border-white cursor-pointer"
                            onClick={triggerFileInput}
                          >
                            {/* <IoCameraOutline size={20} className="text-white" /> */}
                            <Camera size={25} className="text-white" />
                          </div>

                          <input
                            type="file"
                            name=""
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* -------------- new code ------------ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* -------------- old code for reference ------------ */}
                {/* <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your first name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                {/* -------------- old code for reference ------------ */}

                {/* -------------- new code ------------ */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your full name"
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your email address"
                          type="email"
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="floor_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>house number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your house number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="street_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>residential Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your residential name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* -------------- new code ------------ */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="w-full">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="px-4 py-2 bg-gray-100 text-black rounded w-full"
                    disabled={AddressLoading}
                  >
                    {AddressLoading ? (
                      "Fetching..."
                    ) : (
                      <>
                        <MapPin className="inline-block mr-2" />
                        Use My Current Location
                      </>
                    )}
                  </button>
                  {AddressLoading && <p>Getting address...</p>}
                  {address && (
                    <p className="pt-1">
                      <strong>Address:</strong> {address}
                    </p>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                          <PhoneInput
                            defaultCountry="in"
                            value={field.value}
                            onChange={field.onChange}
                            inputClassName="w-full px-4 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell parents a bit about yourself..."
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief introduction to help parents get to know you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Experience Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                Experience & Skills
              </h3>
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How long have you been a babysitter?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      /* defaultValue={field.value} */
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select years of experience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPERIENCE_YEARS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ageRangeExperience"
                render={() => (
                  <FormItem className="mt-4">
                    <div className="mb-4">
                      <FormLabel>
                        What age ranges do you have the most experience with?
                      </FormLabel>
                      <FormDescription>Select all that apply</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {AGE_RANGES.map((range) => (
                        <FormField
                          key={range.value}
                          control={form.control}
                          name="ageRangeExperience"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={range.value}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(range.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            range.value,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== range.value,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {range.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem className="mt-4">
                    <div className="mb-4">
                      <FormLabel>
                        What skills do you have that parents might value?
                      </FormLabel>
                      <FormDescription>Select all that apply</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {AVAILABLE_SKILLS.map((skill) => (
                        <FormField
                          key={skill}
                          control={form.control}
                          name="skills"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={skill}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(skill)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            skill,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== skill,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {skill}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="enjoymentReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What do you enjoy most about working with children?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Share what you find most rewarding about being a caregiver..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caregiverStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        How would you describe your caregiving style?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell parents about your approach to childcare..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                Additional Information
              </h3>

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your hourly rate? ($35-$50)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          className="pl-7"
                          {...field}
                          type="number"
                          min="35"
                          max="50"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Our platform requires rates between $35-$50 per hour.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="firstAidCertified"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Are you certified in First Aid/CPR?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          /* defaultValue={field.value} */
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Yes, I am certified
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              No, I am not certified
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      {/* Show View Document if certified and document exists */}
                      {form.watch("firstAidCertified") === "yes" &&
                        certificatePreviewUrl && (
                          <div className="pl-7">
                            <a
                              href={certificatePreviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm"
                            >
                              View uploaded certification document
                            </a>
                          </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("firstAidCertified") === "yes" && (
                  <div className="mt-3 pl-7">
                    <FormField
                      control={form.control}
                      name="firstAidCertificationDoc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload your certification</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                id="certification-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={handleCertificationUpload}
                                disabled={isUploadingCertification}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("certification-upload")
                                    ?.click()
                                }
                                disabled={isUploadingCertification}
                              >
                                {isUploadingCertification ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Document
                                  </>
                                )}
                              </Button>
                              {field.value && (
                                <span className="text-sm text-green-600">
                                  Document uploaded
                                </span>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Please upload a copy of your certification (PDF,
                            JPG, or PNG).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="hasTransportation"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>
                        Do you have your own transportation?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          /* defaultValue={field.value} */
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Yes, I have my own transportation
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              No, I rely on public transportation
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>

                      {form.watch("hasTransportation") === "yes" &&
                        licensePreviewUrl && (
                          <div className="pl-7">
                            <a
                              href={licensePreviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm"
                            >
                              View uploaded driver's license document
                            </a>
                          </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("hasTransportation") === "yes" && (
                  <div className="mt-3 pl-7">
                    <FormField
                      control={form.control}
                      name="driversLicenseDoc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload your driver's license</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                id="license-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={handleLicenseUpload}
                                disabled={isUploadingLicense}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("license-upload")
                                    ?.click()
                                }
                                disabled={isUploadingLicense}
                              >
                                {isUploadingLicense ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Document
                                  </>
                                )}
                              </Button>
                              {field.value && (
                                <span className="text-sm text-green-600">
                                  Document uploaded
                                </span>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Please upload a copy of your driver's license (PDF,
                            JPG, or PNG).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="hasVideo"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col gap-1.5">
                        <FormLabel>Introduction Video (Optional)</FormLabel>
                        <FormDescription>
                          Upload a short video introducing yourself to parents.
                          This can help you stand out!
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoUpload}
                            disabled={isUploadingVideo}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("video-upload")?.click()
                            }
                            disabled={isUploadingVideo}
                          >
                            {isUploadingVideo ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Video
                              </>
                            )}
                          </Button>
                          {field.value && form.watch("videoUrl") && (
                            <span className="text-sm text-green-600">
                              Video uploaded
                            </span>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {videoPreviewUrl && (
                  <video
                    controls
                    width="300"
                    src={videoPreviewUrl}
                    className="mt-3"
                  />
                )}
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your profile will be reviewed by our team before it becomes
                visible to parents. This usually takes 1-2 business days.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full"
              /* disabled={profileMutation.isPending} */
              disabled={isSubmitting}
            >
              {/* -------------- old code for reference ------------ */}
              {/* {profileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Profile...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Complete My Profile
                </>
              )} */}
              {/* -------------- old code for reference ------------ */}

              {/* -------------- new code ------------ */}
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Profile...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Complete My Profile
                </>
              )}
              {/* -------------- new code ------------ */}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
