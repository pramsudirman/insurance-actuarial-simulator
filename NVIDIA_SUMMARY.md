# Actuarial Simulator Architecture Summary

## Overview

The Actuarial Simulator is a multi-agent AI system designed to simulate insurance product structuring, pricing, and regulatory compliance. It leverages a single, high-performance LLM provider (**NVIDIA NIM**) to execute all tasks in a robust, pipelined architecture.

## Why NVIDIA Only?

Previously, the system attempted a complex orchestration between NVIDIA and Google Gemini (for fallback and consensus). This was removed in favor of a pure NVIDIA architecture because:
1. **Reliability**: Free-tier Gemini endpoints frequently resulted in `404 Not Found` or rate limits.
2. **Speed**: Eliminating the fallback/consensus waiting period drastically improved response times.
3. **Capability**: Llama 3.1 70B via NVIDIA is more than capable of executing all three agent roles (Product, Actuary, Regulatory) with high accuracy.

## The Three Agents

1. **Product Agent**
   - **Role**: Takes user inputs (Age, Geography, Sum Assured, Policy Term) and structures a formal insurance product definition.
   - **Output**: Clean JSON representing the target market and coverage.

2. **Actuary Agent**
   - **Role**: The core mathematical engine. Uses the Gompertz mortality model (`q(x) = 0.0001 * e^(0.09*x)`) to calculate expected claims.
   - **Output**: Calculates the monthly/annual premium, reserves over 1, 5, and 10 years, and provides a granular **Confidence Breakdown** (Overall, Data Quality, Model Accuracy, Assumptions Reliability).

3. **Regulatory Agent**
   - **Role**: The compliance checker. Validates the generated product and actuarial data against real-world Indonesian OJK regulations.
   - **Output**: A detailed, rule-by-rule **Compliance Breakdown** verifying adherence to POJK 23/2015, 69/2016, 76/2016, and 13/2018.

## Frontend Design Philosophy

The UI has been completely overhauled to embody **Wabi-Sabi** principles:
- **Color Palette**: Muted earthy tones, organic whites (`#F9F8F6`), and soft charcoal (`#2D2A26`).
- **Typography**: A mix of clean sans-serif for UI elements and elegant serif for headings.
- **Layout**: High utilization of whitespace, minimal borders, and asymmetrical balance to create a calm, breathable user experience, countering the typical density of financial software.
