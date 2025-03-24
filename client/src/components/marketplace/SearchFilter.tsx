import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Sliders, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterState } from './index';

const initialFilterState: FilterState = {
  // Basic filtering options
  availability: 'All',
  listingType: 'All',
  lienPosition: 'All',
  performance: 'All',
  
  // Note type filtering
  note_type: [],
  
  // Price & balance ranges
  original_amount_min: '',
  original_amount_max: '',
  current_amount_min: '',
  current_amount_max: '',
  unpaid_balance_min: '',
  unpaid_balance_max: '',
  price_min: '',
  price_max: '',
  
  // Property filtering
  property_type: [],
  property_value_min: '',
  property_value_max: '',
  
  // Interest & investment ratios
  interest_rate_min: '',
  interest_rate_max: '',
  investment_to_balance_min: '',
  investment_to_balance_max: '',
  investment_to_value_min: '',
  investment_to_value_max: '',
  loan_to_value_min: '',
  loan_to_value_max: '',
  
  // Maturity & term details
  maturity_date_start: '',
  maturity_date_end: '',
  date_of_note_start: '',
  date_of_note_end: '',
  payments_remaining_min: '',
  payments_remaining_max: '',
  
  // Location info
  location_state: '',
  location_city: '',
  property_zip_code: '',
  property_county: '',
  
  // Status & legal
  note_status: [],
  legal_status: [],
  is_secured: false,
  
  // Jurisdiction classification
  state_classifications: [],
  
  // Additional details
  collateral_type: '',
  loan_term_years_min: '',
  loan_term_years_max: '',
  loan_term_months: '',
  payment_frequency: '',
  amortization_type: '',
  description: '',
};

// Basic filtering options
const availabilityOptions = ['All', 'Available', 'Pending Sale'];
const listingTypeOptions = ['All', 'Single Asset', 'Asset Pool'];
const lienPositionOptions = ['All', '1st', '2nd'];
const performanceOptions = ['All', 'Performing', 'Non-Performing'];

// Note type options - from JSON
const noteTypeOptions = [
  { label: 'Deed of Trust', value: 'deed_of_trust' },
  { label: 'Mortgage', value: 'mortgage' },
  { label: 'Contract For Deed (CFD)', value: 'cfd' }
];

// Other dropdown options
const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const noteStatuses = ['Performing', 'Non-Performing', 'Sub-Performing', 'REO'];
const paymentFrequencies = ['Monthly', 'Bi-Weekly', 'Weekly', 'Quarterly', 'Semi-Annually', 'Annually'];
const amortizationTypes = ['Fully Amortizing', 'Interest-Only', 'Balloon Payment', 'Adjustable Rate'];

// Property types - from JSON
const propertyTypes = [
  { label: 'Commercial', value: 'commercial' },
  { label: 'Condominium', value: 'condominium' },
  { label: 'Land', value: 'land' },
  { label: 'Multi-Family', value: 'multi-family' },
  { label: 'Other', value: 'other' },
  { label: 'Single Family', value: 'single-family' }
];

// Collateral types
const collateralTypes = ['Real Estate', 'Equipment', 'Vehicle', 'Business Assets', 'Unsecured'];

// Legal statuses
const legalStatusOptions = [
  { label: 'Foreclosure', value: 'foreclosure' },
  { label: 'None', value: 'none' }
];

// State classifications
const stateClassificationOptions = [
  { label: 'Judicial State', value: 'judicial' },
  { label: 'Non-Judicial State', value: 'non-judicial' }
];

interface SearchFilterProps {
  onApply: (filters: FilterState) => void;
  onClose?: () => void;
  isDrawer?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onApply, onClose, isDrawer = false }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleCheckboxChange = (
    field: 'note_status' | 'property_type' | 'note_type' | 'legal_status' | 'state_classifications', 
    value: string
  ) => {
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
        {/* Availability */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Availability</label>
          <div className="flex flex-col space-y-2">
            {availabilityOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`availability-${option}`}
                  name="availability"
                  checked={filters.availability === option}
                  onChange={() => handleInputChange('availability', option)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`availability-${option}`} className="text-white text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Listing Type */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Listing Type</label>
          <div className="flex flex-col space-y-2">
            {listingTypeOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`listing-type-${option}`}
                  name="listingType"
                  checked={filters.listingType === option}
                  onChange={() => handleInputChange('listingType', option)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`listing-type-${option}`} className="text-white text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Lien Position */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Lien Position</label>
          <div className="flex flex-col space-y-2">
            {lienPositionOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`lien-position-${option}`}
                  name="lienPosition"
                  checked={filters.lienPosition === option}
                  onChange={() => handleInputChange('lienPosition', option)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`lien-position-${option}`} className="text-white text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Performance</label>
          <div className="flex flex-col space-y-2">
            {performanceOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`performance-${option}`}
                  name="performance"
                  checked={filters.performance === option}
                  onChange={() => handleInputChange('performance', option)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`performance-${option}`} className="text-white text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Note Type */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Note Type</label>
          <div className="grid grid-cols-1 gap-2">
            {noteTypeOptions.map((type) => (
              <div key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`note-type-${type.value}`}
                  checked={filters.note_type.includes(type.value)}
                  onChange={() => handleCheckboxChange('note_type', type.value)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`note-type-${type.value}`} className="text-white text-sm cursor-pointer">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
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
          <label className="text-white font-bold mb-2 block">Asking Price ($)</label>
          <div className="flex space-x-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.price_min}
              onChange={(e) => handleInputChange('price_min', e.target.value ? Number(e.target.value) : '')}
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.price_max}
              onChange={(e) => handleInputChange('price_max', e.target.value ? Number(e.target.value) : '')}
              className="w-1/2 bg-transparent text-white border-b border-gray-500 focus:border-purple-500 focus:outline-none font-bold placeholder-gray-400 transition-all duration-300 py-2"
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
              <div key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`property-${type.value}`}
                  checked={filters.property_type.includes(type.value)}
                  onChange={() => handleCheckboxChange('property_type', type.value)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`property-${type.value}`} className="text-white text-sm cursor-pointer">
                  {type.label}
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

        {/* Legal Status */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">Legal Status</label>
          <div className="grid grid-cols-1 gap-2">
            {legalStatusOptions.map((status) => (
              <div key={status.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`legal-status-${status.value}`}
                  checked={filters.legal_status.includes(status.value)}
                  onChange={() => handleCheckboxChange('legal_status', status.value)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`legal-status-${status.value}`} className="text-white text-sm cursor-pointer">
                  {status.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* State Classifications */}
        <div className="bg-gray-700/50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/70">
          <label className="text-white font-bold mb-2 block">State Classification</label>
          <div className="grid grid-cols-1 gap-2">
            {stateClassificationOptions.map((classification) => (
              <div key={classification.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`state-classification-${classification.value}`}
                  checked={filters.state_classifications.includes(classification.value)}
                  onChange={() => handleCheckboxChange('state_classifications', classification.value)}
                  className="mr-2 h-4 w-4 accent-purple-500"
                />
                <label htmlFor={`state-classification-${classification.value}`} className="text-white text-sm cursor-pointer">
                  {classification.label}
                </label>
              </div>
            ))}
          </div>
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