import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  DollarSign, 
  Home, 
  Clock, 
  PieChart, 
  UploadCloud, 
  Calendar, 
  Check, 
  X,
  ArrowRight,
  PlusCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

// Property type options
const propertyTypes = [
  "Single Family",
  "Multi-Family",
  "Condo",
  "Townhouse",
  "Commercial",
  "Land",
  "Other"
];

// Form schema that extends the note listing schema
const noteListingFormSchema = z.object({
  sellerId: z.number().default(1), // Default to sample user for now
  loanAmount: z.number().min(1000, "Loan amount must be at least $1,000"),
  interestRate: z.number().min(0.1, "Interest rate must be greater than 0.1%").max(25, "Interest rate must be less than 25%"),
  loanTerm: z.number().min(1, "Loan term must be at least 1 month"),
  paymentAmount: z.number().min(10, "Payment amount must be at least $10"),
  timeHeld: z.number().min(1, "Time held must be at least 1 month"),
  remainingPayments: z.number().min(1, "Remaining payments must be at least 1"),
  propertyAddress: z.string().min(5, "Property address must be at least 5 characters"),
  askingPrice: z.number().min(1000, "Asking price must be at least $1,000"),
  propertyType: z.string().min(1, "Please select a property type"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  status: z.string().default("draft"),
});

type NoteListingFormValues = z.infer<typeof noteListingFormSchema>;

const SellingPage = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "documents" | "preview">("form");
  const [documents, setDocuments] = useState<{ name: string; size: number; type: string }[]>([]);
  
  // Initialize form with default values
  const form = useForm<NoteListingFormValues>({
    resolver: zodResolver(noteListingFormSchema),
    defaultValues: {
      sellerId: 1,
      loanAmount: 100000,
      interestRate: 6.5,
      loanTerm: 360,
      paymentAmount: 632.07,
      timeHeld: 24,
      remainingPayments: 336,
      propertyAddress: "",
      askingPrice: 75000,
      propertyType: "Single Family",
      description: "",
      status: "draft",
    },
  });
  
  const { mutate: createNoteListing, isPending } = useMutation({
    mutationFn: async (values: NoteListingFormValues) => {
      const response = await apiRequest(
        "POST",
        "/api/note-listings",
        values
      );
      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      toast({
        title: "Note listing created",
        description: "Your note has been listed successfully.",
      });
      // Reset form after successful creation
      form.reset();
      setStep("form");
      setDocuments([]);
    },
    onError: (error) => {
      console.error("Error creating note listing:", error);
      toast({
        title: "Error",
        description: "Failed to create note listing. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: NoteListingFormValues) {
    // Set status to "active" when actually submitting
    createNoteListing({
      ...values,
      status: "active"
    });
  }
  
  // Function to handle file upload (mock implementation for now)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFile = files[0];
      setDocuments([
        ...documents,
        {
          name: newFile.name,
          size: newFile.size,
          type: newFile.type.includes("pdf") ? "Loan Agreement" : "Property Appraisal"
        }
      ]);
      
      toast({
        title: "File uploaded",
        description: `${newFile.name} has been uploaded successfully.`,
      });
      
      // Reset file input
      event.target.value = "";
    }
  };
  
  const calculateMonthlyPayment = (loanAmount: number, interestRate: number, loanTerm: number) => {
    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    // Calculate monthly payment using the formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const payment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
    return payment;
  };
  
  // Calculate ROI
  const calculateROI = (form: any) => {
    const values = form.getValues();
    const { askingPrice, paymentAmount, remainingPayments } = values;
    
    if (!askingPrice || !paymentAmount || !remainingPayments) return 0;
    
    const totalPayments = paymentAmount * remainingPayments;
    const profit = totalPayments - askingPrice;
    const roi = (profit / askingPrice) * 100;
    
    return roi;
  };
  
  // Watch form values for real-time preview
  const watchAll = form.watch();
  
  // When loan amount, interest rate, or term changes, recalculate payment amount
  const updatePaymentAmount = () => {
    const loanAmount = form.getValues("loanAmount");
    const interestRate = form.getValues("interestRate");
    const loanTerm = form.getValues("loanTerm");
    
    if (loanAmount && interestRate && loanTerm) {
      const payment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
      form.setValue("paymentAmount", parseFloat(payment.toFixed(2)));
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Sell Your Mortgage Note</h1>
              <p className="text-lg text-gray-400 mt-2">Create a listing and get top dollar for your note</p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <Link href="/marketplace">View Marketplace</Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left column - Selling form */}
            <div className="lg:col-span-2 space-y-8">
              {step === "form" && (
                <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      Note Details
                    </CardTitle>
                    <CardDescription>
                      Enter the details of your mortgage note
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="loanAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1 text-primary" />
                                  Loan Amount
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="100000"
                                    className="bg-gray-950 border-gray-800"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value));
                                      setTimeout(updatePaymentAmount, 100);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Original loan amount in dollars
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="interestRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <PieChart className="h-4 w-4 mr-1 text-primary" />
                                  Interest Rate (%)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.125"
                                    placeholder="6.5"
                                    className="bg-gray-950 border-gray-800"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value));
                                      setTimeout(updatePaymentAmount, 100);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Annual interest rate (e.g., 6.5 for 6.5%)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="loanTerm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                                  Loan Term (months)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="360"
                                    className="bg-gray-950 border-gray-800"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(parseFloat(e.target.value));
                                      setTimeout(updatePaymentAmount, 100);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Original term of the loan in months (e.g., 360 for 30 years)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="paymentAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1 text-primary" />
                                  Monthly Payment
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="632.07"
                                    className="bg-gray-950 border-gray-800"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Monthly payment amount
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="timeHeld"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-primary" />
                                  Time Held (months)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="24"
                                    className="bg-gray-950 border-gray-800"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  How long you've held the note in months
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="remainingPayments"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                                  Remaining Payments
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="336"
                                    className="bg-gray-950 border-gray-800"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Number of payments remaining on the note
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="propertyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <Home className="h-4 w-4 mr-1 text-primary" />
                                  Property Type
                                </FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-950 border-gray-800">
                                      <SelectValue placeholder="Select property type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {propertyTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Type of property securing the note
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="askingPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1 text-primary" />
                                  Asking Price
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="75000"
                                    className="bg-gray-950 border-gray-800"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Your desired selling price
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="propertyAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Home className="h-4 w-4 mr-1 text-primary" />
                                Property Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123 Main St, Anytown, ST 12345"
                                  className="bg-gray-950 border-gray-800"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Full address of the property
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <FileText className="h-4 w-4 mr-1 text-primary" />
                                Description
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide details about the note, payment history, and property..."
                                  className="min-h-32 bg-gray-950 border-gray-800"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Detailed description to attract potential buyers
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href="/marketplace">Cancel</Link>
                    </Button>
                    <Button 
                      onClick={() => setStep("documents")}
                      disabled={!form.formState.isValid}
                    >
                      Next: Add Documents <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {step === "documents" && (
                <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                      <UploadCloud className="mr-2 h-5 w-5 text-primary" />
                      Upload Documents
                    </CardTitle>
                    <CardDescription>
                      Add supporting documents for your note listing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-10 text-center">
                        <UploadCloud className="h-10 w-10 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Drag and drop your files here</h3>
                        <p className="text-sm text-gray-400 mb-4">Supported formats: PDF, JPG, PNG (max 10MB)</p>
                        <Button variant="secondary" className="relative">
                          <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                          />
                          Select Files
                        </Button>
                      </div>
                      
                      {documents.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Uploaded Documents</h3>
                          <div className="space-y-2">
                            {documents.map((doc, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between p-3 bg-gray-950 rounded-md border border-gray-800"
                              >
                                <div className="flex items-center">
                                  <FileText className="h-5 w-5 mr-3 text-primary" />
                                  <div>
                                    <p className="font-medium">{doc.name}</p>
                                    <p className="text-xs text-gray-400">
                                      {doc.type} • {Math.round(doc.size / 1024)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const newDocs = [...documents];
                                    newDocs.splice(index, 1);
                                    setDocuments(newDocs);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-900/50 p-4 rounded-md border border-gray-800">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Required Documents
                        </h3>
                        <ul className="text-sm space-y-2 text-gray-400">
                          <li className="flex items-start">
                            <div className="h-5 w-5 mr-2 flex-shrink-0">
                              {documents.some(d => d.type === "Loan Agreement") ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <PlusCircle className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <span>Mortgage note or loan agreement</span>
                          </li>
                          <li className="flex items-start">
                            <div className="h-5 w-5 mr-2 flex-shrink-0">
                              {documents.some(d => d.type === "Property Appraisal") ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <PlusCircle className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <span>Property appraisal or valuation</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setStep("form")}
                    >
                      Back to Details
                    </Button>
                    <Button 
                      onClick={() => setStep("preview")}
                    >
                      Preview Listing <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {step === "preview" && (
                <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      Preview Listing
                    </CardTitle>
                    <CardDescription>
                      Review your note listing before publishing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b border-gray-800 pb-2">Note Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm text-gray-400">Property Type</h4>
                            <p className="font-medium">{watchAll.propertyType}</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Property Address</h4>
                            <p className="font-medium">{watchAll.propertyAddress}</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Loan Amount</h4>
                            <p className="font-medium">{formatCurrency(watchAll.loanAmount)}</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Interest Rate</h4>
                            <p className="font-medium">{watchAll.interestRate}%</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Loan Term</h4>
                            <p className="font-medium">{watchAll.loanTerm} months</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Monthly Payment</h4>
                            <p className="font-medium">{formatCurrency(watchAll.paymentAmount)}</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Time Held</h4>
                            <p className="font-medium">{watchAll.timeHeld} months</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Remaining Payments</h4>
                            <p className="font-medium">{watchAll.remainingPayments}</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Asking Price</h4>
                            <p className="font-medium text-primary">{formatCurrency(watchAll.askingPrice)}</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-gray-400">Potential ROI</h4>
                            <p className="font-medium text-green-500">{calculateROI(form).toFixed(2)}%</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-400">Description</h4>
                          <p className="whitespace-pre-wrap">{watchAll.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b border-gray-800 pb-2">Documents</h3>
                        
                        {documents.length > 0 ? (
                          <div className="space-y-2">
                            {documents.map((doc, index) => (
                              <div 
                                key={index} 
                                className="flex items-center p-3 bg-gray-950 rounded-md border border-gray-800"
                              >
                                <FileText className="h-5 w-5 mr-3 text-primary" />
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {doc.type} • {Math.round(doc.size / 1024)} KB
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setStep("documents")}
                    >
                      Back to Documents
                    </Button>
                    <Button 
                      onClick={() => onSubmit(form.getValues())}
                      disabled={isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isPending ? "Submitting..." : "Publish Listing"}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            {/* Right column - Live Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white">
                  <div className="absolute top-4 right-4 px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded">
                    Preview
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{watchAll.propertyType} Note</CardTitle>
                    <CardDescription className="truncate">
                      {watchAll.propertyAddress || "Property address will appear here"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Loan Amount</p>
                        <p className="font-medium">{formatCurrency(watchAll.loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Interest Rate</p>
                        <p className="font-medium">{watchAll.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Monthly Payment</p>
                        <p className="font-medium">{formatCurrency(watchAll.paymentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Remaining Payments</p>
                        <p className="font-medium">{watchAll.remainingPayments}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900/60 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-400">Asking Price</p>
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(watchAll.askingPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Potential ROI</p>
                          <p className="text-lg font-medium text-green-500">
                            {calculateROI(form).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {documents.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Documents</p>
                        <div className="flex space-x-2">
                          {documents.map((doc, index) => (
                            <div 
                              key={index}
                              className="px-2 py-1 bg-gray-900 rounded text-xs flex items-center"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              <span>{doc.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="mt-6 p-4 border border-gray-800 rounded-lg bg-black/50 backdrop-blur-sm">
                  <h3 className="text-sm font-medium mb-2">Seller Tips</h3>
                  <ul className="text-xs text-gray-400 space-y-2">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-1 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Provide a complete payment history to increase buyer confidence</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-1 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Upload property photos to showcase the underlying asset</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-1 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Be transparent about any payment issues or property condition concerns</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellingPage;