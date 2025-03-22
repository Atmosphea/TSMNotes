import React from 'react';
import { Button } from '@/components/ui/button';
import { Sliders, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FilterButtonProps {
  onClick: () => void;
  activeFilterCount?: number;
  variant?: 'default' | 'outline' | 'subtle';
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  onClick, 
  activeFilterCount = 0,
  variant = 'default'
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return 'border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-800';
      case 'subtle':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800';
      default:
        return 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white';
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`${getButtonStyle()} flex items-center gap-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md`}
    >
      <div className="flex items-center gap-1">
        <Sliders className="h-4 w-4" />
        <span className="font-medium">Filters</span>
      </div>
      
      {activeFilterCount > 0 && (
        <Badge className="bg-purple-600 hover:bg-purple-700 ml-1 text-white">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
};

export default FilterButton;