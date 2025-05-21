import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Save, Loader2, Plus, Check, X, Edit, Trash } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Child } from '@shared/schema';

// Schema for emergency contacts
const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

// Schema for child information
const childSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  personality: z.string().min(1, 'Please provide some information about your child\'s personality'),
  specialCare: z.string().optional(),
});

// Schema for the parent profile form with all required fields
const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  hasSecondParent: z.boolean().default(false),
  secondParentFirstName: z.string().optional(),
  secondParentLastName: z.string().optional(),
  secondParentPhone: z.string().optional(),
  parentingStyle: z.string().min(10, 'Please describe your parenting style (min 10 characters)'),
  familyDescription: z.string().min(10, 'Please provide a description of your family (min 10 characters)'),
  familyActivities: z.string().min(10, 'Please describe activities your family enjoys (min 10 characters)'),
  medicalDietaryRestrictions: z.string().min(1, 'Please provide information about any restrictions or indicate "None"'),
  emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
}).superRefine((data, ctx) => {
  // If hasSecondParent is true, then the second parent fields are required
  if (data.hasSecondParent) {
    if (!data.secondParentFirstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondParentFirstName'],
        message: 'Second parent first name is required',
      });
    }
    if (!data.secondParentLastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondParentLastName'],
        message: 'Second parent last name is required',
      });
    }
    if (!data.secondParentPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondParentPhone'],
        message: 'Second parent phone number is required',
      });
    }
  }
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type ChildFormValues = z.infer<typeof childSchema>;

export default function ParentProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isEditingChild, setIsEditingChild] = useState(false);
  const [currentChildId, setCurrentChildId] = useState<number | null>(null);
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
      hasSecondParent: false,
      secondParentFirstName: '',
      secondParentLastName: '',
      secondParentPhone: '',
      parentingStyle: user?.parentingStyle || '',
      familyDescription: user?.familyDescription || '',
      familyActivities: user?.familyActivities || '',
      medicalDietaryRestrictions: user?.medicalDietaryRestrictions || '',
      emergencyContacts: user?.emergencyContacts || [{ name: '', relationship: '', phoneNumber: '' }],
    },
  });

  // Query to get children data
  const { data: children = [], isLoading: isLoadingChildren, refetch: refetchChildren } = useQuery<Child[]>({
    queryKey: ['/api/children'],
    enabled: !!user,
  });

  // Mutation to update parent profile
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const formattedData = {
        ...data,
        profileCompleted: true, // Mark profile as completed with single form submission
      };
      const res = await apiRequest('PATCH', '/api/users/profile', formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: 'Profile completed!',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation to add/update a child
  const childMutation = useMutation({
    mutationFn: async (childData: ChildFormValues) => {
      // Update existing child
      if (isEditingChild && currentChildId) {
        const res = await apiRequest('PATCH', `/api/children/${currentChildId}`, childData);
        return await res.json();
      } 
      // Create new child
      else {
        const res = await apiRequest('POST', '/api/children', childData);
        return await res.json();
      }
    },
    onSuccess: () => {
      refetchChildren(); // Refresh children list
      
      setIsAddingChild(false);
      setIsEditingChild(false);
      setCurrentChildId(null);
      
      // Reset child form values
      setChildFormValues({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        personality: '',
        specialCare: '',
      });
      
      toast({
        title: isEditingChild ? 'Child Updated' : 'Child Added',
        description: isEditingChild 
          ? 'Child information has been updated successfully.' 
          : 'Child has been added to your profile.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete a child
  const deleteChildMutation = useMutation({
    mutationFn: async (childId: number) => {
      const res = await apiRequest('DELETE', `/api/children/${childId}`);
      return await res.json();
    },
    onSuccess: () => {
      refetchChildren(); // Refresh children list
      
      toast({
        title: 'Child Removed',
        description: 'Child has been removed from your profile.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Function to handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    // Check if the user has added at least one child
    if (children.length === 0) {
      toast({
        title: 'Profile Incomplete',
        description: 'Please add at least one child to your profile.',
        variant: 'destructive',
      });
      return;
    }
    
    // Proceed with profile update
    profileMutation.mutate(values);
  };

  // Function to handle adding emergency contact
  const addEmergencyContact = () => {
    const currentContacts = form.getValues('emergencyContacts') || [];
    form.setValue('emergencyContacts', [
      ...currentContacts,
      { name: '', relationship: '', phoneNumber: '' }
    ]);
  };

  // Function to handle removing emergency contact
  const removeEmergencyContact = (index: number) => {
    const currentContacts = form.getValues('emergencyContacts') || [];
    if (currentContacts.length > 1) { // Ensure at least one emergency contact remains
      const updatedContacts = currentContacts.filter((_, i) => i !== index);
      form.setValue('emergencyContacts', updatedContacts);
    } else {
      toast({
        title: 'Cannot Remove',
        description: 'At least one emergency contact is required.',
        variant: 'destructive',
      });
    }
  };

  // Function to handle child form change
  const handleChildFormChange = (field: keyof ChildFormValues, value: string) => {
    setChildFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to handle child add/edit
  const handleAddEditChild = () => {
    // Simple validation
    if (!childFormValues.firstName || !childFormValues.lastName || !childFormValues.dateOfBirth || !childFormValues.personality) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    childMutation.mutate(childFormValues);
  };

  // Function to edit a child
  const handleEditChild = (child: Child) => {
    // Convert any null or undefined values to empty strings
    setChildFormValues({
      firstName: child.firstName || '',
      lastName: child.lastName || '',
      dateOfBirth: typeof child.dateOfBirth === 'string' ? child.dateOfBirth : '',
      personality: child.personality || '',
      specialCare: child.specialCare || '',
    });
    setCurrentChildId(child.id);
    setIsEditingChild(true);
    setIsAddingChild(true);
  };

  // Function to delete a child
  const handleDeleteChild = (childId: number) => {
    if (confirm('Are you sure you want to remove this child from your profile?')) {
      deleteChildMutation.mutate(childId);
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
        <CardTitle className="text-2xl font-bold">Complete Your Parent Profile</CardTitle>
        <CardDescription>
          Provide information about you and your family to help babysitters better understand your childcare needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h3>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              
              <div className="space-y-4 border rounded-md p-4 mt-4">
                <FormField
                  control={form.control}
                  name="hasSecondParent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="hasSecondParent"
                          />
                          <Label htmlFor="hasSecondParent" className="font-medium">
                            Add Second Parent/Guardian
                          </Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('hasSecondParent') && (
                  <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="secondParentFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Second Parent First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter first name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondParentLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Second Parent Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter last name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="secondParentPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Second Parent Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter phone number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Children Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b">Children</h3>
              <div className="space-y-4">
                {isLoadingChildren ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : children.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {children.map((child) => (
                        <div key={child.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{child.firstName} {child.lastName}</h4>
                              <p className="text-sm text-muted-foreground">Born: {child.dateOfBirth instanceof Date ? child.dateOfBirth.toLocaleDateString() : String(child.dateOfBirth)}</p>
                              <p className="mt-2"><span className="font-medium">Personality:</span> {child.personality}</p>
                              {child.specialCare && (
                                <p className="mt-1"><span className="font-medium">Special Care Needs:</span> {child.specialCare}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="icon" onClick={() => handleEditChild(child)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDeleteChild(child.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-6 text-center">
                    <p className="text-muted-foreground">No children added yet</p>
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingChild(true)}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add a Child
                </Button>
                
                {/* Add/Edit Child Dialog */}
                <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isEditingChild ? 'Edit Child Information' : 'Add a Child'}</DialogTitle>
                      <DialogDescription>
                        Provide details about your child to help babysitters prepare.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="childFirstName">First Name</Label>
                          <Input
                            id="childFirstName"
                            value={childFormValues.firstName}
                            onChange={(e) => handleChildFormChange('firstName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="childLastName">Last Name</Label>
                          <Input
                            id="childLastName"
                            value={childFormValues.lastName}
                            onChange={(e) => handleChildFormChange('lastName', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="childDob">Date of Birth</Label>
                        <Input
                          id="childDob"
                          type="date"
                          value={childFormValues.dateOfBirth}
                          onChange={(e) => handleChildFormChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="childPersonality">Personality & Interests</Label>
                        <Textarea
                          id="childPersonality"
                          value={childFormValues.personality}
                          onChange={(e) => handleChildFormChange('personality', e.target.value)}
                          placeholder="Describe your child's personality, what they enjoy, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="childSpecialCare">Special Care Needs (Optional)</Label>
                        <Textarea
                          id="childSpecialCare"
                          value={childFormValues.specialCare}
                          onChange={(e) => handleChildFormChange('specialCare', e.target.value)}
                          placeholder="Any allergies, medications, or special instructions..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingChild(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddEditChild} disabled={childMutation.isPending}>
                        {childMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditingChild ? 'Updating...' : 'Adding...'}
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {isEditingChild ? 'Update Child' : 'Add Child'}
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Family Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b">Family Information</h3>
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
                          placeholder="Describe your parenting philosophy and approach..."
                          rows={3}
                        />
                      </FormControl>
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
                          placeholder="Tell us about your family..."
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
                      <FormLabel>Medical/Dietary Restrictions</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Any allergies, dietary restrictions, or medical concerns?"
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        If there are none, please write "None".
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Emergency Contacts Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b">Emergency Contacts</h3>
              <div className="space-y-4">
                {form.watch('emergencyContacts')?.map((_, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Emergency Contact #{index + 1}</h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmergencyContact(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`emergencyContacts.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter contact name" />
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
                              <Input {...field} placeholder="e.g., Grandparent, Neighbor" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`emergencyContacts.${index}.phoneNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter phone number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEmergencyContact}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Emergency Contact
                </Button>
              </div>
            </div>
            
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertDescription>
                Please make sure you've added at least one child to your profile before submitting.
              </AlertDescription>
            </Alert>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={profileMutation.isPending}
            >
              {profileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Profile...
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