import { useContext } from "react";
import { AppContext } from "@/App";
import Layout from "@/components/Layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Skill from "@/components/common/Skill";

export default function Profile() {
  const { currentUser, isAuthenticated } = useContext(AppContext);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">Please log in to view your profile.</p>
            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
              Log In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
          <div className="p-6 sm:p-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:items-center">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  {currentUser?.profileImageUrl ? (
                    <AvatarImage src={currentUser.profileImageUrl} alt={currentUser.fullName} />
                  ) : (
                    <AvatarFallback className="text-xl">{getInitials(currentUser?.fullName || "User")}</AvatarFallback>
                  )}
                </Avatar>
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <h1 className="text-2xl font-bold text-neutral-800">{currentUser?.fullName}</h1>
                  <p className="mt-1 text-sm text-neutral-600">{currentUser?.email}</p>
                  <p className="mt-1 text-sm font-medium text-primary capitalize">{currentUser?.userType}</p>
                </div>
              </div>
              <Button className="mt-6 sm:mt-0">Edit Profile</Button>
            </div>

            {currentUser?.userType === "babysitter" && (
              <div className="mt-8">
                <div className="border-t border-neutral-200 pt-8">
                  <h2 className="text-lg font-medium text-neutral-800">About Me</h2>
                  <p className="mt-2 text-neutral-600">{currentUser.bio || "No bio provided."}</p>
                </div>

                <div className="mt-8 border-t border-neutral-200 pt-8">
                  <h2 className="text-lg font-medium text-neutral-800">Skills & Qualifications</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentUser.skills?.map((skill, index) => (
                      <Skill key={index} name={skill} />
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">Experience</h3>
                      <p className="mt-1 text-neutral-600">{currentUser.yearsExperience} years</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">Hourly Rate</h3>
                      <p className="mt-1 text-neutral-600">${currentUser.hourlyRate}/hour</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">First Aid Certified</h3>
                      <p className="mt-1 text-neutral-600">{currentUser.firstAidCertified ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">Has Transportation</h3>
                      <p className="mt-1 text-neutral-600">{currentUser.hasTransportation ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
