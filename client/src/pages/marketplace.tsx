import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Filter as FilterIcon, Search, X as XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { type NoteListing } from "@shared/schema";
import { FilterModal, FilterDrawer, FilterState } from "@/components/marketplace";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";


export default function MarketplacePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

          {/* Filters and Search */}
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
                      <XIcon className="h-3 w-3" />
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
                        <XIcon className="h-3 w-3" />
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
              <Card key={listing.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl group relative hover:border-primary hover:scale-[1.02]">
                <Link href={`/note/${listing.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View details for {listing.propertyAddress}</span>
                </Link>
                <CardHeader className="p-0">
                  <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-white opacity-75" />
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-background text-foreground">
                        {listing.propertyType}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-xl">
                      {formatCurrency(listing.askingPrice)}
                    </CardTitle>
                    <div className="flex space-x-1 relative z-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Add to Watchlist</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription className="text-sm truncate">{listing.propertyAddress}</CardDescription>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <Percent className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">{listing.interestRate}%</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining Term</p>
                        <p className="font-medium">{listing.remainingPayments} months</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Payment</p>
                        <p className="font-medium">{formatCurrency(listing.paymentAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <GalleryHorizontalEnd className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time Held</p>
                        <p className="font-medium">{listing.timeHeld} months</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild className="w-full relative z-20">
                    <Link href={`/note/${listing.id}`}>
                      View Details
                    </Link>
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