'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconLiveRoom,
  IconEventReview,
  IconModeration,
  IconBroadcast,
  IconReports,
  IconVerifiedSeal
} from '../../components/icons/BespokeIcons';

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'All Events', icon: IconLiveRoom, exact: true },
    { href: '/admin/events', label: 'Event Review', icon: IconEventReview },
    { href: '/admin/moderation', label: 'Moderation', icon: IconModeration },
    { href: '/admin/broadcast', label: 'Alerts & Broadcast', icon: IconBroadcast },
    { href: '/admin/reports', label: 'Reports', icon: IconReports },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E14] text-[#ECE8E1] flex flex-col md:flex-row font-ui">
      {/* ADMIN DESKTOP SIDEBAR (Visible on md and up) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#16161F] border-r border-[rgba(236,232,225,0.08)] flex-col justify-between p-6 sticky top-0 h-screen overflow-y-auto z-30">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[rgba(236,232,225,0.08)]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-civic-sm bg-[rgba(255,75,31,0.15)] text-[#FF4B1F] flex items-center justify-center">
                <IconVerifiedSeal size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl text-[#ECE8E1] leading-none">
                  CivicConnect
                </span>
                <span className="text-[12px] text-[#8E8D98] mt-0.5">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* 5 Primary Sidebar Items */}
          <nav className="mt-8 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-civic transition-all text-body font-medium ${
                    isActive
                      ? 'bg-[#0E0E14] text-[#ECE8E1] font-semibold border border-[rgba(236,232,225,0.1)]'
                      : 'text-[#8E8D98] hover:bg-[#1C1C28] hover:text-[#ECE8E1]'
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-[#FF4B1F]' : 'text-[#8E8D98]'}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Portal Switch */}
        <div className="pt-6 border-t border-[rgba(236,232,225,0.08)] flex flex-col gap-3">
          <Link
            href="/app"
            className="flex items-center justify-between p-3 rounded-civic bg-[#0E0E14] hover:bg-[#1C1C28] text-label text-[#8E8D98] transition-colors border border-[rgba(236,232,225,0.06)]"
          >
            <span>Switch to Citizen Portal</span>
            <span>→</span>
          </Link>
          <div className="text-[12px] text-[#8E8D98] flex items-center justify-between">
            <span>System: Real Detections Only</span>
            <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
          </div>
        </div>
      </aside>

      {/* ADMIN MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0 overflow-x-hidden">
        {/* Top Operational Status Bar */}
        <header className="bg-[#16161F] border-b border-[rgba(236,232,225,0.08)] px-4 sm:px-6 py-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-civic-sm bg-[rgba(255,75,31,0.15)] text-[#FF4B1F] flex items-center justify-center">
                <IconVerifiedSeal size={16} />
              </div>
              <span className="font-display text-lg text-[#ECE8E1]">CivicConnect</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F9D6B] animate-live-dot" />
              <span className="text-label text-[#ECE8E1] font-medium">
                Civic Operations & Safety Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-label text-[#8E8D98]">
            <Link
              href="/app"
              className="text-[12px] text-[#8E8D98] hover:text-[#ECE8E1] transition-colors md:hidden border border-[rgba(236,232,225,0.1)] px-2.5 py-1 rounded-civic-sm"
            >
              Citizen App →
            </Link>
            <span className="hidden sm:inline">Authority Audit Mode</span>
            <span className="px-2.5 py-1 rounded-civic-sm bg-[#0E0E14] border border-[rgba(236,232,225,0.08)] text-[12px] text-[#1F9D6B]">
              Verified Ledger
            </span>
          </div>
        </header>

        {/* Subpage Viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly on 390px screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#16161F] border-t border-[rgba(236,232,225,0.1)] px-2 py-2 flex items-center justify-around z-50 shadow-elevation">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1 transition-colors ${
                isActive ? 'text-[#FF4B1F]' : 'text-[#8E8D98] hover:text-[#ECE8E1]'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium mt-1 truncate max-w-[64px] text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
