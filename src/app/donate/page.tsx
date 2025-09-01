import { PayPalDonateButton } from "@/components/PayPalDonateButton";

export default function DonatePage() {
  return (
    <main className="w-full py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
            Support Our Mission
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
            Your generous donation helps us continue making a positive impact.
            Every contribution, no matter the size, makes a difference.
          </p>
        </div>

        <PayPalDonateButton />
      </div>
    </main>
  );
}
