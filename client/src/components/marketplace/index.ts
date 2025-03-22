export { default as SearchFilter } from './SearchFilter';
export { default as FilterButton } from './FilterButton';
export { default as FilterDrawer } from './FilterDrawer';
export { default as FilterModal } from './FilterModal';

// Re-export the FilterState interface for convenience
export interface FilterState {
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