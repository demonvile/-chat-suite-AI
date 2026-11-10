export interface MemoryFact {
  id: string;
  workspaceId: string;
  threadId: string;
  category: 'company_name' | 'user_name' | 'goals' | 'preferences' | 'projects' | 'products' | 'custom';
  key: string;
  value: string;
  confidence: number;
  source: 'extracted' | 'user_explicit' | 'system_updated';
  createdAt: string;
  updatedAt: string;
}

export interface ThreadMemory {
  threadId: string;
  workspaceId: string;
  runningSummary: string;
  summarizedTurnCount: number;
  totalTokensSavedEst: number;
  facts: MemoryFact[];
  updatedAt: string;
}

export interface MemoryContextResult {
  workspaceId: string;
  threadId: string;
  facts: MemoryFact[];
  summary: string;
  contextPromptBlock: string;
  tokenSavingsPercent: number;
}

export interface MemoryStats {
  totalFacts: number;
  totalSummaries: number;
  activeWorkspaces: number;
  totalTokensSavedEst: number;
  factsByCategory: Record<string, number>;
}

export class MemoryManager {
  private memories: Map<string, ThreadMemory> = new Map(); // key: workspaceId:threadId
  private globalFacts: MemoryFact[] = [];

  constructor(initialFacts: MemoryFact[] = [], initialMemories: ThreadMemory[] = []) {
    this.globalFacts = [...initialFacts];
    initialMemories.forEach(m => {
      this.memories.set(`${m.workspaceId}:${m.threadId}`, m);
    });
  }

  /**
   * Import stored memory state from persistent DB object
   */
  public loadFromDB(dbMemories: { facts?: MemoryFact[]; threadMemories?: ThreadMemory[] } | null | undefined) {
    if (!dbMemories) return;
    if (Array.isArray(dbMemories.facts)) {
      this.globalFacts = [...dbMemories.facts];
    }
    if (Array.isArray(dbMemories.threadMemories)) {
      this.memories.clear();
      dbMemories.threadMemories.forEach(tm => {
        if (tm && tm.workspaceId && tm.threadId) {
          this.memories.set(`${tm.workspaceId}:${tm.threadId}`, tm);
        }
      });
    }
  }

  /**
   * Export internal state for JSON DB persistence
   */
  public exportToDB() {
    return {
      facts: this.globalFacts,
      threadMemories: Array.from(this.memories.values())
    };
  }

  private cleanExtractedValue(val: string): string {
    if (!val) return '';
    return val
      .replace(/^(now\s+|a\s+|the\s+|called\s+|is\s+|was\s+)/i, '')
      .replace(/\s+(?:is|was|and|with|for|at|in|on|our|we)$/i, '')
      .trim();
  }

  /**
   * Extract key user facts automatically from user text using NLP patterns & entity detection
   */
  public extractFactsFromMessage(text: string, workspaceId: string, threadId: string): MemoryFact[] {
    if (!text || typeof text !== 'string') return [];
    const extracted: Array<{ category: MemoryFact['category']; key: string; value: string; confidence: number }> = [];

    // 1. Company Name detection
    const companyMatches = [
      /(?:my|our)\s+company(?:\s+name)?\s+(?:is|was|called|changed to|rebranded to|is now|rebranded! Our company name is now)?\s*([A-Za-z0-9\s&\.\-]+?)(?=\.|\!|\?|\,|\n|and |with |our |we |$)/i,
      /(?:I|we)\s+(?:work at|run|founded|own|manage|at)\s+([A-Z][A-Za-z0-9\s&\.\-]+?)(?=\.|\!|\?|\,|\n|and |with |$)/i,
      /(?:company|organization|business):\s*([A-Za-z0-9\s&\.\-]+)/i,
      /at\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)?)(?=\.|\!|\?|\,|\n|$)/
    ];
    for (const regex of companyMatches) {
      const match = text.match(regex);
      if (match && match[1]) {
        let val = this.cleanExtractedValue(match[1]);
        if (val.length > 1 && !['a', 'the', 'my', 'our', 'a company', 'now'].includes(val.toLowerCase())) {
          extracted.push({ category: 'company_name', key: 'company_name', value: val, confidence: 0.95 });
          break;
        }
      }
    }

    // 2. User Name detection
    const nameMatches = [
      /(?:my name is|I am|I'm|call me|name:)\s+([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)?)/i,
      /(?:this is|speaking with)\s+([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)?)/i
    ];
    for (const regex of nameMatches) {
      const match = text.match(regex);
      if (match && match[1]) {
        let val = this.cleanExtractedValue(match[1]);
        if (val.length > 1 && !['here', 'ready', 'interested', 'looking', 'trying'].includes(val.toLowerCase())) {
          extracted.push({ category: 'user_name', key: 'user_name', value: val, confidence: 0.95 });
          break;
        }
      }
    }

    // 3. Goal detection
    const goalMatches = [
      /(?:our|my)\s+(?:goal|objective|target|mission|priority)\s+(?:is|to)\s+(.+?)(?=\.|\!|\?|\n|$)/i,
      /(?:I|we)\s+(?:want to|need to|aim to|plan to|looking to)\s+(.+?)(?=\.|\!|\?|\n|$)/i
    ];
    for (const regex of goalMatches) {
      const match = text.match(regex);
      if (match && match[1]) {
        let val = this.cleanExtractedValue(match[1]);
        if (val.length > 3) {
          extracted.push({ category: 'goals', key: `goal_${Date.now()}`, value: val, confidence: 0.88 });
          break;
        }
      }
    }

    // 4. Preferences & Tech Stack detection
    const prefMatches = [
      /(?:our|my)\s+(?:tech stack|stack|framework|preference|language|theme|mode)\s+(?:is|uses)\s+(.+?)(?=\.|\!|\?|\n|$)/i,
      /(?:I|we)\s+(?:prefer|like|use|enjoy|favor)\s+(.+?)(?=\.|\!|\?|\n|$)/i,
      /(?:preference|prefer):\s*(.+?)(?=\.|\!|\?|\n|$)/i
    ];
    for (const regex of prefMatches) {
      const match = text.match(regex);
      if (match && match[1]) {
        let val = this.cleanExtractedValue(match[1]);
        if (val.length > 2) {
          extracted.push({ category: 'preferences', key: `preference_${Date.now()}`, value: val, confidence: 0.85 });
          break;
        }
      }
    }

    // 5. Projects detection
    const projectMatches = [
      /(?:our|my)\s+(?:project|initiative|campaign|app)\s+(?:is|called|named)\s+(.+?)(?=\.|\!|\?|\n|$)/i,
      /(?:working on|building|launching|developing)\s+(.+?)(?=\.|\!|\?|\n|$)/i
    ];
    for (const regex of projectMatches) {
      const match = text.match(regex);
      if (match && match[1]) {
        let val = this.cleanExtractedValue(match[1]);
        if (val.length > 2) {
          extracted.push({ category: 'projects', key: `project_${Date.now()}`, value: val, confidence: 0.85 });
          break;
        }
      }
    }

    // 6. Products & Services detection
    const productMatches = [
      /(?:our|my)\s+(?:product|service|offering|solution)\s+(?:is|called)\s+(.+?)(?=\.|\!|\?|\n|$)/i,
      /(?:we sell|we offer|we provide)\s+(.+?)(?=\.|\!|\?|\n|$)/i
    ];
    for (const regex of productMatches) {
      const match = text.match(regex);
      if (match && match[1]) {
        let val = this.cleanExtractedValue(match[1]);
        if (val.length > 2) {
          extracted.push({ category: 'products', key: `product_${Date.now()}`, value: val, confidence: 0.85 });
          break;
        }
      }
    }

    // Save/Update extracted facts into memory store
    const updatedFacts: MemoryFact[] = [];
    for (const fact of extracted) {
      const savedFact = this.upsertFact({
        workspaceId,
        threadId,
        category: fact.category,
        key: fact.key,
        value: fact.value,
        confidence: fact.confidence,
        source: 'extracted'
      });
      updatedFacts.push(savedFact);
    }

    return updatedFacts;
  }

  /**
   * Upsert a fact in memory (Updates existing key if present or creates new)
   */
  public upsertFact(params: {
    workspaceId: string;
    threadId: string;
    category: MemoryFact['category'];
    key: string;
    value: string;
    confidence?: number;
    source?: MemoryFact['source'];
  }): MemoryFact {
    const { workspaceId, threadId, category, key, value, confidence = 0.90, source = 'user_explicit' } = params;
    const now = new Date().toISOString();

    // Check if matching fact key already exists for this workspace & thread/user
    const existingIndex = this.globalFacts.findIndex(
      f => f.workspaceId === workspaceId && f.category === category && (f.key === key || category === 'company_name' || category === 'user_name')
    );

    if (existingIndex !== -1) {
      const existing = this.globalFacts[existingIndex];
      existing.value = value;
      existing.updatedAt = now;
      existing.confidence = confidence;
      existing.source = source;
      existing.threadId = threadId;
      return existing;
    } else {
      const newFact: MemoryFact = {
        id: 'fact-' + Math.random().toString(36).substring(2, 11),
        workspaceId,
        threadId,
        category,
        key,
        value,
        confidence,
        source,
        createdAt: now,
        updatedAt: now
      };
      this.globalFacts.push(newFact);
      return newFact;
    }
  }

  /**
   * Get all facts isolated by workspaceId (Never leaks across workspaces)
   */
  public getFactsForWorkspace(workspaceId: string, threadId?: string): MemoryFact[] {
    return this.globalFacts.filter(f => {
      if (f.workspaceId !== workspaceId) return false;
      if (threadId && f.threadId && f.threadId !== threadId && f.category !== 'user_name' && f.category !== 'company_name') {
        return false;
      }
      return true;
    });
  }

  /**
   * Summarize long conversation history to preserve context while minimizing token usage
   */
  public processAndSummarizeThread(
    workspaceId: string,
    threadId: string,
    messages: Array<{ role: string; text: string; id?: string }>,
    maxWindowTurns = 6
  ): {
    summary: string;
    prunedMessages: Array<{ role: 'assistant' | 'user'; text: string }>;
    rawTokenEstimate: number;
    prunedTokenEstimate: number;
    tokenSavingsPercent: number;
  } {
    const mapKey = `${workspaceId}:${threadId}`;
    let tm = this.memories.get(mapKey);

    if (!tm) {
      tm = {
        threadId,
        workspaceId,
        runningSummary: '',
        summarizedTurnCount: 0,
        totalTokensSavedEst: 0,
        facts: [],
        updatedAt: new Date().toISOString()
      };
      this.memories.set(mapKey, tm);
    }

    const validMsgs = (messages || []).filter(m => m && m.text && m.text.trim().length > 0);
    const rawChars = validMsgs.reduce((acc, m) => acc + m.text.length, 0);
    const rawTokenEstimate = Math.ceil(rawChars / 4);

    if (validMsgs.length <= maxWindowTurns) {
      // Still extract facts from initial messages
      validMsgs.forEach(m => {
        if (m.role === 'user') {
          this.extractFactsFromMessage(m.text, workspaceId, threadId);
        }
      });
      const prunedMsgs = validMsgs.map(m => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        text: m.text
      }));
      return {
        summary: tm.runningSummary,
        prunedMessages: prunedMsgs,
        rawTokenEstimate,
        prunedTokenEstimate: rawTokenEstimate,
        tokenSavingsPercent: 0
      };
    }

    // Messages to be summarized vs recent active window
    const olderMsgs = validMsgs.slice(0, validMsgs.length - maxWindowTurns);
    const recentMsgs = validMsgs.slice(validMsgs.length - maxWindowTurns);

    // Extract bullet highlights from older messages & facts
    const highlights: string[] = [];
    validMsgs.forEach(m => {
      if (m.role === 'user') {
        this.extractFactsFromMessage(m.text, workspaceId, threadId);
      }
    });

    olderMsgs.forEach((m) => {
      const speaker = m.role === 'user' ? 'User' : 'Assistant';
      if (m.text.length > 10) {
        highlights.push(`${speaker}: "${m.text.substring(0, 100)}${m.text.length > 100 ? '...' : ''}"`);
      }
    });

    const newSummaryAddition = `Turns 1-${olderMsgs.length}: ${highlights.slice(-6).join(' | ')}`;
    if (tm.runningSummary) {
      tm.runningSummary = `${tm.runningSummary}\n${newSummaryAddition}`;
    } else {
      tm.runningSummary = newSummaryAddition;
    }

    tm.summarizedTurnCount += olderMsgs.length;
    tm.updatedAt = new Date().toISOString();

    // Construct pruned message payload
    const prunedMsgs: Array<{ role: 'assistant' | 'user'; text: string }> = [
      {
        role: 'user',
        text: `[PREVIOUS CONVERSATION CONTEXT & SUMMARY (${tm.summarizedTurnCount} earlier turns)]:\n${tm.runningSummary}`
      },
      {
        role: 'assistant',
        text: `Understood. I have full context of our earlier discussion and facts. How can I assist you further?`
      },
      ...recentMsgs.map(m => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        text: m.text
      }))
    ];

    const prunedChars = prunedMsgs.reduce((acc, m) => acc + m.text.length, 0);
    const prunedTokenEstimate = Math.ceil(prunedChars / 4);
    const tokenSavingsPercent = rawTokenEstimate > 0 ? Math.max(0, Math.round(((rawTokenEstimate - prunedTokenEstimate) / rawTokenEstimate) * 100)) : 0;

    tm.totalTokensSavedEst += Math.max(0, rawTokenEstimate - prunedTokenEstimate);

    return {
      summary: tm.runningSummary,
      prunedMessages: prunedMsgs,
      rawTokenEstimate,
      prunedTokenEstimate,
      tokenSavingsPercent
    };
  }

  /**
   * Format relevant facts and summary into system prompt context block before AI completion
   */
  public getMemoryPromptContext(workspaceId: string, threadId: string): MemoryContextResult {
    // Isolated workspace facts retrieval
    const workspaceFacts = this.getFactsForWorkspace(workspaceId, threadId);
    const mapKey = `${workspaceId}:${threadId}`;
    const threadMem = this.memories.get(mapKey);

    const userNameFact = workspaceFacts.find(f => f.category === 'user_name');
    const companyNameFact = workspaceFacts.find(f => f.category === 'company_name');
    const goalsFacts = workspaceFacts.filter(f => f.category === 'goals');
    const prefFacts = workspaceFacts.filter(f => f.category === 'preferences');
    const projectFacts = workspaceFacts.filter(f => f.category === 'projects');
    const productFacts = workspaceFacts.filter(f => f.category === 'products');
    const customFacts = workspaceFacts.filter(f => f.category === 'custom');

    const factLines: string[] = [];
    if (userNameFact) factLines.push(`- User Name: "${userNameFact.value}"`);
    if (companyNameFact) factLines.push(`- Company Name: "${companyNameFact.value}"`);
    if (goalsFacts.length > 0) factLines.push(`- Stated Goals: ${goalsFacts.map(g => `"${g.value}"`).join(', ')}`);
    if (prefFacts.length > 0) factLines.push(`- Preferences & Tech Stack: ${prefFacts.map(p => `"${p.value}"`).join(', ')}`);
    if (projectFacts.length > 0) factLines.push(`- Projects & Initiatives: ${projectFacts.map(p => `"${p.value}"`).join(', ')}`);
    if (productFacts.length > 0) factLines.push(`- Products & Offerings: ${productFacts.map(p => `"${p.value}"`).join(', ')}`);
    if (customFacts.length > 0) factLines.push(`- Additional Key Facts: ${customFacts.map(c => `${c.key}: "${c.value}"`).join(', ')}`);

    let contextPromptBlock = `\n[ENTERPRISE CONVERSATION MEMORY & STORED USER FACTS]:\n`;
    contextPromptBlock += `Workspace ID Scope: ${workspaceId} | Session Thread: ${threadId}\n`;
    if (factLines.length > 0) {
      contextPromptBlock += `Known High-Priority Facts:\n${factLines.join('\n')}\n`;
    } else {
      contextPromptBlock += `No explicit user facts recorded yet for this session.\n`;
    }

    if (threadMem && threadMem.runningSummary) {
      contextPromptBlock += `\n[RUNNING SUMMARY OF ELAPSED TURNS]:\n${threadMem.runningSummary}\n`;
    }

    contextPromptBlock += `\nMEMORY DIRECTIVE: Use the stored facts above to personalize your responses. If the user asks about their name, company, goals, or preferences, reference these facts accurately. Maintain strict continuity across all turns.\n`;

    return {
      workspaceId,
      threadId,
      facts: workspaceFacts,
      summary: threadMem?.runningSummary || '',
      contextPromptBlock,
      tokenSavingsPercent: threadMem ? Math.round((threadMem.totalTokensSavedEst / (threadMem.totalTokensSavedEst + 500)) * 100) : 0
    };
  }

  /**
   * Delete or clear facts for a thread or workspace
   */
  public deleteFact(factId: string, workspaceId: string): boolean {
    const idx = this.globalFacts.findIndex(f => f.id === factId && f.workspaceId === workspaceId);
    if (idx !== -1) {
      this.globalFacts.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Get memory analytics & stats
   */
  public getMemoryStats(workspaceId?: string): MemoryStats {
    const facts = workspaceId ? this.globalFacts.filter(f => f.workspaceId === workspaceId) : this.globalFacts;
    const memories = Array.from(this.memories.values()).filter(m => !workspaceId || m.workspaceId === workspaceId);

    const activeWsSet = new Set(this.globalFacts.map(f => f.workspaceId));
    memories.forEach(m => activeWsSet.add(m.workspaceId));

    const factsByCategory: Record<string, number> = {};
    facts.forEach(f => {
      factsByCategory[f.category] = (factsByCategory[f.category] || 0) + 1;
    });

    const totalTokensSavedEst = memories.reduce((acc, m) => acc + (m.totalTokensSavedEst || 0), 0);

    return {
      totalFacts: facts.length,
      totalSummaries: memories.filter(m => !!m.runningSummary).length,
      activeWorkspaces: activeWsSet.size,
      totalTokensSavedEst,
      factsByCategory
    };
  }
}

// Global Singleton Instance for Server Runtime
export const globalMemoryManager = new MemoryManager();
