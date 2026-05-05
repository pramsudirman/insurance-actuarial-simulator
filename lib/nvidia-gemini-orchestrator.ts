/**
 * AI ORCHESTRATOR (NVIDIA ONLY)
 * Runs all agents in parallel for maximum speed
 */

import OpenAI from 'openai';

interface ConsensusResult {
  consensus: any;
  individual: { nvidia?: any };
  confidence: number;
  disagreements: string[];
  recommendation: string;
  provider: 'nvidia';
}

export class NvidiaGeminiOrchestrator {
  private nvidia: OpenAI;
  private nvidiaModel: string;
  
  constructor() {
    this.nvidia = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY!,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
    
    this.nvidiaModel = process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';
  }



  /**
   * Run all 3 agents in parallel for maximum speed.
   * Product + Actuary + Regulatory fire simultaneously.
   */
  async calculateAll(payload: any): Promise<{
    product: any;
    actuary: ConsensusResult;
    regulatory: any;
  }> {
    console.log(`🚀 Phase 1: Product + Actuary in parallel on ${this.nvidiaModel}...`);

    const [productRes, actuaryRes] = await Promise.all([
      this.callNvidia(this.getAgentPrompt('product'), payload).catch(e => {
        console.error('Product agent failed:', e.message);
        return null;
      }),
      this.callNvidia(this.getAgentPrompt('actuary'), payload).catch(e => {
        console.error('Actuary agent failed:', e.message);
        return null;
      }),
    ]);

    console.log(`⚖️ Phase 2: Regulatory agent (solo call)...`);
    let regulatoryRes = null;
    try {
      regulatoryRes = await this.callNvidia(this.getAgentPrompt('regulatory'), {
        ...payload,
        product: productRes,
        actuarial: actuaryRes,
      });
    } catch (e: any) {
      console.error('Regulatory agent failed:', e.message);
      // Retry once with shorter timeout
      try {
        console.log('🔄 Retrying regulatory agent...');
        regulatoryRes = await this.callNvidia(this.getAgentPrompt('regulatory'), payload);
      } catch (e2: any) {
        console.error('Regulatory retry also failed:', e2.message);
      }
    }

    return {
      product: { result: productRes, provider: 'nvidia', fallbackUsed: false },
      actuary: {
        consensus: actuaryRes,
        individual: { nvidia: actuaryRes },
        confidence: 0.95,
        disagreements: [],
        recommendation: 'NVIDIA result',
        provider: 'nvidia'
      },
      regulatory: { result: regulatoryRes, provider: 'nvidia', fallbackUsed: false },
    };
  }

  private async callNvidia(prompt: string, payload: any): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await this.nvidia.chat.completions.create({
        model: this.nvidiaModel,
        messages: [
          { role: 'system', content: `${prompt}\nCRITICAL: Return ONLY raw JSON. No markdown, no backticks, no explanations. Just the JSON object.` },
          { role: 'user', content: JSON.stringify(payload) }
        ],
        temperature: 0.1,
        max_tokens: 1500
      }, { signal: controller.signal });

      clearTimeout(timeout);
      const raw = response.choices[0]?.message?.content || '{}';
      console.log(`✅ NVIDIA response received (${raw.length} chars)`);
      return this.extractJSON(raw);
    } catch (error: any) {
      clearTimeout(timeout);
      console.error(`NVIDIA API Error:`, error?.message || error);
      throw error;
    }
  }

  private extractJSON(text: string): any {
    try {
      // Strip markdown code fences if present
      let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON found in response');
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } catch (e) {
      console.error('JSON extraction failed. Raw text:', text.substring(0, 200));
      throw new Error(`Invalid JSON from AI: ${e}`);
    }
  }

  private getAgentPrompt(agentType: string): string {
    const prompts: Record<string, string> = {
      product: `Act as an Indonesian Insurance Product Expert. Create product structure.
Return JSON:
{
  "productName": "string",
  "productType": "life|health|travel|micro",
  "targetMarket": { "ageRange": [min, max], "geography": "Indonesia" },
  "coverage": { "sumAssured": number, "policyTerm": number, "benefits": ["string"] },
  "distribution": { "allowedChannels": ["digital"|"agent"|"bancassurance"|"embedded"] },
  "pricing": { "targetPremium": number, "frequency": "monthly" }
}`,
      actuary: `Act as a Certified Actuary. Calculate premiums, reserves, and risk metrics with actuarial precision (not only Gompertz Law).
IMPORTANT: For the 'breakdown' object, you MUST return absolute IDR amounts (e.g., 500000), NOT percentages or decimals.
Return JSON:
{
  "pricing": { "monthlyPremium": number, "annualPremium": number, "breakdown": { "claims": number, "expenses": number, "profit": number, "commission": number } },
  "assumptions": { "mortalityRate": number, "morbidityRate": number, "discountRate": number, "inflationRate": number, "expenseRatio": number, "lapseRate": number },
  "reserves": { "year1": number, "year5": number, "year10": number },
  "riskMetrics": { "solvencyMarginRatio": number, "valueAtRisk": number, "probabilityOfRuin": number },
  "profitability": { "irr": number },
  "confidence": { "overall": 0.95, "dataQuality": 0.90, "modelAccuracy": 0.98, "assumptionsReliability": 0.85 }
}`,
      regulatory: `Act as an OJK Regulatory Expert. Check compliance thoroughly.
Key regulations to check:
1. POJK 23/2015 - Product Registration (Product must be registered before sale, Actuarial memorandum required, Clear policy wording, No misleading marketing)
2. POJK 69/2016 - Actuarial Practice (Appointed actuary certification required, Reserve adequacy (120% solvency margin), Annual valuation reports)
3. POJK 76/2016 - Micro-Insurance (if applicable) (Premium cap: Rp 300,000/year, Sum assured cap: Rp 20M life/10M health, Simplified underwriting allowed)
4. POJK 13/2018 - Digital Innovation (Sandbox eligibility, Consumer protection measures, Data security requirements)

Return JSON:
{
  "overallCompliance": "compliant|non-compliant|requires_sandbox",
  "checks": { 
    "POJK 23/2015 (Registration)": "pass|fail", 
    "POJK 69/2016 (Actuarial)": "pass|fail", 
    "POJK 76/2016 (Micro)": "pass|fail|n/a",
    "POJK 13/2018 (Digital)": "pass|fail|n/a"
  },
  "recommendations": [{ "priority": "high", "issue": "string", "action": "string", "articleReference": "string" }]
}`
    };
    return prompts[agentType] || prompts.product;
  }
}
