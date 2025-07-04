export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface User {
  id: number;
  userName: string;
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
  // Shared profile fields
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  profileCompleted?: boolean;
  // Payment and membership fields
  membershipStatus?: 'none' | 'pending' | 'active' | 'installment_1' | 'installment_2' | 'expired';
  membershipType?: 'one-time' | 'installment';
  membershipPaymentDate?: string;
  stripeCustomerId?: string;
  stripePaymentIntentId?: string;
  // Parent profile fields
  parentingStyle?: string;
  familyDescription?: string;
  familyActivities?: string;
  medicalDietaryRestrictions?: string;
  emergencyContacts?: EmergencyContact[];
  hasSecondParent?: boolean;
  secondParentFirstName?: string;
  secondParentLastName?: string;
  secondParentPhone?: string;
  // Babysitter profile fields
  experienceYears?: string;
  ageRangeExperience?: string[];
  enjoymentReason?: string;
  caregiverStyle?: string;
  hasVideo?: boolean;
  videoUrl?: string;
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
