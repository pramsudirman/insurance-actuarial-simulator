/**
 * API ROUTE: /api/pricing/calculate
 * NVIDIA-only pricing engine — all agents run in parallel
 */

import { NextRequest, NextResponse } from 'next/server';
import { NvidiaGeminiOrchestrator } from '@/lib/nvidia-gemini-orchestrator';
import { z } from 'zod';

// Request validation schema
const ProductRequestSchema = z.object({
  productName: z.string().min(1),
  productType: z.enum(['life', 'health', 'travel', 'micro']),
  targetMarket: z.object({
    ageRange: z.tuple([z.number(), z.number()]),
    geography: z.string(),
    demographics: z.string().optional()
  }),
  coverage: z.object({
    sumAssured: z.number().positive(),
    policyTerm: z.number().positive(),
    premiumPaymentPeriod: z.number().positive().optional(),
    benefits: z.array(z.string()).optional(),
    riders: z.array(z.string()).optional()
  }),
  distribution: z.object({
    channels: z.array(z.string()),
    platform: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = ProductRequestSchema.parse(body);
    
    const orchestrator = new NvidiaGeminiOrchestrator();
    
    console.log('🚀 Starting parallel pricing calculation (NVIDIA only)...');
    
    // Fire all 3 agents in parallel — no sequential bottleneck
    const results = await orchestrator.calculateAll(validatedInput);
    
    const actuarialData = results.actuary.consensus || {};
    const regulatoryData = results.regulatory?.result || {};
    const productData = results.product?.result || {};
    
    // Package response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      provider: {
        primary: 'nvidia',
        model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct'
      },
      results: {
        product: productData,
        actuarial: actuarialData,
        regulatory: regulatoryData,
        metadata: {
          confidence: results.actuary?.confidence || 0.90,
          disagreements: results.actuary?.disagreements || [],
          recommendation: results.actuary?.recommendation || 'Result calculated',
        }
      },
      summary: {
        productName: productData?.productName || validatedInput.productName,
        monthlyPremium: actuarialData?.pricing?.monthlyPremium,
        premiumBreakdown: actuarialData?.pricing?.breakdown || {},
        assumptions: actuarialData?.assumptions || {},
        reserves: actuarialData?.reserves || {},
        complianceStatus: regulatoryData?.overallCompliance || "Unknown",
        complianceChecks: regulatoryData?.checks || {},
        recommendations: regulatoryData?.recommendations || [],
        confidence: results.actuary?.confidence || 0.90,
        confidenceBreakdown: actuarialData?.confidence || { overall: 0.90 },
        primaryProvider: 'nvidia'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Pricing calculation failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request format', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
