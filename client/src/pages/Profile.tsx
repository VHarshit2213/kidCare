import Layout from "@/components/Layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Skill from "@/components/common/Skill";
import { useAuth } from "@/hooks/use-auth";
import AvailabilityToggle from "@/components/AvailabilityToggle";
import { useNavigate } from "react-router";

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth();
  const isAuthenticated = !!user;

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
                  {user?.profileImageUrl ? (
                    <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                  ) : (
                    <AvatarFallback className="text-xl">{getInitials(user?.fullName || "User")}</AvatarFallback>
                  )}
                </Avatar>
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <h1 className="text-2xl font-bold text-neutral-800">{user?.fullName}</h1>
                  <p className="mt-1 text-sm text-neutral-600">{user?.email}</p>
                  <p className="mt-1 text-sm font-medium text-primary capitalize">{user?.userType}</p>
                </div>
              </div>
              <Button className="mt-6 sm:mt-0" onClick={() => navigate("/profile-completion")}>Edit Profile</Button>
            </div>

            {user?.userType === "babysitter" && (
              <div className="mt-8">
                <div className="border-t border-neutral-200 pt-8">
                  <AvailabilityToggle />
                </div>
                
                <div className="border-t border-neutral-200 pt-8 mt-8">
                  <h2 className="text-lg font-medium text-neutral-800">About Me</h2>
                  <p className="mt-2 text-neutral-600">{user.bio || "No bio provided."}</p>
                  
                  {user.phoneNumber && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-neutral-800">Contact</h3>
                      <p className="mt-1 text-neutral-600">Phone: {user.phoneNumber}</p>
                    </div>
                  )}
                </div>
                
                {user.enjoymentReason && (
                  <div className="mt-8 border-t border-neutral-200 pt-8">
                    <h2 className="text-lg font-medium text-neutral-800">Why I Love Working With Children</h2>
                    <p className="mt-2 text-neutral-600">{user.enjoymentReason}</p>
                  </div>
                )}
                
                {user.caregiverStyle && (
                  <div className="mt-8 border-t border-neutral-200 pt-8">
                    <h2 className="text-lg font-medium text-neutral-800">My Caregiving Style</h2>
                    <p className="mt-2 text-neutral-600">{user.caregiverStyle}</p>
                  </div>
                )}

                <div className="mt-8 border-t border-neutral-200 pt-8">
                  <h2 className="text-lg font-medium text-neutral-800">Skills & Qualifications</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.skills?.map((skill: string, index: number) => (
                      <Skill key={index} name={skill} />
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">Experience</h3>
                      <p className="mt-1 text-neutral-600">{user.yearsExperience} years</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">Hourly Rate</h3>
                      <p className="mt-1 text-neutral-600">${user.hourlyRate}/hour</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">First Aid Certified</h3>
                      <p className="mt-1 text-neutral-600">{user.firstAidCertified ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">Has Transportation</h3>
                      <p className="mt-1 text-neutral-600">{user.hasTransportation ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
                
                {user.ageRangeExperience && user.ageRangeExperience.length > 0 && (
                  <div className="mt-8 border-t border-neutral-200 pt-8">
                    <h2 className="text-lg font-medium text-neutral-800">Age Ranges I Have Experience With</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.ageRangeExperience.map((age: string, index: number) => (
                        <Skill key={index} name={age} />
                      ))}
                    </div>
                  </div>
                )}
                
                {user.videoUrl && (
                  <div className="mt-8 border-t border-neutral-200 pt-8">
                    <h2 className="text-lg font-medium text-neutral-800">Introduction Video</h2>
                    <div className="mt-4">
                      <video 
                        controls 
                        className="w-full max-h-96 rounded-lg"
                        src={user.videoUrl}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
