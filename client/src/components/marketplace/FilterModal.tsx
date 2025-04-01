import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FilterButton from './FilterButton';
import SearchFilter from './SearchFilter';
import { FilterState } from './index';

interface FilterModalProps {
  onApplyFilters: (filters: FilterState) => void;
  activeFilterCount: number;
  buttonVariant?: 'default' | 'outline' | 'subtle';
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  onApplyFilters,
  activeFilterCount,
  buttonVariant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = (filters: FilterState) => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          <FilterButton 
            onClick={() => setIsOpen(true)} 
            activeFilterCount={activeFilterCount}
            variant={buttonVariant}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 border-none bg-transparent max-w-4xl">
        <SearchFilter onApply={handleApplyFilters} onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;