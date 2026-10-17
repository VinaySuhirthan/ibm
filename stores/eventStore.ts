import { create } from 'zustand';
import { CivicEvent } from '../lib/types';
import { EVENTS_FIXTURE } from '../lib/fixtures';

interface EventStoreState {
  events: CivicEvent[];
  selectedEventId: string;
  selectedEvent: CivicEvent;
  filterCategory: string;
  verifiedOnly: boolean;
  searchQuery: string;
  
  setSelectedEvent: (id: string) => void;
  setFilterCategory: (cat: string) => void;
  setVerifiedOnly: (val: boolean) => void;
  setSearchQuery: (q: string) => void;
  
  // Creation Stepper
  creationStep: number;
  setCreationStep: (step: number) => void;
  newEventDraft: Partial<CivicEvent>;
  updateDraft: (data: Partial<CivicEvent>) => void;
  submitEventForVerification: () => void;
  approveEvent: (id: string) => void;
  requestChanges: (id: string, notes: string) => void;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  events: EVENTS_FIXTURE,
  selectedEventId: EVENTS_FIXTURE[0].id,
  selectedEvent: EVENTS_FIXTURE[0],
  filterCategory: 'All',
  verifiedOnly: false,
  searchQuery: '',

  setSelectedEvent: (id: string) => {
    const found = get().events.find(e => e.id === id) || get().events[0];
    set({ selectedEventId: id, selectedEvent: found });
  },

  setFilterCategory: (cat) => set({ filterCategory: cat }),
  setVerifiedOnly: (val) => set({ verifiedOnly: val }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  creationStep: 1,
  setCreationStep: (step) => set({ creationStep: step }),
  newEventDraft: {
    title: '',
    category: 'Civil Rights',
    date: '2026-11-04',
    time: '14:00 — 18:00 IST',
    locationName: 'Ramleela Maidan, New Delhi',
    coordinates: [28.6433, 77.2343],
    organizerName: 'Civic Freedom Coalition',
    organizerRole: 'Coordinator',
    organizerVerified: true,
    expectedAttendance: 25000,
    guidelines: [
      'Staging area open 90 minutes before assembly start',
      'Civil defense monitors wearing visible high-viz vests at all perimeter gates'
    ],
    documents: [
      { name: 'Police NOC Application #8812', type: 'Police NOC', status: 'Pending', uploadedAt: '2026-10-17', refNo: 'NOC-PEND-8812' },
      { name: 'Municipal Assembly Ground Clearance', type: 'Municipal Permit', status: 'Pending', uploadedAt: '2026-10-17', refNo: 'MUN-PERM-442' }
    ]
  },

  updateDraft: (data) =>
    set(state => ({ newEventDraft: { ...state.newEventDraft, ...data } })),

  submitEventForVerification: () => {
    const draft = get().newEventDraft;
    const newId = `ev-${Date.now()}`;
    const newEvent: CivicEvent = {
      id: newId,
      title: draft.title || 'Untitled Civic Assembly',
      slug: (draft.title || 'assembly').toLowerCase().replace(/\s+/g, '-'),
      category: draft.category || 'Civil Rights',
      date: draft.date || '2026-11-10',
      time: draft.time || '10:00 — 16:00 IST',
      locationName: draft.locationName || 'Central Civic Corridor',
      coordinates: draft.coordinates || [28.6271, 77.2166],
      organizerName: draft.organizerName || 'Civic Coordinator',
      organizerRole: draft.organizerRole || 'Event Organizer',
      organizerVerified: true,
      expectedAttendance: draft.expectedAttendance || 5000,
      registeredCount: 1,
      status: 'Submitted',
      authoritiesNotified: ['District Magistrate Office', 'Central Police Traffic Cell'],
      routePoints: [
        { name: 'Assembly Buffer', lat: 28.6235, lng: 77.2140 },
        { name: 'Main Pavilion', lat: 28.6272, lng: 77.2168 }
      ],
      guidelines: draft.guidelines || ['Keep emergency routes accessible at all times.'],
      documents: draft.documents || [],
      liveUpdates: [{ timestamp: 'Just now', author: 'System', message: 'NOC documents successfully lodged with municipal magistrates.' }]
    };

    set(state => ({
      events: [newEvent, ...state.events],
      selectedEventId: newId,
      selectedEvent: newEvent,
      creationStep: 4 // Status outcome step
    }));
  },

  approveEvent: (id) => {
    set(state => ({
      events: state.events.map(e =>
        e.id === id
          ? {
              ...e,
              status: 'Approved',
              verifiedBadgeNumber: `CIVIC-VERIFIED-${Math.floor(100000 + Math.random() * 900000)}`,
              verificationDate: new Date().toISOString().split('T')[0]
            }
          : e
      )
    }));
  },

  requestChanges: (id, notes) => {
    set(state => ({
      events: state.events.map(e =>
        e.id === id
          ? {
              ...e,
              status: 'Changes Requested',
              liveUpdates: [
                { timestamp: 'Just now', author: 'Verification Officer', message: `Action required: ${notes}` },
                ...e.liveUpdates
              ]
            }
          : e
      )
    }));
  }
}));
