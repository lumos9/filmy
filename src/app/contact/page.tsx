import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="w-full py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-4 text-balance">
            Contact Us
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
            Have questions, feedback, or partnership ideas? Reach out to the
            Filmy team and we’ll get back to you soon!
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
