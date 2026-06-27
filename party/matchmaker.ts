import type { Party, PartyServer, PartyRequest } from "partykit/server";

const MAX_USERS_PER_ROOM = 6;

interface RoomInfo {
  id: string;
  count: number;
}

export default class MatchmakerServer implements PartyServer {
  // state: environment -> list of rooms
  roomsByEnv = new Map<string, RoomInfo[]>();

  constructor(readonly party: Party) {}

  async onRequest(req: PartyRequest) {
    // 1. Handling Client Matchmake requests: POST /parties/matchmaker/lobby?env=beach
    if (req.method === "POST" && req.url.includes("?env=")) {
      const url = new URL(req.url);
      const env = url.searchParams.get("env");
      if (!env) return new Response("Missing env", { status: 400 });

      let envRooms = this.roomsByEnv.get(env) || [];
      
      // Filter out rooms that are full
      let availableRooms = envRooms.filter(r => r.count < MAX_USERS_PER_ROOM);
      
      let assignedRoomId: string;
      
      if (availableRooms.length > 0) {
        // Randomly assign to one of the available rooms (or just the first one)
        // Picking random helps distribute load slightly if many join at exact same ms
        const targetRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
        assignedRoomId = targetRoom.id;
      } else {
        // Create a new room
        const newIdx = envRooms.length + 1;
        assignedRoomId = `${env}-${newIdx}-${Math.random().toString(36).substring(2, 6)}`;
        envRooms.push({ id: assignedRoomId, count: 0 });
        this.roomsByEnv.set(env, envRooms);
      }

      return new Response(JSON.stringify({ roomId: assignedRoomId }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 2. Handling internal updates from Chat servers: PUT /parties/matchmaker/lobby
    // The chat server will tell us its new count.
    if (req.method === "PUT") {
      try {
        const body = await req.json() as { env: string, roomId: string, count: number };
        const { env, roomId, count } = body;
        
        let envRooms = this.roomsByEnv.get(env) || [];
        
        if (count === 0) {
          // If room is empty, remove it to save memory
          envRooms = envRooms.filter(r => r.id !== roomId);
        } else {
          // Update count
          const existing = envRooms.find(r => r.id === roomId);
          if (existing) {
            existing.count = count;
          } else {
            envRooms.push({ id: roomId, count });
          }
        }
        
        this.roomsByEnv.set(env, envRooms);
        return new Response("OK");
      } catch (e) {
        return new Response("Bad request", { status: 400 });
      }
    }

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, PUT, OPTIONS",
        }
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
