"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Separator } from "./ui/separator";

const donationAmounts = [
  { amount: 5, label: "$5" },
  { amount: 10, label: "$10" },
  { amount: 25, label: "$25" },
  { amount: 50, label: "$50" },
  { amount: 100, label: "$100" },
];

type DonationStatus = "idle" | "processing" | "success" | "error";

export function PayPalDonateButton() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [status, setStatus] = useState<DonationStatus>("idle");
  const [message, setMessage] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const handleDonation = async (amount: number) => {
    setStatus("processing");
    setMessage("");

    try {
      // Create PayPal order
      const createResponse = await fetch("/api/paypal/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.error || "Failed to create donation order");
      }

      // Redirect to PayPal for payment
      const paypalUrl = `https://www.${
        process.env.NODE_ENV === "production" ? "" : "sandbox."
      }paypal.com/checkoutnow?token=${createData.orderID}`;

      // Open PayPal in a new window
      const paypalWindow = window.open(
        paypalUrl,
        "paypal",
        "width=500,height=600"
      );

      // Listen for the PayPal window to close or redirect back
      const checkClosed = setInterval(async () => {
        if (paypalWindow?.closed) {
          clearInterval(checkClosed);

          // Attempt to capture the order
          try {
            const captureResponse = await fetch("/api/paypal/capture", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderID: createData.orderID }),
            });

            const captureData = await captureResponse.json();

            if (captureResponse.ok && captureData.success) {
              setStatus("success");
              setMessage(
                `Thank you! Your donation of $${captureData.amount} has been processed successfully.`
              );
              setTransactionId(captureData.transactionId);
              setSelectedAmount(null);
              setCustomAmount("");
            } else {
              setStatus("error");
              setMessage(
                "Donation was cancelled or failed to process. Please try again."
              );
            }
          } catch (error) {
            setStatus("error");
            setMessage(
              "Unable to verify donation status. Please check your PayPal account."
            );
          }
        }
      }, 1000);

      // Clean up interval after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        if (status === "processing") {
          setStatus("error");
          setMessage("Donation process timed out. Please try again.");
        }
      }, 300000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    }
  };

  const getEffectiveAmount = () => {
    if (customAmount && !isNaN(Number(customAmount))) {
      return Number(customAmount);
    }
    return selectedAmount;
  };

  const resetStatus = () => {
    setStatus("idle");
    setMessage("");
    setTransactionId("");
  };

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg border-0 bg-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Donation Successful!
                </h3>
                <p className="text-muted-foreground text-balance">{message}</p>
                {transactionId && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Transaction ID: {transactionId}
                  </p>
                )}
              </div>
              <Button onClick={resetStatus} className="w-full">
                Make Another Donation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg border-0 bg-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Donation Failed
                </h3>
                <p className="text-muted-foreground text-balance">{message}</p>
              </div>
              <Button onClick={resetStatus} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Anonymous</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
          <span>Trusted</span>
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <CardTitle className="text-xl font-bold">Make a Donation</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preset Amount Buttons */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Choose an amount
            </label>
            <div className="grid grid-cols-3 gap-2">
              {donationAmounts.map(({ amount, label }) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className="h-12 font-semibold transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center my-4">
            <div className="flex-grow">
              <Separator />
            </div>
            <span className="mx-4 text-muted-foreground text-xs font-medium">
              or
            </span>
            <div className="flex-grow">
              <Separator />
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter a custom amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                min="1"
                step="0.01"
              />
            </div>
          </div>

          <Separator />

          {/* Donation Button */}
          <Button
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
            disabled={!getEffectiveAmount() || status === "processing"}
            onClick={() => {
              const amount = getEffectiveAmount();
              if (amount) handleDonation(amount);
            }}
          >
            {status === "processing" ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing with PayPal...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {getEffectiveAmount()
                  ? `Donate $${getEffectiveAmount()} via PayPal`
                  : "Select Amount to Donate"}
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="secondary">
                <Lock className="h-3 w-3 mr-1" />
                100% Anonymous
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We don't collect or store any personal information. Your donation
              is processed securely through PayPal's encrypted system.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Trust Elements */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Powered by PayPal's secure payment system
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>SSL Encrypted</span>
          <span>•</span>
          <span>PCI Compliant</span>
          <span>•</span>
          <span>No Data Stored</span>
        </div>
      </div>
    </div>
  );
}
