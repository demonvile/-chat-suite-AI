import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export type AIProviderName = 'groq' | 'gemini' | 'openai' | 'openrouter';

export interface AIProviderConfig {
  activeProvider: AIProviderName;
  activeModels: Record<AIProviderName, string>;
  customKeys: Record<AIProviderName, string>;
}

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  activeProvider: 'gemini',
  activeModels: {
    groq: 'llama-3.3-70b-versatile',
    gemini: 'gemini-3.8-flash',
    openai: 'gpt-4o-mini',
    openrouter: 'meta-llama/llama-3.3-70b-instruct',
  },
  customKeys: {
    groq: '',
    gemini: '',
    openai: '',
    openrouter: '',
  }
};

export interface ChatMessageTurn {
  role: 'user' | 'assistant' | 'system';
  text: string;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  docParsedContext?: string;
}

export interface GenerateOptions {
  provider?: AIProviderName;
  model?: string;
  systemPrompt: string;
  messages: ChatMessageTurn[];
  temperature?: number;
  customKeys?: Partial<Record<AIProviderName, string>>;
}

/**
 * Get resolved API Key for a provider (checks custom saved key first, then environment variable)
 */
export function getResolvedKey(
  provider: AIProviderName,
  customKeys?: Partial<Record<AIProviderName, string>>,
  savedConfigKeys?: Partial<Record<AIProviderName, string>>
): string {
  // 1. Injected custom key argument
  if (customKeys && customKeys[provider] && customKeys[provider]?.trim()) {
    return customKeys[provider]!.trim();
  }
  // 2. Saved config key in db
  if (savedConfigKeys && savedConfigKeys[provider] && savedConfigKeys[provider]?.trim()) {
    return savedConfigKeys[provider]!.trim();
  }
  // 3. Environment variables
  switch (provider) {
    case 'groq':
      return (process.env.GROQ_API_KEY || '').trim();
    case 'gemini':
      return (process.env.GEMINI_API_KEY || '').trim();
    case 'openai':
      return (process.env.OPENAI_API_KEY || '').trim();
    case 'openrouter':
      return (process.env.OPENROUTER_API_KEY || '').trim();
    default:
      return '';
  }
}

/**
 * Centralized AI Completion Service supporting Groq (default), Gemini, OpenAI, and OpenRouter
 */
export async function generateAICompletion(
  options: GenerateOptions,
  config?: AIProviderConfig
): Promise<string> {
  const activeProvider = options.provider || config?.activeProvider || 'groq';
  const savedModels = config?.activeModels || DEFAULT_AI_CONFIG.activeModels;
  const savedKeys = config?.customKeys || DEFAULT_AI_CONFIG.customKeys;

  const model = options.model || savedModels[activeProvider] || DEFAULT_AI_CONFIG.activeModels[activeProvider];
  const apiKey = getResolvedKey(activeProvider, options.customKeys, savedKeys);

  if (!apiKey) {
    const geminiFallbackKey = process.env.GEMINI_API_KEY || getResolvedKey('gemini', options.customKeys, savedKeys);
    if (activeProvider !== 'gemini' && geminiFallbackKey) {
      console.warn(`[AI Provider Fallback] Missing API key for "${activeProvider}". Auto-routing to Gemini (gemini-3.8-flash)...`);
      return await executeGeminiCompletion(
        geminiFallbackKey,
        'gemini-3.8-flash',
        options.systemPrompt,
        options.messages,
        options.temperature
      );
    }

    const envVarMap: Record<AIProviderName, string> = {
      groq: 'GROQ_API_KEY',
      gemini: 'GEMINI_API_KEY',
      openai: 'OPENAI_API_KEY',
      openrouter: 'OPENROUTER_API_KEY'
    };
    throw new Error(
      `[AI Provider Error] Missing API Key for provider "${activeProvider.toUpperCase()}". Please configure your API key in AI Settings or set environment variable "${envVarMap[activeProvider]}".`
    );
  }

  const startTime = Date.now();
  console.log(`[Centralized AI Service] Provider: "${activeProvider.toUpperCase()}", Model: "${model}", Messages: ${options.messages.length}`);

  try {
    let attempts = 0;
    while (attempts < 3) {
      try {
        attempts++;
        switch (activeProvider) {
          case 'groq':
            return await executeGroqCompletion(apiKey, model, options.systemPrompt, options.messages, options.temperature);

          case 'gemini':
            return await executeGeminiCompletion(apiKey, model, options.systemPrompt, options.messages, options.temperature);

          case 'openai':
            return await executeOpenAICompletion(apiKey, model, options.systemPrompt, options.messages, options.temperature);

          case 'openrouter':
            return await executeOpenRouterCompletion(apiKey, model, options.systemPrompt, options.messages, options.temperature);

          default:
            throw new Error(`Unsupported AI provider: ${activeProvider}`);
        }
      } catch (err: any) {
        const errStr = (err?.message || JSON.stringify(err)).toLowerCase();
        const isRateLimit = errStr.includes('rate limit') || errStr.includes('quota') || errStr.includes('429') || errStr.includes('resource_exhausted');
        const isAuthError = errStr.includes('invalid api key') || errStr.includes('unauthorized') || errStr.includes('401') || errStr.includes('invalid_api_key');
        
        // If primary non-Gemini provider fails (auth error, quota, rate limit, or model failure) and Gemini is available, seamlessly failover
        const geminiKey = process.env.GEMINI_API_KEY || getResolvedKey('gemini', options.customKeys, savedKeys);
        if (activeProvider !== 'gemini' && geminiKey) {
          console.warn(`[AI Provider Failover] Primary provider "${activeProvider}" failed (${err?.message || 'Error'}). Failing over to Gemini (gemini-3.8-flash)...`);
          try {
            return await executeGeminiCompletion(
              geminiKey,
              'gemini-3.8-flash',
              options.systemPrompt,
              options.messages,
              options.temperature
            );
          } catch (geminiErr: any) {
            console.error('[AI Provider Failover Error] Gemini fallback also failed:', geminiErr?.message || geminiErr);
          }
        }

        if (isRateLimit && attempts < 3) {
          console.warn(`[AI Provider Rate Limit] Retrying attempt ${attempts}/3 after backoff...`);
          await new Promise(res => setTimeout(res, 1200 * attempts));
          continue;
        }
        throw err;
      }
    }
    throw new Error(`[Rate Limit Exceeded] The ${activeProvider.toUpperCase()} provider rate limit or quota has been reached.`);
  } catch (err: any) {
    console.error(`[Centralized AI Error] Provider: "${activeProvider}", Error:`, err?.message || err);

    // Format & normalize provider errors
    const errStr = (err?.message || JSON.stringify(err)).toLowerCase();
    
    if (errStr.includes('invalid api key') || errStr.includes('unauthorized') || errStr.includes('401') || errStr.includes('authentication') || errStr.includes('invalid_api_key')) {
      throw new Error(`[Invalid API Key] The API key configured for ${activeProvider.toUpperCase()} is invalid or unauthorized. Please check your credentials in AI Settings.`);
    }

    if (errStr.includes('rate limit') || errStr.includes('quota') || errStr.includes('429') || errStr.includes('resource_exhausted')) {
      throw new Error(`[Rate Limit Exceeded] The ${activeProvider.toUpperCase()} provider rate limit or quota has been reached. Please try again in a few moments.`);
    }

    if (errStr.includes('econnrefused') || errStr.includes('network') || errStr.includes('fetch failed') || errStr.includes('timeout') || errStr.includes('503') || errStr.includes('502')) {
      throw new Error(`[Provider Unavailable] ${activeProvider.toUpperCase()} API endpoint is currently unreachable or experiencing network disruptions. Please try again or switch active provider.`);
    }

    throw new Error(`[${activeProvider.toUpperCase()} Service Error] ${err?.message || 'Failed to generate AI response.'}`);
  }
}

/**
 * Groq Provider Execution
 */
async function executeGroqCompletion(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessageTurn[],
  temperature?: number
): Promise<string> {
  const groq = new Groq({ apiKey });

  const formattedMessages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const m of messages) {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    let content = m.text;
    if (m.docParsedContext && !content.includes(m.docParsedContext)) {
      content += `\n${m.docParsedContext}`;
    }
    formattedMessages.push({ role, content });
  }

  let lastErr: any;
  const primaryModel = model || 'llama-3.3-70b-versatile';
  const modelsToTry = [primaryModel];
  if (primaryModel === 'llama-3.3-70b-versatile') {
    modelsToTry.push('llama-3.1-8b-instant');
  }

  for (const mName of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const completion = await groq.chat.completions.create({
          messages: formattedMessages,
          model: mName,
          temperature: temperature ?? 0.7,
        });

        const reply = completion.choices[0]?.message?.content;
        if (!reply) {
          throw new Error('Groq returned an empty text completion.');
        }
        return reply;
      } catch (err: any) {
        lastErr = err;
        const errStr = (err?.message || JSON.stringify(err)).toLowerCase();
        const isRateLimit = errStr.includes('rate limit') || errStr.includes('quota') || errStr.includes('429') || errStr.includes('resource_exhausted');
        if (isRateLimit && attempt < 3) {
          console.warn(`[Groq Rate Limit] Model ${mName} attempt ${attempt}/3 hit rate limit. Retrying...`);
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        // If rate limited on primary model, break loop to try secondary Groq model
        if (isRateLimit) break;
        throw err;
      }
    }
  }

  throw lastErr;
}

/**
 * Gemini Provider Execution
 */
async function executeGeminiCompletion(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessageTurn[],
  temperature?: number
): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const contentsParts: any[] = [];

  for (const m of messages) {
    const isUser = m.role === 'user';
    const targetRole = isUser ? 'user' : 'model';
    const parts: any[] = [];

    if (isUser && m.fileType === 'image' && m.fileUrl) {
      try {
        const rawBase64 = m.fileUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        const mime = m.fileUrl.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/png';
        parts.push({
          inlineData: {
            mimeType: mime,
            data: rawBase64
          }
        });
      } catch (e) {
        console.error('[Gemini Execution] Error preparing image:', e);
      }
    }

    let turnText = m.text;
    if (m.docParsedContext && !turnText.includes(m.docParsedContext)) {
      turnText += `\n${m.docParsedContext}`;
    }

    parts.push({ text: turnText });

    if (contentsParts.length > 0 && contentsParts[contentsParts.length - 1].role === targetRole) {
      contentsParts[contentsParts.length - 1].parts.push(...parts);
    } else {
      contentsParts.push({ role: targetRole, parts });
    }
  }

  if (contentsParts.length === 0) {
    contentsParts.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  // Model selection per gemini-api guidelines: use gemini-3.8-flash for general text
  let primaryModel = model;
  if (!primaryModel || primaryModel.includes('2.0') || primaryModel.includes('1.5') || primaryModel.includes('2.5') || primaryModel.includes('3.6')) {
    primaryModel = 'gemini-3.8-flash';
  }

  const modelsToTry = [primaryModel];
  if (primaryModel !== 'gemini-3.8-flash') {
    modelsToTry.push('gemini-3.8-flash');
  }
  if (!modelsToTry.includes('gemini-3.1-flash-lite')) {
    modelsToTry.push('gemini-3.1-flash-lite');
  }

  let lastErr: any;
  for (const mName of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: mName,
          contents: contentsParts,
          config: {
            systemInstruction: systemPrompt,
            temperature: temperature ?? 0.7,
          }
        });

        if (!response || !response.text) {
          throw new Error('Gemini API returned an empty response.');
        }

        return response.text;
      } catch (err: any) {
        lastErr = err;
        const errStr = (err?.message || JSON.stringify(err)).toLowerCase();
        const isRateLimit = errStr.includes('rate limit') || errStr.includes('quota') || errStr.includes('429') || errStr.includes('resource_exhausted');
        if (isRateLimit && attempt < 3) {
          console.warn(`[Gemini Rate Limit] Model ${mName} attempt ${attempt}/3 hit rate limit. Waiting...`);
          await new Promise(r => setTimeout(r, 1500 * attempt));
          continue;
        }
        if (isRateLimit) break;
        throw err;
      }
    }
  }

  throw lastErr;
}

/**
 * OpenAI Provider Execution
 */
async function executeOpenAICompletion(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessageTurn[],
  temperature?: number
): Promise<string> {
  const openai = new OpenAI({ apiKey });

  const formattedMessages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const m of messages) {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    let content = m.text;
    if (m.docParsedContext && !content.includes(m.docParsedContext)) {
      content += `\n${m.docParsedContext}`;
    }
    formattedMessages.push({ role, content });
  }

  const completion = await openai.chat.completions.create({
    messages: formattedMessages,
    model: model || 'gpt-4o-mini',
    temperature: temperature ?? 0.7,
  });

  const reply = completion.choices[0]?.message?.content;
  if (!reply) {
    throw new Error('OpenAI returned an empty completion.');
  }
  return reply;
}

/**
 * OpenRouter Provider Execution
 */
async function executeOpenRouterCompletion(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessageTurn[],
  temperature?: number
): Promise<string> {
  const openrouter = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://chatsuite.ai',
      'X-Title': 'ChatSuite AI',
    }
  });

  const formattedMessages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const m of messages) {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    let content = m.text;
    if (m.docParsedContext && !content.includes(m.docParsedContext)) {
      content += `\n${m.docParsedContext}`;
    }
    formattedMessages.push({ role, content });
  }

  const completion = await openrouter.chat.completions.create({
    messages: formattedMessages,
    model: model || 'meta-llama/llama-3.3-70b-instruct',
    temperature: temperature ?? 0.7,
  });

  const reply = completion.choices[0]?.message?.content;
  if (!reply) {
    throw new Error('OpenRouter returned an empty completion.');
  }
  return reply;
}

/**
 * Connection Tester for AI Providers
 */
export async function testAIProviderConnection(
  provider: AIProviderName,
  testKey?: string,
  testModel?: string,
  savedConfigKeys?: Record<AIProviderName, string>
): Promise<{ success: boolean; message: string; responseTimeMs: number; provider: string; model: string }> {
  const apiKey = (testKey && testKey.trim()) || getResolvedKey(provider, undefined, savedConfigKeys);
  const model = testModel || DEFAULT_AI_CONFIG.activeModels[provider];

  if (!apiKey) {
    return {
      success: false,
      message: `No API key supplied or found in environment variables for ${provider.toUpperCase()}.`,
      responseTimeMs: 0,
      provider,
      model,
    };
  }

  const startTime = Date.now();

  try {
    const testMessages: ChatMessageTurn[] = [
      { role: 'user', text: 'Hello! Respond with a brief 1-sentence confirmation that your AI connection is active.' }
    ];

    const result = await generateAICompletion({
      provider,
      model,
      systemPrompt: 'You are an AI provider test system. Provide a ultra-brief confirmation.',
      messages: testMessages,
      temperature: 0.1,
      customKeys: { [provider]: apiKey }
    });

    const elapsed = Date.now() - startTime;
    return {
      success: true,
      message: `Connection successful (${elapsed}ms): "${result.trim().substring(0, 100)}"`,
      responseTimeMs: elapsed,
      provider,
      model,
    };
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    return {
      success: false,
      message: err?.message || `Failed to connect to ${provider.toUpperCase()} API.`,
      responseTimeMs: elapsed,
      provider,
      model,
    };
  }
}
