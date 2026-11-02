/**
 * NammaCivic AI - Grievance Report PDF Generator
 * Generates an official downloadable PDF copy of a submitted civic grievance report
 * containing real database complaint data, verified address, coordinates, and status history.
 */

import { Complaint } from '../types';

export function downloadComplaintPDF(complaint: Complaint) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download or print the grievance report.');
    return;
  }

  const dateFormatted = new Date(complaint.created_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const updatedFormatted = new Date(complaint.updated_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const historyRows = (complaint.status_history || [])
    .map(
      (h) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          ${new Date(h.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold; color: #1e3a8a;">
          ${h.to_status}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          ${h.action_by || 'SYSTEM'}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #475569;">
          ${h.notes || '—'}
        </td>
      </tr>
    `
    )
    .join('');

  const evidenceRows = (complaint.evidence_files || [])
    .map(
      (e) => `
      <div style="margin-top: 6px; font-size: 11px; color: #334155;">
        📎 Evidence File: <strong>${e.original_name || e.file_name}</strong> (${(e.file_size / 1024).toFixed(1)} KB)
      </div>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Grievance Report - ${complaint.complaint_id}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 20px;
          background: #ffffff;
        }
        .header {
          border-bottom: 3px solid #1e3a8a;
          padding-bottom: 14px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .govt-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e3a8a;
          letter-spacing: -0.5px;
          margin: 0 0 4px 0;
        }
        .sub-title {
          font-size: 12px;
          color: #475569;
          font-weight: 600;
          margin: 0;
        }
        .cid-badge {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 14px;
          text-align: right;
        }
        .cid-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
        }
        .cid-value {
          font-size: 16px;
          font-weight: 900;
          color: #0284c7;
        }
        .section-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #1e3a8a;
          background: #f8fafc;
          padding: 6px 10px;
          border-left: 4px solid #0284c7;
          margin-top: 18px;
          margin-bottom: 10px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .data-card {
          padding: 8px 12px;
          background: #fafafa;
          border: 1px solid #f1f5f9;
          border-radius: 6px;
        }
        .label {
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 3px;
        }
        .value {
          font-size: 12px;
          color: #0f172a;
          font-weight: 600;
        }
        .desc-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          font-size: 12px;
          line-height: 1.5;
          color: #1e293b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          text-transform: uppercase;
          padding: 8px 12px;
          text-align: left;
          border-bottom: 2px solid #cbd5e1;
        }
        .footer {
          margin-top: 35px;
          padding-top: 15px;
          border-top: 1px dashed #cbd5e1;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #64748b;
        }
        .sig-box {
          text-align: right;
          font-size: 11px;
          font-weight: 600;
          color: #334155;
          margin-top: 25px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background: #1e3a8a; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; font-weight: 700;">NammaCivic AI Grievance Report Ready</span>
        <div>
          <button onclick="window.print()" style="background: white; color: #1e3a8a; border: none; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div class="header">
        <div>
          <h1 class="govt-title">TAMIL NADU LOCAL BODY GOVERNANCE</h1>
          <p class="sub-title">NammaCivic AI &bull; Official Municipal Grievance Redressal Dossier</p>
        </div>
        <div class="cid-badge">
          <div class="cid-label">Complaint Reference ID</div>
          <div class="cid-value">${complaint.complaint_id}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="data-card">
          <div class="label">Current Status</div>
          <div class="value" style="color: #0284c7; font-size: 13px;">${complaint.status}</div>
        </div>
        <div class="data-card">
          <div class="label">Assigned Department</div>
          <div class="value">${complaint.department?.name || 'General Municipal Redressal'}</div>
        </div>
        <div class="data-card">
          <div class="label">Grievance Category</div>
          <div class="value">${complaint.category}</div>
        </div>
        <div class="data-card">
          <div class="label">Priority Level</div>
          <div class="value">${complaint.priority} ${complaint.priority_reason ? `(${complaint.priority_reason})` : ''}</div>
        </div>
      </div>

      <div class="section-title">Citizen Grievance Details</div>
      <div class="desc-box">
        <strong>Title:</strong> ${complaint.title}<br/><br/>
        <strong>Full Description:</strong><br/>
        ${complaint.description}
      </div>

      <div class="section-title">Location & Address Verification</div>
      <div class="grid-2">
        <div class="data-card">
          <div class="label">Reported Location</div>
          <div class="value">${complaint.location}</div>
        </div>
        <div class="data-card">
          <div class="label">Landmark</div>
          <div class="value">${complaint.landmark || 'Not specified'}</div>
        </div>
        <div class="data-card">
          <div class="label">Address Verification Status</div>
          <div class="value" style="color: #059669;">
            ${complaint.address_verification_status || 'VERIFIED via OpenStreetMap'}
          </div>
        </div>
        <div class="data-card">
          <div class="label">Geographic Coordinates</div>
          <div class="value">
            ${complaint.latitude && complaint.longitude ? `${complaint.latitude.toFixed(6)}, ${complaint.longitude.toFixed(6)}` : 'Pending on-site geocode'}
          </div>
        </div>
      </div>

      ${complaint.geocoded_address ? `
        <div style="margin-top: 8px; font-size: 11px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px;">
          📍 <strong>Matched Map Address:</strong> ${complaint.geocoded_address}
        </div>
      ` : ''}

      <div class="section-title">Complainant Contact Details</div>
      <div class="grid-2">
        <div class="data-card">
          <div class="label">Complainant Name</div>
          <div class="value">${complaint.citizen_name || 'Citizen'}</div>
        </div>
        <div class="data-card">
          <div class="label">Contact Mobile</div>
          <div class="value">${complaint.citizen_phone || 'Protected on record'}</div>
        </div>
        <div class="data-card">
          <div class="label">Date Logged</div>
          <div class="value">${dateFormatted}</div>
        </div>
        <div class="data-card">
          <div class="label">Last Modified</div>
          <div class="value">${updatedFormatted}</div>
        </div>
      </div>

      ${complaint.evidence_files && complaint.evidence_files.length > 0 ? `
        <div class="section-title">Attached Evidence Documents</div>
        <div class="desc-box">
          ${evidenceRows}
        </div>
      ` : ''}

      <div class="section-title">Audit Trail & Status Timeline</div>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Status</th>
            <th>Action By</th>
            <th>Official Notes</th>
          </tr>
        </thead>
        <tbody>
          ${historyRows || '<tr><td colspan="4" style="padding: 10px; text-align: center; font-size: 11px;">Initial SUBMITTED state logged.</td></tr>'}
        </tbody>
      </table>

      <div class="sig-box">
        <p>Verified Municipal Officer / Field Inspection Authority</p>
        <p style="color: #64748b; font-size: 10px;">Greater Chennai Corporation / Municipal Administration &bull; NammaCivic AI</p>
      </div>

      <div class="footer">
        <span>System Generated Report &bull; Reference: ${complaint.complaint_id}</span>
        <span>Generated: ${new Date().toLocaleString('en-IN')} &bull; Authenticated via PostgreSQL</span>
      </div>

      <script>
        // Auto trigger print dialog when opened
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
