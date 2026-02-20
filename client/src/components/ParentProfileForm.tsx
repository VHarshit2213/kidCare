/* -------------- old code for reference ------------ */

// import { useState } from 'react';
// import { useAuth } from '@/hooks/use-auth';
// import { useToast } from '@/hooks/use-toast';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { apiRequest, queryClient } from '@/lib/queryClient';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import { Save, Loader2, Plus, Check, X, Edit, Trash } from 'lucide-react';

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Child } from '@shared/schema';

// // Schema for emergency contacts
// const emergencyContactSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   relationship: z.string().min(1, 'Relationship is required'),
//   phoneNumber: z.string().min(1, 'Phone number is required'),
// });

// // Schema for child information
// const childSchema = z.object({
//   firstName: z.string().min(1, 'First name is required'),
//   lastName: z.string().min(1, 'Last name is required'),
//   dateOfBirth: z.string().min(1, 'Date of birth is required'),
//   personality: z.string().min(1, 'Please provide some information about your child\'s personality'),
//   specialCare: z.string().optional(),
// });

// // Schema for the parent profile form with all required fields
// const profileFormSchema = z.object({
//   firstName: z.string().min(1, 'First name is required'),
//   lastName: z.string().min(1, 'Last name is required'),
//   address: z.string().min(1, 'Address is required'),
//   phoneNumber: z.string().min(1, 'Phone number is required'),
//   hasSecondParent: z.boolean().default(false),
//   secondParentFirstName: z.string().optional(),
//   secondParentLastName: z.string().optional(),
//   secondParentPhone: z.string().optional(),
//   parentingStyle: z.string().min(10, 'Please describe your parenting style (min 10 characters)'),
//   familyDescription: z.string().min(10, 'Please provide a description of your family (min 10 characters)'),
//   familyActivities: z.string().min(10, 'Please describe activities your family enjoys (min 10 characters)'),
//   medicalDietaryRestrictions: z.string().min(1, 'Please provide information about any restrictions or indicate "None"'),
//   emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
// }).superRefine((data, ctx) => {
//   // If hasSecondParent is true, then the second parent fields are required
//   if (data.hasSecondParent) {
//     if (!data.secondParentFirstName) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ['secondParentFirstName'],
//         message: 'Second parent first name is required',
//       });
//     }
//     if (!data.secondParentLastName) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ['secondParentLastName'],
//         message: 'Second parent last name is required',
//       });
//     }
//     if (!data.secondParentPhone) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ['secondParentPhone'],
//         message: 'Second parent phone number is required',
//       });
//     }
//   }
// });

// type ProfileFormValues = z.infer<typeof profileFormSchema>;
// type ChildFormValues = z.infer<typeof childSchema>;

// export default function ParentProfileForm() {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const [isAddingChild, setIsAddingChild] = useState(false);
//   const [isEditingChild, setIsEditingChild] = useState(false);
//   const [currentChildId, setCurrentChildId] = useState<number | null>(null);
//   const [childFormValues, setChildFormValues] = useState<ChildFormValues>({
//     firstName: '',
//     lastName: '',
//     dateOfBirth: '',
//     personality: '',
//     specialCare: '',
//   });

//   // Form for parent profile
//   const form = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileFormSchema),
//     defaultValues: {
//       firstName: user?.firstName || '',
//       lastName: user?.lastName || '',
//       address: user?.address || '',
//       phoneNumber: user?.phoneNumber || '',
//       hasSecondParent: false,
//       secondParentFirstName: '',
//       secondParentLastName: '',
//       secondParentPhone: '',
//       parentingStyle: user?.parentingStyle || '',
//       familyDescription: user?.familyDescription || '',
//       familyActivities: user?.familyActivities || '',
//       medicalDietaryRestrictions: user?.medicalDietaryRestrictions || '',
//       emergencyContacts: user?.emergencyContacts || [{ name: '', relationship: '', phoneNumber: '' }],
//     },
//   });

//   // Query to get children data
//   const { data: children = [], isLoading: isLoadingChildren, refetch: refetchChildren } = useQuery<Child[]>({
//     queryKey: ['/api/children'],
//     enabled: !!user,
//   });

//   // Mutation to update parent profile
//   const profileMutation = useMutation({
//     mutationFn: async (data: ProfileFormValues) => {
//       const formattedData = {
//         ...data,
//         profileCompleted: true, // Mark profile as completed with single form submission
//       };
//       const res = await apiRequest('PATCH', '/api/users/profile', formattedData);
//       return await res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['/api/user'] });

//       toast({
//         title: 'Profile completed!',
//         description: 'Your profile has been successfully updated.',
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: 'Error updating profile',
//         description: error.message,
//         variant: 'destructive',
//       });
//     },
//   });

//   // Mutation to add/update a child
//   const childMutation = useMutation({
//     mutationFn: async (childData: ChildFormValues) => {
//       // Update existing child
//       if (isEditingChild && currentChildId) {
//         const res = await apiRequest('PATCH', `/api/children/${currentChildId}`, childData);
//         return await res.json();
//       }
//       // Create new child
//       else {
//         const childDataWithParent = {
//           ...childData,
//           parentId: user?.id,
//           name: `${childData.firstName} ${childData.lastName}`, // Add combined name field
//         };
//         const res = await apiRequest('POST', '/api/children', childDataWithParent);
//         return await res.json();
//       }
//     },
//     onSuccess: () => {
//       refetchChildren(); // Refresh children list

//       setIsAddingChild(false);
//       setIsEditingChild(false);
//       setCurrentChildId(null);

//       // Reset child form values
//       setChildFormValues({
//         firstName: '',
//         lastName: '',
//         dateOfBirth: '',
//         personality: '',
//         specialCare: '',
//       });

//       toast({
//         title: isEditingChild ? 'Child Updated' : 'Child Added',
//         description: isEditingChild
//           ? 'Child information has been updated successfully.'
//           : 'Child has been added to your profile.',
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       });
//     },
//   });

//   // Mutation to delete a child
//   const deleteChildMutation = useMutation({
//     mutationFn: async (childId: number) => {
//       const res = await apiRequest('DELETE', `/api/children/${childId}`);
//       return await res.json();
//     },
//     onSuccess: () => {
//       refetchChildren(); // Refresh children list

//       toast({
//         title: 'Child Removed',
//         description: 'Child has been removed from your profile.',
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: 'Error',
//         description: error.message,
//         variant: 'destructive',
//       });
//     },
//   });

//   // Function to handle form submission
//   const onSubmit = (values: ProfileFormValues) => {
//     // Check if the user has added at least one child
//     if (children.length === 0) {
//       toast({
//         title: 'Profile Incomplete',
//         description: 'Please add at least one child to your profile.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     // Proceed with profile update
//     profileMutation.mutate(values);
//   };

//   // Function to handle adding emergency contact
//   const addEmergencyContact = () => {
//     const currentContacts = form.getValues('emergencyContacts') || [];
//     form.setValue('emergencyContacts', [
//       ...currentContacts,
//       { name: '', relationship: '', phoneNumber: '' }
//     ]);
//   };

//   // Function to handle removing emergency contact
//   const removeEmergencyContact = (index: number) => {
//     const currentContacts = form.getValues('emergencyContacts') || [];
//     if (currentContacts.length > 1) { // Ensure at least one emergency contact remains
//       const updatedContacts = currentContacts.filter((_, i) => i !== index);
//       form.setValue('emergencyContacts', updatedContacts);
//     } else {
//       toast({
//         title: 'Cannot Remove',
//         description: 'At least one emergency contact is required.',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Function to handle child form change
//   const handleChildFormChange = (field: keyof ChildFormValues, value: string) => {
//     setChildFormValues(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Function to handle child add/edit
//   const handleAddEditChild = () => {
//     // Simple validation
//     if (!childFormValues.firstName || !childFormValues.lastName || !childFormValues.dateOfBirth || !childFormValues.personality) {
//       toast({
//         title: 'Missing Information',
//         description: 'Please fill in all required fields.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     childMutation.mutate(childFormValues);
//   };

//   // Function to edit a child
//   const handleEditChild = (child: Child) => {
//     // Convert any null or undefined values to empty strings
//     setChildFormValues({
//       firstName: child.firstName || '',
//       lastName: child.lastName || '',
//       dateOfBirth: typeof child.dateOfBirth === 'string' ? child.dateOfBirth : '',
//       personality: child.personality || '',
//       specialCare: child.specialCare || '',
//     });
//     setCurrentChildId(child.id);
//     setIsEditingChild(true);
//     setIsAddingChild(true);
//   };

//   // Function to delete a child
//   const handleDeleteChild = (childId: number) => {
//     if (confirm('Are you sure you want to remove this child from your profile?')) {
//       deleteChildMutation.mutate(childId);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <p>Please log in to access your profile.</p>
//       </div>
//     );
//   }

//   return (
//     <Card className="w-full max-w-4xl mx-auto">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold">Complete Your Parent Profile</CardTitle>
//         <CardDescription>
//           Provide information about you and your family to help babysitters better understand your childcare needs.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//             {/* Personal Information Section */}
//             <div>
//               <h3 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="firstName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>First Name</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="Enter your first name" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="lastName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Last Name</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="Enter your last name" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                 <FormField
//                   control={form.control}
//                   name="address"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Address</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="Enter your address" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="phoneNumber"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Phone Number</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="Enter your phone number" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="space-y-4 border rounded-md p-4 mt-4">
//                 <FormField
//                   control={form.control}
//                   name="hasSecondParent"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
//                       <FormControl>
//                         <div className="flex items-center space-x-2">
//                           <Checkbox
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             id="hasSecondParent"
//                           />
//                           <Label htmlFor="hasSecondParent" className="font-medium">
//                             Add Second Parent/Guardian
//                           </Label>
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {form.watch('hasSecondParent') && (
//                   <div className="space-y-4 mt-2">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="secondParentFirstName"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Second Parent First Name</FormLabel>
//                             <FormControl>
//                               <Input {...field} placeholder="Enter first name" />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="secondParentLastName"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Second Parent Last Name</FormLabel>
//                             <FormControl>
//                               <Input {...field} placeholder="Enter last name" />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     <FormField
//                       control={form.control}
//                       name="secondParentPhone"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Second Parent Phone Number</FormLabel>
//                           <FormControl>
//                             <Input {...field} placeholder="Enter phone number" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Children Section */}
//             <div>
//               <h3 className="text-lg font-medium mb-4 pb-2 border-b">Children</h3>
//               <div className="space-y-4">
//                 {isLoadingChildren ? (
//                   <div className="flex justify-center">
//                     <Loader2 className="h-6 w-6 animate-spin" />
//                   </div>
//                 ) : children.length > 0 ? (
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-1 gap-3">
//                       {children.map((child) => (
//                         <div key={child.id} className="border rounded-md p-4">
//                           <div className="flex justify-between items-start">
//                             <div>
//                               <h4 className="font-semibold">{child.firstName} {child.lastName}</h4>
//                               <p className="text-sm text-muted-foreground">Born: {child.dateOfBirth instanceof Date ? child.dateOfBirth.toLocaleDateString() : String(child.dateOfBirth)}</p>
//                               <p className="mt-2"><span className="font-medium">Personality:</span> {child.personality}</p>
//                               {child.specialCare && (
//                                 <p className="mt-1"><span className="font-medium">Special Care Needs:</span> {child.specialCare}</p>
//                               )}
//                             </div>
//                             <div className="flex space-x-2">
//                               <Button variant="outline" size="icon" onClick={() => handleEditChild(child)}>
//                                 <Edit className="h-4 w-4" />
//                               </Button>
//                               <Button variant="outline" size="icon" onClick={() => handleDeleteChild(child.id)}>
//                                 <Trash className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="border border-dashed rounded-md p-6 text-center">
//                     <p className="text-muted-foreground">No children added yet</p>
//                   </div>
//                 )}

//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsAddingChild(true)}
//                   className="mt-2"
//                 >
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add a Child
//                 </Button>

//                 {/* Add/Edit Child Dialog */}
//                 <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
//                   <DialogContent>
//                     <DialogHeader>
//                       <DialogTitle>{isEditingChild ? 'Edit Child Information' : 'Add a Child'}</DialogTitle>
//                       <DialogDescription>
//                         Provide details about your child to help babysitters prepare.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="childFirstName">First Name</Label>
//                           <Input
//                             id="childFirstName"
//                             value={childFormValues.firstName}
//                             onChange={(e) => handleChildFormChange('firstName', e.target.value)}
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label htmlFor="childLastName">Last Name</Label>
//                           <Input
//                             id="childLastName"
//                             value={childFormValues.lastName}
//                             onChange={(e) => handleChildFormChange('lastName', e.target.value)}
//                           />
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="childDob">Date of Birth</Label>
//                         <Input
//                           id="childDob"
//                           type="date"
//                           value={childFormValues.dateOfBirth}
//                           onChange={(e) => handleChildFormChange('dateOfBirth', e.target.value)}
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="childPersonality">Personality & Interests</Label>
//                         <Textarea
//                           id="childPersonality"
//                           value={childFormValues.personality}
//                           onChange={(e) => handleChildFormChange('personality', e.target.value)}
//                           placeholder="Describe your child's personality, what they enjoy, etc."
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="childSpecialCare">Special Care Needs (Optional)</Label>
//                         <Textarea
//                           id="childSpecialCare"
//                           value={childFormValues.specialCare}
//                           onChange={(e) => handleChildFormChange('specialCare', e.target.value)}
//                           placeholder="Any allergies, medications, or special instructions..."
//                         />
//                       </div>
//                     </div>
//                     <DialogFooter>
//                       <Button variant="outline" onClick={() => setIsAddingChild(false)}>
//                         Cancel
//                       </Button>
//                       <Button type="button" onClick={handleAddEditChild} disabled={childMutation.isPending}>
//                         {childMutation.isPending ? (
//                           <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             {isEditingChild ? 'Updating...' : 'Adding...'}
//                           </>
//                         ) : (
//                           <>
//                             <Check className="mr-2 h-4 w-4" />
//                             {isEditingChild ? 'Update Child' : 'Add Child'}
//                           </>
//                         )}
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </div>

//             {/* Family Information Section */}
//             <div>
//               <h3 className="text-lg font-medium mb-4 pb-2 border-b">Family Information</h3>
//               <div className="space-y-4">
//                 <FormField
//                   control={form.control}
//                   name="parentingStyle"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Parenting Style</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           {...field}
//                           placeholder="Describe your parenting philosophy and approach..."
//                           rows={3}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="familyDescription"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Family Description</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           {...field}
//                           placeholder="Tell us about your family..."
//                           rows={3}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="familyActivities"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Family Activities</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           {...field}
//                           placeholder="What activities does your family enjoy together?"
//                           rows={3}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="medicalDietaryRestrictions"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Medical/Dietary Restrictions</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           {...field}
//                           placeholder="Any allergies, dietary restrictions, or medical concerns?"
//                           rows={3}
//                         />
//                       </FormControl>
//                       <FormDescription>
//                         If there are none, please write "None".
//                       </FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>

//             {/* Emergency Contacts Section */}
//             <div>
//               <h3 className="text-lg font-medium mb-4 pb-2 border-b">Emergency Contacts</h3>
//               <div className="space-y-4">
//                 {form.watch('emergencyContacts')?.map((_, index) => (
//                   <div key={index} className="border rounded-md p-4 space-y-4">
//                     <div className="flex justify-between">
//                       <h4 className="font-medium">Emergency Contact #{index + 1}</h4>
//                       {index > 0 && (
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => removeEmergencyContact(index)}
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name={`emergencyContacts.${index}.name`}
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Name</FormLabel>
//                             <FormControl>
//                               <Input {...field} placeholder="Enter contact name" />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name={`emergencyContacts.${index}.relationship`}
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Relationship</FormLabel>
//                             <FormControl>
//                               <Input {...field} placeholder="e.g., Grandparent, Neighbor" />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name={`emergencyContacts.${index}.phoneNumber`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Phone Number</FormLabel>
//                           <FormControl>
//                             <Input {...field} placeholder="Enter phone number" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 ))}

//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={addEmergencyContact}
//                 >
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add Another Emergency Contact
//                 </Button>
//               </div>
//             </div>

//             <Alert className="bg-amber-50 border-amber-200 text-amber-800">
//               <AlertDescription>
//                 Please make sure you've added at least one child to your profile before submitting.
//               </AlertDescription>
//             </Alert>

//             <Button
//               type="submit"
//               className="w-full"
//               disabled={profileMutation.isPending}
//             >
//               {profileMutation.isPending ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Completing Profile...
//                 </>
//               ) : (
//                 <>
//                   <Save className="mr-2 h-4 w-4" />
//                   Complete My Profile
//                 </>
//               )}
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }

/* -------------- old code for reference ------------ */

/* -------------- new code ------------ */

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useSignedUrl } from "@/hooks/use-signedUrl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Save,
  Loader2,
  Plus,
  Check,
  X,
  Edit,
  Trash,
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
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Child } from "@shared/schema";
import supabase from "@/config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { ParentProfile } from "@/lib/types";
import mapboxgl from "mapbox-gl";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

// Schema for emergency contacts
const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Please enter a valid phone number"),
});

// Schema for child information
const childSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  personality: z
    .string()
    .min(1, "Please provide some information about your child's personality"),
  specialCare: z.string().optional(),
});

// Schema for the parent profile form with all required fields
const profileFormSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    floor_number: z.string().optional(),
    street_name: z.string().optional(),
    // lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    // address: z.string().min(1, "Address is required"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(phoneRegex, "Please enter a valid phone number"),
    hasSecondParent: z.boolean().default(false),
    secondParentFirstName: z.string().optional(),
    secondParentLastName: z.string().optional(),
    secondParentPhone: z.string().optional(),
    parentingStyle: z
      .string()
      .min(10, "Please describe your parenting style (min 10 characters)"),
    familyDescription: z
      .string()
      .min(
        10,
        "Please provide a description of your family (min 10 characters)"
      ),
    familyActivities: z
      .string()
      .min(
        10,
        "Please describe activities your family enjoys (min 10 characters)"
      ),
    medicalDietaryRestrictions: z
      .string()
      .min(
        1,
        'Please provide information about any restrictions or indicate "None"'
      ),
    emergencyContacts: z
      .array(emergencyContactSchema)
      .min(1, "At least one emergency contact is required"),
  })
  .superRefine((data, ctx) => {
    // If hasSecondParent is true, then the second parent fields are required
    if (data.hasSecondParent) {
      if (!data.secondParentFirstName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["secondParentFirstName"],
          message: "Second parent first name is required",
        });
      }
      if (!data.secondParentLastName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["secondParentLastName"],
          message: "Second parent last name is required",
        });
      }
      if (!data.secondParentPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["secondParentPhone"],
          message: "Second parent phone number is required",
        });
      } else if (!phoneRegex.test(data.secondParentPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["secondParentPhone"],
          message: "Please enter a valid phone number",
        });
      }
    }
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type ChildFormValues = z.infer<typeof childSchema>;

export default function ParentProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getSignedUrl } = useSignedUrl();
  const emptyChildFormValues: ChildFormValues = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    personality: "",
    specialCare: "",
  };
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isEditingChild, setIsEditingChild] = useState(false);
  const [currentChildId, setCurrentChildId] = useState<number | null>(null);
  const [childFormValues, setChildFormValues] = useState<ChildFormValues>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    personality: "",
    specialCare: "",
  });
  const [childrens, setChildrens] = useState<ChildFormValues[]>([]);
  const [isChildSubmitting, setIsChildSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<ParentProfile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState(profiles?.[0]?.address || "");
  const [postcode, setPostcode] = useState<string | null>(profiles?.[0]?.zipCode || null);
  const [AddressLoading, setAddressLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const userData = user?.user_metadata;
  const isPaymentSuccess = userData?.isPayment;

  // Form for parent profile
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      floor_number: "",
      street_name: "",
      phoneNumber: "",
      hasSecondParent: false,
      secondParentFirstName: "",
      secondParentLastName: "",
      secondParentPhone: "",
      parentingStyle: "",
      familyDescription: "",
      familyActivities: "",
      medicalDietaryRestrictions: "",
      emergencyContacts: [{ name: "", relationship: "", phoneNumber: "" }],
    },
  });

  useEffect(() => {
    if (userData || (profiles && profiles?.length > 0)) {
      const profile = profiles?.[0];
      const secondParent = profile?.secondParentGuardian;

      // Check if any second parent fields contain data
      const hasSecondParent = !!(
        secondParent &&
        [
          secondParent.firstName,
          secondParent.lastName,
          secondParent.phoneNumber,
        ].some((field) => field && field.trim() !== "")
      );

      form.reset({
        fullName: userData?.fullName || "",
        email: userData?.email || "",
        address: profile?.address || "",
        floor_number: profile?.floor_number || "",
        street_name: profile?.street_name || "",
        phoneNumber: profile?.phoneNumber || "",
        hasSecondParent: hasSecondParent,
        secondParentFirstName: profile?.secondParentGuardian?.firstName || "",
        secondParentLastName: profile?.secondParentGuardian?.lastName || "",
        secondParentPhone: profile?.secondParentGuardian?.phoneNumber || "",
        parentingStyle: profile?.parentingStyle || "",
        familyDescription: profile?.familyDesc || "",
        familyActivities: profile?.familyActivity || "",
        medicalDietaryRestrictions: profile?.medical || "",
        emergencyContacts: profile?.emergencyContact || [
          { name: "", relationship: "", phoneNumber: "" },
        ],
      });
      setChildrens(profile?.children ?? []);
    }
  }, [profiles]);

  // const childMutation = async (childData: ChildFormValues) => {
  //   setChildrens([...childrens, childData]);
  //   setIsAddingChild(false);
  //   setIsEditingChild(false);
  //   setCurrentChildId(null);

  //   //    if (isEditingChild && currentChildId !== null) {
  //   //   // Update existing child
  //   //   const updatedChildren = children.map((child, index) =>
  //   //     index === currentChildId ? { ...child, ...childData } : child
  //   //   );
  //   //   setChildren(updatedChildren);
  //   // } else {
  //   //   // Add new child
  //   //   const newChild = {
  //   //     ...childData,
  //   //     name: `${childData.firstName} ${childData.lastName}`,
  //   //   };
  //   //   setChildren([...children, newChild]);
  //   // }

  //   // // Reset form and states
  //   // setIsEditingChild(false);
  //   // setCurrentChildId(null);
  //   // setChildFormValues({
  //   //   firstName: "",
  //   //   lastName: "",
  //   //   dateOfBirth: "",
  //   //   personality: "",
  //   //   specialCare: "",
  //   // });

  //   // toast({
  //   //   title: isEditingChild ? "Child Updated" : "Child Added",
  //   //   description: isEditingChild
  //   //     ? "Child information has been updated locally."
  //   //     : "Child has been added locally.",
  //   // });
  // };

  // Mutation to delete a child
  // const deleteChildMutation = useMutation({
  //   mutationFn: async (childId: number) => {
  //     const res = await apiRequest("DELETE", `/api/children/${childId}`);
  //     return await res.json();
  //   },
  //   onSuccess: () => {
  //     refetchChildren(); // Refresh children list

  //     toast({
  //       title: "Child Removed",
  //       description: "Child has been removed from your profile.",
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   },
  // });

  // fetch parent profile
  const fetchParentProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("parentprofile")
      .select("*")
      .eq("user_id", userId) // filter by userId
      .limit(1); // expects exactly one row

    if (error) {
      console.error("Fetch error:", error.message);
      return null;
    }

    const imagePath = data?.[0]?.profile_image;

    if (imagePath) {
      const signedUrl = await getSignedUrl(imagePath);

      if (signedUrl) {
        setUploadedImg(signedUrl);
        setImagePath(imagePath);
      }
    }

    return data;
  };

  const loadProfile = async () => {
    const data = await fetchParentProfile(user?.id);
    if (data && data.length > 0) {
      const profile = data[0];
      setProfiles(data);
      setAddress(profile.address || "");
      setLatitude(profile.location?.latitude || null);
      setLongitude(profile.location?.longitude || null);
      setPostcode(profile.zipCode || null);
    }
  };

  const uploadImageToSupabase = async (
    file: File,
    userId: string,
    existingPath: string | null
  ) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `profile.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // 🔁 Delete old image if it exists
    if (existingPath && existingPath !== filePath) {
      await supabase.storage.from("user-uploads").remove([existingPath]);
    }

    const { error: uploadError } = await supabase.storage
      .from("user-uploads")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    return filePath;
  };

  // Function to handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);

    try {
      // ✅ Get current authenticated user directly from Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("User not authenticated");

      const userId = user.id;

      // Check: no uploaded image and no existing one
      if (!imageFile && !imagePath) {
        toast({
          title: "Missing Profile Photo",
          description: "Please upload a profile photo.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if address is provided
      if (!address) {
        toast({
          title: "Address Required",
          description: "Please use your current location.",
          variant: "destructive",
        });
        return;
      }

      // Check if the user has added at least one child
      if (childrens?.length === 0) {
        toast({
          title: "Profile Incomplete",
          description: "Please add at least one child to your profile.",
          variant: "destructive",
        });
        return;
      }

      // ✅ Upload image if provided
      let profileImageUrl = imagePath;
      if (imageFile) {
        profileImageUrl = await uploadImageToSupabase(
          imageFile,
          userId,
          imagePath ?? null
        );
      }

      // ✅ Format children
      const mappedChildren = childrens.map((child) => ({
        id: Math.floor(10000000 + Math.random() * 90000000).toString(),
        firstName: child.firstName,
        lastName: child.lastName,
        dateOfBirth: child.dateOfBirth,
        personality: child.personality,
        specialCare: child.specialCare,
      }));

      // ✅ Prepare full payload
      const payload = {
        user_id: userId,
        profile_image: profileImageUrl,
        fullName: values.fullName,
        email: values.email,
        address: address,
        zipCode: postcode,
        floor_number: values.floor_number,
        street_name: values.street_name,
        location: {
          latitude: latitude,
          longitude: longitude,
        },
        phoneNumber: values.phoneNumber,
        secondParentGuardian: values.hasSecondParent
          ? {
            firstName: values.secondParentFirstName || "",
            lastName: values.secondParentLastName || "",
            phoneNumber: values.secondParentPhone || "",
          }
          : null,
        children: mappedChildren,
        parentingStyle: values.parentingStyle,
        familyDesc: values.familyDescription,
        familyActivity: values.familyActivities,
        medical: values.medicalDietaryRestrictions,
        emergencyContact: values.emergencyContacts,
      };

      // ✅ Check if profile exists
      const { data: existingProfile } = await supabase
        .from("parentprofile")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      let response;

      if (existingProfile && existingProfile.length > 0) {
        response = await supabase
          .from("parentprofile")
          .update(payload)
          .eq("user_id", userId);
      } else {
        response = await supabase
          .from("parentprofile")
          .insert({ ...payload, isProfileCompleted: true });

        // Update user metadata
        if (!response.error) {
          await supabase.auth.updateUser({
            data: { profileCompleted: true },
          });
        }
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description:
          existingProfile?.length > 0
            ? "Profile updated successfully!"
            : "Profile created successfully!",
      });

      navigate("/");
      setChildrens([]);
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

  // Function to handle adding emergency contact
  const addEmergencyContact = () => {
    const currentContacts = form.getValues("emergencyContacts") || [];
    form.setValue("emergencyContacts", [
      ...currentContacts,
      { name: "", relationship: "", phoneNumber: "" },
    ]);
  };

  // Function to handle removing emergency contact
  const removeEmergencyContact = (index: number) => {
    const currentContacts = form.getValues("emergencyContacts") || [];
    if (currentContacts.length > 1) {
      // Ensure at least one emergency contact remains
      const updatedContacts = currentContacts.filter((_, i) => i !== index);
      form.setValue("emergencyContacts", updatedContacts);
    } else {
      toast({
        title: "Cannot Remove",
        description: "At least one emergency contact is required.",
        variant: "destructive",
      });
    }
  };

  // Function to handle child form change
  const handleChildFormChange = (
    field: keyof ChildFormValues,
    value: string
  ) => {
    setChildFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddChildClick = () => {
    setChildFormValues({ ...emptyChildFormValues });
    setIsEditingChild(false);
    setCurrentChildId(null);
    setIsAddingChild(true);
  };

  // Function to handle child add/edit
  const handleAddEditChild = () => {
    // Simple validation
    if (
      !childFormValues.firstName ||
      !childFormValues.lastName ||
      !childFormValues.dateOfBirth ||
      !childFormValues.personality
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsChildSubmitting(true);

    if (isEditingChild && currentChildId !== null) {
      // Update existing child
      const updatedChildren = [...childrens];
      updatedChildren[currentChildId] = childFormValues;
      setChildrens(updatedChildren);
    } else {
      // Add new child
      setChildrens((prev) => [...prev, childFormValues]);
    }

    setChildFormValues({ ...emptyChildFormValues });
    setIsEditingChild(false);
    setCurrentChildId(null);
    setIsAddingChild(false);
    setIsChildSubmitting(false);
    // childMutation(childFormValues);
  };

  // Function to edit a child
  const handleEditChild = (child: ChildFormValues, index: number) => {
    // Convert any null or undefined values to empty strings
    // setChildFormValues({
    //   firstName: child.firstName || "",
    //   lastName: child.lastName || "",
    //   dateOfBirth:
    //     typeof child.dateOfBirth === "string" ? child.dateOfBirth : "",
    //   personality: child.personality || "",
    //   specialCare: child.specialCare || "",
    // });
    setChildFormValues(child);
    setIsEditingChild(true);
    setCurrentChildId(index);
    setIsAddingChild(true);
  };

  // Function to delete a child
  const handleDeleteChild = (index: number) => {
    if (
      confirm("Are you sure you want to remove this child from your profile?")
    ) {
      const updated = childrens.filter((_, i) => i !== index);
      setChildrens(updated);
      // deleteChildMutation.mutate(childId);
    }
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
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=address,postcode&access_token=${mapboxgl.accessToken}`
          );
          const data = await res.json();
          const feature = data.features?.[0];
          const placeName = feature?.place_name || "";
          let postcode = feature?.context?.find((c: any) => c.id.startsWith("postcode."))?.text;

          if (!postcode) {
            const postcodeFeature = data.features.find((f: any) => f.place_type.includes("postcode"));
            postcode = postcodeFeature?.text || null;
          }

          setAddress(placeName);
          setPostcode(postcode);
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
      }
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setUploadedImg(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (user?.id && userData?.userType === "parent") {
      loadProfile();
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Please log in to access your profile.</p>
      </div>
    );
  }

  // ---------------new code------------

  if (!isPaymentSuccess) {
    navigate("/membership");
  }

  // ---------------new code------------

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          {isPaymentSuccess && (
            <h1 className="text-green-900 bg-green-100 p-2 font-bold text-base xs:text-lg sm:text-xl">
              Your payment is successfully completed
            </h1>
          )}
          <CardTitle className="!text-lg sm:!text-xl md:!text-2xl  !font-bold leading-6">
            Complete Your Parent Profile
          </CardTitle>
          <CardDescription>
            Provide information about you and your family to help babysitters
            better understand your childcare needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 justify-items-center gap-4">
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={() => (
                      <FormItem className="text-center">
                        <FormLabel>
                          Profile Photo <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative w-24 h-24 mb-3">
                            {uploadedImg ? (
                              <img
                                src={uploadedImg}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full bg-white border border-gray-300"
                              />
                            ) : (
                              // <FaUserCircle size={80} className="text-gray-400" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
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
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your Email"
                            readOnly
                          // onChange={(e) => {
                          //   field.onChange(e);
                          //   // Set email to the same value as username
                          //   loginForm.setValue("email", e.target.value);
                          // }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="floor_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your home address"
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
                        <FormLabel>Residential Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Lake House, Primary Home, Vacation Cabin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* <FormField
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
                  /> */}
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
                        <FormLabel>
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            defaultCountry="US"
                            value={field.value}
                            onChange={field.onChange}
                            className="rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                            inputClassName="!h-10 w-full px-4 py-2"
                          />
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
                              checked={!!field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked === true)
                              }
                              id="hasSecondParent"
                            />
                            <Label
                              htmlFor="hasSecondParent"
                              className="font-medium"
                            >
                              Add Second Parent/Guardian
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("hasSecondParent") && (
                    <div className="space-y-4 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="secondParentFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Second Parent First Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter first name"
                                />
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
                                <Input
                                  {...field}
                                  placeholder="Enter last name"
                                />
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
                              <PhoneInput
                                defaultCountry="US"
                                value={field.value}
                                onChange={field.onChange}
                                className="rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                                inputClassName="!h-10 w-full px-4 py-2"
                              />
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
                <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                  Children <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-4">
                  {childrens?.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {childrens.map((child, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">
                                  {child.firstName} {child.lastName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Born:{" "}
                                  {child.dateOfBirth instanceof Date
                                    ? child.dateOfBirth.toLocaleDateString()
                                    : String(child.dateOfBirth)}
                                </p>
                                <p className="mt-2">
                                  <span className="font-medium">
                                    Personality:
                                  </span>{" "}
                                  {child.personality}
                                </p>
                                {child.specialCare && (
                                  <p className="mt-1">
                                    <span className="font-medium">
                                      Special Care Needs:
                                    </span>{" "}
                                    {child.specialCare}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  type="button"
                                  size="icon"
                                  onClick={() => handleEditChild(child, index)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  type="button"
                                  onClick={() => handleDeleteChild(index)}
                                >
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
                      <p className="text-muted-foreground">
                        No children added yet
                      </p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddChildClick}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add a Child
                  </Button>

                  {/* Add/Edit Child Dialog */}
                  <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
                    <DialogContent className="w-[90%] max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {isEditingChild
                            ? "Edit Child Information"
                            : "Add a Child"}
                        </DialogTitle>
                        <DialogDescription>
                          Provide details about your child to help babysitters
                          prepare.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="childFirstName">
                              First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="childFirstName"
                              value={childFormValues.firstName}
                              onChange={(e) =>
                                handleChildFormChange(
                                  "firstName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="childLastName">
                              Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="childLastName"
                              value={childFormValues.lastName}
                              onChange={(e) =>
                                handleChildFormChange(
                                  "lastName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="childDob">
                            Date of Birth{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="childDob"
                            type="date"
                            value={childFormValues.dateOfBirth}
                            onChange={(e) =>
                              handleChildFormChange(
                                "dateOfBirth",
                                e.target.value
                              )
                            }
                            className="appearance-none safari-date-left"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="childPersonality">
                            Personality & Interests{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="childPersonality"
                            value={childFormValues.personality}
                            onChange={(e) =>
                              handleChildFormChange(
                                "personality",
                                e.target.value
                              )
                            }
                            placeholder="Describe your child's personality, what they enjoy, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="childSpecialCare">
                            Special Care Needs (Optional)
                          </Label>
                          <Textarea
                            id="childSpecialCare"
                            value={childFormValues.specialCare}
                            onChange={(e) =>
                              handleChildFormChange(
                                "specialCare",
                                e.target.value
                              )
                            }
                            placeholder="Any allergies, medications, or special instructions..."
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex !flex-row !gap-2 !justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingChild(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddEditChild}
                          disabled={isChildSubmitting}
                        >
                          {isChildSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isEditingChild ? "Updating..." : "Adding..."}
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              {isEditingChild ? "Update Child" : "Add Child"}
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
                <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                  Family Information
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="parentingStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Parenting Style{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
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
                        <FormLabel>
                          Family Description{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
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
                        <FormLabel>
                          Family Activities{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
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
                        <FormLabel>
                          Medical/Dietary Restrictions{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
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
                <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                  Emergency Contacts
                </h3>
                <div className="space-y-4">
                  {form.watch("emergencyContacts")?.map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-4 space-y-4"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">
                          Emergency Contact #{index + 1}
                        </h4>
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
                              <FormLabel>
                                Name <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter contact name"
                                />
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
                              <FormLabel>
                                Relationship{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g., Grandparent, Neighbor"
                                />
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
                            <FormLabel>
                              Phone Number{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <PhoneInput
                                defaultCountry="US"
                                value={field.value}
                                onChange={field.onChange}
                                className="rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                                inputClassName="!h-10 w-full px-4 py-2"
                              />
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
                    className="!text-xs xs:!text-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Emergency Contact
                  </Button>
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertDescription>
                  Please make sure you've added at least one child to your
                  profile before submitting.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
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

      {/* {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Unsaved Changes</h2>
            <p className="text-gray-600">
              You have unsaved changes. Are you sure you want to leave?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                // onClick={onCancel}
                className="px-4 py-2 bg-gray-100 rounded-md"
              >
                Stay
              </button>
              <button
                // onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}

/* -------------- new code ------------ */
