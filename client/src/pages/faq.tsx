import { useState } from "react";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search, HelpCircle, FileText, ArrowLeft } from "lucide-react";

const faqData = [
  {
    category: "Buying Notes",
    items: [
      {
        question: "What is a mortgage note?",
        answer: "A mortgage note is a legal document that obligates a borrower to repay a loan at a stated interest rate during a specified period of time. It creates a security interest in the property and represents the debt instrument for the loan."
      },
      {
        question: "How do I evaluate a note before buying?",
        answer: "When evaluating a note, you should consider several factors: payment history, borrower's credit, property value, remaining term, interest rate, and yield. Our platform provides key metrics and documentation to help you make informed decisions."
      },
      {
        question: "What documents should I review before purchasing?",
        answer: "You should review the original note, mortgage or deed of trust, payment history, title report, property appraisal, and borrower's credit report when available. Our sellers are encouraged to provide comprehensive documentation."
      },
      {
        question: "What is the process for buying a note on NoteTrade?",
        answer: "After finding a note you're interested in, you can express interest through our platform. You'll have access to review documents, perform due diligence, and if satisfied, make an offer. Once accepted, you'll complete the purchase through our secure transaction process."
      },
      {
        question: "How is ROI calculated for note investments?",
        answer: "Return on Investment (ROI) for notes is calculated by dividing the total expected payments (monthly payment × remaining payments) minus the purchase price, by the purchase price, expressed as a percentage. This gives you the potential return on your investment."
      }
    ]
  },
  {
    category: "Selling Notes",
    items: [
      {
        question: "How do I list my note for sale?",
        answer: "To list your note, create a seller account, navigate to the Selling page, and complete the note listing form with all required details. You'll need to upload supporting documents and set your asking price. Once submitted, your listing will be reviewed before appearing in the marketplace."
      },
      {
        question: "What documents do I need to provide when selling a note?",
        answer: "You should provide the original note, mortgage or deed of trust, payment history, property information, and any relevant appraisals or title reports. Comprehensive documentation increases buyer confidence and can lead to faster sales."
      },
      {
        question: "How should I price my note?",
        answer: "Note pricing typically reflects a discount to the remaining balance based on various risk factors. Consider the payment history, property value, interest rate, remaining term, and borrower creditworthiness. Our platform provides guidance on competitive pricing based on market trends."
      },
      {
        question: "What fees are associated with selling a note?",
        answer: "NoteTrade charges a small commission on successful sales. There are no upfront listing fees or hidden charges. The commission structure is transparent and only applies when you successfully sell your note."
      },
      {
        question: "How long does it typically take to sell a note?",
        answer: "The timeline varies based on note quality, documentation, and pricing. Well-documented notes with strong payment histories and competitive pricing typically sell faster. Most notes with complete documentation sell within 30-60 days."
      }
    ]
  },
  {
    category: "Platform & Security",
    items: [
      {
        question: "How does NoteTrade ensure security?",
        answer: "NoteTrade employs bank-level encryption for all transactions and data storage. We use secure document storage, identity verification for all users, and follow industry best practices for financial transactions."
      },
      {
        question: "How do I get started with NoteTrade?",
        answer: "You can join our waitlist to get early access to the platform. Once invited, you'll create an account, verify your identity, and then you can start browsing notes or listing your own for sale."
      },
      {
        question: "What information is shared between buyers and sellers?",
        answer: "We protect both parties' privacy while providing necessary information for transactions. Buyer and seller contact information is kept confidential until needed for closing. Note details and documentation are shared under confidentiality agreements."
      },
      {
        question: "Are there educational resources available?",
        answer: "Yes, NoteTrade offers comprehensive learning resources, including guides on note investing, risk assessment, due diligence checklists, and market trends. These resources are available to help both new and experienced investors navigate the note market."
      },
      {
        question: "How does NoteTrade verify listings?",
        answer: "We implement a verification process for all listings, requiring sellers to provide documentation proving ownership and note details. We also use automated systems to check for inconsistencies and manual reviews for quality assurance."
      }
    ]
  }
];

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Filter FAQ items based on search query
  const filteredFaqs = searchQuery 
    ? faqData.flatMap(category => ({
        category: category.category,
        items: category.items.filter(item => 
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    : faqData;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Home
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold flex items-center">
                <HelpCircle className="mr-2 h-6 w-6 text-primary" />
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-gray-400 mt-2">
                Find answers to common questions about buying and selling mortgage notes
              </p>
            </div>
            
            <Button 
              className="bg-primary hover:bg-primary/90" 
              asChild
            >
              <Link href="/marketplace">
                Browse Marketplace <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              className="pl-10 bg-black/50 border-gray-800 py-6"
              placeholder="Search for a question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-4 lg:col-span-1">
              <h2 className="text-lg font-medium">Categories</h2>
              <div className="space-y-2">
                {faqData.map((category) => (
                  <button
                    key={category.category}
                    className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${
                      activeCategory === category.category 
                        ? "border-primary bg-black/60" 
                        : "border-gray-800 bg-black/30 hover:border-gray-600"
                    }`}
                    onClick={() => setActiveCategory(activeCategory === category.category ? null : category.category)}
                  >
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      {category.category}
                    </span>
                  </button>
                ))}
              </div>
              
              <Card className="border-gray-800 bg-black/40 backdrop-blur-sm mt-8">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Need more help?</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Can't find what you're looking for? Contact our support team.
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-3 space-y-8">
              {filteredFaqs.length > 0 ? (
                filteredFaqs
                  .filter(category => !activeCategory || category.category === activeCategory)
                  .map((category) => (
                    <div key={category.category} className="space-y-4">
                      <h2 className="text-xl font-bold flex items-center">
                        <span className="text-primary mr-2">•</span> {category.category}
                      </h2>
                      
                      <Accordion type="single" collapsible className="space-y-4">
                        {category.items.map((item, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`${category.category}-${index}`}
                            className="border border-gray-800 rounded-md overflow-hidden bg-black/40 backdrop-blur-sm"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:bg-gray-900/50 transition-colors">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3 pt-1 text-gray-300">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-gray-400">
                    We couldn't find any FAQ entries matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-16 p-6 rounded-lg border border-gray-800 bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                <p className="text-gray-400">
                  Join our growing community of note investors and get your questions answered.
                </p>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90"
                asChild
              >
                <Link href="/#cta">
                  Join Waitlist <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;