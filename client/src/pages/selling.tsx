import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  PlusCircle,
  Plus,
  ChevronRight,
  Eye,
  Edit2,
  Upload,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// Property type options
const propertyTypes = [
  "Single Family",
  "Multi Family",
  "Commercial",
  "Land",
  "Mixed Use",
  "Other",
];

const noteTypes = [
  "First Lien",
  "Second Lien",
  "Private Note",
  "Contract for Deed",
  "Other",
];

const performanceStatuses = [
  "Performing",
  "Non-Performing",
  "Sub-Performing",
  "REO",
  "Other",
];

const states = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

// Form schema for the note listing
const noteListingFormSchema = z.object({
  sellerId: z.number(),
  title: z.string().min(1, "Title is required"),
  noteType: z.string().min(1, "Note type is required"),
  performanceStatus: z.string().min(1, "Performance status is required"),
  originalLoanAmount: z
    .number()
    .min(1000, "Original loan amount must be at least $1,000"),
  currentLoanAmount: z.number().min(1, "Current loan amount is required"),
  interestRate: z.number().min(0.1, "Interest rate must be greater than 0"),
  originalLoanTerm: z
    .number()
    .int("Loan term must be a whole number")
    .min(1, "Original loan term must be at least 1 month"),
  remainingLoanTerm: z
    .number()
    .int("Remaining term must be a whole number")
    .min(1, "Remaining loan term must be at least 1 month"),
  monthlyPaymentAmount: z
    .number()
    .min(10, "Monthly payment must be at least $10"),
  propertyState: z.string().min(1, "Property state is required"),
  propertyAddress: z
    .string()
    .min(5, "Property address must be at least 5 characters"),
  propertyType: z.string().min(1, "Please select a property type"),
  askingPrice: z.number().min(1000, "Asking price must be at least $1,000"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  status: z.string().default("draft"),
});

type NoteListingFormValues = z.infer<typeof noteListingFormSchema>;

// Interface for user listings
interface NoteListing {
  id: number;
  sellerId: number;
  propertyAddress: string;
  propertyType: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  paymentAmount: number;
  timeHeld: number;
  remainingPayments: number;
  askingPrice: number;
  description: string;
  status: string;
  createdAt: Date;
}

// NoteCard component for the listings grid
const NoteCard = ({
  listing,
  isCondensed = false,
}: {
  listing: NoteListing;
  isCondensed?: boolean;
}) => {
  const isActive = listing.status === "active";
  const isSold = listing.status === "sold";

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${isCondensed ? "aspect-[1.618/1]" : ""}`}
      style={isCondensed && !isActive ? { opacity: 0.6 } : {}}
    >
      <Card
        className={`h-full border border-gray-800 hover:border-white transition-all duration-300 overflow-hidden backdrop-blur-md ${isCondensed ? "bg-black/40" : "bg-black/60"}`}
      >
        {isCondensed && (
          <div className="absolute top-2 right-2">
            <Badge className={isActive ? "bg-green-600" : "bg-gray-600"}>
              {isActive ? "Live" : isSold ? "Sold" : "Draft"}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle
            className={`${isCondensed ? "text-base" : "text-xl"} truncate`}
          >
            {listing.propertyType} Note
          </CardTitle>
          <p
            className={`text-gray-400 ${isCondensed ? "text-xs" : "text-sm"} truncate`}
          >
            {listing.propertyAddress}
          </p>
        </CardHeader>

        <CardContent className={`space-y-3 ${isCondensed ? "p-3" : "p-6"}`}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p
                className={`text-gray-400 ${isCondensed ? "text-[10px]" : "text-xs"}`}
              >
                Value
              </p>
              <p
                className={isCondensed ? "text-sm font-medium" : "font-medium"}
              >
                {formatCurrency(listing.loanAmount)}
              </p>
            </div>
            <div>
              <p
                className={`text-gray-400 ${isCondensed ? "text-[10px]" : "text-xs"}`}
              >
                Rate
              </p>
              <p
                className={isCondensed ? "text-sm font-medium" : "font-medium"}
              >
                {listing.interestRate}%
              </p>
            </div>
            {!isCondensed && (
              <>
                <div>
                  <p className="text-xs text-gray-400">Monthly Payment</p>
                  <p className="font-medium">
                    {formatCurrency(listing.paymentAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Remaining Term</p>
                  <p className="font-medium">
                    {listing.remainingPayments} months
                  </p>
                </div>
              </>
            )}
          </div>

          {!isCondensed && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400">Asking Price</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(listing.askingPrice)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-none"
                >
                  View Details
                </Button>
              </div>
            </div>
          )}

          {isCondensed && (
            <>
              <div className="bg-black/30 p-2 rounded">
                <p className="text-xs text-gray-400">Asking Price</p>
                <p className="text-base font-bold text-primary">
                  {formatCurrency(listing.askingPrice)}
                </p>
              </div>
              <p className="text-xs text-gray-400 line-clamp-1">
                {listing.description.length > 50
                  ? listing.description.substring(0, 50) + "..."
                  : listing.description}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SellingPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listings");
  const [documents, setDocuments] = useState<
    { name: string; size: number; type: string }[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  // Initialize contact info with user data
  const [contactInfo, setContactInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [editingContact, setEditingContact] = useState(false);
  const [selectedListing, setSelectedListing] = useState<NoteListing | null>(
    null,
  );

  // Update contact info when user data changes
  useEffect(() => {
    if (user) {
      setContactInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Function to handle file upload from various places
  const handleFileInputChange = (e: any) => {
    if (e.target && e.target.files) {
      handleFileUpload(e as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Initialize form with default values
  const form = useForm<z.infer<typeof noteListingFormSchema>>({
    resolver: zodResolver(noteListingFormSchema),
    defaultValues: {
      sellerId: user?.id || 0,
      title: "",
      noteType: "",
      performanceStatus: "",
      originalLoanAmount: 100000,
      currentLoanAmount: 100000,
      interestRate: 6.5,
      originalLoanTerm: 360,
      remainingLoanTerm: 336,
      monthlyPaymentAmount: 632.07,
      propertyState: "",
      propertyAddress: "",
      propertyType: "Single Family",
      askingPrice: 75000,
      description: "",
      status: "draft",
    },
  });

  const { mutate: createNoteListing, isPending } = useMutation({
    mutationFn: async (values: NoteListingFormValues) => {
      const response = await apiRequest("POST", "/api/note-listings", values);
      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      toast({
        title: "Note listing created",
        description: "Your note has been listed successfully.",
      });
      form.reset();
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
      status: "active",
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
          type: newFile.type.includes("pdf")
            ? "Loan Agreement"
            : "Property Appraisal",
        },
      ]);

      toast({
        title: "File uploaded",
        description: `${newFile.name} has been uploaded successfully.`,
      });

      // Reset file input
      event.target.value = "";
    }
  };

  const calculateMonthlyPayment = (
    loanAmount: number,
    interestRate: number,
    loanTerm: number,
  ) => {
    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    // Calculate monthly payment using the formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const payment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1);
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
    const loanAmount = form.getValues("originalLoanAmount");
    const interestRate = form.getValues("interestRate");
    const loanTerm = form.getValues("originalLoanTerm");

    if (loanAmount && interestRate && loanTerm) {
      const payment = calculateMonthlyPayment(
        loanAmount,
        interestRate,
        loanTerm,
      );
      form.setValue("monthlyPaymentAmount", parseFloat(payment.toFixed(2)));
    }
  };

  // Fetch user's listings
  const { data: listingsData, isLoading: isListingsLoading } = useQuery({
    queryKey: [`/api/note-listings/seller/${user?.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/note-listings/seller/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Separate listings by status
  const activeListings =
    listingsData?.data?.filter(
      (listing: NoteListing) => listing.status === "active",
    ) || [];
  const draftListings =
    listingsData?.data?.filter(
      (listing: NoteListing) => listing.status === "draft",
    ) || [];
  const soldListings =
    listingsData?.data?.filter(
      (listing: NoteListing) => listing.status === "sold",
    ) || [];

  // Custom input style with animated caret
  const customInputClass = `
    w-full 
    bg-transparent 
    border-none 
    focus:ring-0 
    focus:outline-none 
    py-3 
    text-lg 
    placeholder-gray-500
    caret-pink-500
    animate-caret
  `;

  // Add the caret animation to the CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes caretBlink {
        0%, 70% { opacity: 1; }
        71%, 100% { opacity: 0; }
      }
      .animate-caret::after {
        content: '';
        position: absolute;
        right: -2px;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 24px;
        background: linear-gradient(to bottom, #a855f7, #ec4899);
        animation: caretBlink 1s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // When clicking Review button
  const handleReviewClick = () => {
    if (user) {
      setContactInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Listing Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl bg-white text-gray-800 p-0 overflow-auto max-h-[90vh]">
          <DialogHeader className="bg-purple-600 text-white p-6">
            <DialogTitle className="text-2xl font-bold">
              Listing Preview
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-1 text-gray-900">
                  Property Details
                </h3>
                <div className="space-y-3 mt-3">
                  <div>
                    <p className="text-sm text-gray-500">Property Address</p>
                    <p className="font-medium">
                      {form.getValues("propertyAddress")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Property Type</p>
                    <p className="font-medium">
                      {form.getValues("propertyType")}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-1 text-gray-900">
                  Loan Details
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-3">
                  <div>
                    <p className="text-sm text-gray-500">Loan Amount</p>
                    <p className="font-medium">
                      {formatCurrency(form.getValues("originalLoanAmount"))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Interest Rate</p>
                    <p className="font-medium">
                      {form.getValues("interestRate")}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loan Term</p>
                    <p className="font-medium">
                      {form.getValues("originalLoanTerm")} months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Payment</p>
                    <p className="font-medium">
                      {formatCurrency(form.getValues("monthlyPaymentAmount"))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time Held</p>
                    <p className="font-medium">
                      {form.getValues("originalLoanTerm") -
                        form.getValues("remainingLoanTerm")}{" "}
                      months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining Payments</p>
                    <p className="font-medium">
                      {form.getValues("remainingLoanTerm")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-1 text-gray-900">
                  Listing Details
                </h3>
                <div className="space-y-3 mt-3">
                  <div>
                    <p className="text-sm text-gray-500">Asking Price</p>
                    <p className="text-xl font-bold text-purple-700">
                      {formatCurrency(form.getValues("askingPrice"))}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm mt-1">
                      {form.getValues("description")}
                    </p>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-gray-500">Potential ROI</p>
                    <p className="font-medium text-green-600">
                      {calculateROI(form).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Contact Information
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                      onClick={() => setEditingContact(!editingContact)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  {editingContact ? (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-sm text-gray-500">
                          First Name
                        </label>
                        <Input
                          value={contactInfo.firstName}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              firstName: e.target.value,
                            })
                          }
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Last Name
                        </label>
                        <Input
                          value={contactInfo.lastName}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              lastName: e.target.value,
                            })
                          }
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <Input
                          value={contactInfo.email}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              email: e.target.value,
                            })
                          }
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <Input
                          value={contactInfo.phone}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              phone: e.target.value,
                            })
                          }
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <Button
                        className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setEditingContact(false)}
                      >
                        Save Contact Info
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 w-20">
                          First Name:
                        </p>
                        <p className="font-medium">{contactInfo.firstName}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 w-20">Last Name:</p>
                        <p className="font-medium">{contactInfo.lastName}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 w-20">Email:</p>
                        <p className="font-medium">{contactInfo.email}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 w-20">Phone:</p>
                        <p className="font-medium">{contactInfo.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Documents
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({documents.length} uploaded)
                </span>
              </h3>

              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-purple-500" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.type} • {Math.round(doc.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50"
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
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <UploadCloud className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No documents uploaded</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-purple-500 text-purple-700 hover:bg-purple-50"
                    onClick={() => {
                      const fileInput = document.createElement("input");
                      fileInput.type = "file";
                      fileInput.accept = ".pdf,.jpg,.jpeg,.png";
                      fileInput.multiple = true;
                      fileInput.onchange = handleFileInputChange;
                      fileInput.click();
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-gray-200">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setShowPreview(false)}
            >
              Close
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                setShowPreview(false);
                onSubmit(form.getValues());
              }}
            >
              Confirm & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-16">
        <div className="space-y-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-purple-700">
              Sell Your Mortgage Note
            </h1>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
              Complete the form below to create your listing and get top dollar
              for your note
            </p>
          </div>

          {/* Centered form with horizontal fields */}
          <div className="max-w-4xl mx-auto">
            <Card className="border border-gray-200 bg-white shadow-md">
              <CardHeader className="text-center border-b border-gray-200 pb-6">
                <CardTitle className="text-2xl font-bold text-purple-700">
                  Note Details
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter listing title"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="noteType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Note Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select note type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {noteTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="performanceStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Performance Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select performance status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {performanceStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Loan Details */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="originalLoanAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Original Loan Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter original loan amount"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentLoanAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Loan Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter current loan amount"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="originalLoanTerm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Original Term (months)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="remainingLoanTerm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Remaining Term (months)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="interestRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interest Rate (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Enter interest rate"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Property Information */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="propertyState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property State</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {states.map((state) => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="propertyAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter property address"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="propertyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Financial Details */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="monthlyPaymentAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Payment Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter monthly payment"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="askingPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asking Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter asking price"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter note description"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="mt-8 border rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Supporting Documents
                          </h3>
                          <p className="text-sm text-gray-500">
                            Upload relevant documents such as loan agreements,
                            appraisals, etc.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const fileInput = document.createElement("input");
                            fileInput.type = "file";
                            fileInput.accept = ".pdf,.jpg,.jpeg,.png";
                            fileInput.multiple = true;
                            fileInput.onchange = handleFileInputChange;
                            fileInput.click();
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Files
                        </Button>
                      </div>

                      {documents.length > 0 ? (
                        <div className="space-y-3">
                          {documents.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                            >
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 mr-3 text-purple-500" />
                                <div>
                                  <p className="font-medium text-sm">
                                    {doc.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.type} • {Math.round(doc.size / 1024)}{" "}
                                    KB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-500 hover:bg-red-50"
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
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                          <UploadCloud className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600">
                            No documents uploaded yet
                          </p>
                          <p className="text-sm text-gray-500">
                            Supported formats: PDF, JPG, PNG
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        onClick={() => {
                          // Set status to active when publishing
                          form.setValue("status", "active");
                        }}
                      >
                        Publish Listing
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="border-t border-gray-200 pt-6">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      className="bg-transparent border-purple-500 text-purple-700 hover:bg-purple-50"
                      onClick={() => {
                        // Handle document upload functionality
                        const fileInput = document.createElement("input");
                        fileInput.type = "file";
                        fileInput.accept = ".pdf,.jpg,.jpeg,.png";
                        fileInput.multiple = true;
                        fileInput.onchange = handleFileInputChange;
                        fileInput.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Documents
                    </Button>
                  </div>

                  <Button
                    onClick={handleReviewClick}
                    disabled={!form.formState.isValid}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isPending ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Review <Eye className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Active listings section */}
          <div className="py-10 border-t border-purple-500/20">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Note Listings
            </h2>

            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="grid grid-cols-3 max-w-md mb-8">
                <TabsTrigger
                  value="listings"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  Your Listings
                </TabsTrigger>
                <TabsTrigger
                  value="market"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  Market
                </TabsTrigger>
                <TabsTrigger
                  value="sold"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  Sold
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-0">
                {isListingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...activeListings, ...draftListings].map((listing) => (
                      <NoteCard
                        key={listing.id}
                        listing={listing}
                        isCondensed={true}
                      />
                    ))}

                    <div className="aspect-[1.618/1] flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-full w-full border-dashed border-purple-500/30 bg-black/40 backdrop-blur-sm hover:bg-purple-500/10 hover:border-purple-500/50 flex flex-col items-center justify-center space-y-2"
                        onClick={() => {
                          form.reset();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Plus className="h-6 w-6 text-purple-400" />
                        <span>Add New Listing</span>
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="market" className="mt-0">
                <div className="text-center py-6">
                  <p className="text-gray-400">
                    Explore the marketplace to see what other notes are
                    available
                  </p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-none"
                    asChild
                  >
                    <Link href="/marketplace">
                      Browse Marketplace{" "}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="sold" className="mt-0">
                {isListingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {soldListings.map((listing: NoteListing) => (
                      <NoteCard
                        key={listing.id}
                        listing={listing}
                        isCondensed={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellingPage;
