/**
 * Regulatory Orchestrator — single NVIDIA NIM call
 *
 * Actuarial math moved to lib/actuarial-engine.ts (deterministic, TMI 2011).
 * This module only handles OJK regulatory compliance reasoning via LLM,
 * where natural-language judgement on article applicability is needed.
 */

import OpenAI from 'openai';
import type { EngineInput, EngineOutput } from './actuarial-engine';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RegulatoryResult {
  overallCompliance: 'compliant' | 'non-compliant' | 'requires_sandbox';
  checks: Record<string, 'pass' | 'fail' | 'n/a'>;
  recommendations: Array<{ priority: string; issue: string; action: string; articleReference: string }>;
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export class ActuarialOrchestrator {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY!,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
    this.model = process.env.NVIDIA_MODEL || 'meta/llama-3.2-3b-instruct';
  }

  async checkRegulatory(payload: EngineInput, actuarial: EngineOutput): Promise<RegulatoryResult> {
    const context = {
      product: {
        type: payload.productType,
        sumAssured: payload.sumAssured,
        policyTerm: payload.policyTerm,
        ageRange: payload.ageRange,
        channels: payload.distributionChannels,
      },
      actuarial: {
        annualPremium: actuarial.pricing.annualPremium,
        solvencyMarginRatio: actuarial.riskMetrics.solvencyMarginRatio,
        reserves: actuarial.reserves,
        mortalityTable: actuarial.assumptions.mortalityTable,
      },
    };

    const raw = await this.callWithRetry(this.buildRegulatoryPrompt(), JSON.stringify(context, null, 2));
    return this.extractJSON(raw) as RegulatoryResult;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private buildRegulatoryPrompt(): string {
    let ojkKnowledgeBase = '';
    try {
      const fs = require('fs');
      const path = require('path');
      const kbPath = path.join(process.cwd(), 'ojk_knowledge_base.md');
      ojkKnowledgeBase = fs.readFileSync(kbPath, 'utf-8');
    } catch (e) {
      console.warn('⚠️ Could not load OJK Knowledge Base, falling back to basic knowledge.', e);
    }

    const fallbackRules = `1. UU 40/2014 — Insurance Law: min paid-up capital Rp 150B (life)/Rp 100B (general), fit & proper test, appointed actuary mandatory.
2. POJK 23/2015 — Product Registration: actuarial memorandum required, OJK approval before marketing, clear Bahasa Indonesia policy wording.
3. POJK 69/2016 — Actuarial Practice: solvency margin >= 120%, FSAI-certified actuary, annual actuarial valuation.
4. POJK 76/2016 — Micro Insurance (productType=micro only): premium cap Rp 300k/year, SA cap Rp 20M life/Rp 10M health, claims settled within 10 business days.
5. POJK 13/2018 — Digital Innovation: OJK sandbox registration required for digital channels, data localization in Indonesia.
6. POJK 14/2020 — Bancassurance (channel=bancassurance only): referral vs integration model disclosure, commission transparency, certified sales staff.
7. POJK 5/2023 — Risk-Based Supervision: ICS parallel run with RBC, periodic risk self-assessment framework.
8. POJK 8/2023 — Consumer Protection: 14-day cooling-off period, free complaints mechanism within 20 business days, no data usage beyond consent.
9. SEOJK 18/2021 — Digital Marketing: e-policy valid with certified e-signature, digital acknowledgement before first premium, marketing pre-approved by actuary.
10. SEOJK 5/2022 — PAYDI/Unit Link (investment-linked only): risk profile assessment, no 100% first-year acquisition cost allocation, welcoming call mandatory.
11. UU PDP 27/2022 — Data Protection: explicit consent for sensitive data, breach notification, fines up to 2% annual revenue.`;

    return `You are an OJK (Otoritas Jasa Keuangan) Regulatory Compliance Officer for Indonesian insurance.
Analyze the insurance product and actuarial data below. Check compliance against the regulations below.

--- OJK KNOWLEDGE BASE ---
${ojkKnowledgeBase || fallbackRules}
--------------------------

Rules:
- Cite specific article (e.g. "Pasal 4 POJK 23/2015") in every recommendation.
- overallCompliance: "compliant" if all relevant checks pass; "requires_sandbox" if digital channel but not yet registered; "non-compliant" otherwise.
- Do not invent numbers — use the actuarial data provided.

Return ONLY this JSON (no markdown, no explanation):
{
  "overallCompliance": "compliant|non-compliant|requires_sandbox",
  "checks": {
    "UU 40/2014 (Licensing)": "pass|fail",
    "POJK 23/2015 (Registration)": "pass|fail",
    "POJK 69/2016 (Actuarial)": "pass|fail",
    "POJK 76/2016 (Micro)": "pass|fail|n/a",
    "POJK 13/2018 (Digital)": "pass|fail|n/a",
    "POJK 14/2020 (Bancassurance)": "pass|fail|n/a",
    "POJK 5/2023 (Risk-Based)": "pass|fail",
    "POJK 8/2023 (Consumer)": "pass|fail",
    "SEOJK 18/2021 (E-Policy)": "pass|fail|n/a",
    "SEOJK 5/2022 (PAYDI/Unit Link)": "pass|fail|n/a",
    "UU PDP 27/2022 (Data Protection)": "pass|fail"
  },
  "recommendations": [
    { "priority": "high|medium|low", "issue": "string", "action": "string", "articleReference": "Pasal X POJK YY/YYYY" }
  ]
}`;
  }

  private async callWithRetry(system: string, user: string, retries = 2): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 50000);

      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.1,
          max_tokens: 1500,
        }, { signal: controller.signal });

        clearTimeout(timeout);
        const text = response.choices[0]?.message?.content || '{}';
        console.log(`📥 Regulatory response: ${text.length} chars (attempt ${attempt})`);
        return text;
      } catch (err: any) {
        clearTimeout(timeout);
        const isAbort = err?.name === 'AbortError' || err?.message?.includes('aborted');
        console.error(`Attempt ${attempt} failed: ${err?.message}`);
        if (attempt === retries) throw err;
        if (!isAbort) throw err;
        console.log(`🔄 Retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    throw new Error('All retry attempts failed');
  }

  private extractJSON(text: string): unknown {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');

    if (first === -1 || last === -1) {
      console.error('No JSON braces found:', cleaned.substring(0, 300));
      throw new Error('Regulatory LLM did not return valid JSON');
    }

    try {
      return JSON.parse(cleaned.substring(first, last + 1));
    } catch (e) {
      console.error('JSON parse failed:', cleaned.substring(first, first + 300));
      throw new Error(`Regulatory JSON parse error: ${e}`);
    }
  }
}
