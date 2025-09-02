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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setFormData({
          name: "",
          email: "",
          contactType: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error("Failed to send message");
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
      <Card className=" shadow-lg">
        {/* <CardHeader className="text-center pb-8">
          <CardTitle className="text-2xl font-bold text-foreground">
            Get in Touch
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </CardDescription>
        </CardHeader> */}

        <CardContent className="space-y-6">
          {status.type === "success" && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          {status.type === "error" && (
            <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{status.message}</AlertDescription>
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
