'use client';

import React, { useState } from 'react';
import { IconVerifiedSeal } from '../../../components/icons/BespokeIcons';
import { EVENTS_FIXTURE } from '../../../lib/fixtures';

export default function AdminReportsPage() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "EventID,Title,Date,PeakAttendance,MaxDensityM2,Incidents,Status\n" +
      EVENTS_FIXTURE.map(e => `${e.id},"${e.title}",${e.date},${e.expectedAttendance},2.4,0,Verified`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `civicconnect_safety_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full font-ui text-[#ECE8E1]">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(236,232,225,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#1F9D6B] font-semibold uppercase tracking-wider text-[11px]">
              Democracy Safety Transparency Ledger
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(31,157,107,0.12)] text-[#1F9D6B] text-[11px] font-semibold">
              PUBLIC RECORD
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#ECE8E1] mt-1">
            Civic Reports & Public Transparency Audit
          </h1>
          <p className="text-body text-[#8E8D98] mt-1">
            Auditable records of assembly attendance, peak crowd densities, incident response times, and statutory privacy compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-civic-sm bg-[#1C1C28] hover:bg-[#232332] text-[13px] font-semibold text-[#ECE8E1] transition-colors cursor-pointer border border-[rgba(236,232,225,0.08)] shadow-soft flex items-center gap-2"
          >
            <span>📥 {downloadSuccess ? 'Downloaded CSV ✓' : 'Export Audit CSV'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft">
          <span className="text-[12px] text-[#8E8D98] block">Audited Assemblies (YTD)</span>
          <span className="font-display text-3xl text-[#ECE8E1] font-mono-numbers mt-1 block">
            148
          </span>
          <span className="text-[12px] text-[#1F9D6B] mt-1 block">100% Peaceful Conclusion</span>
        </div>

        <div className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft">
          <span className="text-[12px] text-[#8E8D98] block">Total Verified Attendees</span>
          <span className="font-display text-3xl text-[#ECE8E1] font-mono-numbers mt-1 block">
            482,900
          </span>
          <span className="text-[12px] text-[#8E8D98] mt-1 block">Aggregate count only</span>
        </div>

        <div className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft">
          <span className="text-[12px] text-[#8E8D98] block">Avg Medical Triage Time</span>
          <span className="font-display text-3xl text-[#22D3EE] font-mono-numbers mt-1 block">
            2.4 min
          </span>
          <span className="text-[12px] text-[#1F9D6B] mt-1 block">0 Crush Incidents</span>
        </div>

        <div className="p-5 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft">
          <span className="text-[12px] text-[#8E8D98] block">Privacy Compliance Score</span>
          <span className="font-display text-3xl text-[#1F9D6B] font-mono-numbers mt-1 block">
            100%
          </span>
          <span className="text-[12px] text-[#8E8D98] mt-1 block">0 Facial Biometrics</span>
        </div>
      </div>

      {/* Assembly Safety Audit Table */}
      <div className="p-6 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(236,232,225,0.08)]">
          <span className="text-label font-semibold text-[#ECE8E1]">
            Recent Assembly Safety Audits
          </span>
          <span className="text-[12px] text-[#8E8D98]">Signed by Municipal Magistrate</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[rgba(236,232,225,0.06)] text-[#8E8D98]">
                <th className="pb-3 font-medium">Event Title</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Headcount</th>
                <th className="pb-3 font-medium">Peak Density</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(236,232,225,0.04)]">
              {EVENTS_FIXTURE.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#1C1C28]/50 transition-colors">
                  <td className="py-3.5 font-medium text-[#ECE8E1]">{ev.title}</td>
                  <td className="py-3.5 text-[#8E8D98]">{ev.date}</td>
                  <td className="py-3.5 text-[#8E8D98]">{ev.locationName}</td>
                  <td className="py-3.5 font-mono-numbers text-[#ECE8E1]">{ev.expectedAttendance.toLocaleString('en-US')}</td>
                  <td className="py-3.5 font-mono-numbers text-[#1F9D6B]">2.15 p/m²</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(31,157,107,0.15)] text-[#1F9D6B] text-[11px] font-semibold">
                      <IconVerifiedSeal size={12} />
                      Compliant
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
