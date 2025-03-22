import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { type NoteListing } from "@shared/schema";
import { FilterModal, FilterDrawer, FilterState } from "@/components/marketplace";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Filter,
  Search,
  Building2,
  GalleryHorizontalEnd,
  Calendar,
  DollarSign,
  Percent,
  ArrowUpDown,
  MoreVertical,
  X
} from "lucide-react";

export default function MarketplacePage() {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterPropertyType, setFilterPropertyType] = useState<string | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState | null>(null);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter state variables
  const [noteType, setNoteType] = useState("");
  const [originalAmountMin, setOriginalAmountMin] = useState(0);
  const [originalAmountMax, setOriginalAmountMax] = useState(160000);
  const [currentAmountMin, setCurrentAmountMin] = useState(0);
  const [currentAmountMax, setCurrentAmountMax] = useState(160000);
  const [interestRateMin, setInterestRateMin] = useState(0);
  const [interestRateMax, setInterestRateMax] = useState(16);
  const [maturityDateStart, setMaturityDateStart] = useState("");
  const [maturityDateEnd, setMaturityDateEnd] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(160000);
  const [selectedNoteStatus, setSelectedNoteStatus] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [propertyZipCode, setPropertyZipCode] = useState("");
  const [loanTermYearsMin, setLoanTermYearsMin] = useState(0);
  const [loanTermYearsMax, setLoanTermYearsMax] = useState(16);
  const [loanTermMonths, setLoanTermMonths] = useState(0);
  const [isSecured, setIsSecured] = useState(false);
  const [collateralType, setCollateralType] = useState("");
  const [dateOfNoteStart, setDateOfNoteStart] = useState("");
  const [dateOfNoteEnd, setDateOfNoteEnd] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("");
  const [amortizationType, setAmortizationType] = useState("");
  const [descriptionKeywords, setDescriptionKeywords] = useState("");
  const [propertyCounty, setPropertyCounty] = useState("");
  const [ltvRatioMin, setLtvRatioMin] = useState(0);
  const [ltvRatioMax, setLtvRatioMax] = useState(95);
  
  // Fetch note listings from the API
  const { data, isLoading, error } = useQuery<{ success: boolean; data: NoteListing[] }>({
    queryKey: ["/api/note-listings"],
  });
  
  // Get note listings from the data
  const noteListings = data?.data || [];

  // Properties for filtering
  const propertyTypes = Array.from(new Set(noteListings.map(listing => listing.propertyType)));
  
  // Handle advanced filter application
  const handleApplyFilters = (filters: FilterState) => {
    setAdvancedFilters(filters);
    // Reset to first page when applying new filters
    setPage(1);
  };
  
  // Filter and sort the listings
  const filteredListings = noteListings
    .filter(listing => {
      // Basic property type filter
      if (filterPropertyType && listing.propertyType !== filterPropertyType) {
        return false;
      }
      
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          listing.propertyAddress.toLowerCase().includes(query) ||
          listing.propertyType.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }
      
      // Advanced filters
      if (advancedFilters) {
        // Property type filter from advanced filters
        if (advancedFilters.property_type.length > 0 && 
            !advancedFilters.property_type.includes(listing.propertyType)) {
          return false;
        }
        
        // Note status filter
        if (advancedFilters.note_status.length > 0) {
          const status = listing.status === 'active' ? 'Performing' : 'Non-Performing';
          if (!advancedFilters.note_status.includes(status)) {
            return false;
          }
        }
        
        // Price range filter
        if (advancedFilters.price_min !== '' && listing.askingPrice < advancedFilters.price_min) {
          return false;
        }
        if (advancedFilters.price_max !== '' && listing.askingPrice > advancedFilters.price_max) {
          return false;
        }
        
        // Interest rate filter
        if (advancedFilters.interest_rate_min !== '' && listing.interestRate < advancedFilters.interest_rate_min) {
          return false;
        }
        if (advancedFilters.interest_rate_max !== '' && listing.interestRate > advancedFilters.interest_rate_max) {
          return false;
        }
        
        // Location state filter
        if (advancedFilters.location_state && 
            !listing.propertyAddress.includes(advancedFilters.location_state)) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "priceHigh") {
        return b.askingPrice - a.askingPrice;
      } else if (sortBy === "priceLow") {
        return a.askingPrice - b.askingPrice;
      } else if (sortBy === "yieldHigh") {
        return b.interestRate - a.interestRate;
      } else if (sortBy === "yieldLow") {
        return a.interestRate - b.interestRate;
      }
      return 0;
    });
    
  // Pagination logic
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const displayedListings = filteredListings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 py-12 mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Marketplace</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Page Title */}
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold tracking-tight lg:text-5xl">
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Note Marketplace
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Browse our curated selection of high-quality mortgage notes from vetted sellers.
              Each listing is thoroughly verified for authenticity and performance.
            </p>
          </div>
          
          {/* Search Bar and Sort */}
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-64">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <input
                className="pl-10 w-full h-10 rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search notes..."
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page when searching
                }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 whitespace-nowrap">Sort by:</p>
              <select 
                className="px-2 py-1 border rounded-md text-sm bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceHigh">Price (High to Low)</option>
                <option value="priceLow">Price (Low to High)</option>
                <option value="yieldHigh">Yield (High to Low)</option>
                <option value="yieldLow">Yield (Low to High)</option>
              </select>
            </div>
          </div>
          
          {/* Interactive Filter Panel */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-purple-900 border border-purple-500/20 shadow-lg">
            <form onSubmit={(e) => {
              e.preventDefault();
              // Create a new filter object from the local state
              const newFilters = {
                note_type: noteType,
                original_amount_min: originalAmountMin,
                original_amount_max: originalAmountMax,
                current_amount_min: currentAmountMin,
                current_amount_max: currentAmountMax,
                interest_rate_min: interestRateMin,
                interest_rate_max: interestRateMax,
                maturity_date_start: maturityDateStart,
                maturity_date_end: maturityDateEnd,
                location_state: locationState,
                location_city: locationCity,
                price_min: priceMin,
                price_max: priceMax,
                note_status: selectedNoteStatus,
                property_type: selectedPropertyTypes,
                property_zip_code: propertyZipCode,
                loan_term_years_min: loanTermYearsMin,
                loan_term_years_max: loanTermYearsMax,
                loan_term_months: loanTermMonths,
                is_secured: isSecured,
                collateral_type: collateralType,
                date_of_note_start: dateOfNoteStart,
                date_of_note_end: dateOfNoteEnd,
                payment_frequency: paymentFrequency,
                amortization_type: amortizationType,
                description: descriptionKeywords,
                property_county: propertyCounty,
                loan_to_value_ratio_min: ltvRatioMin,
                loan_to_value_ratio_max: ltvRatioMax,
              };
              
              handleApplyFilters(newFilters);
              
              // Count active filters
              let count = 0;
              Object.entries(newFilters).forEach(([_, value]) => {
                if (Array.isArray(value)) {
                  if (value.length > 0) count++;
                } else if (value !== '' && value !== false) {
                  count++;
                }
              });
              setActiveFilterCount(count);
            }}>
              {/* Top Row with Main Numeric Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-white text-sm font-medium mb-1">Loan Amount</p>
                  <div className="flex justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-300 text-xs">Min</p>
                      <input 
                        type="number" 
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-xl"
                        value={originalAmountMin}
                        onChange={(e) => setOriginalAmountMin(Number(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-xs">Max</p>
                      <input 
                        type="number"
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-xl"
                        value={originalAmountMax}
                        onChange={(e) => setOriginalAmountMax(Number(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-white text-sm font-medium mb-1">Interest Rate</p>
                  <div className="flex justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-300 text-xs">Min %</p>
                      <input 
                        type="number" 
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-xl"
                        value={interestRateMin}
                        onChange={(e) => setInterestRateMin(Number(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-xs">Max %</p>
                      <input 
                        type="number"
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-xl"
                        value={interestRateMax}
                        onChange={(e) => setInterestRateMax(Number(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-white text-sm font-medium mb-1">Loan Term</p>
                  <div className="flex justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-300 text-xs">Min Years</p>
                      <input 
                        type="number"
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-xl"
                        value={loanTermYearsMin}
                        onChange={(e) => setLoanTermYearsMin(Number(e.target.value) || 0)}
                        min="0"
                        max="40"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-xs">Max Years</p>
                      <input 
                        type="number" 
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-xl"
                        value={loanTermYearsMax}
                        onChange={(e) => setLoanTermYearsMax(Number(e.target.value) || 0)}
                        min="0"
                        max="40"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-white text-sm font-medium mb-1">Asking Price</p>
                  <div className="flex justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-300 text-xs">Min $</p>
                      <input 
                        type="number" 
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-xl"
                        value={priceMin}
                        onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-xs">Max $</p>
                      <input 
                        type="number" 
                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-white text-xl"
                        value={priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sliders for ranges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">Yield Range (%)</p>
                    <p className="text-xs text-gray-300">
                      {interestRateMin}% - {interestRateMax}%
                    </p>
                  </div>
                  <div className="relative h-2 bg-gray-700 rounded-full">
                    <input
                      type="range"
                      className="absolute w-full h-2 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                      min="0"
                      max="24"
                      value={interestRateMax}
                      onChange={(e) => setInterestRateMax(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">Price Range ($)</p>
                    <p className="text-xs text-gray-300">
                      ${priceMin} - ${priceMax}
                    </p>
                  </div>
                  <div className="relative h-2 bg-gray-700 rounded-full">
                    <input
                      type="range"
                      className="absolute w-full h-2 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                      min="0"
                      max="300000"
                      step="5000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              {/* Dropdown Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                <div className="space-y-1">
                  <label className="text-white text-sm">Note Type</label>
                  <select 
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                  >
                    <option value="">Any Type</option>
                    <option value="Promissory">Promissory</option>
                    <option value="Mortgage">Mortgage</option>
                    <option value="Business">Business</option>
                    <option value="Land Contract">Land Contract</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-white text-sm">Payment Frequency</label>
                  <select 
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value)}
                  >
                    <option value="">Any Frequency</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                    <option value="Biweekly">Biweekly</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-white text-sm">Amortization Type</label>
                  <select 
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    value={amortizationType}
                    onChange={(e) => setAmortizationType(e.target.value)}
                  >
                    <option value="">Any Type</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Adjustable">Adjustable</option>
                    <option value="Interest-Only">Interest-Only</option>
                    <option value="Balloon">Balloon</option>
                  </select>
                </div>
              </div>
              
              {/* Checkboxes for Property Type */}
              <div className="mt-6">
                <p className="text-white text-sm mb-2">Property Type</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Single Family', 'Multi-Family', 'Commercial', 'Land'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-purple-500"
                        checked={selectedPropertyTypes.includes(type)}
                        onChange={() => {
                          if (selectedPropertyTypes.includes(type)) {
                            setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type));
                          } else {
                            setSelectedPropertyTypes([...selectedPropertyTypes, type]);
                          }
                        }}
                      />
                      <span className="text-white text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Toggle for Secured */}
              <div className="mt-6">
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isSecured}
                        onChange={(e) => setIsSecured(e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full ${isSecured ? 'bg-purple-500' : 'bg-gray-600'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isSecured ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-white text-sm">Secured Note</span>
                  </label>
                </div>
                
                {isSecured && (
                  <div className="mt-3 ml-6">
                    <label className="text-white text-sm">Collateral Type</label>
                    <select 
                      className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                      value={collateralType}
                      onChange={(e) => setCollateralType(e.target.value)}
                    >
                      <option value="">Select Collateral</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="Business Assets">Business Assets</option>
                    </select>
                  </div>
                )}
              </div>
              
              {/* Location Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                <div className="space-y-1">
                  <label className="text-white text-sm">State</label>
                  <input 
                    type="text" 
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="e.g. CA, TX"
                    value={locationState}
                    onChange={(e) => setLocationState(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-white text-sm">City</label>
                  <input 
                    type="text" 
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="e.g. San Francisco"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-white text-sm">ZIP Code</label>
                  <input 
                    type="text"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="e.g. 94103"
                    value={propertyZipCode}
                    onChange={(e) => setPropertyZipCode(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Filter and Email Notification */}
              <div className="flex justify-between items-center mt-6">
                <button 
                  type="button" 
                  className="text-purple-300 underline text-sm"
                  onClick={() => {
                    // Reset all filters to default values
                    setNoteType('');
                    setOriginalAmountMin(0);
                    setOriginalAmountMax(160000);
                    setCurrentAmountMin(0);
                    setCurrentAmountMax(160000);
                    setInterestRateMin(0);
                    setInterestRateMax(16);
                    setMaturityDateStart('');
                    setMaturityDateEnd('');
                    setLocationState('');
                    setLocationCity('');
                    setPriceMin(0);
                    setPriceMax(160000);
                    setSelectedNoteStatus([]);
                    setSelectedPropertyTypes([]);
                    setPropertyZipCode('');
                    setLoanTermYearsMin(0);
                    setLoanTermYearsMax(16);
                    setLoanTermMonths(0);
                    setIsSecured(false);
                    setCollateralType('');
                    setDateOfNoteStart('');
                    setDateOfNoteEnd('');
                    setPaymentFrequency('');
                    setAmortizationType('');
                    setDescriptionKeywords('');
                    setPropertyCounty('');
                    setLtvRatioMin(0);
                    setLtvRatioMax(95);
                    setAdvancedFilters(null);
                    setActiveFilterCount(0);
                  }}
                >
                  Reset All Filters
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-2 rounded-full shadow-lg"
                  >
                    Apply Filters
                  </button>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="email-notify" 
                      className="mr-2 h-4 w-4 accent-purple-500"
                    />
                    <label htmlFor="email-notify" className="text-xs text-white">
                      Email me when a match is found
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="p-8 text-center">
              <p className="text-lg text-red-500">
                An error occurred while loading note listings. Please try again later.
              </p>
            </div>
          )}
          
          {/* No results state */}
          {!isLoading && displayedListings.length === 0 && (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium">No notes found</h3>
              <p className="text-muted-foreground">
                No notes match your current filters. Try changing your search criteria.
              </p>
            </div>
          )}
          
          {/* Note listings grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedListings.map((listing) => (
              <Card key={listing.id} className="transition-all duration-300 hover:shadow-xl group relative hover:border-purple-400 hover:scale-[1.02] overflow-hidden">
                <Link href={`/note/${listing.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View details for {listing.propertyAddress}</span>
                </Link>
                
                {/* Card Border Gradient */}
                <div className="absolute inset-0 rounded-lg border border-purple-500/20 pointer-events-none"></div>
                
                {/* Card Header with Property Type Badge */}
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 font-medium">
                      {listing.propertyType}
                    </Badge>
                    <div className="flex space-x-1 relative z-20">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                        <span className="sr-only">More options</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="19" cy="12" r="1"></circle>
                          <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-4">
                  {/* Address */}
                  <p className="text-sm text-gray-500 mb-2 truncate">{listing.propertyAddress}</p>
                  
                  {/* Price and Yield */}
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                      {formatCurrency(listing.askingPrice)}
                    </h3>
                    <div className="flex items-center text-green-600 font-medium">
                      <span className="text-xs font-bold mr-1">YIELD</span>
                      <span>{listing.interestRate}%</span>
                    </div>
                  </div>
                  
                  {/* Loan Stats */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    <div>
                      <p className="text-xs text-gray-500">Original Amount</p>
                      <p className="font-medium">{formatCurrency(listing.loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Monthly Payment</p>
                      <p className="font-medium">{formatCurrency(listing.paymentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Term</p>
                      <p className="font-medium">{Math.floor(listing.loanTerm / 12)} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payments Left</p>
                      <p className="font-medium">{listing.remainingPayments}</p>
                    </div>
                  </div>
                  
                  {/* Performance Indicator */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <p className="text-xs font-medium text-green-700">Performing</p>
                      </div>
                      <div className="flex items-center text-gray-500 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{listing.timeHeld} months held</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0 pb-4 px-6">
                  <Button className="w-full relative z-20 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white">
                    View Investment Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  {page > 1 ? (
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
                  ) : (
                    <PaginationPrevious className="pointer-events-none opacity-50" />
                  )}
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  // Only show the first, last, and pages around the current one
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= page - 1 && pageNumber <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={page === pageNumber}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (pageNumber === 2 && page > 3) ||
                    (pageNumber === totalPages - 1 && page < totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                <PaginationItem>
                  {page < totalPages ? (
                    <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
                  ) : (
                    <PaginationNext className="pointer-events-none opacity-50" />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
          {/* Call-to-action for sellers */}
          <div className="p-8 mt-12 text-center rounded-lg bg-muted">
            <h2 className="mb-3 text-2xl font-bold">Have notes to sell?</h2>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Join our exclusive network of note sellers and connect with qualified buyers looking for quality investments.
            </p>
            <Button className="bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90" asChild>
              <Link href="/sell-notes">
                Start Selling
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}