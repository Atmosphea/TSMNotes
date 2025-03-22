import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Sliders, Filter } from 'lucide-react';

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

const initialFilterState: FilterState = {
  note_type: '',
  original_amount_min: '',
  original_amount_max: '',
  current_amount_min: '',
  current_amount_max: '',
  interest_rate_min: '',
  interest_rate_max: '',
  maturity_date_start: '',
  maturity_date_end: '',
  location_state: '',
  location_city: '',
  price_min: '',
  price_max: '',
  note_status: [],
  property_type: [],
  property_zip_code: '',
  loan_term_years_min: '',
  loan_term_years_max: '',
  loan_term_months: '',
  is_secured: false,
  collateral_type: '',
  date_of_note_start: '',
  date_of_note_end: '',
  payment_frequency: '',
  amortization_type: '',
  description: '',
  property_county: '',
  loan_to_value_ratio_min: '',
  loan_to_value_ratio_max: '',
};

const noteTypes = ['Promissory', 'Mortgage', 'Business', 'Land Contract'];
const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const noteStatuses = ['Performing', 'Non-Performing', 'Sub-Performing', 'REO'];
const propertyTypes = ['Single Family', 'Multi-Family', 'Commercial', 'Land', 'Industrial', 'Mixed-Use'];
const collateralTypes = ['Real Estate', 'Equipment', 'Vehicle', 'Business Assets', 'Unsecured'];
const paymentFrequencies = ['Monthly', 'Bi-Weekly', 'Weekly', 'Quarterly', 'Semi-Annually', 'Annually'];
const amortizationTypes = ['Fully Amortizing', 'Interest-Only', 'Balloon Payment', 'Adjustable Rate'];

interface SearchFilterProps {
  onApply: (filters: FilterState) => void;
  onClose?: () => void;
  isDrawer?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onApply, onClose, isDrawer = false }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleCheckboxChange = (field: 'note_status' | 'property_type', value: string) => {
    const current = filters[field];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFilters({ ...filters, [field]: updated });
    updateActiveFiltersCount({ ...filters, [field]: updated });
  };

  const handleInputChange = (field: keyof FilterState, value: any) => {
    setFilters({ ...filters, [field]: value });
    updateActiveFiltersCount({ ...filters, [field]: value });
  };

  const updateActiveFiltersCount = (currentFilters: FilterState) => {
    let count = 0;
    
    // Count all non-empty filters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) count++;
      } else if (value !== '' && value !== false && value !== initialFilterState[key as keyof FilterState]) {
        count++;
      }
    });
    
    setActiveFiltersCount(count);
  };

  const handleClearFilters = () => {
    setFilters(initialFilterState);
    setActiveFiltersCount(0);
  };

  const handleApplyFilters = () => {
    onApply(filters);
    if (isDrawer && onClose) {
      onClose();
    }
  };

  return (
    <div className={`${isDrawer ? 'w-full' : 'w-[80vw] h-[80vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'} 
                bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 overflow-y-auto shadow-lg animate-in fade-in duration-300`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Search Filters</h2>
        {isDrawer && onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Note Type */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Note Type</label>
          <select
            value={filters.note_type}
            onChange={(e) => handleInputChange('note_type', e.target.value)}
            className="w-full bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 py-2"
          >
            <option value="">Select Note Type</option>
            {noteTypes.map((type) => (
              <option key={type} value={type} className="bg-gray-800 text-white">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Original Amount */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Original Amount ($)</label>
          <div className="flex space-x-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.original_amount_min}
              onChange={(e) =>
                handleInputChange('original_amount_min', e.target.value ? Number(e.target.value) : '')
              }
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.original_amount_max}
              onChange={(e) =>
                handleInputChange('original_amount_max', e.target.value ? Number(e.target.value) : '')
              }
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
          </div>
        </div>

        {/* Current Amount */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Current Amount ($)</label>
          <div className="flex space-x-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.current_amount_min}
              onChange={(e) =>
                handleInputChange('current_amount_min', e.target.value ? Number(e.target.value) : '')
              }
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.current_amount_max}
              onChange={(e) =>
                handleInputChange('current_amount_max', e.target.value ? Number(e.target.value) : '')
              }
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Interest Rate (%)</label>
          <div className="flex space-x-4">
            <input
              type="number"
              placeholder="Min"
              step="0.125"
              value={filters.interest_rate_min}
              onChange={(e) =>
                handleInputChange('interest_rate_min', e.target.value ? Number(e.target.value) : '')
              }
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
            <input
              type="number"
              placeholder="Max"
              step="0.125"
              value={filters.interest_rate_max}
              onChange={(e) =>
                handleInputChange('interest_rate_max', e.target.value ? Number(e.target.value) : '')
              }
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
          </div>
        </div>

        {/* Price */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Asking Price: ${filters.price_min} - ${filters.price_max}</label>
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={filters.price_min}
              onChange={(e) => handleInputChange('price_min', Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={filters.price_max}
              onChange={(e) => handleInputChange('price_max', Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        {/* Location State */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">State</label>
          <select
            value={filters.location_state}
            onChange={(e) => handleInputChange('location_state', e.target.value)}
            className="w-full bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 py-2"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state} className="bg-gray-800 text-white">
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Property Type</label>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => (
              <div key={type} className="flex items-center">
                <input
                  type="checkbox"
                  id={`property-${type}`}
                  checked={filters.property_type.includes(type)}
                  onChange={() => handleCheckboxChange('property_type', type)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`property-${type}`} className="text-white text-sm cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Note Status */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Note Status</label>
          <div className="grid grid-cols-2 gap-2">
            {noteStatuses.map((status) => (
              <div key={status} className="flex items-center">
                <input
                  type="checkbox"
                  id={`status-${status}`}
                  checked={filters.note_status.includes(status)}
                  onChange={() => handleCheckboxChange('note_status', status)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`status-${status}`} className="text-white text-sm cursor-pointer">
                  {status}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Loan Term */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Loan Term (Years)</label>
          <div className="flex space-x-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.loan_term_years_min}
              onChange={(e) =>
                handleInputChange('loan_term_years_min', e.target.value ? Number(e.target.value) : '')
              }
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.loan_term_years_max}
              onChange={(e) =>
                handleInputChange('loan_term_years_max', e.target.value ? Number(e.target.value) : '')
              }
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
          </div>
        </div>

        {/* Collateral Type */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Collateral Type</label>
          <select
            value={filters.collateral_type}
            onChange={(e) => handleInputChange('collateral_type', e.target.value)}
            className="w-full bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 py-2"
          >
            <option value="">Select Collateral Type</option>
            {collateralTypes.map((type) => (
              <option key={type} value={type} className="bg-gray-800 text-white">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Frequency */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Payment Frequency</label>
          <select
            value={filters.payment_frequency}
            onChange={(e) => handleInputChange('payment_frequency', e.target.value)}
            className="w-full bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 py-2"
          >
            <option value="">Select Frequency</option>
            {paymentFrequencies.map((freq) => (
              <option key={freq} value={freq} className="bg-gray-800 text-white">
                {freq}
              </option>
            ))}
          </select>
        </div>

        {/* Amortization Type */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Amortization Type</label>
          <select
            value={filters.amortization_type}
            onChange={(e) => handleInputChange('amortization_type', e.target.value)}
            className="w-full bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 py-2"
          >
            <option value="">Select Type</option>
            {amortizationTypes.map((type) => (
              <option key={type} value={type} className="bg-gray-800 text-white">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Secured Status */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Security Status</label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is-secured"
              checked={filters.is_secured}
              onChange={(e) => handleInputChange('is_secured', e.target.checked)}
              className="mr-2 h-4 w-4 accent-purple-500"
            />
            <label htmlFor="is-secured" className="text-white cursor-pointer">
              Secured Notes Only
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center border-t border-gray-700 pt-4">
        <div className="text-white text-sm">
          <span className="font-bold">{activeFiltersCount}</span> active filters
        </div>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-400"
          >
            Clear All
          </Button>
          <Button 
            onClick={handleApplyFilters}
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 border-none"
          >
            Apply Filters ({activeFiltersCount})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;