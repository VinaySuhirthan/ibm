'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconVerifiedSeal,
  IconLiveRoom,
  IconArrowRight
} from '../components/icons/BespokeIcons';

export default function PortalChooserPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#14141C] flex flex-col justify-between selection:bg-[#1F9D6B] selection:text-white font-ui">
      {/* Top Navigation Bar */}
      <header className="border-b border-[rgba(20,20,28,0.08)] bg-[#FFFFFF]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-civic-sm bg-[rgba(31,157,107,0.12)] text-[#1F9D6B] flex items-center justify-center">
              <IconVerifiedSeal size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl text-[#14141C] leading-none tracking-tight font-semibold">
                CivicConnect
              </span>
              <span className="text-[11px] text-[#65636D] mt-0.5 font-ui">
                Civic Safety & Event Verification
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(31,157,107,0.08)] border border-[rgba(31,157,107,0.2)] text-[12px] text-[#1F9D6B] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#1F9D6B] animate-live-dot" />
              <span>Operational Network Active</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        {/* Masthead Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(31,157,107,0.1)] border border-[rgba(31,157,107,0.2)] text-[12px] text-[#1F9D6B] font-semibold mb-2.5">
            <IconVerifiedSeal size={13} />
            <span>Verified Public Assembly Infrastructure</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#14141C] tracking-tight leading-tight">
            Safety, verification, and resilient communication.
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-normal text-[#65636D] mt-2.5 max-w-xl mx-auto">
            A civic-grade platform engineered to prevent crowd crushes, certify constitutional gatherings, and survive network blackouts through peer-to-peer mesh.
          </p>
        </div>

        {/* Two Balanced Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch w-full mb-8">
          {/* CARD 1: Citizen & Organizer Portal */}
          <Link
            href="/app"
            className="group relative bg-[#FFFFFF] border border-[rgba(20,20,28,0.12)] hover:border-[#1F9D6B] rounded-civic-lg p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-soft hover:shadow-elevation h-full"
          >
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(20,20,28,0.08)]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1F9D6B]">
                  Citizen & Organizer Access
                </span>
                <div className="w-8 h-8 rounded-civic-sm bg-[rgba(31,157,107,0.1)] text-[#1F9D6B] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <IconVerifiedSeal size={18} />
                </div>
              </div>

              <div className="mt-4">
                <h2 className="font-display text-2xl font-semibold text-[#14141C] group-hover:text-[#1F9D6B] transition-colors leading-snug">
                  I&apos;m a Citizen or Organizer
                </h2>
                <p className="text-[14px] leading-normal text-[#65636D] mt-2">
                  Discover verified assemblies, monitor real-time crowd safety levels, trigger emergency SOS with nearest triage, and communicate over offline Bluetooth mesh when cell towers drop.
                </p>
              </div>

              <ul className="mt-4 flex flex-col gap-2 text-[13px] text-[#65636D]">
                <li className="flex items-center gap-2">
                  <span className="text-[#1F9D6B] font-bold">✓</span>
                  <span>Discover legally verified events and safe routes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#1F9D6B] font-bold">✓</span>
                  <span>2-second press-and-hold emergency SOS dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#1F9D6B] font-bold">✓</span>
                  <span>Offline Bluetooth & Wi-Fi Direct mesh communication</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(20,20,28,0.08)] flex items-center justify-between">
              <span className="text-label font-semibold text-[#14141C] group-hover:text-[#1F9D6B] transition-colors">
                Enter Citizen Portal
              </span>
              <div className="w-8 h-8 rounded-full bg-[#14141C] group-hover:bg-[#1F9D6B] text-[#FFFFFF] flex items-center justify-center transition-colors">
                <IconArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* CARD 2: Authority & Platform Admin Console */}
          <Link
            href="/admin"
            className="group relative bg-[#0E0E14] border border-[rgba(236,232,225,0.12)] hover:border-[#FF4B1F] rounded-civic-lg p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-soft hover:shadow-elevation text-[#ECE8E1] h-full"
          >
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(236,232,225,0.08)]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FF4B1F]">
                  Authority Operations
                </span>
                <div className="w-8 h-8 rounded-civic-sm bg-[rgba(255,75,31,0.15)] text-[#FF4B1F] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <IconLiveRoom size={18} />
                </div>
              </div>

              <div className="mt-4">
                <h2 className="font-display text-2xl font-semibold text-[#ECE8E1] group-hover:text-[#FF4B1F] transition-colors leading-snug">
                  I&apos;m an Admin or Official
                </h2>
                <p className="text-[14px] leading-normal text-[#8E8D98] mt-2">
                  Supervise aerial drone and CCTV feeds with calibrated 3D depth surfaces, verify event permits and safety clearances, review content flags, and broadcast emergency instructions.
                </p>
              </div>

              <ul className="mt-4 flex flex-col gap-2 text-[13px] text-[#8E8D98]">
                <li className="flex items-center gap-2">
                  <span className="text-[#FF4B1F] font-bold">✓</span>
                  <span>Live Crowd Intelligence Room with 3D Depth Surface</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF4B1F] font-bold">✓</span>
                  <span>Real YOLO detections only (no fabricated metrics)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF4B1F] font-bold">✓</span>
                  <span>Magistrate permit verification queue and audit records</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(236,232,225,0.08)] flex items-center justify-between">
              <span className="text-label font-semibold text-[#ECE8E1] group-hover:text-[#FF4B1F] transition-colors">
                Access Admin Operations
              </span>
              <div className="w-8 h-8 rounded-full bg-[#16161F] group-hover:bg-[#FF4B1F] text-[#ECE8E1] flex items-center justify-center transition-colors">
                <IconArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>

        {/* 4 Supporting Feature Badges */}
        <div className="pt-5 border-t border-[rgba(20,20,28,0.08)] grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
          <div className="p-3 bg-[#FFFFFF] rounded-civic-sm border border-[rgba(20,20,28,0.06)] shadow-soft">
            <div className="text-[13px] font-semibold text-[#14141C] flex items-center gap-1.5 leading-snug">
              <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
              <span>Event Verification</span>
            </div>
            <p className="text-[12px] leading-normal text-[#65636D] mt-1">
              Police & fire NOC review with verified seals.
            </p>
          </div>

          <div className="p-3 bg-[#FFFFFF] rounded-civic-sm border border-[rgba(20,20,28,0.06)] shadow-soft">
            <div className="text-[13px] font-semibold text-[#14141C] flex items-center gap-1.5 leading-snug">
              <span className="w-2 h-2 rounded-full bg-[#FF4B1F]" />
              <span>Crowd Safety AI</span>
            </div>
            <p className="text-[12px] leading-normal text-[#65636D] mt-1">
              Live density heatmaps and chokepoint alerts.
            </p>
          </div>

          <div className="p-3 bg-[#FFFFFF] rounded-civic-sm border border-[rgba(20,20,28,0.06)] shadow-soft">
            <div className="text-[13px] font-semibold text-[#14141C] flex items-center gap-1.5 leading-snug">
              <span className="w-2 h-2 rounded-full bg-[#2E1F73]" />
              <span>Offline Mesh</span>
            </div>
            <p className="text-[12px] leading-normal text-[#65636D] mt-1">
              Bluetooth peer-to-peer when towers blackout.
            </p>
          </div>

          <div className="p-3 bg-[#FFFFFF] rounded-civic-sm border border-[rgba(20,20,28,0.06)] shadow-soft">
            <div className="text-[13px] font-semibold text-[#14141C] flex items-center gap-1.5 leading-snug">
              <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
              <span>Privacy Standard</span>
            </div>
            <p className="text-[12px] leading-normal text-[#65636D] mt-1">
              Zero facial recognition. Anonymous counts only.
            </p>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[rgba(20,20,28,0.08)] bg-[#FFFFFF] py-3.5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 text-label text-[#65636D]">
          <div className="flex items-center gap-2 text-[12px] sm:text-[13px]">
            <span className="font-display font-semibold text-[#14141C]">CivicConnect</span>
            <span>•</span>
            <span>Public Assembly Safety & Resilience Infrastructure</span>
          </div>
          <div className="text-[11px] sm:text-[12px]">
            <span>Zero facial recognition • WCAG AA Compliant • Open Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
