import { type NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  contactType: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    const { name, email, contactType, subject, message } = body;

    if (!name || !email || !contactType || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Log the contact form submission (in production, you'd save to database or send email)
    console.log("Contact form submission:", {
      name,
      email,
      contactType,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    // 4. Integrate with CRM or support system

    // For now, we'll simulate a successful submission
    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
