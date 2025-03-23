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

// Available US states for dropdown
const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

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
  const [isPerforming, setIsPerforming] = useState(true);
  const [collateralType, setCollateralType] = useState("");
  const [dateOfNoteStart, setDateOfNoteStart] = useState("");
  const [dateOfNoteEnd, setDateOfNoteEnd] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("");
  const [amortizationType, setAmortizationType] = useState("");
  const [descriptionKeywords, setDescriptionKeywords] = useState("");
  const [propertyCounty, setPropertyCounty] = useState("");
  const [ltvRatioMin, setLtvRatioMin] = useState(0);
  const [ltvRatioMax, setLtvRatioMax] = useState(95);
  
  // Note type collapse state
  const [isNoteTypeExpanded, setIsNoteTypeExpanded] = useState(false);
  
  // Filter toggle state
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Note type options
  const noteTypeOptions = ["Residential Mortgages", "Commercial Mortgages", "Land Contracts", 
                         "Small Business Loans", "Promissory Notes", "Commercial and Industrial (C&I) Loans", 
                         "Equipment Loans", "Consumer Loans"];
                         
  // Performing status already defined above
  
  // Property value range
  const [propertyValueMin, setPropertyValueMin] = useState(0);
  const [propertyValueMax, setPropertyValueMax] = useState(500000);
  
  // Use a local loading state for the animations
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Fetch note listings from the API
  const { data, isLoading: apiLoading, error } = useQuery<{ success: boolean; data: NoteListing[] }>({
    queryKey: ["/api/note-listings"],
  });
  
  // Combined loading state (API loading or filtering animation)
  const isLoading = apiLoading || isFiltering;
  
  // Get note listings from the data
  const noteListings = data?.data || [];

  // Properties for filtering
  const propertyTypes = Array.from(new Set(noteListings.map(listing => listing.propertyType)));
  
  // Handle advanced filter application with animated transition
  const handleApplyFilters = (filters: FilterState) => {
    // Activate loading state to show animation
    setIsFiltering(true);
    
    // Use setTimeout to create a smooth visual transition
    setTimeout(() => {
      setAdvancedFilters(filters);
      // Reset to first page when applying new filters
      setPage(1);
      // Deactivate loading state
      setIsFiltering(false);
    }, 800); // Short delay for visual effect
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
        
        // LTV ratio filter
        if (advancedFilters.loan_to_value_ratio_min !== '' && 
            (listing.loanToValueRatio === undefined || listing.loanToValueRatio === null || 
             listing.loanToValueRatio < advancedFilters.loan_to_value_ratio_min)) {
          return false;
        }
        if (advancedFilters.loan_to_value_ratio_max !== '' && 
            listing.loanToValueRatio !== undefined && listing.loanToValueRatio !== null && 
            listing.loanToValueRatio > advancedFilters.loan_to_value_ratio_max) {
          return false;
        }
        
        // Property value filter
        const estimatedPropertyValue = listing.propertyValue || 
           (listing.loanAmount && listing.loanToValueRatio ? 
            listing.loanAmount * (100 / listing.loanToValueRatio) : null);
            
        if (advancedFilters.property_value_min !== '' && 
            (estimatedPropertyValue === null || 
             estimatedPropertyValue < advancedFilters.property_value_min)) {
          return false;
        }
        if (advancedFilters.property_value_max !== '' && 
            estimatedPropertyValue !== null && 
            estimatedPropertyValue > advancedFilters.property_value_max) {
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
                  // If significant change in search (more than just typing), show animation
                  if (searchQuery.length === 0 || e.target.value.length === 0) {
                    setIsFiltering(true);
                    setTimeout(() => {
                      setSearchQuery(e.target.value);
                      setPage(1); // Reset to first page when searching
                      setIsFiltering(false);
                    }, 400);
                  } else {
                    setSearchQuery(e.target.value);
                    setPage(1); // Reset to first page when searching
                  }
                }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 whitespace-nowrap">Sort by:</p>
              <select 
                className="px-2 py-1 border rounded-md text-sm bg-white"
                value={sortBy}
                onChange={(e) => {
                  // Show animation when sorting changes
                  setIsFiltering(true);
                  setTimeout(() => {
                    setSortBy(e.target.value as any);
                    setIsFiltering(false);
                  }, 300);
                }}
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
          
          {/* Collapsible Filter Panel with Gradient Header */}
          <div className="mb-8 rounded-2xl overflow-hidden border border-purple-500/20 shadow-lg">
            {/* Gradient Filter Toggle Header */}
            <div 
              className={`bg-gradient-to-r from-purple-800 to-purple-900 transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-between px-6 ${isFilterVisible ? "py-4" : "py-2.5 hover:py-5"}`}
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-white" />
                <h3 className="font-medium text-white">Filter Notes</h3>
              </div>
              <div className={`transition-transform duration-300 ${isFilterVisible ? "rotate-180" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
            
            {/* Filter Content - Collapsible */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFilterVisible ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} bg-gradient-to-br from-gray-900 to-purple-900 p-0`}>
              <div className="p-4">
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
                    property_value_min: propertyValueMin,
                    property_value_max: propertyValueMax,
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
                  {/* Condensed layout with all range sliders on the right */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Left side - Payment options */}
                    <div className="space-y-4">
                      {/* We've removed Payment Frequency and Amortization Type */}
                      
                      {/* Note Type Selector with expand/collapse */}
                      <div className="bg-black/10 p-3 rounded-xl">
                        {/* Note Type Toggle Header */}
                        <div 
                          className="flex items-center justify-between px-2 py-2 cursor-pointer border-b border-gray-700/30 mb-2"
                          onClick={() => setIsNoteTypeExpanded(!isNoteTypeExpanded)}
                        >
                          <span className="text-white text-sm font-medium">Note Type</span>
                          <div className={`transition-transform duration-200 ${isNoteTypeExpanded ? "rotate-90" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Expandable Checkbox Grid */}
                        <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 px-2 overflow-hidden transition-all duration-300 ${
                          isNoteTypeExpanded ? "max-h-96 opacity-100 pt-2" : "max-h-0 opacity-0"
                        }`}>
                          {noteTypeOptions.map(type => (
                            <button
                              key={type}
                              type="button"
                              className={`py-1.5 px-2 rounded-md text-xs text-left transition-all duration-200 w-auto ${
                                selectedPropertyTypes.includes(type)
                                  ? "bg-purple-600 text-white font-medium shadow-lg"
                                  : "bg-gray-800/20 text-gray-300 hover:bg-gray-800/40"
                              }`}
                              onClick={() => {
                                if (selectedPropertyTypes.includes(type)) {
                                  setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type));
                                } else {
                                  setSelectedPropertyTypes([...selectedPropertyTypes, type]);
                                }
                              }}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Toggle row for Secured and Performing */}
                      <div className="flex items-center gap-4">
                        {/* Secured Note Toggle */}
                        <div>
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={isSecured}
                                onChange={(e) => setIsSecured(e.target.checked)}
                              />
                              <div className={`block w-8 h-4 rounded-full ${isSecured ? 'bg-purple-500' : 'bg-gray-600'}`}></div>
                              <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition ${isSecured ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-2 text-white text-xs">Secured Note</span>
                          </label>
                        </div>
                        
                        {/* Performing Note Toggle */}

                        <div>
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={isPerforming}
                                onChange={(e) => {
                                  setIsPerforming(e.target.checked);
                                  // Update the note status array based on the toggle
                                  if (e.target.checked) {
                                    if (!selectedNoteStatus.includes('Performing')) {
                                      setSelectedNoteStatus([...selectedNoteStatus.filter(s => s !== 'Non-Performing'), 'Performing']);
                                    }
                                  } else {
                                    if (!selectedNoteStatus.includes('Non-Performing')) {
                                      setSelectedNoteStatus([...selectedNoteStatus.filter(s => s !== 'Performing'), 'Non-Performing']);
                                    }
                                  }
                                }}
                              />
                              <div className={`block w-8 h-4 rounded-full ${isPerforming ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition ${isPerforming ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-2 text-white text-xs">{isPerforming ? 'Performing' : 'Non-Performing'}</span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Collateral Type (conditional) */}
                      {isSecured && (
                        <div className="mt-2 ml-5">
                          <label className="text-white text-xs">Collateral Type</label>
                          <select 
                            className="w-full mt-1 p-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
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
                      
                      {/* State Dropdown */}
                      <div>
                        <label className="text-white text-xs font-medium">Property State</label>
                        <select 
                          className="w-full mt-1 p-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                          value={locationState}
                          onChange={(e) => setLocationState(e.target.value)}
                        >
                          <option value="">Any State</option>
                          {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Right side - All range sliders stacked */}
                    <div className="space-y-3 bg-black/5 p-3 rounded-lg">
                      {/* Loan Amount Range Slider */}
                      <div>
                        <p className="text-white text-xs font-medium mb-1">Loan Amount ($)</p>
                        <div className="flex flex-col space-y-2">
                          <div className="relative h-2 bg-gray-700 rounded-full">
                            <div 
                              className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none" 
                              style={{ 
                                left: `${(originalAmountMin / 30000000) * 100}%`, 
                                right: `${100 - (originalAmountMax / 30000000) * 100}%` 
                              }}
                            ></div>
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="30000000"
                              step="10000"
                              value={originalAmountMin}
                              onChange={(e) => setOriginalAmountMin(Number(e.target.value))}
                            />
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-20 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="30000000"
                              step="10000"
                              value={originalAmountMax}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value > originalAmountMin) {
                                  setOriginalAmountMax(value);
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between gap-2">
                            <div className="w-1/2">
                              <input 
                                type="text" 
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={formatCurrency(originalAmountMin)}
                                onChange={(e) => {
                                  const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                                  if (!isNaN(value)) {
                                    setOriginalAmountMin(value);
                                  }
                                }}
                              />
                            </div>
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={formatCurrency(originalAmountMax)}
                                onChange={(e) => {
                                  const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                                  if (!isNaN(value) && value > originalAmountMin) {
                                    setOriginalAmountMax(value);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Interest Rate Range Slider */}
                      <div>
                        <p className="text-white text-xs font-medium mb-1">Interest Rate (%)</p>
                        <div className="flex flex-col space-y-2">
                          <div className="relative h-2 bg-gray-700 rounded-full">
                            <div 
                              className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none" 
                              style={{ 
                                left: `${(interestRateMin / 30) * 100}%`, 
                                right: `${100 - (interestRateMax / 30) * 100}%` 
                              }}
                            ></div>
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="30"
                              step="0.25"
                              value={interestRateMin}
                              onChange={(e) => setInterestRateMin(Number(e.target.value))}
                            />
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-20 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="30"
                              step="0.25"
                              value={interestRateMax}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value > interestRateMin) {
                                  setInterestRateMax(value);
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between gap-2">
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={interestRateMin === 0 ? '-∞' : `${interestRateMin}%`}
                                onChange={(e) => {
                                  if (e.target.value === '-∞') {
                                    setInterestRateMin(0);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9.]/g, ''));
                                  if (!isNaN(value)) {
                                    setInterestRateMin(value);
                                  }
                                }}
                              />
                            </div>
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={interestRateMax === 30 ? '∞' : `${interestRateMax}%`}
                                onChange={(e) => {
                                  if (e.target.value === '∞') {
                                    setInterestRateMax(30);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9.]/g, ''));
                                  if (!isNaN(value) && value > interestRateMin) {
                                    setInterestRateMax(value);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* LTV Ratio Range Slider */}
                      <div>
                        <p className="text-white text-xs font-medium mb-1">LTV Ratio (%)</p>
                        <div className="flex flex-col space-y-2">
                          <div className="relative h-2 bg-gray-700 rounded-full">
                            <div 
                              className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none" 
                              style={{ 
                                left: `${(ltvRatioMin / 100) * 100}%`, 
                                right: `${100 - (ltvRatioMax / 100) * 100}%` 
                              }}
                            ></div>
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="100"
                              step="1"
                              value={ltvRatioMin}
                              onChange={(e) => setLtvRatioMin(Number(e.target.value))}
                            />
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-20 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="100"
                              step="1"
                              value={ltvRatioMax}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value > ltvRatioMin) {
                                  setLtvRatioMax(value);
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between gap-2">
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={ltvRatioMin === 0 ? '-∞' : `${ltvRatioMin}%`}
                                onChange={(e) => {
                                  if (e.target.value === '-∞') {
                                    setLtvRatioMin(0);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9.]/g, ''));
                                  if (!isNaN(value)) {
                                    setLtvRatioMin(value);
                                  }
                                }}
                              />
                            </div>
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={ltvRatioMax === 100 ? '∞' : `${ltvRatioMax}%`}
                                onChange={(e) => {
                                  if (e.target.value === '∞') {
                                    setLtvRatioMax(100);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9.]/g, ''));
                                  if (!isNaN(value) && value > ltvRatioMin) {
                                    setLtvRatioMax(value);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Property Value Range Slider */}
                      <div>
                        <p className="text-white text-xs font-medium mb-1">Property Value ($)</p>
                        <div className="flex flex-col space-y-2">
                          <div className="relative h-2 bg-gray-700 rounded-full">
                            <div 
                              className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none" 
                              style={{ 
                                left: `${(propertyValueMin / 2000000) * 100}%`, 
                                right: `${100 - (propertyValueMax / 2000000) * 100}%` 
                              }}
                            ></div>
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="2000000"
                              step="5000"
                              value={propertyValueMin}
                              onChange={(e) => setPropertyValueMin(Number(e.target.value))}
                            />
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-20 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="2000000"
                              step="5000"
                              value={propertyValueMax}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value > propertyValueMin) {
                                  setPropertyValueMax(value);
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between gap-2">
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={propertyValueMin === 0 ? '-∞' : formatCurrency(propertyValueMin)}
                                onChange={(e) => {
                                  if (e.target.value === '-∞') {
                                    setPropertyValueMin(0);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                                  if (!isNaN(value)) {
                                    setPropertyValueMin(value);
                                  }
                                }}
                              />
                            </div>
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={propertyValueMax === 2000000 ? '∞' : formatCurrency(propertyValueMax)}
                                onChange={(e) => {
                                  if (e.target.value === '∞') {
                                    setPropertyValueMax(2000000);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                                  if (!isNaN(value) && value > propertyValueMin) {
                                    setPropertyValueMax(value);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Renamed to Unpaid Principal Balance */}
                      <div>
                        <p className="text-white text-xs font-medium mb-1">Unpaid Principal Balance ($)</p>
                        <div className="flex flex-col space-y-2">
                          <div className="relative h-2 bg-gray-700 rounded-full">
                            <div 
                              className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none" 
                              style={{ 
                                left: `${(loanTermYearsMin / 50) * 100}%`, 
                                right: `${100 - (loanTermYearsMax / 50) * 100}%` 
                              }}
                            ></div>
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="50"
                              step="1"
                              value={loanTermYearsMin}
                              onChange={(e) => setLoanTermYearsMin(Number(e.target.value))}
                            />
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-20 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="50"
                              step="1"
                              value={loanTermYearsMax}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value > loanTermYearsMin) {
                                  setLoanTermYearsMax(value);
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between gap-2">
                            <div className="w-1/2">
                              <input 
                                type="text" 
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={loanTermYearsMin === 0 ? '-∞' : formatCurrency(loanTermYearsMin * 5000)}
                                onChange={(e) => {
                                  if (e.target.value === '-∞') {
                                    setLoanTermYearsMin(0);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                                  if (!isNaN(value)) {
                                    setLoanTermYearsMin(Math.floor(value / 5000));
                                  }
                                }}
                              />
                            </div>
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={loanTermYearsMax === 50 ? '∞' : formatCurrency(loanTermYearsMax * 5000)}
                                onChange={(e) => {
                                  if (e.target.value === '∞') {
                                    setLoanTermYearsMax(50);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                                  if (!isNaN(value) && Math.floor(value / 5000) > loanTermYearsMin) {
                                    setLoanTermYearsMax(Math.floor(value / 5000));
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Asking Price Range Slider */}
                      <div>
                        <p className="text-white text-xs font-medium mb-1">Asking Price ($)</p>
                        <div className="flex flex-col space-y-2">
                          <div className="relative h-2 bg-gray-700 rounded-full">
                            <div 
                              className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none" 
                              style={{ 
                                left: `${(priceMin / 50000000) * 100}%`, 
                                right: `${100 - (priceMax / 50000000) * 100}%` 
                              }}
                            ></div>
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="50000000"
                              step="10000"
                              value={priceMin}
                              onChange={(e) => setPriceMin(Number(e.target.value))}
                            />
                            <input
                              type="range"
                              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-20 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                              min="0"
                              max="50000000"
                              step="10000"
                              value={priceMax}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value > priceMin) {
                                  setPriceMax(value);
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between gap-2">
                            <div className="w-1/2">
                              <input 
                                type="text" 
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={priceMin === 0 ? '-∞' : formatCurrency(priceMin)}
                                onChange={(e) => {
                                  if (e.target.value === '-∞') {
                                    setPriceMin(0);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                                  if (!isNaN(value)) {
                                    setPriceMin(value);
                                  }
                                }}
                              />
                            </div>
                            <div className="w-1/2">
                              <input 
                                type="text"
                                className="w-full p-1 bg-gray-800/5 border border-gray-700/20 rounded text-white text-sm opacity-80 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                                value={priceMax >= 50000000 ? '∞' : formatCurrency(priceMax)}
                                onChange={(e) => {
                                  if (e.target.value === '∞') {
                                    setPriceMax(50000000);
                                    return;
                                  }
                                  const value = Number(e.target.value.replace(/[^0-9]/g, ''));
                                  if (!isNaN(value) && value > priceMin) {
                                    setPriceMax(value);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location Filters - Condensed row */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <input 
                        type="text" 
                        className="w-full p-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                        placeholder="State (e.g. CA, TX)"
                        value={locationState}
                        onChange={(e) => setLocationState(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <input 
                        type="text" 
                        className="w-full p-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                        placeholder="City"
                        value={locationCity}
                        onChange={(e) => setLocationCity(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <input 
                        type="text"
                        className="w-full p-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                        placeholder="ZIP Code"
                        value={propertyZipCode}
                        onChange={(e) => setPropertyZipCode(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Filter and Email Notification */}
                  <div className="flex justify-between items-center mt-3">
                    <button 
                      type="button" 
                      className="text-purple-300 underline text-xs"
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
                        setIsNoteTypeExpanded(false);
                        setAdvancedFilters(null);
                        setActiveFilterCount(0);
                      }}
                    >
                      Reset All Filters
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-1.5 rounded-full shadow-lg text-sm"
                      >
                        Apply Filters
                      </button>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="email-notify" 
                          className="mr-1 h-3 w-3 accent-purple-500"
                        />
                        <label htmlFor="email-notify" className="text-xs text-white">
                          Email when found
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Loading state with enhanced animations */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center my-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
                {[1, 2, 3, 4, 5, 6].map((placeholder) => (
                  <div 
                    key={placeholder}
                    className="rounded-lg bg-gray-800/20 h-[300px] animate-filterLoading"
                    style={{ 
                      animationDelay: `${placeholder * 100}ms`
                    }}
                  >
                    <div className="h-full flex flex-col p-6">
                      <div className="h-6 w-24 bg-gray-700/30 rounded mb-3"></div>
                      <div className="h-4 w-full bg-gray-700/30 rounded mb-6"></div>
                      <div className="flex justify-between mb-4">
                        <div className="h-8 w-24 bg-gray-700/30 rounded"></div>
                        <div className="h-6 w-14 bg-gray-700/30 rounded"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="h-12 bg-gray-700/30 rounded"></div>
                        <div className="h-12 bg-gray-700/30 rounded"></div>
                        <div className="h-12 bg-gray-700/30 rounded"></div>
                        <div className="h-12 bg-gray-700/30 rounded"></div>
                      </div>
                      <div className="mt-auto">
                        <div className="h-10 w-full bg-gray-700/30 rounded-md mt-4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          
          {/* Note listings grid with animated transitions */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedListings.map((listing, index) => (
              <Card 
                key={listing.id} 
                className="transition-all duration-500 hover:shadow-xl group relative hover:border-purple-400 hover:scale-[1.02] overflow-hidden animate-fadeIn"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
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
                      <p className="text-xs text-gray-500">Time Held</p>
                      <p className="font-medium">{listing.timeHeld} months</p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0 pb-5 px-6">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md">View Details</Button>
                </CardFooter>
                
                {/* Status overlay for non-active listings */}
                {listing.status !== 'active' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="outline" className="text-white border-white px-3 py-1 text-lg uppercase tracking-wider">
                      {listing.status}
                    </Badge>
                  </div>
                )}
              </Card>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) {
                        setPage(page - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) {
                        setPage(page + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
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