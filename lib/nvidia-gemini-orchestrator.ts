/**
 * AI ORCHESTRATOR — Single-call architecture
 *
 * Instead of 3 sequential/parallel LLM calls (one per agent),
 * we issue ONE call with a unified prompt that returns all three
 * agent outputs in a single JSON object. This eliminates:
 *   - Multiple round-trips to NVIDIA NIM
 *   - Rate-limit throttling from concurrent requests
 *   - Context loss between agents
 *
 * Estimated latency reduction: ~60-70% vs. the previous approach.
 */

import OpenAI from 'openai';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AgentResult {
  product: ProductResult;
  actuary: ActuaryResult;
  regulatory: RegulatoryResult;
  confidence: number;
}

interface ProductResult {
  productName: string;
  productType: string;
  targetMarket: { ageRange: [number, number]; geography: string };
  coverage: { sumAssured: number; policyTerm: number; benefits: string[] };
  distribution: { allowedChannels: string[] };
  pricing: { targetPremium: number; frequency: string };
}

interface ActuaryResult {
  pricing: {
    monthlyPremium: number;
    annualPremium: number;
    breakdown: { claims: number; expenses: number; profit: number; commission: number };
  };
  assumptions: {
    mortalityRate: number;
    morbidityRate: number;
    discountRate: number;
    inflationRate: number;
    expenseRatio: number;
    lapseRate: number;
  };
  reserves: { year1: number; year5: number; year10: number };
  riskMetrics: { solvencyMarginRatio: number; valueAtRisk: number; probabilityOfRuin: number };
  profitability: { irr: number };
  confidence: { overall: number; dataQuality: number; modelAccuracy: number; assumptionsReliability: number };
}

interface RegulatoryResult {
  overallCompliance: 'compliant' | 'non-compliant' | 'requires_sandbox';
  checks: Record<string, 'pass' | 'fail' | 'n/a'>;
  recommendations: Array<{ priority: string; issue: string; action: string; articleReference: string }>;
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

export class ActuarialOrchestrator {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY!,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
    // llama-3.2-3b is confirmed available & fastest on NVIDIA NIM free tier
    this.model = process.env.NVIDIA_MODEL || 'meta/llama-3.2-3b-instruct';
  }

  /**
   * Two parallel calls:
   * - llama-3.2-3b  → product + actuary (fast, already proven)
   * - llama-3.1-8b  → regulatory only (larger model for legal reasoning)
   * Total latency = max(two calls), not sum.
   */
  async calculate(payload: any): Promise<AgentResult> {
    const userContent = JSON.stringify(payload, null, 2);
    const start = Date.now();

    console.log(`🚀 Parallel: actuary(3b) + regulatory(3b)...`);

    const [actuaryRaw, regulatoryRaw] = await Promise.all([
      this.callWithRetry(this.buildActuaryPrompt(), userContent, this.model),
      this.callWithRetry(this.buildRegulatoryPrompt(), userContent, this.model),
    ]);

    const actuaryData = this.extractJSON(actuaryRaw);
    const regulatoryData = this.extractJSON(regulatoryRaw);

    console.log(`✅ Complete in ${((Date.now() - start) / 1000).toFixed(1)}s`);

    return {
      product: actuaryData.product ?? {},
      actuary: actuaryData.actuary ?? {},
      regulatory: regulatoryData ?? {},
      confidence: actuaryData.confidence ?? 0.9,
    } as AgentResult;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private buildActuaryPrompt(): string {
    return `You are an Indonesian Insurance Product Architect and Certified Actuary (FSA/FSAI).
Given the insurance product request, return a JSON with product structure and actuarial calculations.

RULES:
- All monetary values MUST be absolute IDR integers, never percentages or decimals.
- breakdown.claims + expenses + profit + commission must sum to approximately monthlyPremium.
- Use actuarial methods beyond Gompertz (Makeham, select-and-ultimate tables).

Return ONLY this JSON (no markdown, no explanation):
{
  "product": {
    "productName": "string",
    "productType": "life|health|travel|micro",
    "targetMarket": { "ageRange": [number, number], "geography": "Indonesia" },
    "coverage": { "sumAssured": number, "policyTerm": number, "benefits": ["string"] },
    "distribution": { "allowedChannels": ["string"] },
    "pricing": { "targetPremium": number, "frequency": "monthly" }
  },
  "actuary": {
    "pricing": {
      "monthlyPremium": number,
      "annualPremium": number,
      "breakdown": { "claims": number, "expenses": number, "profit": number, "commission": number }
    },
    "assumptions": {
      "mortalityRate": number,
      "morbidityRate": number,
      "discountRate": number,
      "inflationRate": number,
      "expenseRatio": number,
      "lapseRate": number
    },
    "reserves": { "year1": number, "year5": number, "year10": number },
    "riskMetrics": { "solvencyMarginRatio": number, "valueAtRisk": number, "probabilityOfRuin": number },
    "profitability": { "irr": number },
    "confidence": { "overall": number, "dataQuality": number, "modelAccuracy": number, "assumptionsReliability": number }
  },
  "confidence": number
}`;
  }

  private buildRegulatoryPrompt(): string {
    return `You are an OJK (Otoritas Jasa Keuangan) Regulatory Compliance Officer for Indonesian insurance.
Analyze the insurance product and check compliance against these four regulations:

1. POJK 23/2015 - Product Registration: product registered before sale, actuarial memorandum, clear policy wording, no misleading marketing.
2. POJK 69/2016 - Actuarial Practice: appointed actuary certification, reserve adequacy (120% solvency margin), annual valuation reports.
3. POJK 76/2016 - Micro-Insurance (apply only if micro product): premium cap Rp 300,000/year, sum assured cap Rp 20M life / Rp 10M health, simplified underwriting.
4. POJK 13/2018 - Digital Innovation: if digital channel used, check sandbox eligibility, consumer protection, data security requirements.

For each check, cite the specific article (e.g. "Pasal 4 POJK 23/2015").
overallCompliance must be one of: compliant, non-compliant, requires_sandbox.

Return ONLY this JSON (no markdown, no explanation):
{
  "overallCompliance": "compliant|non-compliant|requires_sandbox",
  "checks": {
    "POJK 23/2015 (Registration)": "pass|fail",
    "POJK 69/2016 (Actuarial)": "pass|fail",
    "POJK 76/2016 (Micro)": "pass|fail|n/a",
    "POJK 13/2018 (Digital)": "pass|fail|n/a"
  },
  "recommendations": [
    { "priority": "high|medium|low", "issue": "string", "action": "string", "articleReference": "Pasal X POJK YY/YYYY" }
  ]
}`;
  }

  private async callWithRetry(system: string, user: string, model?: string, retries = 2): Promise<string> {
    const targetModel = model || this.model;
    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 50000);

      try {
        const response = await this.client.chat.completions.create({
          model: targetModel,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }, { signal: controller.signal });

        clearTimeout(timeout);
        const text = response.choices[0]?.message?.content || '{}';
        console.log(`📥 Response: ${text.length} chars (attempt ${attempt})`);
        return text;
      } catch (err: any) {
        clearTimeout(timeout);
        const isAbort = err?.name === 'AbortError' || err?.message?.includes('aborted');
        console.error(`Attempt ${attempt} failed: ${err?.message}`);

        if (attempt === retries) throw err;
        if (!isAbort) throw err; // Don't retry non-timeout errors

        console.log(`🔄 Retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    throw new Error('All retry attempts failed');
  }

  private extractJSON(text: string): any {
    // Strip markdown fences
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');

    if (first === -1 || last === -1) {
      console.error('No JSON braces found. Raw response:', cleaned.substring(0, 300));
      throw new Error('AI did not return valid JSON');
    }

    try {
      return JSON.parse(cleaned.substring(first, last + 1));
    } catch (e) {
      console.error('JSON parse failed. Snippet:', cleaned.substring(first, first + 300));
      throw new Error(`JSON parse error: ${e}`);
    }
  }
}
