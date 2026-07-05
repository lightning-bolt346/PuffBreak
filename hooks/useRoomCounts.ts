'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

type RoomId = 'office' | 'beach' | 'space' | 'library' | 'park' | 'metro' | 'chai' | 'silent';
const ALL_ROOMS: RoomId[] = ['office', 'beach', 'space', 'library', 'park', 'metro', 'chai', 'silent'];

/**
 * useRoomCounts — subscribes to live presence counts for all 8 rooms simultaneously.
 * Shows how many users are currently online in each room for the room picker modal.
 *
 * Returns Record<RoomId, number> — updates in real time.
 * Falls back to all-zeros if Firebase is unreachable.
 */
export function useRoomCounts(): Record<RoomId, number> {
  const [counts, setCounts] = useState<Record<RoomId, number>>(
    Object.fromEntries(ALL_ROOMS.map(id => [id, 0])) as Record<RoomId, number>
  );

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    for (const roomId of ALL_ROOMS) {
      // We count unique entries in lobbies/{roomId} — each sub-room's users
      // The existing data model stores: lobbies/{roomId}/{subRoomId}/users/{userId}
      // So we count total users across all sub-rooms for the given room
      const roomLobbiesRef = ref(db, `lobbies/${roomId}`);

      const unsub = onValue(roomLobbiesRef, (snapshot) => {
        try {
          const lobbiesData = snapshot.val();
          if (!lobbiesData) {
            setCounts(prev => ({ ...prev, [roomId]: 0 }));
            return;
          }

          let total = 0;
          for (const subRoom of Object.values(lobbiesData)) {
            const users = (subRoom as { users?: Record<string, unknown> }).users;
            if (users) {
              // Count non-null entries — supports both legacy boolean and new { joinedAt } format
              total += Object.values(users).filter(v => v !== null && v !== undefined).length;
            }
          }
          setCounts(prev => ({ ...prev, [roomId]: total }));
        } catch {
          // Non-fatal: Firebase unavailable or invalid config
          setCounts(prev => ({ ...prev, [roomId]: 0 }));
        }
      }, () => {
        // Error handler — Firebase config may be dummy values; silently ignore
        setCounts(prev => ({ ...prev, [roomId]: 0 }));
      });

      unsubscribers.push(() => unsub());
    }

    return () => {
      unsubscribers.forEach(fn => fn());
    };
  }, []);

  return counts;
}
