
export interface PrintSession {
  id: string
  printer_id: string
  session_token: string
  status: string
  expires_at: string
  created_at: string
}

export interface Document {
  id: string
  session_id: string
  original_name: string
  stored_name: string
  file_type: string
  file_size: number
  page_count: number | null
  status: string
  created_at: string
}

export interface PrintOrder {
  id: string
  session_id: string
  document_id: string
  order_number: string
  copies: number
  color_mode: string
  paper_size: string
  orientation: string
  duplex: boolean
  total_amount: string
  status: string
  paper_type: string
  scaling: string
  collation: boolean
  photo_collage: boolean
  created_at: string
  updated_at: string
}

export interface PricingRule {
  id: string
  name: string
  color_mode: string
  paper_size: string
  paper_type: string
  duplex: boolean
  price_per_page: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PricingCalculation {
  order_id: string
  order_number: string
  page_count: number
  copies: number
  price_per_page: string
  total_amount: string
}

export interface Payment {
  id: string
  order_id: string
  provider: string
  provider_order_id: string | null
  provider_payment_id: string | null
  amount: string
  currency: string
  status: string
  created_at: string
  updated_at: string
}
