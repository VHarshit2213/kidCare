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
import { format } from "date-fns";

type SafeUser = Omit<User, "password">;

interface UserDetailsProps {
  user: SafeUser;
  trigger: React.ReactNode;
  fieldsToShow: boolean;
}

export default function UserDetailsDialog({
  user,
  trigger,
  fieldsToShow = true,
}: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState(
    fieldsToShow ? "overview" : "profile"
  );

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
      <DialogContent className="w-[95%] lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl xs:text-2xl">
            {user?.userType === "parent" ? "Parent" : "Babysitter"} Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this{" "}
            {user?.userType === "parent" ? "Parent" : "Babysitter"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="md:w-1/3">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-3">
                    {user.profileImageUrl ? (
                      <AvatarImage
                        src={user.profileImageUrl}
                        alt={user.fullName}
                      />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {getInitials(user.fullName || "User")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="text-xl text-center">
                    {user.fullName}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {user.email}
                  </CardDescription>
                  <div className="mt-2 flex flex-col lg:flex-row justify-center items-center gap-2 lg:gap-0">
                    <Badge
                      variant={
                        user.userType === "babysitter" ? "secondary" : "default"
                      }
                      className="w-fit"
                    >
                      {user.userType === "babysitter" ? "Babysitter" : "Parent"}
                    </Badge>
                    {user.isProfileCompleted && (
                      <Badge variant="success" className="ml-2 w-fit">
                        Profile Complete
                      </Badge>
                    )}
                    {user.userType === "babysitter" && user.reviewStatus && (
                      <Badge
                        variant={
                          user.reviewStatus === "approved"
                            ? "success"
                            : user.reviewStatus === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                        className="ml-2"
                      >
                        {user.reviewStatus === "approved"
                          ? "Approved"
                          : user.reviewStatus === "rejected"
                          ? "Rejected"
                          : "Pending Review"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-3">
                  {/* <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Username
                    </h4>
                    <p className="mt-1">{user.username}</p>
                  </div> */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Member Since
                    </h4>
                    <p className="mt-1">
                      {format(new Date(user.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                  {fieldsToShow && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Location
                      </h4>
                      <p className="mt-1">
                        {(
                          user.floor_number +
                          " " +
                          user.street_name +
                          " " +
                          user.address
                        ).trim() || "Not specified"}
                      </p>
                    </div>
                  )}
                  {user.userType === "babysitter" && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Hourly Rate
                        </h4>
                        <p className="mt-1">
                          {user.horulyRate
                            ? `$${user.horulyRate}/hour`
                            : "Not specified"}
                        </p>
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
              <TabsList className={`w-full grid ${fieldsToShow ? "grid-cols-3" : " grid-cols-2"} `}>
                {fieldsToShow && (
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                )}
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                {user.userType === "parent" && (
                  <TabsTrigger value="children">Children</TabsTrigger>
                )}
                {user.userType === "babysitter" && (
                  <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
                )}
              </TabsList>

              {fieldsToShow && (
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
                            {user.userType === "babysitter"
                              ? "Babysitter"
                              : "Parent"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Profile Status</h4>
                          <p className="text-gray-600">
                            {user.isProfileCompleted
                              ? "Completed"
                              : "Incomplete"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Contact Information</h4>
                          <p className="text-gray-600">
                            Email: {user.email || "Not provided"}
                            <br />
                            Phone: {user.phoneNumber || "Not provided"}
                          </p>
                        </div>
                        {user.userType === "babysitter" && (
                          <>
                            {/* <div>
                            <h4 className="font-medium">Review Status</h4>
                            <p className="text-gray-600">
                              {user.reviewStatus === "approved"
                                ? "Approved - Caregiver is verified and ready to accept bookings"
                                : user.reviewStatus === "rejected"
                                  ? "Rejected - Caregiver profile has been rejected"
                                  : user.reviewStatus === "pending"
                                    ? "Pending Review - Caregiver profile is awaiting admin approval"
                                    : "Not submitted for review"}
                            </p>
                          </div> */}
                          </>
                        )}
                        {user.userType === "parent" && (
                          <div>
                            <h4 className="font-medium">Family Description</h4>
                            <p className="text-gray-600">
                              {user.familyDesc || "No description provided"}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="profile" className="mt-4">
                {user.userType === "parent" ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Parent Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* <div>
                            <h4 className="font-medium">First Name</h4>
                            <p className="text-gray-600">
                              {user.firstName || "Not provided"}
                            </p>
                          </div> */}
                          <div>
                            <h4 className="font-medium">Full Name</h4>
                            <p className="text-gray-600">
                              {user.fullName || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">Parenting Style</h4>
                          <p className="text-gray-600">
                            {user.parentingStyle || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Family Activities</h4>
                          <p className="text-gray-600">
                            {user.familyActivity || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Medical & Dietary Information
                          </h4>
                          <p className="text-gray-600">
                            {user.medical || "Not provided"}
                          </p>
                        </div>
                        {user.userType === "parent" &&
                          user.secondParentGuardian && (
                            <div className="mt-6">
                              <h4 className="font-medium">
                                Second Parent / Guardian
                              </h4>
                              {user.secondParentGuardian.firstName ||
                              user.secondParentGuardian.lastName ||
                              user.secondParentGuardian.phoneNumber ? (
                                <div className="border rounded p-2 mt-2">
                                  <p>
                                    <span className="font-medium">
                                      {user.secondParentGuardian.firstName}{" "}
                                      {user.secondParentGuardian.lastName}
                                    </span>{" "}
                                  </p>
                                  {user.secondParentGuardian.phoneNumber && (
                                    <p>
                                      {user.secondParentGuardian.phoneNumber}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-600 mt-2">
                                  No additional guardian information provided
                                </p>
                              )}
                            </div>
                          )}

                        <div>
                          <h4 className="font-medium">Emergency Contacts</h4>
                          {Array.isArray(user.emergencyContact) &&
                          user.emergencyContact.length > 0 ? (
                            <div className="space-y-2 mt-2">
                              {user.emergencyContact.map(
                                (
                                  contact: {
                                    name: string;
                                    relationship: string;
                                    phoneNumber: string;
                                  },
                                  index: number
                                ) => (
                                  <div
                                    key={index}
                                    className="border rounded p-2"
                                  >
                                    <p>
                                      <span className="font-medium">
                                        {contact.name}
                                      </span>{" "}
                                      ({contact.relationship})
                                    </p>
                                    <p className="text-sm">
                                      {contact.phoneNumber}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-600">
                              No emergency contacts provided
                            </p>
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
                          <p className="text-gray-600">
                            {user.shortBio || "No bio provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Passion for Working with Children
                          </h4>
                          <p className="text-gray-600">
                            {user.aboutWorking || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">caregiving style</h4>
                          <p className="text-gray-600">
                            {user.caregiving || "Not specified"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Experience</h4>
                            <p className="text-gray-600">
                              {user.experience
                                ? `${user.experience} years`
                                : "Not specified"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Hourly Rate</h4>
                            <p className="text-gray-600">
                              {user.horulyRate
                                ? `$${user.horulyRate}/hour`
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                        {fieldsToShow && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">
                                First Aid Certified
                              </h4>
                              <p className="text-gray-600">
                                {user.certified ? "Yes" : "No"}
                              </p>
                              {user.certificateUrl && (
                                <a
                                  href={user.certificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View Aid Certificate
                                </a>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Has Transportation
                              </h4>
                              <p className="text-gray-600">
                                {user.transportation ? "Yes" : "No"}
                              </p>
                              {user.transportationUrl && (
                                <a
                                  href={user.transportationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View driver's license Certificate
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">Introduction Video</h4>
                          <p className="text-gray-600">
                            {user.instrucationVideo ? "Yes" : "No"}
                          </p>
                          {user.videoUrl && (
                            <video controls className="w-full rounded-md">
                              <source src={user.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
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
                      {Array.isArray(user.children) &&
                      user.children.length > 0 ? (
                        <div className="space-y-4">
                          {user.children.map(
                            (
                              child: {
                                id: string;
                                firstName: string;
                                lastName: string;
                                dateOfBirth: string;
                                personality?: string;
                                specialCare?: string;
                              },
                              index: number
                            ) => (
                              <div
                                key={child.id || index}
                                className="border rounded-lg p-4 shadow-sm"
                              >
                                <p className="font-medium text-lg">
                                  {child.firstName} {child.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Date of Birth:{" "}
                                  {new Date(
                                    child.dateOfBirth
                                  ).toLocaleDateString()}
                                </p>
                                {child.personality && (
                                  <p className="text-sm mt-1">
                                    <span className="font-semibold">
                                      Personality:
                                    </span>{" "}
                                    {child.personality}
                                  </p>
                                )}
                                {child.specialCare && (
                                  <p className="text-sm mt-1">
                                    <span className="font-semibold">
                                      Special Care:
                                    </span>{" "}
                                    {child.specialCare}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No children information available.
                        </div>
                      )}
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
                          {user.parentSkill &&
                          Array.isArray(user.parentSkill) &&
                          user.parentSkill.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {user.parentSkill.map(
                                (skill: string, index: number) => (
                                  <Skill key={index} name={skill} />
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-600">No skills specified</p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Most Experienced Age Range
                          </h4>
                          {user.mostExperience &&
                          Array.isArray(user.mostExperience) &&
                          user.mostExperience.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {user.mostExperience.map(
                                (experience: string, index: number) => (
                                  <Skill key={index} name={experience} />
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-600">No skills specified</p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">Years of Experience</h4>
                          <p className="text-gray-600">
                            {user.experience
                              ? `${user.experience} years`
                              : "Not specified"}
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

        {/* <div className="flex justify-end mt-6">
          <Button variant="outline">Close</Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
