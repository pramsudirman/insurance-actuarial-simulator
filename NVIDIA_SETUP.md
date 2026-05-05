# NVIDIA AI setup guide for Actuarial Simulator

This guide outlines the streamlined, NVIDIA-only architecture for the Actuarial Simulator engine.

## Core Architecture

The simulator now uses **NVIDIA NIM (meta/llama-3.1-70b-instruct)** exclusively to power all three agents (Product, Actuary, and Regulatory). Gemini has been removed to reduce complexity, eliminate free-tier rate limits/404 errors, and unify the AI pipeline under a single, highly capable provider.

### Why Llama 3.1 70B via NVIDIA?
- **Speed**: Capable of rapid generation, essential for multi-agent workflows.
- **Reasoning**: Strong enough to handle Gompertz mortality calculations and regulatory compliance checks.
- **Simplicity**: No need for complex fallback or consensus loops across different vendor APIs.

## Environment Variables

Ensure your `.env.local` contains the following:

```env
# NVIDIA API Setup (https://build.nvidia.com/)
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_MODEL=meta/llama-3.1-70b-instruct

# Strategy Defaults
DEFAULT_PRICING_STRATEGY=consensus
```

## Agent Pipeline

1. **Product Agent**: Structures the insurance product based on user inputs.
2. **Actuary Agent**: Uses the Gompertz mortality model to calculate premiums, generate a breakdown (claims, expenses, profit), calculate reserves, and provide a confidence breakdown (`overall`, `dataQuality`, `modelAccuracy`, `assumptionsReliability`).
3. **Regulatory Agent**: Checks the product against OJK regulations (POJK 23/2015, POJK 69/2016, POJK 76/2016, POJK 13/2018) and returns a detailed pass/fail breakdown for each rule.

## Running Locally

1. `npm install`
2. `npm run dev`
3. Access at `http://localhost:3002` (or whichever port Next.js binds to).
