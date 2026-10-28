import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  AlertTriangle, 
  Send, 
  RefreshCw,
  Building2,
  Filter,
  Check,
  Shield,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ComplaintListItem, Department } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const DemoAuthorityPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modal state
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('IN_PROGRESS');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('Er. Senthil Kumar (GCC Field Team)');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const isAuthorized = user && (user.role === 'OFFICER' || user.role === 'DEMO_ADMIN');

  const loadData = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      const [comps, depts] = await Promise.all([
        api.listDemoComplaints(),
        api.getDepartments()
      ]);
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

  // If user is not an officer or demo admin, reject access
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
            {t('demoAccessDeniedDesc')}
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

  const openStatusModal = (complaint: ComplaintListItem) => {
    setSelectedComplaintId(complaint.complaint_id);
    setSuccessMsg('');
    setActionError('');
    if (complaint.status === 'SUBMITTED') {
      setTargetStatus('ASSIGNED');
      setResolutionNote('SIMULATED ACTION: Assigned to zonal maintenance team.');
    } else if (complaint.status === 'ASSIGNED') {
      setTargetStatus('IN_PROGRESS');
      setResolutionNote('SIMULATED ACTION: Field workers deployed on site with repair machinery.');
    } else if (complaint.status === 'IN_PROGRESS' || complaint.status === 'REOPENED') {
      setTargetStatus('RESOLUTION_PENDING_VERIFICATION');
      setResolutionNote('SIMULATED REPORT: Defect repaired on site. Moving to Resolution Pending Citizen Verification.');
    } else {
      setTargetStatus('RESOLUTION_PENDING_VERIFICATION');
      setResolutionNote('SIMULATED ACTION: Work completed. Awaiting citizen verification.');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId) return;

    setIsUpdating(true);
    setActionError('');
    try {
      await api.demoUpdateStatus(selectedComplaintId, {
        status: targetStatus,
        assigned_officer: officerName,
        resolution_notes: resolutionNote,
        note: resolutionNote
      });

      setSuccessMsg(`Status updated to ${targetStatus}!`);
      setTimeout(() => {
        setSelectedComplaintId(null);
        setSuccessMsg('');
      }, 1500);

      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = filterCategory === 'ALL'
    ? complaints
    : complaints.filter(c => c.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-700 text-purple-200 text-xs font-bold uppercase tracking-wider">
                Simulated Demonstration Authority
              </span>
              <span className="text-xs text-purple-300">• Authorized: {user.full_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('demoAuthorityTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-2 max-w-3xl leading-relaxed">
              {t('demoAuthorityDisclaimer')}
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-800 hover:bg-purple-700 text-white rounded-xl text-xs font-bold border border-purple-600 transition-colors self-start md:self-auto flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Registry</span>
          </button>
        </div>
      </div>

      {/* Filter and stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-civic-navy-900">Filter Department:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories ({complaints.length})</option>
            <option value="STREETLIGHT">Streetlight</option>
            <option value="ROAD">Roads</option>
            <option value="GARBAGE">Garbage</option>
            <option value="DRAINAGE">Drainage</option>
            <option value="WATER">Water</option>
            <option value="PUBLIC_PROPERTY">Public Property</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> complaints in civic registry
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tracking ID</th>
                <th className="py-3.5 px-4">Title & Issue</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Logged On</th>
                <th className="py-3.5 px-4 text-right">Simulated Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.complaint_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-civic-navy-900">
                    #{c.complaint_id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 block">{c.title}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{c.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="block">{c.location}</span>
                    {c.landmark && <span className="text-[10px] text-slate-400">Near: {c.landmark}</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} isCitizenVerified={c.is_citizen_verified} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      to={`/track?id=${encodeURIComponent(c.complaint_id)}`}
                      className="px-2.5 py-1 text-slate-600 hover:text-civic-blue-600 font-semibold"
                    >
                      View
                    </Link>

                    {c.status !== 'CLOSED' && (
                      <button
                        onClick={() => openStatusModal(c)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-sm"
                      >
                        {t('advanceStatusBtn')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Transition Modal */}
      {selectedComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-civic-navy-900 mb-1">
              Simulate Authority Status Advance
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Advancing status for grievance <strong>#{selectedComplaintId}</strong>
            </p>

            {successMsg && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ASSIGNED">ASSIGNED (Dispatch to Department)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Machinery & Crew Active)</option>
                  <option value="RESOLUTION_PENDING_VERIFICATION">
                    RESOLUTION_PENDING_VERIFICATION (Complete Field Work)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Field Officer</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resolution Audit Notes / Explanation
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Explain actions taken on site..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaintId(null)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <span>{isUpdating ? 'Updating...' : 'Commit Status Update'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
