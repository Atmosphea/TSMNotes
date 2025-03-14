import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, DollarSign, Home, BarChart, PieChart } from "lucide-react";

const TerminologySection = () => {
  const [activeTab, setActiveTab] = useState("terms");

  const keyTerms = [
    {
      term: "Loan-to-Value (LTV)",
      description: "This ratio compares the loan amount to the value of the property. A lower LTV indicates the borrower has more equity, reducing the risk for the investor.",
      icon: <BarChart className="h-5 w-5" />
    },
    {
      term: "Non-Performing Note (NPN)",
      description: "A note where the borrower has stopped making payments.",
      icon: <FileText className="h-5 w-5" />
    },
    {
      term: "Performing Note",
      description: "A loan in which the borrower is making regular payments.",
      icon: <FileText className="h-5 w-5" />
    },
    {
      term: "Collateral",
      description: "The property or asset securing the loan. In case of default, the investor may seize the collateral.",
      icon: <Home className="h-5 w-5" />
    },
    {
      term: "Foreclosure",
      description: "The legal process of taking possession of the property when a borrower defaults.",
      icon: <Home className="h-5 w-5" />
    },
    {
      term: "Loan Servicer",
      description: "A third-party company that manages the administrative tasks of loan collection and borrower communication.",
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      term: "Seasoned Note",
      description: "A loan with a proven payment history, which lowers its risk and increases its marketability.",
      icon: <FileText className="h-5 w-5" />
    },
    {
      term: "Discounted Note",
      description: "A loan sold at a price below its face value, providing an opportunity for investors to buy debt at a reduced cost.",
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      term: "Hard Money Loan",
      description: "A short-term loan secured by real estate, typically used by real estate investors seeking quick financing.",
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      term: "Loan Sale Agreement",
      description: "A formal contract detailing the terms of a note purchase.",
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const evaluationSteps = [
    {
      title: "Analyze the Borrower",
      items: [
        "Review the borrower's credit score and payment history.",
        "Assess the borrower's income stability and debt-to-income ratio (the percentage of their income that goes toward debt payments)."
      ]
    },
    {
      title: "Assess the Property",
      items: [
        "Investigate the location and market trends in the area.",
        "Check the condition of the property and its marketability.",
        "Compare it to similar properties in the area to gauge its true value."
      ]
    },
    {
      title: "Review Loan Terms",
      items: [
        "Look at the interest rate, payment schedule, and any balloon payments or prepayment penalties.",
        "Understand the loan length (whether it's short-term or long-term) and its impact on cash flow."
      ]
    }
  ];

  const profitStrategies = [
    {
      title: "Holding for Monthly Income",
      description: "If the borrower continues to pay on time, you earn steady monthly income, similar to a landlord collecting rent, but without the responsibilities of property management."
    },
    {
      title: "Selling the Note",
      description: "As the note shows consistent payment behavior, it becomes a seasoned note. This makes it more attractive to investors, and you can sell it for a profit."
    },
    {
      title: "Loan Modification",
      description: "If the borrower struggles with payments, you can negotiate new terms to make the loan more manageable. This approach can help reduce the risk of default while maintaining the value of your investment."
    },
    {
      title: "Foreclosure & Property Acquisition",
      description: "If the borrower defaults, you may have the option to acquire the property through foreclosure. If the property's value exceeds the amount you paid for the note, this can result in significant profits."
    }
  ];

  return (
    <section id="terminology" className="py-20 gradient-bg-light">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mb-12">
          <h2 className="section-title text-4xl mb-4">Key <span className="text-gradient">Knowledge</span></h2>
          <p className="section-description text-gray-300">
            Understanding the terminology and processes in note investing is crucial for making informed decisions. Explore our comprehensive guide to navigate this specialized market with confidence.
          </p>
        </div>

        <Tabs 
          defaultValue="terms" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="glass-card bg-gray-800/40">
              <TabsTrigger value="terms" className="data-[state=active]:bg-primary/20">
                <BookOpen className="h-4 w-4 mr-2" />
                Terminology
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="data-[state=active]:bg-primary/20">
                <BarChart className="h-4 w-4 mr-2" />
                Evaluation
              </TabsTrigger>
              <TabsTrigger value="strategies" className="data-[state=active]:bg-primary/20">
                <PieChart className="h-4 w-4 mr-2" />
                Profit Strategies
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="terms" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keyTerms.map((item, index) => (
                <div key={index} className="terminology-card">
                  <div className="flex items-center mb-3">
                    <div className="feature-icon-container w-10 h-10 mr-3">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-lg text-gray-100">{item.term}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="evaluation" className="mt-0">
            <div className="glass-card p-8">
              <h3 className="font-bold text-2xl mb-6 text-gray-100">Evaluating an Unseasoned Note</h3>
              
              <div className="space-y-8">
                {evaluationSteps.map((step, index) => (
                  <div key={index} className="glass-card p-6">
                    <h4 className="font-bold text-xl mb-4 text-primary">{index + 1}. {step.title}</h4>
                    <ul className="space-y-3">
                      {step.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="text-primary mr-3 mt-1">•</div>
                          <p className="text-gray-300">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="mt-0">
            <div className="glass-card p-8">
              <h3 className="font-bold text-2xl mb-6 text-gray-100">Making Money with Unseasoned Notes</h3>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                {profitStrategies.map((strategy, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`strategy-${index}`} 
                    className="glass-card border-0"
                  >
                    <AccordionTrigger className="px-6 py-4 text-gray-100 hover:text-primary hover:no-underline">
                      <span className="font-bold">{index + 1}. {strategy.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-300">
                      {strategy.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="mt-8 p-6 glass-card">
                <div className="text-center text-gray-100 mb-4">
                  <div className="text-2xl font-bold mb-3">Revenue Potential Visualization</div>
                  <p className="text-sm text-gray-300">Comparative analysis of profit strategies over a 5-year period</p>
                </div>
                
                {/* Simplified graph visualization */}
                <div className="h-64 mt-6 relative flex items-end justify-around px-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-gradient-to-t from-primary/30 to-primary/80 rounded-t-md animate-float" style={{ height: '120px' }}></div>
                    <div className="mt-2 text-xs text-gray-300 text-center">Monthly Income</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-gradient-to-t from-primary/30 to-primary/80 rounded-t-md animate-float" style={{ height: '180px', animationDelay: '0.2s' }}></div>
                    <div className="mt-2 text-xs text-gray-300 text-center">Note Sale</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-gradient-to-t from-primary/30 to-primary/80 rounded-t-md animate-float" style={{ height: '140px', animationDelay: '0.4s' }}></div>
                    <div className="mt-2 text-xs text-gray-300 text-center">Loan Modification</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-gradient-to-t from-primary/30 to-primary/80 rounded-t-md animate-float" style={{ height: '200px', animationDelay: '0.6s' }}></div>
                    <div className="mt-2 text-xs text-gray-300 text-center">Foreclosure</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default TerminologySection;