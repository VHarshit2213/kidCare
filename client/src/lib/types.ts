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
  id: string;
  name: string;
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
