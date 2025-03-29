import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, DollarSign, Home, BarChart, PieChart, Info } from "lucide-react";

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
              <TabsTrigger value="unseasoned" className="data-[state=active]:bg-primary/20">
                <Info className="h-4 w-4 mr-2" />
                Unseasoned Notes
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
            <div className="grid grid-cols-3 gap-8">
              {keyTerms.map((item, index) => (
                <div key={index} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="text-primary">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-lg text-black">{item.term}</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="unseasoned" className="mt-0">
            <div className="glass-card p-8">
              <h3 className="font-bold text-2xl mb-6 text-gradient">What Are Unseasoned Notes & How Can You Profit?</h3>
              
              <div className="space-y-8">
                <div className="glass-card p-6 hover-glow">
                  <h4 className="category-title mb-4">Understanding Unseasoned Notes</h4>
                  <p className="text-gray-300 leading-relaxed">
                    An unseasoned note is a newly created mortgage loan that hasn't yet built a track record of consistent payments. 
                    When a borrower takes out a loan to buy a home, the lender can sell that loan (or "note") to investors instead of 
                    holding onto it. Since an unseasoned note has little to no payment history, it carries more risk—but that also 
                    means it can be purchased at a discount, creating potential for higher returns.
                  </p>
                </div>
                
                <div className="glass-card p-6 hover-glow">
                  <h4 className="category-title mb-4">How the Process Works</h4>
                  <ul className="space-y-4">
                    <li className="process-step-card" style={{ '--step-index': 0 } as React.CSSProperties}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 shrink-0">1</div>
                      <div>
                        <h5 className="font-bold text-gray-100 mb-1">Banks & Lenders Sell Notes</h5>
                        <p className="text-gray-300 text-sm">
                          Instead of waiting years to collect payments, lenders sell mortgage notes to investors for a lump sum of cash.
                        </p>
                      </div>
                    </li>
                    <li className="process-step-card" style={{ '--step-index': 1 } as React.CSSProperties}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 shrink-0">2</div>
                      <div>
                        <h5 className="font-bold text-gray-100 mb-1">Investors Buy at a Discount</h5>
                        <p className="text-gray-300 text-sm">
                          Because the payment history is unproven, unseasoned notes are often sold below their full value.
                        </p>
                      </div>
                    </li>
                    <li className="process-step-card" style={{ '--step-index': 2 } as React.CSSProperties}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 shrink-0">3</div>
                      <div>
                        <h5 className="font-bold text-gray-100 mb-1">Earning Potential</h5>
                        <p className="text-gray-300 text-sm">
                          If the borrower keeps making payments, the investor collects monthly income. As the note builds a payment history, 
                          its value increases, allowing for resale at a profit.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="glass-card p-6 hover-glow">
                  <div className="flex items-center justify-between">
                    <h4 className="category-title mb-0">Market Dynamics Visualization</h4>
                    <div className="text-gray-200 text-sm">Illustrative model</div>
                  </div>
                  
                  <div className="mt-8 flex justify-center">
                    <div className="w-full max-w-lg h-64 relative">
                      {/* Value vs Time graph visualization */}
                      <div className="absolute inset-0">
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-500/30"></div>
                        <div className="absolute left-0 bottom-0 h-full w-px bg-gray-500/30"></div>
                        
                        {/* X-axis labels */}
                        <div className="absolute bottom-[-20px] left-0 text-xs text-gray-400">0 Months</div>
                        <div className="absolute bottom-[-20px] left-1/4 text-xs text-gray-400">6 Months</div>
                        <div className="absolute bottom-[-20px] left-1/2 text-xs text-gray-400">12 Months</div>
                        <div className="absolute bottom-[-20px] left-3/4 text-xs text-gray-400">18 Months</div>
                        <div className="absolute bottom-[-20px] right-0 text-xs text-gray-400">24 Months</div>
                        
                        {/* Purchase price */}
                        <div className="absolute bottom-[30%] left-0 w-full border-t border-dashed border-red-400/50"></div>
                        <div className="absolute bottom-[30%] left-[-5px] text-xs text-red-400">Purchase Price</div>
                        
                        {/* Face value */}
                        <div className="absolute bottom-[60%] left-0 w-full border-t border-dashed border-green-400/50"></div>
                        <div className="absolute bottom-[60%] left-[-5px] text-xs text-green-400">Face Value</div>
                        
                        {/* Graph line */}
                        <div className="absolute bottom-[20%] left-[5%] w-[90%] h-[60%]">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path 
                              d="M0,80 C10,70 20,55 30,45 C40,35 60,30 70,25 C80,20 90,15 100,10" 
                              fill="none" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth="2"
                              strokeDasharray="220"
                              strokeDashoffset="220"
                              className="animate-draw"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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