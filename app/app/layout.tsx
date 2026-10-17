'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHome,
  IconCalendarEvents,
  IconCommunity,
  IconConnect,
  IconSafetyShield,
  IconVerifiedSeal
} from '../../components/icons/BespokeIcons';

export default function PublicPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [activeDistrict, setActiveDistrict] = useState('Central Assembly Sector');

  const navItems = [
    { href: '/app', label: 'Home', icon: IconHome, exact: true },
    { href: '/app/events', label: 'Events', icon: IconCalendarEvents },
    { href: '/app/communities', label: 'Communities', icon: IconCommunity },
    { href: '/app/connect', label: 'Connect', icon: IconConnect },
    { href: '/app/safety', label: 'Safety', icon: IconSafetyShield, emergency: true },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#14141C] flex flex-col md:flex-row font-ui">
      {/* DESKTOP SIDEBAR (Visible on md and up) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between p-6 bg-[#FFFFFF] border-r border-[rgba(20,20,28,0.08)] shadow-soft sticky top-0 h-screen overflow-y-auto z-30">
        <div>
          {/* Header & Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-[rgba(20,20,28,0.08)]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-civic-sm bg-[rgba(31,157,107,0.12)] text-[#1F9D6B] flex items-center justify-center group-hover:scale-105 transition-transform">
                <IconVerifiedSeal size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl text-[#14141C] leading-none">
                  CivicConnect
                </span>
                <span className="text-[11px] text-[#65636D] mt-0.5">
                  Citizen Portal
                </span>
              </div>
            </Link>
          </div>

          {/* 5 Primary Navigation Tabs */}
          <nav className="mt-8 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === '/app'
                : pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-civic transition-all text-body font-medium ${
                    isActive
                      ? item.emergency
                        ? 'bg-[rgba(255,75,31,0.1)] text-[#FF4B1F] font-semibold'
                        : 'bg-[#F4F1EA] text-[#14141C] font-semibold shadow-xs'
                      : 'text-[#65636D] hover:bg-[rgba(20,20,28,0.04)] hover:text-[#14141C]'
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? item.emergency
                          ? 'text-[#FF4B1F]'
                          : 'text-[#1F9D6B]'
                        : 'text-[#65636D]'
                    }
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Switch Portal Link */}
        <div className="pt-6 border-t border-[rgba(20,20,28,0.08)] flex flex-col gap-3">
          <Link
            href="/admin"
            className="flex items-center justify-between p-3 rounded-civic bg-[#F4F1EA] hover:bg-[rgba(20,20,28,0.06)] text-label text-[#65636D] transition-colors border border-[rgba(20,20,28,0.06)]"
          >
            <span>Switch to Admin Console</span>
            <span>→</span>
          </Link>
          <div className="text-[12px] text-[#65636D] flex items-center justify-between">
            <span>Privacy: Aggregate counts</span>
            <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[rgba(20,20,28,0.08)] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-soft">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-civic-sm bg-[rgba(31,157,107,0.12)] text-[#1F9D6B] flex items-center justify-center">
                <IconVerifiedSeal size={18} />
              </div>
              <span className="font-display text-lg text-[#14141C]">
                CivicConnect
              </span>
            </Link>

            {/* District Selector Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F1EA] border border-[rgba(20,20,28,0.08)] text-[13px] text-[#14141C]">
              <span className="w-2 h-2 rounded-full bg-[#1F9D6B] animate-live-dot" />
              <span className="font-medium">District:</span>
              <select
                value={activeDistrict}
                onChange={(e) => setActiveDistrict(e.target.value)}
                className="bg-transparent border-none text-[13px] font-medium text-[#14141C] focus:outline-none cursor-pointer"
              >
                <option value="Central Assembly Sector">Central Assembly Sector</option>
                <option value="North Pier Corridor">North Pier Corridor</option>
                <option value="Old Fort Ground">Old Fort Ground</option>
              </select>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/app/safety"
              className="px-3.5 py-1.5 rounded-civic-sm bg-[#FF4B1F] text-white text-[13px] font-semibold hover:bg-[#FF4B1F]/90 transition-colors flex items-center gap-1.5 shadow-soft"
            >
              <IconSafetyShield size={15} />
              <span>SOS Emergency</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-civic-sm bg-[#FFFFFF] border border-[rgba(20,20,28,0.1)] text-label text-[#14141C] shadow-soft hover:bg-[rgba(20,20,28,0.02)] transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
                <span className="hidden sm:inline">Preferences</span>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.12)] shadow-elevation p-4 z-50 flex flex-col gap-3">
                  <div className="pb-3 border-b border-[rgba(20,20,28,0.08)]">
                    <div className="text-body font-semibold text-[#14141C]">
                      Citizen Preferences
                    </div>
                    <p className="text-[13px] text-[#65636D] mt-0.5">
                      Privacy standards and device permissions
                    </p>
                  </div>

                  {/* Location Sharing Toggle */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="text-label text-[#14141C]">Location Sharing</div>
                      <div className="text-[12px] text-[#65636D]">Only used for nearby triage</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={locationSharing}
                      onChange={(e) => setLocationSharing(e.target.checked)}
                      className="w-4 h-4 accent-[#1F9D6B] cursor-pointer"
                    />
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center justify-between py-1 border-t border-[rgba(20,20,28,0.08)] pt-2">
                    <div className="text-label text-[#14141C]">Language</div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                      className="px-2 py-1 text-[13px] border border-[rgba(20,20,28,0.1)] rounded-civic-sm bg-[#F4F1EA]"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </div>

                  {/* Privacy Guarantee Statement */}
                  <div className="p-2.5 rounded-civic-sm bg-[#F4F1EA] text-[12px] text-[#65636D] leading-normal">
                    🛡️ Strict privacy standard: Zero facial recognition. Detections process aggregate crowd density only.
                  </div>

                  {/* Switch Portal Link */}
                  <div className="pt-2 border-t border-[rgba(20,20,28,0.08)]">
                    <Link
                      href="/admin"
                      className="flex items-center justify-between p-2 rounded-civic-sm bg-[#F4F1EA] hover:bg-[rgba(20,20,28,0.06)] text-[12px] text-[#14141C] font-semibold transition-colors"
                    >
                      <span>Switch to Admin Console</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR (390px Thumb-Friendly Navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[rgba(20,20,28,0.1)] px-3 py-2 flex items-center justify-around z-50 shadow-elevation">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === '/app'
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
                isActive
                  ? item.emergency
                    ? 'text-[#FF4B1F]'
                    : 'text-[#1F9D6B]'
                  : 'text-[#65636D]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[11px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
