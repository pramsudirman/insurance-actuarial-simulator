/**
 * API ROUTE: /api/pricing/calculate
 * Unified single-call NVIDIA inference — all agents in one request.
 */

import { NextRequest, NextResponse } from 'next/server';
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

    const orchestrator = new ActuarialOrchestrator();
    const result = await orchestrator.calculate(input);

    const { product, actuary, regulatory, confidence } = result;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      provider: {
        primary: 'nvidia',
        model: process.env.NVIDIA_MODEL || 'mistralai/mistral-7b-instruct-v0.3',
      },
      results: {
        product: product ?? {},
        actuarial: actuary ?? {},
        regulatory: regulatory ?? {},
        metadata: {
          confidence: confidence ?? 0.9,
          disagreements: [],
          recommendation: 'Unified inference result',
        },
      },
      summary: {
        productName: product?.productName ?? input.productName,
        monthlyPremium: actuary?.pricing?.monthlyPremium,
        premiumBreakdown: actuary?.pricing?.breakdown ?? {},
        assumptions: actuary?.assumptions ?? {},
        reserves: actuary?.reserves ?? {},
        complianceStatus: regulatory?.overallCompliance ?? 'Unknown',
        complianceChecks: regulatory?.checks ?? {},
        recommendations: regulatory?.recommendations ?? [],
        confidence: confidence ?? 0.9,
        confidenceBreakdown: actuary?.confidence ?? { overall: 0.9 },
        primaryProvider: 'nvidia',
      },
    });

  } catch (error) {
    console.error('❌ Pricing calculation failed:', error);

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
