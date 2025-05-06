import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Save, Loader2, Upload, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema for the babysitter profile form
const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().min(10, 'Please provide a brief bio (at least 10 characters)'),
  experienceYears: z.string().min(1, 'Please select your experience level'),
  ageRangeExperience: z.array(z.string()).min(1, 'Please select at least one age range'),
  enjoymentReason: z.string().min(10, 'Please share what you enjoy about working with children'),
  caregiverStyle: z.string().min(10, 'Please share your caregiving style'),
  hasVideo: z.boolean().default(false),
  videoUrl: z.string().optional(),
  hourlyRate: z.string()
    .min(1, 'Please specify your hourly rate')
    .refine(val => {
      const rate = Number(val);
      return !isNaN(rate) && rate >= 35 && rate <= 50;
    }, 'Hourly rate must be between $35 and $50'),
  firstAidCertified: z.enum(['yes', 'no']).default('no'),
  firstAidCertificationDoc: z.string().optional()
    .refine(
      (val: string | undefined, ctx: z.RefinementCtx) => {
        // If firstAidCertified is 'yes', certification doc is required
        if (ctx.path[0] === 'firstAidCertificationDoc' && 
            ctx.parent && 
            (ctx.parent as any).firstAidCertified === 'yes') {
          return !!val;
        }
        return true;
      }, 
      { message: 'Certification document is required' }
    ),
  hasTransportation: z.enum(['yes', 'no']).default('no'),
  driversLicenseDoc: z.string().optional()
    .refine(
      (val: string | undefined, ctx: z.RefinementCtx) => {
        // If hasTransportation is 'yes', driver's license doc is required
        if (ctx.path[0] === 'driversLicenseDoc' && 
            ctx.parent && 
            (ctx.parent as any).hasTransportation === 'yes') {
          return !!val;
        }
        return true;
      }, 
      { message: 'Driver\'s license document is required' }
    ),
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Available skills for babysitters
const AVAILABLE_SKILLS = [
  'Arts & Crafts', 
  'Music', 
  'Sports', 
  'Cooking', 
  'Homework Help', 
  'Special Needs Experience', 
  'Multilingual', 
  'Infant Care',
  'Toddler Experience',
  'Outdoor Activities',
];

// Experience years options
const EXPERIENCE_YEARS = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-2", label: "1-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "More than 10 years" }
];

// Age ranges options
const AGE_RANGES = [
  { value: "infant", label: "Infant (0-1 year)" },
  { value: "toddler", label: "Toddler (1-3 years)" },
  { value: "preschool", label: "Preschool (3-5 years)" },
  { value: "schoolAge", label: "School Age (5-12 years)" },
  { value: "teenager", label: "Teenager (13-18 years)" }
];

export default function BabysitterProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isUploading, setIsUploading] = useState(false);

  // Form for babysitter profile
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      bio: user?.bio || '',
      experienceYears: user?.yearsExperience ? String(user.yearsExperience) : '',
      ageRangeExperience: [],
      enjoymentReason: '',
      caregiverStyle: '',
      hasVideo: false,
      videoUrl: '',
      hourlyRate: user?.hourlyRate ? String(user.hourlyRate) : '35',
      firstAidCertified: user?.firstAidCertified ? 'yes' : 'no',
      firstAidCertificationDoc: '',
      hasTransportation: user?.hasTransportation ? 'yes' : 'no',
      driversLicenseDoc: '',
      skills: user?.skills || [],
    },
  });

  // Mutation to update babysitter profile
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Transform some data fields for API compatibility
      const profileData = {
        ...data,
        yearsExperience: data.experienceYears,
        profileCompleted: activeTab === 'additional-info' ? true : undefined,
      };
      
      const res = await apiRequest('PATCH', '/api/users/profile', profileData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Different messages based on which tab was completed
      if (activeTab === 'additional-info') {
        toast({
          title: 'Profile completed!',
          description: 'Your babysitter profile has been successfully completed.',
        });
      } else {
        toast({
          title: 'Section saved',
          description: 'Your profile has been updated successfully.',
        });
      }
      
      // Move to the next tab after successful update
      if (activeTab === 'basic-info') {
        setActiveTab('experience');
      } else if (activeTab === 'experience') {
        setActiveTab('additional-info');
      }
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Function to handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    // Log form validation errors if any
    if (Object.keys(form.formState.errors).length > 0) {
      console.log('Form validation errors:', form.formState.errors);
      toast({
        title: 'Form validation failed',
        description: 'Please check all required fields are filled correctly.',
        variant: 'destructive',
      });
      return;
    }

    // Proceed with mutation if validation passes
    profileMutation.mutate(values);
  };

  // Function to handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      
      // Simulate upload process
      setTimeout(() => {
        const videoURL = URL.createObjectURL(e.target.files![0]);
        form.setValue('videoUrl', videoURL);
        form.setValue('hasVideo', true);
        setIsUploading(false);
        
        toast({
          title: 'Video uploaded',
          description: 'Your introduction video has been uploaded successfully.',
        });
      }, 2000);
    }
  };
  
  // Function to handle certification document upload
  const handleCertificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      
      // Simulate upload process
      setTimeout(() => {
        const docURL = URL.createObjectURL(e.target.files![0]);
        form.setValue('firstAidCertificationDoc', docURL);
        setIsUploading(false);
        
        toast({
          title: 'Document uploaded',
          description: 'Your certification document has been uploaded successfully.',
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
        form.setValue('driversLicenseDoc', docURL);
        setIsUploading(false);
        
        toast({
          title: 'Document uploaded',
          description: 'Your driver\'s license has been uploaded successfully.',
        });
      }, 1500);
    }
  };

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
        <CardTitle className="text-2xl font-bold">Complete Your Babysitter Profile</CardTitle>
        <CardDescription>
          Provide information about yourself, your experience, and your caregiving style to help parents find the perfect match.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="additional-info">Additional Info</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic-info">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
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
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your phone number" />
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
                          <Input {...field} placeholder="Enter your email address" type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save & Continue
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Experience Tab */}
          <TabsContent value="experience">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long have you been a babysitter?</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years of experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPERIENCE_YEARS.map(option => (
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
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>What age ranges do you have the most experience with?</FormLabel>
                        <FormDescription>
                          Select all that apply
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {AGE_RANGES.map((age) => (
                          <FormField
                            key={age.value}
                            control={form.control}
                            name="ageRangeExperience"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={age.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(age.value)}
                                      onCheckedChange={(checked) => {
                                        let updatedValue = [...field.value || []];
                                        if (checked) {
                                          updatedValue.push(age.value);
                                        } else {
                                          updatedValue = updatedValue.filter(
                                            (value) => value !== age.value
                                          );
                                        }
                                        field.onChange(updatedValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {age.label}
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
                  name="enjoymentReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you enjoy most about working with children?</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Share your passion for working with children..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save & Continue
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Additional Information Tab */}
          <TabsContent value="additional-info">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="caregiverStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Share anything you would like parents to know about your caregiver style or experience</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your approach to childcare..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="35"
                          max="50"
                          placeholder="35"
                        />
                      </FormControl>
                      <FormDescription>
                        Hourly rates must be between $35 and $50
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstAidCertified"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          Are you First Aid / CPR certified?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Yes
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                No
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          First Aid and CPR certification is required to work as a babysitter with The Enchanted Co.
                        </FormDescription>
                        
                        {field.value === 'no' && (
                          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-800" />
                            <AlertDescription>
                              First Aid / CPR certification is required. Please obtain certification before you can start babysitting.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {field.value === 'yes' && (
                          <div className="space-y-3 mt-3">
                            <FormField
                              control={form.control}
                              name="firstAidCertificationDoc"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Upload Certification Document</FormLabel>
                                  <FormControl>
                                    <div className="flex flex-col space-y-2">
                                      <Input
                                        type="file"
                                        id="certification-upload"
                                        onChange={handleCertificationUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                      />
                                      <div className="flex items-center gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => document.getElementById('certification-upload')?.click()}
                                          disabled={isUploading}
                                        >
                                          {isUploading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          ) : (
                                            <Upload className="mr-2 h-4 w-4" />
                                          )}
                                          {field.value ? 'Change Document' : 'Upload Document'}
                                        </Button>
                                        {field.value && (
                                          <span className="text-sm text-green-600">Document uploaded</span>
                                        )}
                                      </div>
                                      {!field.value && (
                                        <p className="text-sm text-gray-500">
                                          Upload a copy of your certification (PDF, JPG, or PNG)
                                        </p>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Yes
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                No
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Having your own transportation is preferred for babysitting positions that require travel.
                        </FormDescription>
                        
                        {field.value === 'no' && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Without your own transportation, you may be limited to certain babysitting opportunities in your immediate area.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {field.value === 'yes' && (
                          <div className="space-y-3 mt-3">
                            <FormField
                              control={form.control}
                              name="driversLicenseDoc"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Upload Driver's License</FormLabel>
                                  <FormControl>
                                    <div className="flex flex-col space-y-2">
                                      <Input
                                        type="file"
                                        id="license-upload"
                                        onChange={handleLicenseUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                      />
                                      <div className="flex items-center gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => document.getElementById('license-upload')?.click()}
                                          disabled={isUploading}
                                        >
                                          {isUploading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          ) : (
                                            <Upload className="mr-2 h-4 w-4" />
                                          )}
                                          {field.value ? 'Change Document' : 'Upload License'}
                                        </Button>
                                        {field.value && (
                                          <span className="text-sm text-green-600">License uploaded</span>
                                        )}
                                      </div>
                                      {!field.value && (
                                        <p className="text-sm text-gray-500">
                                          Upload a copy of your driver's license (PDF, JPG, or PNG)
                                        </p>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Skills</FormLabel>
                        <FormDescription>
                          Select all skills that apply to you
                        </FormDescription>
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
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(skill)}
                                      onCheckedChange={(checked) => {
                                        let updatedValue = [...field.value || []];
                                        if (checked) {
                                          updatedValue.push(skill);
                                        } else {
                                          updatedValue = updatedValue.filter(
                                            (value) => value !== skill
                                          );
                                        }
                                        field.onChange(updatedValue);
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
                
                <div className="border rounded-lg p-4 space-y-4">
                  <FormLabel>Upload a video introducing yourself</FormLabel>
                  <FormDescription>
                    Record a short (30-60 second) video introducing yourself to parents
                  </FormDescription>
                  
                  {form.watch('videoUrl') ? (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-2">Video uploaded successfully!</p>
                      <video 
                        controls 
                        className="w-full max-h-48 object-cover rounded-md"
                        src={form.watch('videoUrl')}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center border-2 border-dashed rounded-md p-6">
                      <Label
                        htmlFor="video-upload" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          {isUploading ? 'Uploading...' : 'Click to upload your introduction video'}
                        </span>
                        <Input 
                          id="video-upload" 
                          type="file" 
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoUpload}
                          disabled={isUploading}
                        />
                      </Label>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="mt-4"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Complete Profile
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}