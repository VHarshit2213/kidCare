import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Child } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlusCircle, Trash2, Save, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Schema for child information
const childSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  personality: z.string().optional(),
  specialCare: z.string().optional(),
});

// Schema for emergency contact
const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

// Schema for the parent profile form
const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  parentingStyle: z.string().optional(),
  familyDescription: z.string().optional(),
  familyActivities: z.string().optional(),
  medicalDietaryRestrictions: z.string().optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type ChildFormValues = z.infer<typeof childSchema>;

export default function ParentProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal-info');
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [childFormValues, setChildFormValues] = useState<ChildFormValues>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    personality: '',
    specialCare: '',
  });
  
  // Form for parent profile
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      address: user?.address || '',
      phoneNumber: user?.phoneNumber || '',
      parentingStyle: user?.parentingStyle || '',
      familyDescription: user?.familyDescription || '',
      familyActivities: user?.familyActivities || '',
      medicalDietaryRestrictions: user?.medicalDietaryRestrictions || '',
      emergencyContacts: user?.emergencyContacts || [{ name: '', relationship: '', phoneNumber: '' }],
    },
  });

  // Query to get children data
  const { data: children = [], isLoading: isLoadingChildren } = useQuery<Child[]>({
    queryKey: ['/api/children'],
    enabled: !!user,
  });

  // Mutation to update parent profile
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest('PATCH', '/api/users/profile', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      // Move to the next tab after successful update
      if (activeTab === 'personal-info') {
        setActiveTab('children');
      } else if (activeTab === 'children') {
        setActiveTab('family');
      } else if (activeTab === 'family') {
        setActiveTab('emergency');
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

  // Mutation to add a child
  const addChildMutation = useMutation({
    mutationFn: async (data: ChildFormValues & { parentId: number }) => {
      const res = await apiRequest('POST', '/api/children', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      toast({
        title: 'Child added',
        description: 'Your child has been added successfully.',
      });
      setIsAddingChild(false);
      setChildFormValues({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        personality: '',
        specialCare: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error adding child',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Function to update each section of the profile
  const onSubmit = (values: ProfileFormValues) => {
    profileMutation.mutate(values);
  };

  // Function to add a child
  const handleAddChild = () => {
    if (!user) return;
    
    if (!childFormValues.firstName || !childFormValues.lastName) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least the first and last name of your child.',
        variant: 'destructive',
      });
      return;
    }

    addChildMutation.mutate({
      ...childFormValues,
      parentId: user.id,
    });
  };

  // Function to handle changes to child form
  const handleChildFormChange = (field: keyof ChildFormValues, value: string) => {
    setChildFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to add a new emergency contact field
  const addEmergencyContact = () => {
    const currentContacts = form.getValues('emergencyContacts') || [];
    form.setValue('emergencyContacts', [
      ...currentContacts,
      { name: '', relationship: '', phoneNumber: '' },
    ]);
  };

  // Function to remove an emergency contact field
  const removeEmergencyContact = (index: number) => {
    const currentContacts = form.getValues('emergencyContacts') || [];
    form.setValue(
      'emergencyContacts',
      currentContacts.filter((_, i) => i !== index)
    );
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
        <CardTitle className="text-2xl font-bold">Complete Your Parent Profile</CardTitle>
        <CardDescription>
          Provide information about you and your family to help babysitters better understand your childcare needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
          </TabsList>
          
          {/* Personal Information Tab */}
          <TabsContent value="personal-info">
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
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      Save & Continue
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Children Tab */}
          <TabsContent value="children">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Your Children</h3>
              
              {isLoadingChildren ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : children.length > 0 ? (
                <div className="space-y-4">
                  {children.map((child) => (
                    <Card key={child.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{child.firstName} {child.lastName}</CardTitle>
                        {child.dateOfBirth && (
                          <CardDescription>Date of Birth: {new Date(child.dateOfBirth).toLocaleDateString()}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        {child.personality && (
                          <div className="mb-2">
                            <h4 className="font-semibold">Personality & Interests:</h4>
                            <p>{child.personality}</p>
                          </div>
                        )}
                        {child.specialCare && (
                          <div>
                            <h4 className="font-semibold">Special Care Requirements:</h4>
                            <p>{child.specialCare}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No children added yet. Please add your children below.</p>
              )}
              
              <Separator className="my-4" />
              
              {isAddingChild ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add a Child</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="childFirstName">First Name</Label>
                          <Input 
                            id="childFirstName"
                            value={childFormValues.firstName}
                            onChange={(e) => handleChildFormChange('firstName', e.target.value)}
                            placeholder="Enter first name" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="childLastName">Last Name</Label>
                          <Input 
                            id="childLastName"
                            value={childFormValues.lastName}
                            onChange={(e) => handleChildFormChange('lastName', e.target.value)}
                            placeholder="Enter last name" 
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="childDOB">Date of Birth</Label>
                        <Input 
                          id="childDOB"
                          type="date"
                          value={childFormValues.dateOfBirth}
                          onChange={(e) => handleChildFormChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="childPersonality">Personality & Interests</Label>
                        <Textarea 
                          id="childPersonality"
                          value={childFormValues.personality}
                          onChange={(e) => handleChildFormChange('personality', e.target.value)}
                          placeholder="Describe your child's personality, interests, and activities they enjoy"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="childSpecialCare">Special Care Requirements</Label>
                        <Textarea 
                          id="childSpecialCare"
                          value={childFormValues.specialCare}
                          onChange={(e) => handleChildFormChange('specialCare', e.target.value)}
                          placeholder="Any allergies, medical needs, dietary restrictions, or special instructions"
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsAddingChild(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddChild}
                      disabled={addChildMutation.isPending}
                    >
                      {addChildMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Child
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Button onClick={() => setIsAddingChild(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add a Child
                </Button>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={() => {
                    form.handleSubmit(onSubmit)();
                  }}
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
              </div>
            </div>
          </TabsContent>
          
          {/* Family Tab */}
          <TabsContent value="family">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="parentingStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parenting Style</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe your parenting style and approach" 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          This helps babysitters understand your parenting approach and values.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="familyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Tell us about your family (size, composition, etc.)" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="familyActivities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Activities</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="What activities does your family enjoy together?" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="medicalDietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical & Dietary Information</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any family medical conditions or dietary restrictions babysitters should be aware of" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      Save & Continue
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Emergency Contacts</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEmergencyContact}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Contact
                    </Button>
                  </div>
                  
                  {form.watch('emergencyContacts')?.map((_, index) => (
                    <div key={index} className="p-4 border rounded-md relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-destructive h-8 w-8 p-0"
                        onClick={() => removeEmergencyContact(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <FormField
                          control={form.control}
                          name={`emergencyContacts.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Contact name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`emergencyContacts.${index}.relationship`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. Grandparent, Friend" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`emergencyContacts.${index}.phoneNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Phone number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
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