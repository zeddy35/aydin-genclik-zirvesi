import { NextRequest, NextResponse } from "next/server";
import { generatePresignedUploadUrl } from "@/lib/r2";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
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

    // Get request body
    const body = await request.json();
    const { fileName, contentType, eventType } = body;

    if (!fileName || !contentType || !eventType) {
      return NextResponse.json(
        { error: "Missing required fields: fileName, contentType, eventType" },
        { status: 400 }
      );
    }

    // Validate file types
    const gameJamAllowed = ["application/zip", "application/x-zip-compressed"];
    const adminDocAllowed = ["application/pdf", "image/png", "image/jpeg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    const allowedTypes = eventType === "gamejam" ? gameJamAllowed : adminDocAllowed;
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid content type for ${eventType}` },
        { status: 400 }
      );
    }

    // Generate unique key
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileExt = fileName.split(".").pop();
    const key =
      eventType === "gamejam"
        ? `submissions/gamejam/${uid}-${timestamp}.${fileExt}`
        : `admin-docs/${uid}-${timestamp}-${randomId}.${fileExt}`;

    // Generate presigned URL (1 hour expiry)
    const presignedUrl = await generatePresignedUploadUrl(
      key,
      contentType,
      3600
    );

    return NextResponse.json({
      presignedUrl,
      key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
