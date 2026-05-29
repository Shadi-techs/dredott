// src/lib/types/property-manager.ts
// Phase 6 - Property Manager Types

export interface PropertyManagerProfile {
  id: string;
  user_id: string;
  manager_name: string;
  commercial_registration: string;
  tax_id: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  subscription_type: 'normal' | 'premium';
  subscription_expires_at: string | null;
  is_verified: boolean;
  hide_dredott_branding: boolean;
  api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManagedProperty {
  id: string;
  manager_id: string;
  property_id: string;
  owner_user_id: string;
  management_fee_percent: number | null;
  management_fee_fixed: number | null;
  fee_type: 'percent' | 'fixed';
  is_active: boolean;
  contract_start_date: string | null;
  contract_end_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  property?: {
    id: string;
    name: string;
    city: string;
    photos: string[];
    price_per_night: number;
    bedrooms?: number;
  };
  owner?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface PropertyFinancials {
  id: string;
  managed_property_id: string;
  period_start: string;
  period_end: string;
  booking_revenue: number;
  electricity_cost: number;
  water_cost: number;
  maintenance_cost: number;
  cleaning_cost: number;
  marketing_cost: number;
  other_expenses: number;
  other_expenses_description: string | null;
  manager_fee: number;
  net_to_owner: number;
  status: 'draft' | 'finalized' | 'paid';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManualBooking {
  id: string;
  managed_property_id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  total_amount: number;
  paid_amount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyExpense {
  id: string;
  managed_property_id: string;
  expense_type: 'electricity' | 'water' | 'maintenance' | 'cleaning' | 'marketing' | 'other';
  amount: number;
  expense_date: string;
  invoice_number: string | null;
  description: string | null;
  receipt_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PropertyManagerSummary {
  manager_id: string;
  user_id: string;
  manager_name: string;
  total_properties: number;
  total_owners: number;
  total_revenue: number;
  total_fees: number;
  total_net_to_owners: number;
}