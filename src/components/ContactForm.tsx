"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Send,
  MessageSquare,
  HelpCircle,
  Handshake,
  Loader2,
  CheckCircle2Icon,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface FormData {
  name: string;
  email: string;
  contactType: string;
  subject: string;
  message: string;
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error";
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    contactType: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  // Store last successful submission to prevent spam/duplicate
  const [lastSubmitted, setLastSubmitted] = useState<FormData | null>(null);

  const contactTypes = [
    {
      value: "feedback",
      label: "Feedback",
      icon: MessageSquare,
      description: "Share your thoughts and suggestions",
    },
    {
      value: "support",
      label: "Support",
      icon: HelpCircle,
      description: "Get help with technical issues",
    },
    {
      value: "partnership",
      label: "Partnership",
      icon: Handshake,
      description: "Explore collaboration opportunities",
    },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isDuplicate = (a: FormData | null, b: FormData) => {
    if (!a) return false;
    return (
      a.name === b.name &&
      a.email === b.email &&
      a.contactType === b.contactType &&
      a.subject === b.subject &&
      a.message === b.message
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission
    if (isDuplicate(lastSubmitted, formData)) {
      setStatus({
        type: "error",
        message:
          "You have already submitted this message. Please modify your message or wait before submitting again.",
      });
      return;
    }

    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({
          type: "success",
          message:
            "Thank you for reaching out! We'll get back to you within 24 hours.",
        });
        setLastSubmitted(formData); // Save last successful submission
        setFormData({
          name: "",
          email: "",
          contactType: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: "Sorry, something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          "Sorry, there was an issue sending your message. Please try again.",
      });
    }
  };

  const selectedContactType = contactTypes.find(
    (type) => type.value === formData.contactType
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardContent className="space-y-6">
          {status.type === "success" && (
            <Alert className="border-green-500/50 text-green-700">
              <AlertTitle className="flex flex-row items-center gap-2">
                <CheckCircle2Icon className="h-4 w-4" />
                <div>{status.message}</div>
              </AlertTitle>
            </Alert>
          )}

          {status.type === "error" && (
            <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
              <AlertTitle className="flex flex-row items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <div>{status.message}</div>
              </AlertTitle>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-3 text-left">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="border-border focus:ring-ring"
                />
              </div>

              <div className="grid gap-3 text-left">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="border-border focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid gap-3 text-left">
              <Label
                htmlFor="contactType"
                className="text-sm font-medium text-foreground"
              >
                Contact Type
              </Label>
              <Select
                value={formData.contactType}
                onValueChange={(value) =>
                  handleInputChange("contactType", value)
                }
              >
                <SelectTrigger className="border-border focus:ring-ring">
                  <SelectValue placeholder="Select the type of inquiry" />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedContactType && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent border-accent/20"
                  >
                    <selectedContactType.icon className="h-3 w-3 mr-1" />
                    {selectedContactType.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedContactType.description}
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-3 text-left">
              <Label
                htmlFor="subject"
                className="text-sm font-medium text-foreground"
              >
                Subject
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Brief description of your inquiry"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                required
                className="border-border focus:ring-ring"
              />
            </div>

            <div className="grid gap-3 text-left">
              <Label
                htmlFor="message"
                className="text-sm font-medium text-foreground"
              >
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Please provide details about your inquiry..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                required
                rows={5}
                className="border-border focus:ring-ring resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={status.type === "loading"}
              className="w-full py-3 transition-colors"
            >
              {status.type === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>

          <div className="text-center border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              We typically respond within 24 hours during business days.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
