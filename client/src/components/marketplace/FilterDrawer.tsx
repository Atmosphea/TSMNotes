import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FilterButton from "./FilterButton";
import SearchFilter from "./SearchFilter";
import { FilterState } from "./index";

interface FilterDrawerProps {
  onApplyFilters: (filters: FilterState) => void;
  activeFilterCount: number;
  buttonVariant?: "default" | "outline" | "subtle";
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  onApplyFilters,
  activeFilterCount,
  buttonVariant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = (filters: FilterState) => {
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
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 border-none bg-[#131823]"
      >
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
