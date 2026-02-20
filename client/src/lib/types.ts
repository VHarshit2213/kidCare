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
  // Shared profile fields
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  profileCompleted?: boolean;
  // Payment and membership fields
  membershipStatus?:
    | "none"
    | "pending"
    | "active"
    | "installment_1"
    | "installment_2"
    | "expired";
  membershipType?: "one-time" | "installment";
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
  user_metadata?: {
    email: string;
    email_verified: boolean;
    fullName: string;
    isPayment: boolean;
    phone_verified: boolean;
    sub: string;
    userType: string;
    profileCompleted: boolean;
  };
}

export interface Booking {
  id: string;
  parent_id: string;
  sitter_id: string;
  hours: number;
  start_time: string;
  end_time: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  children: string[];
  careInstructions: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  requiresFirstAid: boolean;
  requiresTransportation: boolean;
  requiresExperience: boolean;
  createdAt: string;
  date: string;
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
  hoursNeeded: number;
  children: Child[];
  careInstructions?: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface ScheduledCareFormData {
  date: string;
  startTime: string;
  endTime: string;
  children: Child[];
  careInstructions?: string;
  address: string;
  latitude: number;
  longitude: number;
  hoursNeeded: number;
}

export interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export interface ParentProfile {
  user_id?: string;
  email: string;
  fullName: string;
  isPayment: boolean;
  address: string;
  floor_number: string;
  street_name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  phoneNumber: string;
  secondParentGuardian?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  parentingStyle?: string;
  familyDesc?: string;
  familyActivity?: string;
  medical?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  }[];
  children?: any[];
  profile_image?: string;
  isProfileCompleted?: boolean;
  isApproved:boolean;
  zipCode:string;
}

export type babysitterProfile = {
  user_id?: string;
  fullName?: string;
  email?: string;
  address: string;
  floor_number: string;
  street_name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  phoneNumber: string;
  shortBio: string;
  experience: string;
  mostExperience: string[];
  parentSkill: string[];
  aboutWorking: string;
  caregiving: string;
  horulyRate: number;
  certified: string;
  transportation: string;
  instrucationVideo: string;
  isApproved: boolean;
  isAvailable: boolean;
  profile_image: string;
  isProfileCompleted:boolean;
  stripeAccountID:string;
  averageRating?: number | null;
  reviewCount?: number;
  zipCode:string;
};
export interface TransactionsData {
  id: string;
  babySitterName: string;
  parentName: string;
  totalAmount: Float16Array;
  babySitterAmount: Float16Array;
  platformFee: Float16Array;
}
