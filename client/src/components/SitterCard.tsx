import { Link } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Skill from "./common/Skill";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface SitterCardProps {
  sitter: User;
}

export default function SitterCard({ sitter }: SitterCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
      <div className="relative pb-2/3 h-48">
        {sitter.profileImageUrl ? (
          <img
            className="absolute h-full w-full object-cover"
            src={sitter.profileImageUrl}
            alt={sitter.fullName}
          />
        ) : (
          <div className="absolute h-full w-full bg-gray-200 flex items-center justify-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {getInitials(sitter.fullName)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-800">{sitter.fullName}</h3>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-medium text-neutral-800">
              {sitter.yearsExperience ? "4.9" : "New"}
            </span>
          </div>
        </div>
        <p className="text-sm text-neutral-600 mt-1">
          {sitter.yearsExperience} years experience
          {sitter.firstAidCertified ? ", CPR certified" : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sitter.skills?.map((skill, index) => (
            <Skill key={index} name={skill} />
          ))}
          {sitter.hasVideo && (
            <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Video
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm font-medium text-neutral-800">
            ${sitter.hourlyRate}/hour
          </span>
          <Link href={`/sitter/${sitter.id}`}>
            <Button size="sm" className="rounded-full bg-[#00A699] hover:bg-[#008F84]">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
