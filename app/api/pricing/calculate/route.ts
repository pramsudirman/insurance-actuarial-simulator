/**
 * API ROUTE: /api/pricing/calculate
 *
 * Two-stage pipeline:
 *   1. Deterministic actuarial engine (TMI 2011, <1ms, no LLM)
 *   2. NVIDIA NIM regulatory check (OJK POJK citations, LLM)
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculate as engineCalculate } from '@/lib/actuarial-engine';
import { ActuarialOrchestrator } from '@/lib/nvidia-gemini-orchestrator';
import { z } from 'zod';

const ProductRequestSchema = z.object({
  productName: z.string().min(1),
  productType: z.enum(['life', 'health', 'travel', 'micro']),
  targetMarket: z.object({
    ageRange: z.tuple([z.number(), z.number()]),
    geography: z.string(),
    demographics: z.string().optional(),
  }),
  coverage: z.object({
    sumAssured: z.number().positive(),
    policyTerm: z.number().positive(),
    premiumPaymentPeriod: z.number().positive().optional(),
    benefits: z.array(z.string()).optional(),
    riders: z.array(z.string()).optional(),
  }),
  distribution: z.object({
    channels: z.array(z.string()),
    platform: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = ProductRequestSchema.parse(body);

    const engineInput = {
      productType: input.productType,
      ageRange: input.targetMarket.ageRange as [number, number],
      sumAssured: input.coverage.sumAssured,
      policyTerm: input.coverage.policyTerm,
      distributionChannels: input.distribution.channels,
    };

    // Stage 1: deterministic — always fast and reproducible
    const actuarial = engineCalculate(engineInput);

    // Stage 2: LLM regulatory check
    const orchestrator = new ActuarialOrchestrator();
    let regulatory: { overallCompliance: string; checks: Record<string, string>; recommendations: Array<{ priority: string; issue: string; action: string; articleReference: string }> };
    try {
      regulatory = await orchestrator.checkRegulatory(engineInput, actuarial);
    } catch (regErr) {
      console.error('Regulatory check failed (non-fatal):', regErr);
      regulatory = {
        overallCompliance: 'Unknown',
        checks: {},
        recommendations: [],
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      provider: {
        actuarial: 'deterministic',
        mortalityTable: 'TMI 2011',
        regulatory: 'nvidia-nim',
        model: process.env.NVIDIA_MODEL || 'meta/llama-3.2-3b-instruct',
      },
      results: {
        actuarial,
        regulatory,
      },
      summary: {
        productName: input.productName,
        productType: input.productType,
        entryAge: actuarial.assumptions.entryAge,
        monthlyPremium: actuarial.pricing.monthlyPremium,
        annualPremium: actuarial.pricing.annualPremium,
        netAnnualPremium: actuarial.pricing.netAnnualPremium,
        premiumBreakdown: actuarial.pricing.breakdown,
        assumptions: actuarial.assumptions,
        reserves: actuarial.reserves,
        riskMetrics: actuarial.riskMetrics,
        profitability: actuarial.profitability,
        confidenceBreakdown: actuarial.confidence,
        complianceStatus: regulatory.overallCompliance,
        complianceChecks: regulatory.checks,
        recommendations: regulatory.recommendations,
      },
    });

  } catch (error) {
    console.error('Pricing calculation failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
