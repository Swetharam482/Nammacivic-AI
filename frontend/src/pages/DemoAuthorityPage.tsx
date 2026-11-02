import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2,
  Filter,
  Check,
  Shield,
  ArrowRight,
  Download,
  FileText,
  MapPin,
  User as UserIcon,
  Phone,
  X,
  ExternalLink,
  Layers,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { ComplaintListItem, Complaint, Department } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { downloadComplaintPDF } from '../utils/pdfGenerator';

export const DemoAuthorityPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Full Complaint Report modal state
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Rectified confirmation modal state
  const [showRectifyConfirm, setShowRectifyConfirm] = useState(false);
  const [rectifyNote, setRectifyNote] = useState('Defect inspected and rectified on site by municipal field crew.');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const isAuthorized = user && (user.role === 'OFFICER' || user.role === 'DEMO_ADMIN' || user.role === 'ADMIN');

  const loadData = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      let comps: ComplaintListItem[] = [];
      try {
        comps = await api.listOfficerGrievances();
      } catch (officerErr) {
        comps = await api.listDemoComplaints();
      }
      const depts = await api.getDepartments();
      setComplaints(comps);
      setDepartments(depts);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-civic-navy-900">
            {t('demoAccessDeniedTitle')}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Access forbidden. Only authorized municipal officers can access this dashboard.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="py-3 bg-civic-blue-600 hover:bg-civic-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
            >
              Sign In as Municipal Officer
            </Link>
            <Link
              to="/"
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const openFullReport = async (complaintId: string) => {
    setIsLoadingDetail(true);
    setActionError('');
    setSuccessMsg('');
    try {
      let full: Complaint;
      try {
        full = await api.getOfficerComplaintDetail(complaintId);
      } catch {
        full = await api.getComplaint(complaintId);
      }
      setActiveComplaint(full);
    } catch (err: any) {
      alert(`Could not load full report details: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleRectifiedSubmit = async () => {
    if (!activeComplaint) return;
    setIsUpdating(true);
    setActionError('');
    try {
      const officerDisplayName = user ? `${user.full_name} (Municipal Officer)` : 'Municipal Authority';
      
      let updated: Complaint;
      try {
        updated = await api.updateOfficerGrievanceStatus(activeComplaint.complaint_id, {
          status: 'RESOLUTION_PENDING_VERIFICATION',
          assigned_officer: officerDisplayName,
          resolution_notes: rectifyNote,
          note: rectifyNote
        });
      } catch {
        updated = await api.demoUpdateStatus(activeComplaint.complaint_id, {
          status: 'RESOLUTION_PENDING_VERIFICATION',
          assigned_officer: officerDisplayName,
          resolution_notes: rectifyNote,
          note: rectifyNote
        });
      }

      setActiveComplaint(updated);
      setSuccessMsg('Grievance marked as RECTIFIED! Status updated to RESOLUTION_PENDING_VERIFICATION.');
      setShowRectifyConfirm(false);
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update resolution status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchCat = filterCategory === 'ALL' || c.category === filterCategory;
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchCat && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Officer Header */}
      <div className="bg-gradient-to-r from-civic-navy-900 via-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-700/80 text-blue-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Municipal Authority Dashboard</span>
              </span>
              <span className="text-xs text-blue-200">&bull; Officer: {user?.full_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Grievance Redressal Officer Portal
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-3xl leading-relaxed">
              Review genuine grievances submitted by citizens, inspect verified map addresses, update resolution status upon field completion, and download official PDF dossiers.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 self-start md:self-auto transition-all"
          >
            <span>Refresh Registry</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Filter By:</span>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD_DAMAGE">Road Damage</option>
            <option value="ROAD">Roads</option>
            <option value="STREETLIGHT">Streetlight</option>
            <option value="GARBAGE">Garbage</option>
            <option value="DRAINAGE">Drainage</option>
            <option value="SEWAGE">Sewage</option>
            <option value="WATER_SHORTAGE">Water Supply</option>
            <option value="WATER_LEAK">Water Leakage</option>
            <option value="PUBLIC_PROPERTY">Public Property</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLUTION_PENDING_VERIFICATION">RESOLUTION_PENDING_VERIFICATION</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> complaints in registry
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Complaint ID</th>
                <th className="py-3.5 px-4">Complaint Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Submission Date</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No complaints match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr 
                    key={c.complaint_id} 
                    onClick={() => openFullReport(c.complaint_id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-civic-blue-700">
                      {c.complaint_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.department_name || 'Municipal Works'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                      {c.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} isCitizenVerified={c.is_citizen_verified} />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openFullReport(c.complaint_id)}
                        className="px-3 py-1.5 bg-civic-blue-600 hover:bg-civic-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Report</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Complaint Report Modal (Scrollable, with RECTIFIED and DOWNLOAD COPY buttons) */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  Official Grievance Dossier &bull; {activeComplaint.complaint_id}
                </h3>
              </div>
              <button
                onClick={() => setActiveComplaint(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Report Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm flex-1">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {actionError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Status & Priority Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Current Redressal Status
                  </span>
                  <StatusBadge status={activeComplaint.status} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Priority & Urgency
                  </span>
                  <span className="font-bold text-slate-800">
                    {activeComplaint.priority} {activeComplaint.priority_reason ? `(${activeComplaint.priority_reason})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Assigned Department
                  </span>
                  <span className="font-bold text-civic-blue-700">
                    {activeComplaint.department?.name || 'Municipal Works Department'}
                  </span>
                </div>
              </div>

              {/* Citizen & Submission Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-xs">
                    <UserIcon className="w-4 h-4 text-civic-blue-600" />
                    <span>Complainant Details</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><strong>Name:</strong> {activeComplaint.citizen_name || 'Citizen'}</p>
                    <p><strong>Mobile:</strong> {activeComplaint.citizen_phone || 'Protected on record'}</p>
                    <p><strong>Language:</strong> {activeComplaint.language || 'English'}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-xs">
                    <Calendar className="w-4 h-4 text-civic-blue-600" />
                    <span>Submission Timestamps</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><strong>Submitted:</strong> {new Date(activeComplaint.created_at).toLocaleString('en-IN')}</p>
                    <p><strong>Last Updated:</strong> {new Date(activeComplaint.updated_at).toLocaleString('en-IN')}</p>
                    <p><strong>Persistence:</strong> {activeComplaint.duration || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Complaint Title & Description */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Grievance Description
                </span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-civic-navy-900 text-sm">
                    {activeComplaint.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {activeComplaint.description}
                  </p>
                </div>
              </div>

              {/* Verified Location & Map Details */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Verified Location & Map Coordinates
                </span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block">Reported Address</span>
                      <span className="text-slate-800 font-medium">{activeComplaint.location}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">Landmark</span>
                      <span className="text-slate-800 font-medium">{activeComplaint.landmark || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">Verification Status</span>
                      <span className="font-bold text-emerald-600">
                        {activeComplaint.address_verification_status || 'VERIFIED'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">Coordinates</span>
                      <span className="font-mono text-slate-700">
                        {activeComplaint.latitude && activeComplaint.longitude
                          ? `${activeComplaint.latitude.toFixed(6)}, ${activeComplaint.longitude.toFixed(6)}`
                          : 'Pending on-site geocode'}
                      </span>
                    </div>
                  </div>

                  {activeComplaint.geocoded_address && (
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600">
                      📍 <strong>Map Match:</strong> {activeComplaint.geocoded_address}
                    </div>
                  )}

                  {activeComplaint.latitude && activeComplaint.longitude && (
                    <div className="pt-1">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${activeComplaint.latitude}&mlon=${activeComplaint.longitude}#map=17/${activeComplaint.latitude}/${activeComplaint.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-civic-blue-600 hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Open on OpenStreetMap</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Status History Audit Trail */}
              {activeComplaint.status_history && activeComplaint.status_history.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status History & Officer Notes
                  </span>
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                    {activeComplaint.status_history.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs border-b border-slate-200/60 pb-2.5 last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-civic-blue-600 mt-1.5"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-civic-navy-900">{h.to_status}</span>
                            <span className="text-slate-400 text-[10px]">
                              {new Date(h.created_at).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs mt-0.5">{h.notes || 'Status updated.'}</p>
                          <span className="text-[10px] text-slate-400 font-medium">By: {h.action_by || 'OFFICER'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons at the Bottom of Full Report: RECTIFIED and DOWNLOAD COPY */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveComplaint(null)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Close Report
              </button>

              <div className="flex items-center gap-3">
                {/* 1. RECTIFIED BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowRectifyConfirm(true)}
                  disabled={activeComplaint.status === 'RESOLUTION_PENDING_VERIFICATION' || activeComplaint.status === 'CLOSED'}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeComplaint.status === 'RESOLUTION_PENDING_VERIFICATION' || activeComplaint.status === 'CLOSED'
                      ? 'Already Rectified'
                      : 'Rectified'}
                  </span>
                </button>

                {/* 2. DOWNLOAD COPY BUTTON */}
                <button
                  type="button"
                  onClick={() => downloadComplaintPDF(activeComplaint)}
                  className="px-5 py-2.5 bg-civic-navy-900 hover:bg-civic-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Copy (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for RECTIFIED */}
      {showRectifyConfirm && activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-civic-navy-900">
                  Confirm Grievance Rectification
                </h3>
                <p className="text-[11px] text-slate-500">
                  Complaint ID: {activeComplaint.complaint_id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure the required repair or maintenance work has been completed on site?
              This will update the complaint status to <strong>RESOLUTION_PENDING_VERIFICATION</strong> and log your officer credentials and timestamp in PostgreSQL.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Field Inspection / Rectification Note
              </label>
              <textarea
                value={rectifyNote}
                onChange={(e) => setRectifyNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRectifyConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRectifiedSubmit}
                disabled={isUpdating}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5"
              >
                <span>{isUpdating ? 'Committing...' : 'Confirm Rectified'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
