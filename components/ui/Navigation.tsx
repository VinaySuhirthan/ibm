'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOpsStore } from '../../stores/opsStore';
import { useCommsStore } from '../../stores/commsStore';
import { IconShieldAlert, IconRadar, IconMeshNetwork, IconVerifiedSeal } from '../icons/BespokeIcons';

export function Navigation() {
  const pathname = usePathname();
  const { emergencyTriggered, riskLevel, riskScore } = useOpsStore();
  const { offlineMeshMode } = useCommsStore();
  const [theme, setTheme] = useState<'ink' | 'paper'>('ink');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'ink' ? 'paper' : 'ink';
    setTheme(nextTheme);
    if (nextTheme === 'paper') {
      document.documentElement.setAttribute('data-theme', 'paper');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const navLinks = [
    { href: '/', label: '01 Story', full: '01 Story & Hero' },
    { href: '/ops', label: '02 Live Ops', full: '02 Live Ops Room', hero: true },
    { href: '/events', label: '03 Events', full: '03 Discovery & Routes' },
    { href: '/create', label: '04 Register / NOC', full: '04 Permission & NOC' },
    { href: '/community', label: '05 Community', full: '05 Civic Forum' },
    { href: '/comms', label: '06 Mesh Comms', full: '06 Mesh Comms' },
    { href: '/safety', label: '07 Safety SOS', full: '07 Triage & SOS' },
    { href: '/admin', label: '08 Admin', full: '08 Admin & Audit' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0F]/90 backdrop-blur-md border-hairline-b select-none">
      {/* Critical Emergency Banner if triggered */}
      {emergencyTriggered && (
        <div className="bg-[#FF4B1F] text-white px-4 py-1.5 flex items-center justify-between text-xs font-mono font-bold tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>[CRITICAL TELEMETRY] FRUIN LEVEL F BREACH IN SECTOR 4 — COMPRESSIVE CHOKEPOINT DETECTED</span>
          </div>
          <Link
            href="/ops"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            VIEW OPS ROOM →
          </Link>
        </div>
      )}

      {/* Main Command Bar */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Masthead */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 border border-[#3DDC97]/60 bg-[#3DDC97]/10 flex items-center justify-center text-[#3DDC97] group-hover:border-[#3DDC97] transition-colors">
              <IconVerifiedSeal size={15} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-display text-lg tracking-tight font-medium text-[#ECE8DF] group-hover:text-white transition-colors">
                CivicConnect
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#8B8A93] -mt-1">
                CIVIC INTELLIGENCE & SAFETY
              </span>
            </div>
          </Link>

          {/* Live Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-hairline-l font-mono text-[11px] text-[#8B8A93]">
            <span className="flex items-center gap-1.5 px-2 py-0.5 border border-hairline bg-[#14141C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B1F] animate-live-pulse" />
              <span className="text-[#ECE8DF] font-semibold">LIVE</span>
            </span>
            <span className="tabular-nums">3 FEEDS ACTIVE</span>
            <span className="text-[#8B8A93]/40">•</span>
            <span className="tabular-nums">RISK: {riskScore}/100</span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 font-mono text-xs">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 transition-all ${
                  isActive
                    ? 'text-[#ECE8DF] bg-[#191924] border-hairline font-semibold'
                    : 'text-[#8B8A93] hover:text-[#ECE8DF] hover:bg-[#14141C]'
                } ${link.hero ? 'border-l-2 border-l-[#FF4B1F]' : ''}`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#FF4B1F]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & Mode Badges */}
        <div className="flex items-center gap-3">
          {/* Offline Mesh Mode Indicator */}
          <Link
            href="/comms"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] uppercase tracking-wider transition-colors ${
              offlineMeshMode
                ? 'border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]'
                : 'border-hairline text-[#8B8A93] hover:text-[#ECE8DF]'
            }`}
          >
            <IconMeshNetwork size={12} />
            <span>{offlineMeshMode ? 'MESH MODE: ACTIVE' : 'MESH READY'}</span>
          </Link>

          {/* SOS Quick Shortcut */}
          <Link
            href="/safety"
            className="flex items-center gap-1.5 px-3 py-1 border border-[#FF4B1F]/60 bg-[#FF4B1F]/10 hover:bg-[#FF4B1F]/20 text-[#FF4B1F] font-mono text-xs font-bold tracking-wider transition-all"
          >
            <IconShieldAlert size={14} />
            <span>SOS</span>
          </Link>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 border border-hairline text-[#8B8A93] hover:text-[#ECE8DF] hover:bg-[#14141C] font-mono text-[10px] transition-colors"
            title="Toggle Broadsheet Theme (Ink / Paper)"
          >
            {theme === 'ink' ? 'PAPER' : 'INK'}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 border border-hairline text-[#ECE8DF]"
            aria-label="Toggle navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-hairline-t bg-[#0A0A0F] p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 font-mono text-xs border ${
                pathname === link.href
                  ? 'border-[#FF4B1F] bg-[#191924] text-white font-semibold'
                  : 'border-hairline text-[#8B8A93]'
              }`}
            >
              {link.full}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
