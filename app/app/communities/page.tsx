'use client';

import React, { useState } from 'react';
import { IconVerifiedSeal } from '../../../components/icons/BespokeIcons';
import { FORUM_POSTS_FIXTURE, CIVIC_POLL_FIXTURE } from '../../../lib/fixtures';
import { CivicPoll } from '../../../lib/types';

export default function PublicCommunitiesTab() {
  const [poll, setPoll] = useState<CivicPoll>(CIVIC_POLL_FIXTURE);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');

  const handleVote = (optionId: string) => {
    if (userVote) return;

    setUserVote(optionId);
    setPoll(prev => ({
      ...prev,
      totalVotes: prev.totalVotes + 1,
      options: prev.options.map(opt =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
  };

  const filteredPosts = FORUM_POSTS_FIXTURE.filter(post => {
    if (filterTag === 'all') return true;
    return post.category.toLowerCase().includes(filterTag.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(20,20,28,0.08)] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label text-[#1F9D6B] font-semibold uppercase tracking-wider text-[11px]">
              Civic Discourse & Assembly Charters
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(31,157,107,0.1)] text-[#1F9D6B] text-[11px] font-semibold">
              COMMUNITY LED
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#14141C] mt-1">
            Communities & Assembly Forums
          </h1>
          <p className="text-body text-[#65636D] mt-1">
            Coordinate peaceful gatherings, vote on route adjustments, and access verified organizer dispatches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Community Forum Posts (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Forum Categories Bar */}
          <div className="flex items-center gap-2 p-2 rounded-civic bg-[#FFFFFF] border border-[rgba(20,20,28,0.08)] shadow-soft overflow-x-auto">
            {['all', 'medical', 'safety', 'legal aid'].map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1.5 rounded-civic-sm text-[13px] font-medium transition-all capitalize cursor-pointer ${
                  filterTag === tag
                    ? 'bg-[#1F9D6B] text-white shadow-soft'
                    : 'text-[#65636D] hover:bg-[rgba(20,20,28,0.04)] hover:text-[#14141C]'
                }`}
              >
                {tag === 'all' ? 'All Discussions' : tag}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-6 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-3 hover:border-[rgba(20,20,28,0.16)] transition-all"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(20,20,28,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] text-[#14141C]">
                      {post.author}
                    </span>
                    {post.authorRole && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[rgba(31,157,107,0.1)] text-[#1F9D6B] text-[11px] font-semibold">
                        <IconVerifiedSeal size={12} />
                        {post.authorRole}
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-[#65636D]">
                    {post.timestamp}
                  </span>
                </div>

                <h3 className="font-display text-xl text-[#14141C] leading-snug">
                  {post.title}
                </h3>
                <p className="text-[14px] text-[#65636D] leading-normal">
                  {post.body}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[rgba(20,20,28,0.06)] text-[13px] text-[#65636D]">
                  <span className="px-2 py-0.5 rounded bg-[#F4F1EA] text-[11px] uppercase font-semibold text-[#65636D]">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-4">
                    <span>💬 {post.repliesCount} responses</span>
                    <span>▲ {post.upvotes} upvotes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Poll & Assembly Charter (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Active Poll Card */}
          <div className="p-6 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(20,20,28,0.08)]">
              <span className="text-label font-semibold text-[#14141C]">
                Active Assembly Poll
              </span>
              <span className="text-[11px] text-[#1F9D6B] font-semibold">{poll.expiresIn}</span>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[15px] font-medium text-[#14141C] leading-snug">
                {poll.question}
              </h4>
              <span className="text-[12px] text-[#65636D]">Organizer: {poll.organizer}</span>

              <div className="flex flex-col gap-2 mt-1">
                {poll.options.map((opt) => {
                  const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                  const isSelected = userVote === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVote(opt.id)}
                      disabled={userVote !== null}
                      className={`relative overflow-hidden p-3 rounded-civic-sm border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1F9D6B] bg-[rgba(31,157,107,0.08)]'
                          : 'border-[rgba(20,20,28,0.08)] bg-[#F4F1EA] hover:bg-[rgba(20,20,28,0.04)]'
                      }`}
                    >
                      {/* Progress fill */}
                      {userVote !== null && (
                        <div
                          className="absolute top-0 bottom-0 left-0 bg-[rgba(31,157,107,0.15)] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between text-[13px]">
                        <span className={`font-medium ${isSelected ? 'text-[#1F9D6B]' : 'text-[#14141C]'}`}>
                          {opt.label} {isSelected && '✓'}
                        </span>
                        {userVote !== null && (
                          <span className="font-mono-numbers font-semibold text-[#14141C]">
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[12px] text-[#65636D] flex items-center justify-between pt-1">
                <span>Total Votes: {poll.totalVotes.toLocaleString('en-US')}</span>
                <span>{userVote ? 'Vote Confirmed' : 'Tap to register vote'}</span>
              </div>
            </div>
          </div>

          {/* Peaceful Assembly Charter */}
          <div className="p-6 bg-[#FFFFFF] rounded-civic-lg border border-[rgba(20,20,28,0.08)] shadow-soft flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[rgba(20,20,28,0.08)]">
              <IconVerifiedSeal size={18} className="text-[#1F9D6B]" />
              <span className="text-label font-semibold text-[#14141C]">
                Peaceful Assembly Charter
              </span>
            </div>

            <p className="text-[13px] text-[#65636D] leading-normal">
              Every gathering hosted on CivicConnect abides by peaceful constitutional principles:
            </p>

            <ul className="flex flex-col gap-2 text-[12px] text-[#65636D]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#1F9D6B] font-bold">1.</span>
                <span>Keep emergency egress ramps unobstructed at all times.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1F9D6B] font-bold">2.</span>
                <span>Zero provocative disinformation or unverified collapse rumors.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#1F9D6B] font-bold">3.</span>
                <span>Prioritize elderly, pregnant, and disabled citizens during egress.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
