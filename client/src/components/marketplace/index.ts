export { default as SearchFilter } from './SearchFilter';
export { default as FilterButton } from './FilterButton';
export { default as FilterDrawer } from './FilterDrawer';
export { default as FilterModal } from './FilterModal';
export { StatusIndicator } from './StatusIndicator';
export { default as ContactRequestDialog } from './ContactRequestDialog';
export { default as NoteDetailModal } from './NoteDetailModal';

// Re-export the FilterState interface for convenience
export interface FilterState {
  // Basic filtering options
  availability: string;
  listingType: string;
  lienPosition: string;
  performance: string;

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

  // Dates
  maturity_date_start: string;
  maturity_date_end: string;
  date_of_note_start: string;
  date_of_note_end: string;

  // Payment details
  payments_remaining_min: string | '';
  payments_remaining_max: string | '';
  payment_frequency: string;
  amortization_type: string;

  // Location info
  location_state: string;
  location_city: string;
  property_zip_code: string;
  property_county: string;

  // Status & legal
  note_status: string[];
  legal_status: string[];
  state_classifications: string[];
  is_secured: boolean;

  // Loan details
  collateral_type: string;
  loan_term_years_min: number | '';
  loan_term_years_max: number | '';
  loan_term_months: number | '';

  // Additional details
  description: string;

  // Notification preferences
  emailNotify?: boolean;
}