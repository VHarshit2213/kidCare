import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { User } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Skill from "@/components/common/Skill";
import { useState } from "react";
import InstantCareModal from "@/components/InstantCareModal";

export default function SitterProfile() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: sitter, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
    enabled: !!id,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
            <div className="p-6 sm:p-8">
              <div className="flex items-center">
                <div className="h-24 w-24 rounded-full bg-gray-200"></div>
                <div className="ml-6">
                  <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="mt-8 border-t border-neutral-200 pt-8">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!sitter) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">Babysitter not found.</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
          <div className="relative h-48 md:h-64">
            {sitter.profileImageUrl ? (
              <img
                className="w-full h-full object-cover"
                src={sitter.profileImageUrl}
                alt={sitter.fullName}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-3xl">{getInitials(sitter.fullName)}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">{sitter.fullName}</h1>
                <div className="mt-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-neutral-800">
                    {sitter.yearsExperience ? "4.9" : "New"}
                  </span>
                  <span className="mx-2 text-neutral-500">•</span>
                  <span className="text-sm text-neutral-600">{sitter.location}</span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">
                  ${sitter.hourlyRate}/hour • {sitter.yearsExperience} years experience
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark"
                >
                  Book Now
                </Button>
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-8">
              <h2 className="text-lg font-medium text-neutral-800">About {sitter.fullName.split(" ")[0]}</h2>
              <p className="mt-2 text-neutral-600">{sitter.bio}</p>
              
              {/* Video introduction */}
              {sitter.hasVideo && sitter.videoUrl && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-neutral-800 mb-2">Video Introduction</h3>
                  <div className="relative rounded-lg overflow-hidden border border-neutral-200">
                    <video 
                      controls 
                      className="w-full max-h-96 object-contain bg-neutral-50"
                      src={sitter.videoUrl}
                      poster={sitter.profileImageUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <p className="mt-2 text-sm text-neutral-500">
                    Watch {sitter.fullName.split(" ")[0]}'s introduction video to learn more about their childcare approach.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-8">
              <h2 className="text-lg font-medium text-neutral-800">Skills & Qualifications</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {sitter.skills?.map((skill, index) => (
                  <Skill key={index} name={skill} />
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${sitter.firstAidCertified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-neutral-800">First Aid Certified</h3>
                    <p className="text-sm text-neutral-500">{sitter.firstAidCertified ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${sitter.hasTransportation ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-neutral-800">Has Transportation</h3>
                    <p className="text-sm text-neutral-500">{sitter.hasTransportation ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${(sitter.yearsExperience || 0) >= 2 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-neutral-800">Experience</h3>
                    <p className="text-sm text-neutral-500">{sitter.yearsExperience || 0} years</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InstantCareModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
