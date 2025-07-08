import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Save, Loader2, Upload, AlertCircle } from "lucide-react";

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

// Schema for the babysitter profile form
const profileFormSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
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
    firstAidCertificationDoc: z
      .string()
      .min(1, "First aid certification document is required when certified"),
    hasTransportation: z.enum(["yes", "no"]),
    driversLicenseDoc: z
      .string()
      .min(
        1,
        "Driver's license document is required when you have transportation"
      ),
    skills: z.array(z.string()).min(1, "Please select at least one skill"),
  })
  .superRefine((data, ctx) => {
    // We're keeping these refinements for better conditional validation messages

    // Skip document validation if firstAidCertified is 'no'
    if (data.firstAidCertified === "no") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["firstAidCertificationDoc"],
        message: "", // Empty message to avoid showing validation error
      });
    }

    // Skip document validation if hasTransportation is 'no'
    if (data.hasTransportation === "no") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["driversLicenseDoc"],
        message: "", // Empty message to avoid showing validation error
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
  { value: "infant", label: "Infant (0-1 year)" },
  { value: "toddler", label: "Toddler (1-3 years)" },
  { value: "preschool", label: "Preschool (3-5 years)" },
  { value: "schoolAge", label: "School Age (5-12 years)" },
  { value: "teenager", label: "Teenager (13-18 years)" },
];

type babysitterProfile = {
  userId?: string;
  phoneNumber: string;
  shortBio: string;
  experience: string;
  mostExperience: string[];
  parentSkill: string[];
  aboutWorking: string;
  caregiving: string;
  horulyRate: number;
  certified: string;
  transportation: string;
  instrucationVideo: string;
};

export default function BabysitterProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [profiles, setProfiles] = useState<babysitterProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userData = user?.user_metadata;

  // Get firstAidCertified value safely
  const firstAidValue = profiles?.[0]?.certified ? "yes" : "no";

  // Get hasTransportation value safely
  const transportationValue = profiles?.[0]?.transportation ? "yes" : "no";

  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      // lastName: user?.lastName || '',
      phoneNumber: "",
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
  });

  useEffect(() => {
    if (userData || (profiles && profiles?.length > 0)) {
      const profile = profiles?.[0];
      form.reset({
        fullName: userData?.fullName || "",
        email: userData?.email || "",
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
  }, [profiles, userData, form]);

  // Mutation to update babysitter profile
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Transform some data fields for API compatibility
      const profileData = {
        ...data,
        yearsExperience: data.experienceYears,
        profileCompleted: true, // Profile is completed when form is submitted
        reviewStatus: "pending", // Set review status to pending
      };

      const res = await apiRequest("PATCH", "/api/users/profile", profileData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      toast({
        title: "Profile completed!",
        description:
          "Your profile has been sent to admin for review and will be available soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // fetch Babysitter profile
  const fetchBabysitterProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("babySitterProfile")
      .select("*")
      .eq("userId", userId) // filter by userId
      .limit(1); // expects exactly one row

    if (error) {
      console.error("Fetch error:", error.message);
      return null;
    }

    return data;
  };

  const loadProfile = async () => {
    const data = await fetchBabysitterProfile(user?.id);
    setProfiles(data);
  };

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

    const payload = {
      userId: user?.id,
      phoneNumber: values.phoneNumber,
      shortBio: values.bio,
      experience: values.experienceYears,
      mostExperience: values.ageRangeExperience,
      parentSkill: values.skills,
      aboutWorking: values.enjoymentReason,
      caregiving: values.caregiverStyle,
      horulyRate: values.hourlyRate,
      certified: values.firstAidCertificationDoc,
      transportation: values.driversLicenseDoc,
      instrucationVideo: values.videoUrl,
    };

    try {
      //  Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("babySitterProfile")
        .select("id")
        .eq("userId", user?.id)
        .limit(1);

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      let response;
      if (existingProfile) {
        response = await supabase
          .from("babySitterProfile")
          .update(payload)
          .eq("userId", user?.id);
      } else {
        response = await supabase.from("babySitterProfile").insert(payload);
      }

      const { error } = response;

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: existingProfile
          ? "Profile updated successfully!"
          : "Profile created successfully!",
      });

      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }

    // Proceed with mutation if validation passes
    // profileMutation.mutate(values);
  };

  // Function to handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);

      // Simulate upload process
      setTimeout(() => {
        const videoURL = URL.createObjectURL(e.target.files![0]);
        form.setValue("videoUrl", videoURL);
        form.setValue("hasVideo", true);
        setIsUploading(false);

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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);

      // Simulate upload process
      setTimeout(() => {
        const docURL = URL.createObjectURL(e.target.files![0]);
        form.setValue("firstAidCertificationDoc", docURL);
        setIsUploading(false);

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
      setIsUploading(true);

      // Simulate upload process
      setTimeout(() => {
        const docURL = URL.createObjectURL(e.target.files![0]);
        form.setValue("driversLicenseDoc", docURL);
        setIsUploading(false);

        toast({
          title: "Document uploaded",
          description: "Your driver's license has been uploaded successfully.",
        });
      }, 1500);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

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
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your phone number"
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                                              (value) => value !== range.value
                                            )
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
                                              (value) => value !== skill
                                            )
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
                                disabled={isUploading}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("certification-upload")
                                    ?.click()
                                }
                                disabled={isUploading}
                              >
                                {isUploading ? (
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
                                disabled={isUploading}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("license-upload")
                                    ?.click()
                                }
                                disabled={isUploading}
                              >
                                {isUploading ? (
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
                            disabled={isUploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("video-upload")?.click()
                            }
                            disabled={isUploading}
                          >
                            {isUploading ? (
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
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your profile will be reviewed by our team before it becomes
                visible to parents. This usually takes 1-2 business days.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
