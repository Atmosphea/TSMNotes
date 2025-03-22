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
          
          {/* Filters and Search Bar */}
          <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Advanced Filter Component - Use either modal or drawer based on screen size */}
              {isMobile ? (
                <FilterDrawer 
                  onApplyFilters={(filters) => {
                    handleApplyFilters(filters);
                    // Count active filters
                    let count = 0;
                    Object.entries(filters).forEach(([_, value]) => {
                      if (Array.isArray(value)) {
                        if (value.length > 0) count++;
                      } else if (value !== '' && value !== false) {
                        count++;
                      }
                    });
                    setActiveFilterCount(count);
                  }}
                  buttonVariant="outline"
                />
              ) : (
                <FilterModal 
                  onApplyFilters={(filters) => {
                    handleApplyFilters(filters);
                    // Count active filters
                    let count = 0;
                    Object.entries(filters).forEach(([_, value]) => {
                      if (Array.isArray(value)) {
                        if (value.length > 0) count++;
                      } else if (value !== '' && value !== false) {
                        count++;
                      }
                    });
                    setActiveFilterCount(count);
                  }}
                  buttonVariant="outline"
                />
              )}
              
              {/* Active Filter Badges */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline" className="flex items-center gap-1 bg-gray-100">
                    <span>{activeFilterCount} active filters</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 rounded-full p-0 text-gray-500 hover:bg-gray-200"
                      onClick={() => {
                        setAdvancedFilters(null);
                        setActiveFilterCount(0);
                      }}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Clear all filters</span>
                    </Button>
                  </Badge>
                  
                  {filterPropertyType && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-gray-100">
                      <span>Type: {filterPropertyType}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 rounded-full p-0 text-gray-500 hover:bg-gray-200"
                        onClick={() => setFilterPropertyType(null)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Clear property type filter</span>
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort: {sortBy === "newest" ? "Newest First" : 
                           sortBy === "oldest" ? "Oldest First" : 
                           sortBy === "priceHigh" ? "Price (High to Low)" : 
                           sortBy === "priceLow" ? "Price (Low to High)" :
                           sortBy === "yieldHigh" ? "Yield (High to Low)" :
                           "Yield (Low to High)"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("priceHigh")}>
                    Price (High to Low)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("priceLow")}>
                    Price (Low to High)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("yieldHigh")}>
                    Yield (High to Low)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("yieldLow")}>
                    Yield (Low to High)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="pl-10 w-full md:w-64 h-10 rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search notes..."
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page when searching
                }}
              />
            </div>
          </div>
          
          {/* Standalone Filter Panel */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-purple-900 border border-purple-500/20 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-white text-sm font-medium mb-1">Loan Amount</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-300 text-xs">Min</p>
                    <p className="text-white font-bold text-2xl">
                      {advancedFilters?.original_amount_min || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs">Max</p>
                    <p className="text-white font-bold text-2xl">
                      {advancedFilters?.original_amount_max || 160000}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-white text-sm font-medium mb-1">Interest Rate</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-300 text-xs">Min %</p>
                    <p className="text-white font-bold text-2xl">
                      {advancedFilters?.interest_rate_min || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs">Max %</p>
                    <p className="text-white font-bold text-2xl">
                      {advancedFilters?.interest_rate_max || 16}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-white text-sm font-medium mb-1">Loan Term</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-300 text-xs">Min Years</p>
                    <p className="text-white font-bold text-2xl">
                      {advancedFilters?.loan_term_years_min || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs">Max Years</p>
                    <p className="text-white font-bold text-2xl">
                      {advancedFilters?.loan_term_years_max || 16}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-white text-sm font-medium mb-1">Asking Price</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-300 text-xs">Min $</p>
                    <p className="text-white font-bold text-2xl">
                      {advancedFilters?.price_min || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs">Max $</p>
                    <p className="text-white font-bold text-2xl">
                      {advancedFilters?.price_max || 160000}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">Yield Range</p>
                  <p className="text-xs text-gray-300">
                    {advancedFilters?.interest_rate_min || 0}% - {advancedFilters?.interest_rate_max || 24}%
                  </p>
                </div>
                <div className="h-1 bg-gray-700 rounded-full">
                  <div 
                    className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">Price Range</p>
                  <p className="text-xs text-gray-300">
                    ${advancedFilters?.price_min || 0} - ${advancedFilters?.price_max || 160000}
                  </p>
                </div>
                <div className="h-1 bg-gray-700 rounded-full">
                  <div 
                    className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                    style={{ width: '65%' }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">Term Range</p>
                  <p className="text-xs text-gray-300">
                    {advancedFilters?.loan_term_years_min || 0} - {advancedFilters?.loan_term_years_max || 30} years
                  </p>
                </div>
                <div className="h-1 bg-gray-700 rounded-full">
                  <div 
                    className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                    style={{ width: '50%' }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">LTV Ratio</p>
                  <p className="text-xs text-gray-300">
                    {advancedFilters?.loan_to_value_ratio_min || 0}% - {advancedFilters?.loan_to_value_ratio_max || 95}%
                  </p>
                </div>
                <div className="h-1 bg-gray-700 rounded-full">
                  <div 
                    className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <div className="flex items-center gap-2">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-2 rounded-full shadow-lg"
                  onClick={() => {
                    if (isMobile) {
                      const filterDrawerButton = document.querySelector('[aria-label="Filter"]');
                      if (filterDrawerButton) {
                        (filterDrawerButton as HTMLButtonElement).click();
                      }
                    } else {
                      const filterModalButton = document.querySelector('[aria-label="Filter"]');
                      if (filterModalButton) {
                        (filterModalButton as HTMLButtonElement).click();
                      }
                    }
                  }}
                >
                  Filter
                </Button>
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