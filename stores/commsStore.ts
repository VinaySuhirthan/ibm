import { create } from 'zustand';
import { MeshPeer, OfflineChatMessage } from '../lib/types';
import { MESH_PEERS_FIXTURE, OFFLINE_MESSAGES_FIXTURE } from '../lib/fixtures';

interface CommsStoreState {
  offlineMeshMode: boolean;
  toggleOfflineMeshMode: () => void;
  peers: MeshPeer[];
  messages: OfflineChatMessage[];
  activeChannel: 'broadcast' | 'medical-team' | 'general';
  setActiveChannel: (channel: 'broadcast' | 'medical-team' | 'general') => void;
  sendMessage: (content: string, senderRole?: string) => void;
  syncQueuedMessages: () => void;
  localQueueCount: number;
}

export const useCommsStore = create<CommsStoreState>((set, get) => ({
  offlineMeshMode: false,
  toggleOfflineMeshMode: () => {
    const next = !get().offlineMeshMode;
    set({ offlineMeshMode: next });
  },

  peers: MESH_PEERS_FIXTURE,
  messages: OFFLINE_MESSAGES_FIXTURE,
  activeChannel: 'broadcast',
  setActiveChannel: (ch) => set({ activeChannel: ch }),

  sendMessage: (content: string, senderRole = 'Field Volunteer') => {
    const isOffline = get().offlineMeshMode;
    const newMessage: OfflineChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'You (Local Terminal)',
      senderRole,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      content,
      status: isOffline ? 'mesh-relaying' : 'synced',
      hops: isOffline ? 1 : 0,
      channel: get().activeChannel
    };

    set(state => ({
      messages: [...state.messages, newMessage],
      localQueueCount: isOffline ? state.localQueueCount + 1 : state.localQueueCount
    }));
  },

  syncQueuedMessages: () => {
    set(state => ({
      messages: state.messages.map(m => ({ ...m, status: 'synced' as const })),
      localQueueCount: 0
    }));
  },

  localQueueCount: 1
}));
