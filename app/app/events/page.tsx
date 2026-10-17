'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconVerifiedSeal,
  IconCalendarEvents,
  IconSafetyShield
} from '../../../components/icons/BespokeIcons';
import { EVENTS_FIXTURE } from '../../../lib/fixtures';
import { CivicEvent } from '../../../lib/types';

export default function PublicEventsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CivicEvent | null>(null);
  const [followedEvents, setFollowedEvents] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All Assemblies' },
    { id: 'rally', label: 'Rallies & Marches' },
    { id: 'cultural', label: 'Cultural & Religious' },
    { id: 'vigil', label: 'Peaceful Vigils' },
    { id: 'sports', label: 'Civic Marathons' }
  ];

  const filteredEvents = EVENTS_FIXTURE.filter((ev) => {
    const matchesCat = selectedCategory === 'all' || ev.category.toLowerCase().includes(selectedCategory);
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleFollow = (id: string) => {
    setFollowedEvents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(20,20,28,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#1F9D6B] font-semibold uppercase tracking-wider text-[11px]">
              Constitutional Public Gatherings
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(31,157,107,0.1)] text-[#1F9D6B] text-[11px] font-semibold">
              VERIFIED INFRASTRUCTURE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#14141C] mt-1">
            Verified Public Events
          </h1>
          <p className="text-body text-[#65636D] mt-1">
            Explore legally verified public assemblies, permitted boundaries, safe corridors, and emergency triage plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/safety"
            className="px-3.5 py-2 rounded-civic-sm bg-[#FF4B1F] text-white text-label font-semibold hover:bg-[#FF4B1F]/90 transition-colors flex items-center gap-1.5 shadow-soft"
          >
            <IconSafetyShield size={16} />
            <span>Safety Checklist</span>
          </Link>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-civic-lg bg-[#FFFFFF] border border-[rgba(20,20,28,0.08)] shadow-soft">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, location, or organizer..."
            className="w-full px-4 py-2.5 rounded-civic-sm bg-[#F4F1EA] border border-[rgba(20,20,28,0.08)] text-[14px] text-[#14141C] placeholder-[#65636D] focus:outline-none focus:border-[#1F9D6B]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-civic-sm text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat.id
                  ? 'bg-[#1F9D6B] text-white shadow-soft'
                  : 'bg-[#F4F1EA] text-[#65636D] hover:bg-[rgba(20,20,28,0.06)] hover:text-[#14141C]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isFollowed = followedEvents[ev.id];
            return (
              <div
                key={ev.id}
                className="p-6 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col justify-between hover:border-[#1F9D6B] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(20,20,28,0.06)] mb-4">
                    <span className="text-[12px] font-semibold text-[#65636D] uppercase">
                      {ev.category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(31,157,107,0.1)] text-[11px] text-[#1F9D6B] font-semibold">
                      <IconVerifiedSeal size={13} />
                      Verified Seal
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-[#14141C] leading-snug">
                    {ev.title}
                  </h3>
                  <p className="text-[14px] text-[#65636D] mt-2 line-clamp-2 leading-normal" suppressHydrationWarning>
                    {ev.guidelines && ev.guidelines.length > 0 ? ev.guidelines.join(' • ') : `Organized by ${ev.organizerName}`}
                  </p>

                  <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-[#14141C] bg-[#F4F1EA] p-3 rounded-civic-sm border border-[rgba(20,20,28,0.04)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#65636D]">Location:</span>
                      <span className="font-medium text-right line-clamp-1">{ev.locationName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#65636D]">Schedule:</span>
                      <span className="font-medium">{ev.date} • {ev.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#65636D]">Capacity:</span>
                      <span className="font-medium font-mono-numbers">{ev.expectedAttendance.toLocaleString('en-US')} pax</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[rgba(20,20,28,0.06)] flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedEvent(ev)}
                    className="text-label text-[#1F9D6B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Route & Permits</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => toggleFollow(ev.id)}
                    className={`px-3 py-1.5 rounded-civic-sm text-[12px] font-semibold transition-colors cursor-pointer border ${isFollowed
                        ? 'bg-[rgba(31,157,107,0.1)] border-[#1F9D6B] text-[#1F9D6B]'
                        : 'bg-[#F4F1EA] border-[rgba(20,20,28,0.08)] text-[#14141C] hover:bg-[rgba(20,20,28,0.04)]'
                      }`}
                  >
                    {isFollowed ? 'Following Updates ✓' : '+ Follow Event'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] text-center text-[#65636D] shadow-soft">
          <IconCalendarEvents size={36} className="mx-auto text-[#65636D]/50 mb-3" />
          <h3 className="font-display text-xl text-[#14141C]">No gatherings found</h3>
          <p className="text-[14px] mt-1 max-w-md mx-auto">
            No verified events match your search query &ldquo;{searchQuery}&rdquo;. Try clearing search filters or checking other sectors.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 px-4 py-2 rounded-civic-sm bg-[#1F9D6B] text-white text-[13px] font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Event Details & Verification Drawer Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] max-w-2xl w-full rounded-civic-lg border border-[rgba(20,20,28,0.12)] shadow-elevation p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[rgba(20,20,28,0.08)]">
              <div>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1F9D6B]">
                  <IconVerifiedSeal size={15} />
                  Verified Magistrate Permit: NOC-2026-DL-882
                </span>
                <h2 className="font-display text-2xl text-[#14141C] mt-1">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full bg-[#F4F1EA] text-[#14141C] flex items-center justify-center hover:bg-[rgba(20,20,28,0.08)] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-body text-[#65636D]">
              {selectedEvent.description || `${selectedEvent.title} is an authorized public gathering coordinated with municipal authorities and field emergency triage teams.`}
            </p>

            {/* Permitted Assembly Route & Safety Details */}
            <div className="bg-[#F4F1EA] p-4 rounded-civic-sm border border-[rgba(20,20,28,0.06)] flex flex-col gap-2.5 text-[14px]">
              <div className="font-semibold text-[#14141C] text-[15px]">
                Authorized Route & Corridor Guidelines
              </div>
              <div className="flex items-center justify-between text-[#65636D]">
                <span>Ingress Point:</span>
                <span className="font-medium text-[#14141C]">North Gate 1 & East Boulevard</span>
              </div>
              <div className="flex items-center justify-between text-[#65636D]">
                <span>Designated Evacuation Corridor:</span>
                <span className="font-medium text-[#1F9D6B]">Pier Ramp 3 (Reserved Clear)</span>
              </div>
              <div className="flex items-center justify-between text-[#65636D]">
                <span>Registered Organizer:</span>
                <span className="font-medium text-[#14141C]">{selectedEvent.organizerName}</span>
              </div>
              <div className="flex items-center justify-between text-[#65636D]">
                <span>Field Medical Post:</span>
                <span className="font-medium text-[#14141C]">Triage Tent Alpha (12 Paramedics)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(20,20,28,0.08)]">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-civic-sm bg-[#F4F1EA] text-[#14141C] text-label font-medium hover:bg-[rgba(20,20,28,0.06)] cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/app/safety"
                className="px-4 py-2 rounded-civic-sm bg-[#1F9D6B] text-white text-label font-semibold hover:bg-[#1F9D6B]/90 shadow-soft"
              >
                Open Field Safety Guide →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
