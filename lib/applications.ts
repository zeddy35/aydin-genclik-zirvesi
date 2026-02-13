import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Application, ApplicationStatus, EventType, ApplicationProfile, GameJamEventData, HackathonEventData } from "@/types/firestore";

/**
 * Get or create an application for a user
 */
export async function getOrCreateApplication(
  uid: string,
  eventType: EventType
): Promise<Application | null> {
  try {
    const docRef = doc(db, "applications", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Application;
    }

    return null;
  } catch (error) {
    console.error("Error getting application:", error);
    throw error;
  }
}

/**
 * Create a new application
 */
export async function createApplication(
  uid: string,
  eventType: EventType,
  profile: ApplicationProfile,
  eventData: GameJamEventData | HackathonEventData
): Promise<Application> {
  try {
    const application: Application = {
      uid,
      eventType,
      status: "draft",
      profile,
      eventData,
      timestamps: {
        createdAt: serverTimestamp() as any,
      },
    };

    await setDoc(doc(db, "applications", uid), application);
    return application;
  } catch (error) {
    console.error("Error creating application:", error);
    throw error;
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  uid: string,
  status: ApplicationStatus,
  statusReason?: string
): Promise<void> {
  try {
    const docRef = doc(db, "applications", uid);
    const updates: any = {
      status,
      "timestamps.reviewedAt": serverTimestamp(),
    };

    if (statusReason) {
      updates.statusReason = statusReason;
    }

    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
}

/**
 * Submit an application
 */
export async function submitApplication(uid: string): Promise<void> {
  try {
    const docRef = doc(db, "applications", uid);
    await setDoc(
      docRef,
      {
        status: "submitted",
        "timestamps.submittedAt": serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error submitting application:", error);
    throw error;
  }
}
