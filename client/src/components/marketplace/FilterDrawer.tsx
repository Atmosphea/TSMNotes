import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FilterButton from './FilterButton';
import SearchFilter from './SearchFilter';

// Import the FilterState type from SearchFilter
// We need to define it again here to avoid circular imports
interface FilterState {
  note_type: string;
  original_amount_min: number | '';
  original_amount_max: number | '';
  current_amount_min: number | '';
  current_amount_max: number | '';
  interest_rate_min: number | '';
  interest_rate_max: number | '';
  maturity_date_start: string;
  maturity_date_end: string;
  location_state: string;
  location_city: string;
  price_min: number | '';
  price_max: number | '';
  note_status: string[];
  property_type: string[];
  property_zip_code: string;
  loan_term_years_min: number | '';
  loan_term_years_max: number | '';
  loan_term_months: number | '';
  is_secured: boolean;
  collateral_type: string;
  date_of_note_start: string;
  date_of_note_end: string;
  payment_frequency: string;
  amortization_type: string;
  description: string;
  property_county: string;
  loan_to_value_ratio_min: number | '';
  loan_to_value_ratio_max: number | '';
}

interface FilterDrawerProps {
  onApplyFilters: (filters: FilterState) => void;
  buttonVariant?: 'default' | 'outline' | 'subtle';
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ 
  onApplyFilters,
  buttonVariant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const handleApplyFilters = (filters: FilterState) => {
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
    onApplyFilters(filters);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div>
          <FilterButton 
            onClick={() => setIsOpen(true)} 
            activeFilterCount={activeFilterCount}
            variant={buttonVariant}
          />
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg p-0 border-none bg-transparent">
        <SearchFilter 
          onApply={handleApplyFilters} 
          onClose={() => setIsOpen(false)} 
          isDrawer={true} 
        />
      </SheetContent>
    </Sheet>
  );
};

export default FilterDrawer;