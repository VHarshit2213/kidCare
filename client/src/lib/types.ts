export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  userType: "parent" | "babysitter";
  profileImageUrl?: string;
  bio?: string;
  hourlyRate?: number;
  skills?: string[];
  firstAidCertified?: boolean;
  hasTransportation?: boolean;
  yearsExperience?: number;
  location?: string;
  // Parent profile fields
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  parentingStyle?: string;
  familyDescription?: string;
  familyActivities?: string;
  medicalDietaryRestrictions?: string;
  emergencyContacts?: EmergencyContact[];
  profileCompleted?: boolean;
}

export interface Booking {
  id: number;
  parentId: number;
  babysitterId: number | null;
  childName: string;
  startTime: string;
  endTime: string;
  careInstructions?: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  requiresFirstAid: boolean;
  requiresTransportation: boolean;
  requiresExperience: boolean;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  bookingId?: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Child {
  id: number;
  parentId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  personality?: string;
  specialCare?: string;
  createdAt: string;
}

export interface InstantCareFormData {
  startTime: string;
  endTime: string;
  children: Child[];
  careInstructions?: string;
}

export interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
}
