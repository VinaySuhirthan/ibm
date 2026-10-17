'use client';

import React, { useState } from 'react';
import {
  IconMesh,
  IconVerifiedSeal
} from '../../../components/icons/BespokeIcons';
import { MESH_PEERS_FIXTURE, OFFLINE_MESSAGES_FIXTURE } from '../../../lib/fixtures';
import { OfflineChatMessage, MeshPeer } from '../../../lib/types';

export default function PublicConnectTab() {
  const [meshActive, setMeshActive] = useState(true);
  const [messages, setMessages] = useState<OfflineChatMessage[]>(OFFLINE_MESSAGES_FIXTURE);
  const [peers] = useState<MeshPeer[]>(MESH_PEERS_FIXTURE);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'broadcast' | 'peers'>('all');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: OfflineChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'You (Citizen-842)',
      senderRole: 'Attendee',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      content: newMessage.trim(),
      status: 'synced',
      hops: 0,
      channel: 'general'
    };

    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const filteredMessages = messages.filter(m => {
    if (activeTab === 'broadcast') return m.channel === 'broadcast';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(20,20,28,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#2E1F73] font-semibold uppercase tracking-wider text-[11px]">
              Resilient Mesh & Peer-to-Peer
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(46,31,115,0.1)] text-[#2E1F73] text-[11px] font-semibold">
              OFFLINE READY
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#14141C] mt-1">
            Connect & Mesh Communications
          </h1>
          <p className="text-body text-[#65636D] mt-1">
            Resilient multi-hop communication that survives cellular network throttling and local internet blackouts.
          </p>
        </div>

        {/* Mesh Status Toggle */}
        <button
          onClick={() => setMeshActive(!meshActive)}
          className={`px-4 py-2 rounded-civic-sm text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
            meshActive
              ? 'bg-[#2E1F73] text-white border-[#2E1F73] shadow-soft'
              : 'bg-[#FFFFFF] text-[#65636D] border-[rgba(20,20,28,0.1)] hover:bg-[#F4F1EA]'
          }`}
        >
          <IconMesh size={16} />
          <span>{meshActive ? 'Mesh Network: ENGAGED' : 'Mesh Standby'}</span>
          <span className={`w-2 h-2 rounded-full ${meshActive ? 'bg-[#3DDC97]' : 'bg-[#65636D]'}`} />
        </button>
      </div>

      {/* Main Grid: Mesh Chat (8 cols) & Peers/Telemetry (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Offline Chat Console (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-[#FFFFFF] rounded-civic border border-[rgba(20,20,28,0.08)] shadow-soft">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-civic-sm text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#2E1F73] text-white'
                  : 'text-[#65636D] hover:bg-[rgba(20,20,28,0.04)]'
              }`}
            >
              Mesh Feed ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-4 py-2 rounded-civic-sm text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'broadcast'
                  ? 'bg-[#2E1F73] text-white'
                  : 'text-[#65636D] hover:bg-[rgba(20,20,28,0.04)]'
              }`}
            >
              Official Broadcasts Only
            </button>
            <button
              onClick={() => setActiveTab('peers')}
              className={`px-4 py-2 rounded-civic-sm text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'peers'
                  ? 'bg-[#2E1F73] text-white'
                  : 'text-[#65636D] hover:bg-[rgba(20,20,28,0.04)]'
              }`}
            >
              Nearby Relays ({peers.length})
            </button>
          </div>

          {activeTab === 'peers' ? (
            /* Peers List View */
            <div className="bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft p-5 flex flex-col gap-3">
              <span className="text-label font-semibold text-[#14141C]">
                Active Peer-to-Peer Bluetooth & Wi-Fi Nodes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="p-4 bg-[#F4F1EA] rounded-civic-sm border border-[rgba(20,20,28,0.06)] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[13px] text-[#14141C] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
                        {peer.name}
                      </span>
                      <span className="text-[11px] font-mono-numbers text-[#65636D]">
                        🔋 {peer.batteryPercent}%
                      </span>
                    </div>
                    <div className="text-[12px] text-[#65636D]">
                      Protocol: {peer.protocol} • {peer.distanceMeters}m away
                    </div>
                    <div className="text-[11px] text-[#65636D] flex items-center justify-between pt-1 border-t border-[rgba(20,20,28,0.06)]">
                      <span>RSSI: {peer.rssiDbm} dBm</span>
                      <span>Hops: {peer.hopCount}</span>
                      <span>Packets: {peer.packetsForwarded}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Container */
            <div className="bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft p-5 flex flex-col h-[480px]">
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3.5">
                {filteredMessages.map((msg) => {
                  const isMe = msg.senderName.startsWith('You');
                  const isOfficial = msg.channel === 'broadcast';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isMe ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-[#65636D]">
                        <span className="font-semibold text-[#14141C]">
                          {msg.senderName}
                        </span>
                        {msg.senderRole && (
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            isOfficial
                              ? 'bg-[rgba(31,157,107,0.1)] text-[#1F9D6B]'
                              : 'bg-[rgba(46,31,115,0.08)] text-[#2E1F73]'
                          }`}>
                            {isOfficial && <IconVerifiedSeal size={10} />}
                            {msg.senderRole}
                          </span>
                        )}
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                        <span>•</span>
                        <span>{msg.hops === 0 ? 'Direct link' : `${msg.hops} mesh hops`}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-civic-sm text-[14px] leading-normal ${
                          isMe
                            ? 'bg-[#2E1F73] text-white rounded-br-xs'
                            : isOfficial
                            ? 'bg-[rgba(31,157,107,0.08)] border border-[rgba(31,157,107,0.25)] text-[#14141C] rounded-bl-xs'
                            : 'bg-[#F4F1EA] text-[#14141C] rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Composer */}
              <form onSubmit={handleSendMessage} className="pt-4 border-t border-[rgba(20,20,28,0.08)] flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={meshActive ? "Broadcast to nearby mesh peers (no internet required)..." : "Enable mesh to broadcast..."}
                  disabled={!meshActive}
                  className="flex-1 px-4 py-2.5 rounded-civic-sm bg-[#F4F1EA] border border-[rgba(20,20,28,0.08)] text-[14px] text-[#14141C] placeholder-[#65636D] focus:outline-none focus:border-[#2E1F73]"
                />
                <button
                  type="submit"
                  disabled={!meshActive || !newMessage.trim()}
                  className="px-5 py-2.5 rounded-civic-sm bg-[#2E1F73] text-white text-[13px] font-semibold hover:bg-[#2E1F73]/90 disabled:opacity-50 cursor-pointer shadow-soft"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Mesh Topology & Quick Stats (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Active Mesh Relays Overview */}
          <div className="p-5 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,20,28,0.08)]">
              <span className="text-label font-semibold text-[#14141C]">
                Mesh Network Status
              </span>
              <span className="text-[12px] text-[#1F9D6B] font-mono-numbers">
                {peers.length} Nodes Active
              </span>
            </div>

            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center justify-between text-[#65636D]">
                <span>Routing Mode:</span>
                <span className="font-semibold text-[#14141C]">Ad-Hoc Multi-Hop</span>
              </div>
              <div className="flex items-center justify-between text-[#65636D]">
                <span>Coverage Radius:</span>
                <span className="font-semibold text-[#14141C]">~450 meters</span>
              </div>
              <div className="flex items-center justify-between text-[#65636D]">
                <span>Encryption Standard:</span>
                <span className="font-semibold text-[#1F9D6B]">Curve25519 E2E</span>
              </div>
            </div>
          </div>

          {/* Privacy & Protocol Guarantee */}
          <div className="p-5 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-2.5 text-[13px] text-[#65636D]">
            <div className="text-label font-semibold text-[#14141C] flex items-center gap-1.5">
              <span>🔐 Zero Cell Tower Dependency</span>
            </div>
            <p className="leading-normal">
              When telecom infrastructure is blocked or jammed, CivicConnect routes emergency text and triage alerts from phone to phone. Messages hop securely without recording phone numbers or device identifiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
