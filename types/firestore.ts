// Event Types
export type EventType = "gamejam" | "hackathon";

// Application Status
export type ApplicationStatus = "draft" | "submitted" | "approved" | "rejected";

// User Role
export type UserRole = "user" | "admin";

// User Document (users/{uid})
export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  kvkkAccepted?: boolean;
  kvkkAcceptedAt?: Date | string;
  createdAt: Date | string;
}

// Common Profile Fields
export interface ApplicationProfile {
  school: string;
  department: string;
  city: string;
  grade?: string;
  birthDate?: string;
}

// Game Jam Specific Data
export interface GameJamEventData {
  roles: string[]; // Designer, Developer, Artist, etc.
  engine?: string; // Unity, Unreal, Godot, etc.
  experience: string; // Beginner, Intermediate, Advanced
  preferredGenre?: string;
  teamSize?: number;
}

// Hackathon Specific Data
export interface HackathonEventData {
  tracks: string[]; // AI, Web, Mobile, IoT, etc.
  stack: string[]; // React, Python, Node.js, etc.
  experience: string;
  ideaSummary?: string;
  teamSize?: number;
}

// Game Submission (Game Jam)
export interface GameSubmission {
  gameUpload?: {
    key: string;
    url?: string;
    size: number;
    uploadedAt: Date | string;
  };
  itchLink?: string;
  updatedAt?: Date | string;
}

// Trailer Submission (Hackathon)
export interface TrailerSubmission {
  trailerUrl?: string;
  updatedAt?: Date | string;
}

// Admin Document
export interface AdminDocument {
  id: string;
  title: string;
  key: string;
  mime: string;
  size: number;
  uploadedAt: Date | string;
  uploadedBy: string; // admin uid
}

// Application Document (applications/{uid})
export interface Application {
  uid: string;
  eventType: EventType;
  status: ApplicationStatus;
  statusReason?: string; // Rejection reason
  profile: ApplicationProfile;
  eventData: GameJamEventData | HackathonEventData;
  adminDocs?: AdminDocument[];
  timestamps: {
    createdAt: Date | string;
    submittedAt?: Date | string;
    reviewedAt?: Date | string;
    reviewedBy?: string; // admin uid
  };
}

// Submission Document (submissions/{uid})
export interface Submission {
  uid: string;
  eventType: EventType;
  gamejam?: GameSubmission;
  hackathon?: TrailerSubmission;
}
