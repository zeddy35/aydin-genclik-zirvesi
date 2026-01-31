import { NextRequest, NextResponse } from "next/server";
import { generatePresignedDownloadUrl } from "@/lib/r2";
import { adminAuth } from "@/lib/firebase-admin";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    // Get auth header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Verify Firebase token
    let uid: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // If it's a user's own submission, allow
    // If it's an admin doc, check if user has access
    if (key.includes("admin-docs")) {
      // Get user doc to check if admin
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists() || userDoc.data()?.role !== "admin") {
        return NextResponse.json(
          { error: "Not authorized to download admin documents" },
          { status: 403 }
        );
      }
    } else if (key.includes("submissions")) {
      // Check if it's the user's own submission
      if (!key.includes(uid)) {
        return NextResponse.json(
          { error: "Not authorized to download this file" },
          { status: 403 }
        );
      }
    }

    // Generate presigned download URL (24 hours expiry)
    const presignedUrl = await generatePresignedDownloadUrl(key, 86400);

    // Return redirect to presigned URL
    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("Download URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
