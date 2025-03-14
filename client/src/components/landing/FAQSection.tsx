import { Card } from "@/components/ui/card";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-3">{question}</h3>
      <p className="text-gray-600">
        {answer}
      </p>
    </Card>
  );
};

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about our note trading platform
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <FAQItem 
              question="How does NoteTrade verify users?" 
              answer="We implement a multi-step verification process that includes industry-specific credentials, business verification, and compliance with financial regulations. Our goal is to create a trusted community of legitimate note professionals."
            />
            
            <FAQItem 
              question="Does NoteTrade handle the financial transactions?" 
              answer="No, NoteTrade serves as a connection platform only. All financial transactions and legal transfers take place outside our platform through traditional means. We focus on providing the tools to find the right notes and connect with qualified counterparties."
            />
            
            <FAQItem 
              question="What types of mortgage notes can be listed?" 
              answer="Our platform supports all types of mortgage notes including residential 1st and 2nd positions, commercial notes, performing and non-performing notes. Each listing type has specialized fields to provide the most relevant information to potential buyers."
            />
            
            <FAQItem 
              question="How secure is the document sharing feature?" 
              answer="Our document sharing system uses bank-grade encryption and secure access controls. Only verified users with explicit permission can access shared documents, and all sensitive borrower information must be properly redacted before upload."
            />
            
            <FAQItem 
              question="What is the pricing structure based on?" 
              answer="Our subscription plans are designed around listing volume and access to premium features. We don't charge transaction fees or commissions on note sales, allowing you to maximize your profits."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
