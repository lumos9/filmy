import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Helper to send email to a list of recipients using Resend
async function sendContactEmail({
  to,
  subject,
  text,
}: {
  to: string[];
  subject: string;
  text: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Resend API key is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: process.env.SMTP_FROM || "onboarding@resend.dev", // sandbox until verified
    to: to,
    subject,
    text,
  });

  console.log("Resend response:", result);
}

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

    // Send email to addresses in env CONTACT_EMAILS (comma-separated)
    const contactEmails = (process.env.CONTACT_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (contactEmails.length > 0) {
      console.log(
        `Sending contact form email to: '${contactEmails.join(", ")}'`
      );
      const emailText = `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nType: ${contactType}\nSubject: ${subject}\nMessage:\n${message}\n\nSubmitted at: ${new Date().toISOString()}`;
      await sendContactEmail({
        to: contactEmails,
        subject: `Filmy Contact Form: ${subject}`,
        text: emailText,
      });
      console.log(`Contact email sent to: '${contactEmails.join(", ")}'`);
    }

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
