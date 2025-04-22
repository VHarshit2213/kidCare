import { useState } from "react";
import { User } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Skill from "@/components/common/Skill";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SafeUser = Omit<User, "password">;

interface UserDetailsProps {
  user: SafeUser;
  trigger: React.ReactNode;
}

export default function UserDetailsDialog({ user, trigger }: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="md:w-1/3">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-3">
                    {user.profileImageUrl ? (
                      <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {getInitials(user.fullName || "User")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="text-xl text-center">{user.fullName}</CardTitle>
                  <CardDescription className="text-center">{user.email}</CardDescription>
                  <div className="mt-2">
                    <Badge variant={user.userType === "babysitter" ? "secondary" : "default"}>
                      {user.userType === "babysitter" ? "Caregiver" : "Parent"}
                    </Badge>
                    {user.profileCompleted && (
                      <Badge variant="success" className="ml-2">
                        Profile Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Username</h4>
                    <p className="mt-1">{user.username}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Member Since</h4>
                    <p className="mt-1">April 2025</p>
                  </div>
                  {user.userType === "babysitter" && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                        <p className="mt-1">{user.location || "Not specified"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Hourly Rate</h4>
                        <p className="mt-1">${user.hourlyRate}/hour</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                {user.userType === "parent" && (
                  <TabsTrigger value="children">Children</TabsTrigger>
                )}
                {user.userType === "babysitter" && (
                  <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>User Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Account Type</h4>
                        <p className="text-gray-600">
                          {user.userType === "babysitter" ? "Caregiver" : "Parent"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Profile Status</h4>
                        <p className="text-gray-600">
                          {user.profileCompleted ? "Complete" : "Incomplete"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Contact Information</h4>
                        <p className="text-gray-600">
                          Email: {user.email}
                          <br />
                          Phone: {user.phoneNumber || "Not provided"}
                        </p>
                      </div>
                      {user.userType === "babysitter" && (
                        <div>
                          <h4 className="font-medium">Brief Bio</h4>
                          <p className="text-gray-600">{user.bio || "No bio provided"}</p>
                        </div>
                      )}
                      {user.userType === "parent" && (
                        <div>
                          <h4 className="font-medium">Family Description</h4>
                          <p className="text-gray-600">
                            {user.familyDescription || "No description provided"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="mt-4">
                {user.userType === "parent" ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Parent Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">First Name</h4>
                            <p className="text-gray-600">{user.firstName || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Last Name</h4>
                            <p className="text-gray-600">{user.lastName || "Not provided"}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">Parenting Style</h4>
                          <p className="text-gray-600">{user.parentingStyle || "Not provided"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Family Activities</h4>
                          <p className="text-gray-600">{user.familyActivities || "Not provided"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Medical & Dietary Information</h4>
                          <p className="text-gray-600">
                            {user.medicalDietaryRestrictions || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Emergency Contacts</h4>
                          {user.emergencyContacts && Array.isArray(user.emergencyContacts) && user.emergencyContacts.length > 0 ? (
                            <div className="space-y-2 mt-2">
                              {user.emergencyContacts.map((contact: { name: string, relationship: string, phoneNumber: string }, index: number) => (
                                <div key={index} className="border rounded p-2">
                                  <p>
                                    <span className="font-medium">{contact.name}</span> ({contact.relationship})
                                  </p>
                                  <p className="text-sm">{contact.phoneNumber}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600">No emergency contacts provided</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Caregiver Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Bio</h4>
                          <p className="text-gray-600">{user.bio || "No bio provided"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Experience</h4>
                            <p className="text-gray-600">
                              {user.yearsExperience ? `${user.yearsExperience} years` : "Not specified"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Hourly Rate</h4>
                            <p className="text-gray-600">
                              {user.hourlyRate ? `$${user.hourlyRate}/hour` : "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">First Aid Certified</h4>
                            <p className="text-gray-600">
                              {user.firstAidCertified ? "Yes" : "No"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Has Transportation</h4>
                            <p className="text-gray-600">
                              {user.hasTransportation ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {user.userType === "parent" && (
                <TabsContent value="children" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Children</CardTitle>
                      <CardDescription>
                        Information about children under this parent's care
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        This information is available in the database and would be displayed here.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {user.userType === "babysitter" && (
                <TabsContent value="skills" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Skills & Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Skills</h4>
                          {user.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {user.skills.map((skill: string, index: number) => (
                                <Skill key={index} name={skill} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600">No skills specified</p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">Years of Experience</h4>
                          <p className="text-gray-600">
                            {user.yearsExperience ? `${user.yearsExperience} years` : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}