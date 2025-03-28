export { default as SearchFilter } from './SearchFilter';
export { default as FilterButton } from './FilterButton';
export { default as FilterDrawer } from './FilterDrawer';
export { default as FilterModal } from './FilterModal';
export { StatusIndicator } from './StatusIndicator';
export { ContactRequestDialog } from './ContactRequestDialog';

// Re-export the FilterState interface for convenience
export interface FilterState {
  // Basic filtering options
  availability: string; // All, Available, Pending Sale
  listingType: string; // All, Single Asset, Asset Pool
  lienPosition: string; // All, 1st, 2nd
  performance: string; // All, Performing, Non-Performing
  
  // Note type filtering
  note_type: string[];
  
  // Price & balance ranges
  original_amount_min: number | '';
  original_amount_max: number | '';
  current_amount_min: number | '';
  current_amount_max: number | '';
  unpaid_balance_min: number | '';
  unpaid_balance_max: number | '';
  price_min: number | '';
  price_max: number | '';
  
  // Property filtering
  property_type: string[];
  property_value_min: number | '';
  property_value_max: number | '';
  
  // Interest & investment ratios
  interest_rate_min: number | '';
  interest_rate_max: number | '';
  investment_to_balance_min: number | '';
  investment_to_balance_max: number | '';
  investment_to_value_min: number | '';
  investment_to_value_max: number | '';
  loan_to_value_min: number | '';
  loan_to_value_max: number | '';
  
  // Maturity & term details
  maturity_date_start: string;
  maturity_date_end: string;
  date_of_note_start: string;
  date_of_note_end: string;
  payments_remaining_min: number | '';
  payments_remaining_max: number | '';
  
  // Location info
  location_state: string;
  location_city: string;
  property_zip_code: string;
  property_county: string;
  
  // Status & legal
  note_status: string[];
  legal_status: string[];
  is_secured: boolean;
  
  // Jurisdiction classification
  state_classifications: string[];
  
  // Additional details
  collateral_type: string;
  loan_term_years_min: number | '';
  loan_term_years_max: number | '';
  loan_term_months: number | '';
  payment_frequency: string;
  amortization_type: string;
  description: string;
}