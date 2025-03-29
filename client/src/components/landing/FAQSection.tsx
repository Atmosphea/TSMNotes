import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does NoteTrade verify users?",
    answer: "We implement a multi-step verification process that includes industry-specific credentials, business verification, and compliance with financial regulations. Our goal is to create a trusted community of legitimate note professionals."
  },
  {
    question: "Does NoteTrade handle the financial transactions?",
    answer: "No, NoteTrade serves as a connection platform only. All financial transactions and legal transfers take place outside our platform through traditional means. We focus on providing the tools to find the right notes and connect with qualified counterparties."
  },
  {
    question: "What types of mortgage notes can be listed?",
    answer: "Our platform supports all types of mortgage notes including residential 1st and 2nd positions, commercial notes, performing and non-performing notes. Each listing type has specialized fields to provide the most relevant information to potential buyers."
  },
  {
    question: "How secure is the document sharing feature?",
    answer: "Our document sharing system uses bank-grade encryption and secure access controls. Only verified users with explicit permission can access shared documents, and all sensitive borrower information must be properly redacted before upload."
  },
  {
    question: "What is the pricing structure based on?",
    answer: "Our subscription plans are designed around listing volume and access to premium features. We don't charge transaction fees or commissions on note sales, allowing you to maximize your profits."
  },
  {
    question: "How quickly can I get my notes listed?",
    answer: "Once your account is verified, you can list notes immediately. The listing process is streamlined and typically takes less than 10 minutes to complete if you have all the necessary documentation ready."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <div className="accent-border">
            <h2 className="section-title text-black">
              Frequently Asked Questions
            </h2>
            <p className="section-description text-black">
              Everything you need to know about our note trading platform
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 last:border-0">
                <AccordionTrigger className="text-left font-serif font-medium text-lg text-black hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-black">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-black">
            Don't see what you're looking for? <a href="#" className="text-primary font-medium">Contact us</a> for more information.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;