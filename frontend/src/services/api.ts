import { 
  Complaint, 
  ComplaintListItem, 
  ComplaintDraftState, 
  Department, 
  User, 
  DuplicateCheckResponse,
  GeocodeResponse,
  AddressVerifyResponse,
  AddressSuggestionResponse,
  ReverseGeocodeResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse
} from '../types';

const API_BASE = '/api/v1';

async function smartFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const fullPath = url.startsWith('/') ? url : `/${url}`;
  try {
    const res = await fetch(fullPath, init);
    if ((res.status === 502 || res.status === 504) && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return await fetch(`http://127.0.0.1:8000${fullPath}`, init);
    }
    return res;
  } catch (netErr) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return await fetch(`http://127.0.0.1:8000${fullPath}`, init);
    }
    throw netErr;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('nammacivic_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(data: { email: string; full_name: string; phone_number?: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to register account');
    }
    return res.json() as Promise<{ access_token: string; user: User }>;
  },

  async login(data: { email: string; password: string }) {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      throw new Error('Cannot connect to backend server. Please verify FastAPI is running on port 8000.');
    }

    if (!res.ok) {
      if (res.status === 502 || res.status === 504) {
        throw new Error('Backend server is not reachable on port 8000. Please start the backend.');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Incorrect password. Please try again.');
    }
    return res.json() as Promise<{ access_token: string; user: User }>;
  },

  async getMe(): Promise<User | null> {
    const token = localStorage.getItem('nammacivic_token');
    if (!token) return null;
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      localStorage.removeItem('nammacivic_token');
      return null;
    }
    return res.json();
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to request password reset');
    }
    return res.json();
  },

  async resetPassword(data: { token: string; new_password: string }): Promise<ResetPasswordResponse> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to reset password');
    }
    return res.json();
  },

  // OpenStreetMap Nominatim Geocoding (Free, No Google Maps API key required)
  async searchAddress(address: string, countryCode: string = 'in'): Promise<GeocodeResponse> {
    const url = new URL(`${window.location.origin}${API_BASE}/geocoding/search`);
    url.searchParams.set('q', address);
    if (countryCode) url.searchParams.set('country_code', countryCode);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        return {
          query: address,
          provider: 'OpenStreetMap Nominatim',
          attribution: 'Location data © OpenStreetMap contributors (ODbL 1.0)',
          matches: [],
          message: 'Unable to reach location service. You can proceed with your entered address.',
          status: 'service_unavailable',
          from_cache: false
        };
      }
      return res.json();
    } catch (e: any) {
      return {
        query: address,
        provider: 'OpenStreetMap Nominatim',
        attribution: 'Location data © OpenStreetMap contributors (ODbL 1.0)',
        matches: [],
        message: 'Network error contacting geocoding service. You can continue submitting your complaint.',
        status: 'service_unavailable',
        from_cache: false
      };
    }
  },

  async verifyAddress(
    params: string | {
      address?: string;
      landmark?: string;
      door_number?: string;
      street_name?: string;
      area_locality?: string;
      city_town?: string;
      district?: string;
      state?: string;
      country?: string;
    }, 
    landmark?: string
  ): Promise<AddressVerifyResponse> {
    const payload = typeof params === 'string' 
      ? { address: params, landmark }
      : { ...params, landmark: params.landmark || landmark };

    const res = await smartFetch(`${API_BASE}/address/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to verify address');
    }
    return res.json();
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResponse> {
    const res = await smartFetch(`${API_BASE}/address/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude })
    });
    if (!res.ok) {
      return {
        formatted_address: `Pinned Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
        display_address: `Pinned Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
        latitude,
        longitude
      };
    }
    return res.json();
  },

  async getAddressSuggestions(query: string): Promise<AddressSuggestionResponse> {
    const res = await smartFetch(`${API_BASE}/address/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) {
      return { query, suggestions: [], message: 'Could not fetch suggestions' };
    }
    return res.json();
  },

  // AI Chat
  async sendChatMessage(message: string, sessionId?: string, language: string = 'auto') {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ message, session_id: sessionId, language })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to process AI chat message');
    }
    return res.json() as Promise<{
      session_id: string;
      reply: string;
      draft: ComplaintDraftState;
      detected_language: string;
      is_summary_ready: boolean;
      should_read_aloud: boolean;
    }>;
  },

  async resetChatSession(sessionId: string) {
    const res = await fetch(`${API_BASE}/chat/${sessionId}/reset`, {
      method: 'POST'
    });
    return res.json();
  },

  async confirmChatbotSubmission(data: {
    session_id: string;
    latitude?: number;
    longitude?: number;
    geocoded_address?: string;
    address_verification_status?: string;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/chat/confirm-submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to confirm grievance submission');
    }
    return res.json();
  },

  // Complaints
  async submitComplaint(data: {
    title?: string;
    description: string;
    category: string;
    subcategory?: string;
    priority?: string;
    priority_reason?: string;
    location: string;
    landmark?: string;
    pincode?: string;
    duration?: string;
    citizen_name?: string;
    citizen_phone?: string;
    language?: string;
    latitude?: number;
    longitude?: number;
    geocoded_address?: string;
    address_verification_status?: string;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/grievances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit complaint');
    }
    return res.json();
  },

  async listComplaints(params?: {
    category?: string;
    status?: string;
    search?: string;
    my_only?: boolean;
  }): Promise<ComplaintListItem[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/grievances`);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.my_only) url.searchParams.set('my_only', 'true');

    const res = await fetch(url.toString(), {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch complaints');
    }
    return res.json();
  },

  async getComplaint(idOrCid: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/grievances/${encodeURIComponent(idOrCid)}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Complaint '${idOrCid}' not found`);
    }
    return res.json();
  },

  async uploadEvidence(complaintId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/grievances/${encodeURIComponent(complaintId)}/evidence`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload evidence');
    }
    return res.json();
  },

  async verifyResolution(
    complaintId: string, 
    data: { is_resolved: boolean; citizen_feedback?: string; reopen_reason?: string; verification_evidence_url?: string }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/grievances/${encodeURIComponent(complaintId)}/verify-resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit verification');
    }
    return res.json();
  },

  async checkDuplicates(params: {
    category: string;
    description: string;
    location: string;
    landmark?: string;
  }): Promise<DuplicateCheckResponse> {
    const url = new URL(`${window.location.origin}${API_BASE}/grievances/check-duplicates`);
    url.searchParams.set('category', params.category);
    url.searchParams.set('description', params.description);
    url.searchParams.set('location', params.location);
    if (params.landmark) url.searchParams.set('landmark', params.landmark);

    const res = await fetch(url.toString(), {
      method: 'POST'
    });
    return res.json();
  },

  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) return [];
    return res.json();
  },

  // Demo Authority simulation
  async listDemoComplaints(): Promise<ComplaintListItem[]> {
    const res = await fetch(`${API_BASE}/demo/complaints`);
    if (!res.ok) return [];
    return res.json();
  },

  async demoUpdateStatus(complaintId: string, data: {
    status: string;
    department_id?: number;
    assigned_officer?: string;
    resolution_notes?: string;
    note?: string;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/demo/complaints/${encodeURIComponent(complaintId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update demo status');
    }
    return res.json();
  },

  // Municipal Officer Dashboard APIs
  async listOfficerGrievances(params?: {
    category?: string;
    department_id?: number;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ComplaintListItem[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/officer/grievances`);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.department_id) url.searchParams.set('department_id', String(params.department_id));
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    if (params?.offset) url.searchParams.set('offset', String(params.offset));

    const res = await fetch(url.toString(), {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch officer grievances');
    }
    return res.json();
  },

  async getOfficerGrievance(complaintId: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/officer/grievances/${encodeURIComponent(complaintId)}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Grievance '${complaintId}' not found`);
    }
    return res.json();
  },

  async getOfficerComplaintDetail(complaintId: string): Promise<Complaint> {
    return this.getOfficerGrievance(complaintId);
  },

  async updateOfficerGrievanceStatus(
    complaintId: string,
    data: {
      status: string;
      department_id?: number;
      assigned_officer?: string;
      internal_notes?: string;
      resolution_notes?: string;
      note?: string;
    }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/officer/grievances/${encodeURIComponent(complaintId)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update grievance status');
    }
    return res.json();
  }
};
