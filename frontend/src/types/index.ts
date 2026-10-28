export type Language = 'en' | 'ta' | 'tanglish';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: string;
  created_at: string;
}

export interface StatusHistory {
  id: number;
  from_status?: string;
  to_status: string;
  action_by: string;
  notes?: string;
  created_at: string;
}

export interface EvidenceFile {
  id: number;
  file_name: string;
  original_name: string;
  file_url: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
}

export interface ResolutionVerification {
  id: number;
  is_resolved: boolean;
  citizen_feedback?: string;
  reopen_reason?: string;
  verification_evidence_url?: string;
  verified_at: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  helpline?: string;
}

export interface Complaint {
  id: number;
  complaint_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority_reason?: string;
  classification_method: string;
  classification_confidence: number;
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLUTION_PENDING_VERIFICATION' | 'CLOSED' | 'REOPENED';
  location: string;
  landmark?: string;
  pincode?: string;
  duration?: string;
  language: string;
  citizen_id?: number;
  citizen_name?: string;
  citizen_phone?: string;
  department_id?: number;
  department?: Department;
  assigned_officer?: string;
  resolution_notes?: string;
  resolution_date?: string;
  is_duplicate_flag: boolean;
  related_complaint_id?: string;
  latitude?: number;
  longitude?: number;
  geocoded_address?: string;
  created_at: string;
  updated_at: string;
  status_history: StatusHistory[];
  evidence_files: EvidenceFile[];
  verifications: ResolutionVerification[];
}

export interface ComplaintListItem {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  landmark?: string;
  duration?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  department_name?: string;
  is_citizen_verified: boolean;
}

export interface ComplaintDraftState {
  category?: string;
  subcategory?: string;
  description?: string;
  location?: string;
  landmark?: string;
  duration?: string;
  priority?: string;
  priority_reason?: string;
  language?: string;
  latitude?: number;
  longitude?: number;
  geocoded_address?: string;
  missing_information: string[];
  needs_confirmation: boolean;
  is_ready_to_submit: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface DuplicateMatch {
  complaint_id: string;
  title: string;
  category: string;
  location: string;
  similarity_score: number;
  created_at: string;
}

export interface DuplicateCheckResponse {
  is_duplicate_likely: boolean;
  highest_score: number;
  matches: DuplicateMatch[];
  message: string;
}

export interface GeocodeMatch {
  display_address: string;
  latitude: number;
  longitude: number;
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  category?: string;
  type?: string;
  importance?: number;
  city?: string;
  state?: string;
  postcode?: string;
}

export interface GeocodeResponse {
  query: string;
  provider: string;
  attribution: string;
  matches: GeocodeMatch[];
  message: string;
  status: string;
  from_cache: boolean;
}
