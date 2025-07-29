// ----------- old code for reference ------------

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { User } from "@shared/schema";
// import { useAuth } from "@/hooks/use-auth";
// import { Redirect } from "wouter";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Loader2, CheckCircle, X } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { apiRequest } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import Layout from "@/components/Layout";
// import UserDetailsDialog from "@/components/admin/UserDetailsDialog";

// type SafeUser = Omit<User, "password">;

// export default function AdminPage() {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState("pending-reviews");

//   // Mutation for approving babysitter profiles
//   const approveMutation = useMutation({
//     mutationFn: async (sitterId: number) => {
//       const response = await apiRequest(
//         "PATCH",
//         `/api/admin/users/${sitterId}/review`,
//         { reviewStatus: "approved" },
//       );
//       return response.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Profile Approved",
//         description: "Babysitter profile has been approved successfully.",
//       });
//       // Invalidate queries to refresh data
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Approval Failed",
//         description: error.message || "Failed to approve babysitter profile.",
//         variant: "destructive",
//       });
//     },
//   });

//   // Mutation for rejecting babysitter profiles
//   const rejectMutation = useMutation({
//     mutationFn: async (sitterId: number) => {
//       const response = await apiRequest(
//         "PATCH",
//         `/api/admin/users/${sitterId}/review`,
//         { reviewStatus: "rejected" },
//       );
//       return response.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Profile Rejected",
//         description: "Babysitter profile has been rejected.",
//         variant: "default",
//       });
//       // Invalidate queries to refresh data
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Rejection Failed",
//         description: error.message || "Failed to reject babysitter profile.",
//         variant: "destructive",
//       });
//     },
//   });

//   // Check if the user is authenticated and has admin privileges
//   // if (!user) {
//   //   return <Redirect to="/auth" />;
//   // }

//   // if (user.username !== "ecadmin") {
//   //   return (
//   //     <Layout>
//   //       <div className="container mx-auto py-10 text-center">
//   //         <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
//   //         <p>You do not have permission to access the admin panel.</p>
//   //       </div>
//   //     </Layout>
//   //   );
//   // }

//   // Fetch all users
//   const { data: users = [], isLoading } = useQuery<SafeUser[]>({
//     queryKey: ["/api/admin/users"],
//   });

//   // Fetch all reviews for admin view
//   const { data: reviews = [] } = useQuery<any[]>({
//     queryKey: ["/api/admin/reviews"],
//   });

//   // Filter users by type
//   const parents = users.filter((user) => user.userType === "parent");
//   const babysitters = users.filter((user) => user.userType === "babysitter");

//   // Filter babysitters by review status
//   const pendingReviewBabysitters = babysitters.filter(
//     (sitter) => sitter.reviewStatus === "pending",
//   );

//   const renderUserTable = (userList: SafeUser[]) => {
//     return (
//       <Table>
//         <TableCaption>List of {activeTab}</TableCaption>
//         <TableHeader>
//           <TableRow>
//             <TableHead>ID</TableHead>
//             <TableHead>Full Name</TableHead>
//             <TableHead>Username</TableHead>
//             <TableHead>Email</TableHead>
//             <TableHead>Profile Status</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {userList.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={6} className="text-center">
//                 No {activeTab} found
//               </TableCell>
//             </TableRow>
//           ) : (
//             userList.map((user) => (
//               <TableRow key={user.id}>
//                 <TableCell>{user.id}</TableCell>
//                 <TableCell className="font-medium">{user.fullName}</TableCell>
//                 <TableCell>{user.username}</TableCell>
//                 <TableCell>{user.email}</TableCell>
//                 <TableCell>
//                   <Badge
//                     variant={user.profileCompleted ? "success" : "outline"}
//                   >
//                     {user.profileCompleted ? "Complete" : "Incomplete"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <UserDetailsDialog
//                     user={user}
//                     trigger={
//                       <Button variant="outline" size="sm">
//                         View Details
//                       </Button>
//                     }
//                   />
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     );
//   };

//   return (
//     <Layout>
//       <div className="container mx-auto py-10">
//         <Card>
//           <CardHeader>
//             <CardTitle>Admin Dashboard</CardTitle>
//             <CardDescription>
//               Manage user accounts and view system data.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <div className="flex justify-center my-10">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//               </div>
//             ) : (
//               <Tabs
//                 value={activeTab}
//                 onValueChange={setActiveTab}
//                 className="w-full"
//               >
//                 <TabsList className="w-full grid grid-cols-4">
//                   <TabsTrigger value="pending-reviews" className="relative">
//                     Pending Reviews
//                     {pendingReviewBabysitters.length > 0 && (
//                       <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                         {pendingReviewBabysitters.length}
//                       </span>
//                     )}
//                   </TabsTrigger>
//                   <TabsTrigger value="parents">
//                     Parents ({parents.length})
//                   </TabsTrigger>
//                   <TabsTrigger value="babysitters">
//                     Caregivers ({babysitters.length})
//                   </TabsTrigger>
//                   <TabsTrigger value="reviews">Reviews</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="parents" className="mt-6">
//                   <h2 className="text-xl font-semibold mb-4">
//                     Parent Profiles
//                   </h2>
//                   {renderUserTable(parents)}
//                 </TabsContent>
//                 <TabsContent value="pending-reviews" className="mt-6">
//                   <h2 className="text-xl font-semibold mb-4">
//                     Pending Babysitter Profile Reviews
//                   </h2>
//                   <Table>
//                     <TableCaption>
//                       Babysitter profiles awaiting admin review
//                     </TableCaption>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Full Name</TableHead>
//                         <TableHead>Certification</TableHead>
//                         <TableHead>Transportation</TableHead>
//                         <TableHead>Submission Date</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {pendingReviewBabysitters.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={5} className="text-center">
//                             No profiles awaiting review
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         pendingReviewBabysitters.map((sitter) => (
//                           <TableRow key={sitter.id}>
//                             <TableCell className="font-medium">
//                               {sitter.fullName}
//                             </TableCell>
//                             <TableCell>
//                               <Badge
//                                 variant={
//                                   sitter.firstAidCertified
//                                     ? "success"
//                                     : "destructive"
//                                 }
//                               >
//                                 {sitter.firstAidCertified ? "Yes" : "No"}
//                               </Badge>
//                             </TableCell>
//                             <TableCell>
//                               <Badge
//                                 variant={
//                                   sitter.hasTransportation
//                                     ? "success"
//                                     : "destructive"
//                                 }
//                               >
//                                 {sitter.hasTransportation ? "Yes" : "No"}
//                               </Badge>
//                             </TableCell>
//                             <TableCell>May 06, 2025</TableCell>
//                             <TableCell className="text-right">
//                               <div className="flex items-center justify-end gap-2">
//                                 <UserDetailsDialog
//                                   user={sitter}
//                                   trigger={
//                                     <Button variant="outline" size="sm">
//                                       View Profile
//                                     </Button>
//                                   }
//                                 />
//                                 <Button
//                                   variant="default"
//                                   size="sm"
//                                   className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
//                                   onClick={() =>
//                                     approveMutation.mutate(sitter.id)
//                                   }
//                                   disabled={approveMutation.isPending}
//                                 >
//                                   {approveMutation.isPending ? (
//                                     <Loader2 className="h-3 w-3 animate-spin" />
//                                   ) : (
//                                     <CheckCircle className="h-3 w-3" />
//                                   )}
//                                   Approve
//                                 </Button>
//                                 <Button
//                                   variant="destructive"
//                                   size="sm"
//                                   onClick={() =>
//                                     rejectMutation.mutate(sitter.id)
//                                   }
//                                   disabled={rejectMutation.isPending}
//                                   className="flex items-center gap-1"
//                                 >
//                                   {rejectMutation.isPending ? (
//                                     <Loader2 className="h-3 w-3 animate-spin" />
//                                   ) : (
//                                     <X className="h-3 w-3" />
//                                   )}
//                                   Reject
//                                 </Button>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </TabsContent>

//                 <TabsContent value="babysitters" className="mt-6">
//                   <h2 className="text-xl font-semibold mb-4">
//                     Caregiver Profiles
//                   </h2>
//                   {renderUserTable(babysitters)}
//                 </TabsContent>

//                 <TabsContent value="reviews" className="mt-6">
//                   <h2 className="text-xl font-semibold mb-4">Parent Reviews</h2>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Review ID</TableHead>
//                         <TableHead>Parent</TableHead>
//                         <TableHead>Babysitter</TableHead>
//                         <TableHead>Booking</TableHead>
//                         <TableHead>Overall Rating</TableHead>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {reviews.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={7} className="text-center">
//                             No reviews found
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         reviews.map((review) => (
//                           <TableRow key={review.id}>
//                             <TableCell>{review.id}</TableCell>
//                             <TableCell className="font-medium">
//                               {review.parent?.fullName || "Unknown"}
//                             </TableCell>
//                             <TableCell>
//                               {review.babysitter?.fullName || "Unknown"}
//                             </TableCell>
//                             <TableCell>
//                               {review.booking ? (
//                                 <div className="text-sm">
//                                   <div>{review.booking.childName}</div>
//                                   <div className="text-gray-500">
//                                     {new Date(
//                                       review.booking.startTime,
//                                     ).toLocaleDateString()}
//                                   </div>
//                                 </div>
//                               ) : (
//                                 "Unknown"
//                               )}
//                             </TableCell>
//                             <TableCell>
//                               <div className="flex items-center">
//                                 {Array.from({ length: 5 }, (_, i) => (
//                                   <span
//                                     key={i}
//                                     className={`text-sm ${
//                                       i < review.overallRating
//                                         ? "text-yellow-400"
//                                         : "text-gray-300"
//                                     }`}
//                                   >
//                                     ★
//                                   </span>
//                                 ))}
//                                 <span className="ml-2 text-sm text-gray-600">
//                                   ({review.overallRating}/5)
//                                 </span>
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               {new Date(review.createdAt).toLocaleDateString()}
//                             </TableCell>
//                             <TableCell>
//                               <Button variant="outline" size="sm">
//                                 View Details
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </TabsContent>
//               </Tabs>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// }

// ------------ old code for reference ------------

// ------------- new code ------------

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSignedUrl } from "@/hooks/use-signedUrl";
import Layout from "@/components/Layout";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";
import { babysitterProfile, ParentProfile } from "@/lib/types";
import supabase from "@/config/supabaseClient";

type SafeUser = Omit<User, "password">;

type ParentWithType = ParentProfile & { userType: "parent" };
type BabysitterWithType = babysitterProfile & { userType: "babysitter" };
type CombinedUser = ParentWithType | BabysitterWithType;

export default function AdminPage() {
  const { user,logoutMutation } = useAuth();
  const { toast } = useToast();
  const { getSignedUrl } = useSignedUrl();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("parents");

  const [babysitters, setBabysitters] = useState<BabysitterWithType[]>([]);
  const [parents, setParents] = useState<ParentWithType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log("babysitters===>", babysitters);

  // Mutation for approving babysitter profiles
  const approveMutation = useMutation({
    mutationFn: async (sitterId: number) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/users/${sitterId}/review`,
        { reviewStatus: "approved" }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Approved",
        description: "Babysitter profile has been approved successfully.",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve babysitter profile.",
        variant: "destructive",
      });
    },
  });

  // Mutation for rejecting babysitter profiles
  const rejectMutation = useMutation({
    mutationFn: async (sitterId: number) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/users/${sitterId}/review`,
        { reviewStatus: "rejected" }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Rejected",
        description: "Babysitter profile has been rejected.",
        variant: "default",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject babysitter profile.",
        variant: "destructive",
      });
    },
  });

  // Fetch all users
  // const { data: users = [], isLoading } = useQuery<SafeUser[]>({
  //   queryKey: ["/api/admin/users"],
  // });

  // Fetch all reviews for admin view
  // const { data: reviews = [] } = useQuery<any[]>({
  //   queryKey: ["/api/admin/reviews"],
  // });

  // Filter users by type
  // const parents = users.filter((user) => user.userType === "parent");
  // const babysitters = users.filter((user) => user.userType === "babysitter");

  // Filter babysitters by review status
  // const pendingReviewBabysitters = babysitters.filter(
  //   (sitter) => sitter.reviewStatus === "pending",
  // );

  const handleApprovalChange = async (value: string, userId: string) => {
    const isApproved = value === "approved";

    // First, check if the user is a babysitter
    const { data: babysitterProfile, error: babysitterError } = await supabase
      .from("babySitterProfile")
      .select("id")
      .eq("user_id", userId)
      .single();
      
    let profileUpdateError = null;

    if (babysitterProfile) {
      const { error } = await supabase
        .from("babySitterProfile")
        .update({ isApproved })
        .eq("user_id", userId);
      profileUpdateError = error;
    } else {
      // If not babysitter, assume parent
      const { error } = await supabase
        .from("parentprofile")
        .update({ isApproved })
        .eq("user_id", userId);
      profileUpdateError = error;
    }

    if (profileUpdateError) {
      toast({
        title: "Update failed",
        description: profileUpdateError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `User has been ${
          isApproved ? "approved" : "disapproved"
        }.`,
      });

      await fetchProfiles();
    }
  };

  const renderUserTable = (userList: CombinedUser[]) => {
    return (
      <Table>
        <TableCaption>List of {activeTab}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Profile Status</TableHead>
            <TableHead>Approved Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No {activeTab} found
              </TableCell>
            </TableRow>
          ) : (
            userList.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.user_id}</TableCell>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.isProfileCompleted ? "success" : "outline"}
                  >
                    {user.isProfileCompleted ? "Completed" : "Incomplete"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {" "}
                  <select
                    value={user.isApproved ? "approved" : "not approved"}
                    onChange={(e) =>
                      handleApprovalChange(e.target.value, user.user_id)
                    }
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    <option value="not_approved">Not Approved</option>
                    <option value="approved">Approved</option>
                  </select>
                </TableCell>
                <TableCell className="text-right">
                  <UserDetailsDialog
                    user={user}
                    trigger={
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  const fetchProfiles = async () => {
    setIsLoading(true);

    try {
      // Fetch babysitters
      const babysitterRes = await supabase
        .from("babySitterProfile")
        .select("*");

      if (babysitterRes.error) throw new Error(babysitterRes.error.message);
      const babysittersWithType: BabysitterWithType[] = await Promise.all(
        babysitterRes.data.map(async (b) => {
          const profileImageUrl = await getSignedUrl(b.profile_image);
          const certificateUrl = await getSignedUrl(b.certified);
          const transportationUrl = await getSignedUrl(b.transportation);
          const videoUrl = await getSignedUrl(b.instrucationVideo);

          return {
            ...b,
            userType: "babysitter",
            profileImageUrl,
            certificateUrl,
            transportationUrl,
            videoUrl,
          };
        })
      );

      setBabysitters(babysittersWithType);

      // Fetch parents
      const parentRes = await supabase.from("parentprofile").select("*");

      if (parentRes.error) throw new Error(parentRes.error.message);
      const parentsWithType: ParentWithType[] = await Promise.all(
        parentRes.data.map(async (p) => {
          const profileImageUrl = await getSignedUrl(p.profile_image);
          return {
            ...p,
            userType: "parent",
            profileImageUrl,
          };
        })
      );
      setParents(parentsWithType);
    } catch (err: any) {
      toast({
        title: "Error loading profiles",
        description: err.message || "Unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

    const handleLogout = () => {
    // logoutMutation.mutate();
    logoutMutation();
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Check if the user is authenticated and has admin privileges
  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user?.user_metadata?.userType !== "admin") {
    return (
      <Layout>
        <div className="container mx-auto py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
          <p>You do not have permission to access the admin panel.</p>
        </div>
      </Layout>
    );
  }

  return (
    // <Layout>
    <div className="container mx-auto py-10">
      <Card>
        <div className="flex justify-between items-center">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Manage user accounts and view system data.
            </CardDescription>
          </CardHeader>
          <div>
            <button className="m-6 bg-[#3c5679] hover:bg-[#2c4059] text-white py-2 px-4 rounded-lg" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center my-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-4">
                {/* <TabsTrigger value="pending-reviews" className="relative">
                    Pending Reviews
                    {pendingReviewBabysitters.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {pendingReviewBabysitters.length}
                      </span>
                    )} 
                  </TabsTrigger> */}
                <TabsTrigger value="parents">
                  Parents ({parents.length})
                </TabsTrigger>
                <TabsTrigger value="babysitters">
                  Babysitters ({babysitters.length})
                </TabsTrigger>
                {/* <TabsTrigger value="reviews">Reviews</TabsTrigger> */}
              </TabsList>
              <TabsContent value="parents" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Parent Profiles</h2>
                {renderUserTable(parents)}
              </TabsContent>
              {/* <TabsContent value="pending-reviews" className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Pending Babysitter Profile Reviews
                  </h2>
                  <Table>
                    <TableCaption>
                      Babysitter profiles awaiting admin review
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Certification</TableHead>
                        <TableHead>Transportation</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReviewBabysitters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No profiles awaiting review
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingReviewBabysitters.map((sitter) => (
                          <TableRow key={sitter.id}>
                            <TableCell className="font-medium">
                              {sitter.fullName}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  sitter.firstAidCertified
                                    ? "success"
                                    : "destructive"
                                }
                              >
                                {sitter.firstAidCertified ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  sitter.hasTransportation
                                    ? "success"
                                    : "destructive"
                                }
                              >
                                {sitter.hasTransportation ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>May 06, 2025</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <UserDetailsDialog
                                  user={sitter}
                                  trigger={
                                    <Button variant="outline" size="sm">
                                      View Profile
                                    </Button>
                                  }
                                />
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                                  onClick={() =>
                                    approveMutation.mutate(sitter.id)
                                  }
                                  disabled={approveMutation.isPending}
                                >
                                  {approveMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    rejectMutation.mutate(sitter.id)
                                  }
                                  disabled={rejectMutation.isPending}
                                  className="flex items-center gap-1"
                                >
                                  {rejectMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent> */}

              <TabsContent value="babysitters" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Babysitters Profiles
                </h2>
                {renderUserTable(babysitters)}
              </TabsContent>

              {/* <TabsContent value="reviews" className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Parent Reviews</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Review ID</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Babysitter</TableHead>
                        <TableHead>Booking</TableHead>
                        <TableHead>Overall Rating</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No reviews found
                          </TableCell>
                        </TableRow>
                      ) : (
                        reviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell>{review.id}</TableCell>
                            <TableCell className="font-medium">
                              {review.parent?.fullName || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {review.babysitter?.fullName || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {review.booking ? (
                                <div className="text-sm">
                                  <div>{review.booking.childName}</div>
                                  <div className="text-gray-500">
                                    {new Date(
                                      review.booking.startTime,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              ) : (
                                "Unknown"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < review.overallRating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">
                                  ({review.overallRating}/5)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent> */}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
    // </Layout>
  );
}

// ------------- new code ------------
