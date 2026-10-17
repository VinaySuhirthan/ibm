'use client';

import React, { useState } from 'react';
import { IconVerifiedSeal } from '../../../components/icons/BespokeIcons';
import { EVENTS_FIXTURE } from '../../../lib/fixtures';
import { CivicEvent } from '../../../lib/types';

export default function AdminEventsReviewPage() {
  const [eventsList, setEventsList] = useState<CivicEvent[]>(EVENTS_FIXTURE);
  const [selectedEvent, setSelectedEvent] = useState<CivicEvent | null>(EVENTS_FIXTURE[0]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Review' | 'Approved'>('all');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setEventsList(prev =>
      prev.map(ev => ev.id === id ? { ...ev, status: 'Approved' as const } : ev)
    );
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent({ ...selectedEvent, status: 'Approved' });
    }
    setNotification(`Seal Issued: Event #${id} approved under Magistrate Order.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRequestChanges = (id: string) => {
    if (!decisionNotes.trim()) {
      alert('Please specify the required changes in the decision notes.');
      return;
    }
    setEventsList(prev =>
      prev.map(ev => ev.id === id ? { ...ev, status: 'Changes Requested' as const } : ev)
    );
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent({ ...selectedEvent, status: 'Changes Requested' });
    }
    setNotification(`Revision Request Sent to Organizer for Event #${id}.`);
    setDecisionNotes('');
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredEvents = eventsList.filter(ev => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'In Review') return ev.status === 'In Review';
    if (statusFilter === 'Approved') return ev.status === 'Approved';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full font-ui text-[#ECE8E1]">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(236,232,225,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#1F9D6B] font-semibold uppercase tracking-wider text-[11px]">
              Statutory Compliance & Legal Clearances
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(31,157,107,0.12)] text-[#1F9D6B] text-[11px] font-semibold">
              MAGISTRATE DESK
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#ECE8E1] mt-1">
            Event Verification Queue
          </h1>
          <p className="text-body text-[#8E8D98] mt-1">
            Audit proposed assembly corridors, verify Police & Fire safety NOCs, and issue tamper-evident Verified Seals.
          </p>
        </div>

        {notification && (
          <div className="px-4 py-2 rounded-civic-sm bg-[rgba(31,157,107,0.15)] border border-[#1F9D6B] text-[#1F9D6B] text-[13px] font-semibold animate-stamp">
            {notification}
          </div>
        )}
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Events Queue List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-[#16161F] rounded-civic border border-[rgba(236,232,225,0.08)]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-civic-sm text-[12px] font-medium transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#1C1C28] text-[#ECE8E1] font-semibold'
                  : 'text-[#8E8D98] hover:text-[#ECE8E1]'
              }`}
            >
              All Events ({eventsList.length})
            </button>
            <button
              onClick={() => setStatusFilter('Approved')}
              className={`px-3 py-1.5 rounded-civic-sm text-[12px] font-medium transition-all cursor-pointer ${
                statusFilter === 'Approved'
                  ? 'bg-[#1C1C28] text-[#1F9D6B] font-semibold'
                  : 'text-[#8E8D98] hover:text-[#ECE8E1]'
              }`}
            >
              Approved ({eventsList.filter(e => e.status === 'Approved').length})
            </button>
            <button
              onClick={() => setStatusFilter('In Review')}
              className={`px-3 py-1.5 rounded-civic-sm text-[12px] font-medium transition-all cursor-pointer ${
                statusFilter === 'In Review'
                  ? 'bg-[#1C1C28] text-[#D97706] font-semibold'
                  : 'text-[#8E8D98] hover:text-[#ECE8E1]'
              }`}
            >
              Pending NOC ({eventsList.filter(e => e.status === 'In Review').length})
            </button>
          </div>

          {/* Events List */}
          <div className="flex flex-col gap-3">
            {filteredEvents.map((ev) => {
              const isSelected = selectedEvent?.id === ev.id;
              const isApproved = ev.status === 'Approved';
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`p-4 rounded-civic-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-[#1C1C28] border-[#1F9D6B] shadow-soft'
                      : 'bg-[#16161F] border-[rgba(236,232,225,0.08)] hover:bg-[#1C1C28]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase text-[#8E8D98]">
                      {ev.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      isApproved
                        ? 'bg-[rgba(31,157,107,0.15)] text-[#1F9D6B]'
                        : 'bg-[rgba(217,119,6,0.15)] text-[#D97706]'
                    }`}>
                      {isApproved ? 'APPROVED SEAL' : ev.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-display text-lg text-[#ECE8E1] leading-snug">
                    {ev.title}
                  </h3>

                  <div className="flex items-center justify-between text-[12px] text-[#8E8D98] mt-1">
                    <span>{ev.locationName}</span>
                    <span className="font-mono-numbers">{ev.expectedAttendance.toLocaleString('en-US')} pax</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Document Inspector & Decision Workbench (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {selectedEvent ? (
            <div className="p-6 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] shadow-soft flex flex-col gap-5">
              <div className="flex items-start justify-between pb-4 border-b border-[rgba(236,232,225,0.08)]">
                <div>
                  <span className="text-[12px] font-mono-numbers text-[#8E8D98]">
                    APPLICATION ID: #EVT-{selectedEvent.id}
                  </span>
                  <h2 className="font-display text-2xl text-[#ECE8E1] mt-1">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-[13px] text-[#8E8D98] mt-1">
                    Organizer: {selectedEvent.organizerName} • Target Date: {selectedEvent.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedEvent.status === 'Approved' ? (
                    <span className="px-3 py-1 rounded-full bg-[rgba(31,157,107,0.15)] text-[#1F9D6B] text-[12px] font-semibold flex items-center gap-1">
                      <IconVerifiedSeal size={14} />
                      Seal Issued
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[rgba(217,119,6,0.15)] text-[#D97706] text-[12px] font-semibold">
                      {selectedEvent.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Submitted Documents & Clearances */}
              <div className="flex flex-col gap-3">
                <span className="text-label font-semibold text-[#ECE8E1]">
                  Submitted Statutory Clearances
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#ECE8E1]">Police NOC Clearance</span>
                      <span className="text-[#1F9D6B]">VERIFIED ✓</span>
                    </div>
                    <span className="text-[11px] text-[#8E8D98]">Doc: NOC-POL-2026-88.pdf (2.4 MB)</span>
                  </div>

                  <div className="p-3.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#ECE8E1]">Fire Safety Inspection</span>
                      <span className="text-[#1F9D6B]">VERIFIED ✓</span>
                    </div>
                    <span className="text-[11px] text-[#8E8D98]">Doc: FIRE-CERT-902.pdf (1.8 MB)</span>
                  </div>

                  <div className="p-3.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#ECE8E1]">Paramedic Triage Plan</span>
                      <span className="text-[#1F9D6B]">VERIFIED ✓</span>
                    </div>
                    <span className="text-[11px] text-[#8E8D98]">4 Field Tents allocated</span>
                  </div>

                  <div className="p-3.5 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#ECE8E1]">Route Egress Corridor</span>
                      <span className="text-[#22D3EE]">CLEAR 12M</span>
                    </div>
                    <span className="text-[11px] text-[#8E8D98]">Pier Ramp reserved open</span>
                  </div>
                </div>
              </div>

              {/* Event Description & Guidelines */}
              <div className="p-4 bg-[#0E0E14] rounded-civic-sm border border-[rgba(236,232,225,0.06)] flex flex-col gap-1.5 text-[13px]">
                <span className="font-semibold text-[#ECE8E1]">Assembly Route Points & Guidelines</span>
                <p className="text-[#8E8D98] leading-normal">
                  {selectedEvent.guidelines && selectedEvent.guidelines.length > 0
                    ? selectedEvent.guidelines.join(' • ')
                    : selectedEvent.title}
                </p>
                {selectedEvent.routePoints && selectedEvent.routePoints.length > 0 && (
                  <div className="text-[12px] text-[#22D3EE] mt-1">
                    Route Waypoints: {selectedEvent.routePoints.map(p => p.name).join(' → ')}
                  </div>
                )}
              </div>

              {/* Action Decision Form */}
              <div className="pt-3 border-t border-[rgba(236,232,225,0.08)] flex flex-col gap-3">
                <span className="text-label font-semibold text-[#ECE8E1]">
                  Magistrate Decision Workbench
                </span>

                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Enter condition notes or required adjustments (e.g. Ensure sound levels below 65dB after 20:00)..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.1)] text-[13px] text-[#ECE8E1] placeholder-[#8E8D98] focus:outline-none focus:border-[#1F9D6B]"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleRequestChanges(selectedEvent.id)}
                    className="px-4 py-2 rounded-civic-sm bg-[#1C1C28] hover:bg-[#232332] text-[13px] text-[#D97706] font-semibold transition-colors cursor-pointer border border-[rgba(217,119,6,0.2)]"
                  >
                    Request Route Changes
                  </button>

                  <button
                    onClick={() => handleApprove(selectedEvent.id)}
                    className="px-5 py-2 rounded-civic-sm bg-[#1F9D6B] hover:bg-[#1F9D6B]/90 text-white text-[13px] font-semibold transition-colors cursor-pointer shadow-soft flex items-center gap-1.5"
                  >
                    <IconVerifiedSeal size={15} />
                    <span>Issue Verified Seal</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-[#16161F] rounded-civic-lg border border-[rgba(236,232,225,0.08)] text-center text-[#8E8D98]">
              Select an event from the queue to inspect permits and take official action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
