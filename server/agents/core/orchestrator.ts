import type { BaseAgent } from './base-agent.js';
import type { AgentConfig, AgentResult } from './types.js';

export class Orchestrator {
  private agents: Map<string, BaseAgent> = new Map();

  registerAgent(agent: BaseAgent) {
    this.agents.set(agent.getId(), agent);
  }

  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  async route<T = any>(id: string, method: string, ...args: any[]): Promise<AgentResult<T>> {
    const agent = this.getAgent(id);
    if (!agent) throw new Error(`Agent ${id} not found`);
    // @ts-ignore
    if (typeof agent[method] !== 'function') throw new Error(`Method ${method} not found on agent ${id}`);
    // @ts-ignore
    return agent[method](...args);
  }
}
