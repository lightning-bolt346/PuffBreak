import type { Party, PartyServer, PartyConnection } from "partykit/server";

// Simple backend profanity filter
const BANNED_WORDS = ['fuck','shit','bitch','asshole','dick','pussy','chutiya','madarchod','bhenchod','gandu','slur'];
const filterText = (text: string): string => {
  for (const word of BANNED_WORDS) {
    if (new RegExp(word, 'gi').test(text)) return '🚫 Message filtered';
  }
  return text;
};

// Types for messages matching the frontend
type BaseMessage = {
  id: string;
  type: "chat" | "reaction" | "system";
};

type ChatMessage = BaseMessage & {
  type: "chat";
  text: string;
  nickname: string;
  color: string;
  xPos: number;
};

type ReactionMessage = BaseMessage & {
  type: "reaction";
  messageId: string;
  emoji: string;
};

type SystemMessage = BaseMessage & {
  type: "system";
  text: string;
};

export default class ChatServer implements PartyServer {
  messages: any[] = [];
  
  constructor(readonly party: Party) {}

  // Helper to notify the matchmaker about our current connection count
  async updateMatchmakerCount() {
    // The env name is usually part of the room ID, e.g., "beach-1-abc" -> "beach"
    const env = this.party.id.split('-')[0];
    
    // Get total connections (users)
    let count = 0;
    for (const _conn of this.party.getConnections()) {
      count++;
    }

    try {
      // Send a PUT request to the matchmaker party named 'lobby'
      await this.party.context.parties.matchmaker.get('lobby').fetch({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          env,
          roomId: this.party.id,
          count
        })
      });
    } catch (err) {
      console.error("Failed to update matchmaker:", err);
    }
  }

  async onConnect(conn: PartyConnection) {
    // When a user connects, update matchmaker count
    await this.updateMatchmakerCount();

    // Send the last 20 messages to the new user so they aren't looking at an empty room
    const initMsg = JSON.stringify({ type: "init", messages: this.messages.slice(-20) });
    conn.send(initMsg);
  }

  async onClose(conn: PartyConnection) {
    // When a user leaves, update matchmaker count
    await this.updateMatchmakerCount();
  }

  onMessage(message: string, sender: PartyConnection) {
    try {
      const parsed = JSON.parse(message);
      
      if (parsed.type === "chat") {
        // Apply profanity filter server-side
        parsed.text = filterText(parsed.text);
        parsed.createdAt = Date.now();
        
        // Save to ephemeral history
        this.messages.push(parsed);
        if (this.messages.length > 50) this.messages.shift(); // keep last 50
        
        // Broadcast to everyone (including sender, so they get server confirmation)
        this.party.broadcast(JSON.stringify(parsed));
      } 
      else if (parsed.type === "reaction") {
        // Reactions are not saved to history array directly for simplicity, just broadcasted
        this.party.broadcast(JSON.stringify(parsed));
      }
    } catch (e) {
      console.error("Invalid message format", e);
    }
  }
}
