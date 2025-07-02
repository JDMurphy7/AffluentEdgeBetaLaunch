// Simple in-memory pub/sub for agent communication
export class CommunicationBus {
  private channels: Map<string, Set<(msg: any) => void>> = new Map();

  subscribe(channel: string, handler: (msg: any) => void) {
    if (!this.channels.has(channel)) this.channels.set(channel, new Set());
    this.channels.get(channel)!.add(handler);
  }

  unsubscribe(channel: string, handler: (msg: any) => void) {
    this.channels.get(channel)?.delete(handler);
  }

  publish(channel: string, msg: any) {
    this.channels.get(channel)?.forEach((handler) => handler(msg));
  }
}
