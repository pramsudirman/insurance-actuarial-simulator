# OJK Insurance & Insurtech Regulatory Dossier
**Audience:** Head of Product, Insurtech  
**Context:** Indonesian market entry / new product launch  
**Last updated:** May 2026

---

## TL;DR for the Pitch

Indonesia's insurance penetration is ~3% of GDP vs ASEAN average of 5–6%. OJK is actively encouraging insurtech via sandbox, but the regulatory stack is layered — foundational law → sector POJK → product-specific POJK → circular letters (SEOJK). A new product touches at minimum 6 regulatory instruments before launch.

---

## Priority 1 — WAJIB (Pre-Launch Blockers)

These are hard gates. No product ships without these cleared.

- **[CRITICAL] UU 40/2014 Pasal 7 — Minimum Capital**  
  Life insurer: Rp 150 billion paid-up capital minimum. General insurer: Rp 100 billion.  
  → *If you're building on top of a licensed carrier (B2B2C), skip. If you're applying for your own license, this is Year 1 priority.*

- **[CRITICAL] UU 40/2014 Pasal 8 — Fit & Proper Test**  
  All directors, commissioners, and major shareholders must pass OJK's fit & proper test before the company can operate.  
  → *Submit applications early — OJK processing takes 3–6 months.*

- **[CRITICAL] POJK 23/2015 Pasal 2 — Product Approval Before Marketing**  
  OJK must approve every new product before it goes to market. No beta launches, no soft launches, no "test with 100 users" without a filed product.  
  → *File the actuarial memorandum (Pasal 9) at least 60 days before target launch.*

- **[CRITICAL] POJK 23/2015 Pasal 9 — Actuarial Memorandum**  
  Every product requires a signed actuarial memorandum from a certified actuary (FSAI). This simulator generates the pricing basis — the actuary uses it to sign off.  
  → *Hire or partner with an FSAI-certified actuary before first filing.*

- **[CRITICAL] POJK 69/2016 Pasal 24 — Solvency Margin ≥ 120%**  
  Risk-Based Capital must stay above 120% at all times. OJK monitors quarterly.  
  → *Do not launch if your RBC drops below 150% — you need buffer for growth.*

- **[CRITICAL] POJK 23/2015 Pasal 46 — Policy in Bahasa Indonesia**  
  Policy wording must be in clear, unambiguous Bahasa Indonesia. English-only policies are invalid.  
  → *Engage legal translation for all policy documents. Budget 3–4 weeks.*

---

## Priority 2 — HIGH (Must-Have Within 90 Days of Launch)

These affect legal exposure and customer rights directly.

- **[HIGH] POJK 8/2023 Pasal 12 — 14-Day Cooling-Off Period**  
  Customers can cancel within 14 calendar days of receiving policy, full premium refund, no penalty.  
  → *Build this into the policy admin system (PAS) on Day 1. Non-negotiable for OJK audit.*

- **[HIGH] POJK 8/2023 Pasal 18 — Complaints Mechanism**  
  Must have an accessible, free complaints channel. Resolution within 20 business days.  
  → *Define escalation path: in-app → email → OJK LAPS-SJK (dispute resolution). Document it.*

- **[HIGH] UU PDP 27/2022 Pasal 16 — Explicit Consent for Sensitive Data**  
  Insurance data (health, biometric, financial) classified as sensitive. Double-opt-in consent required.  
  → *Redesign onboarding consent flow. Cannot bundle with T&C. Separate explicit consent per data type.*

- **[HIGH] UU PDP 27/2022 Pasal 20 — Data Security**  
  Technical and organizational measures mandatory. 2% annual revenue fine for breach.  
  → *ISO 27001 or SOC 2 certification recommended before OJK supervisory visit.*

- **[HIGH] POJK 13/2018 Pasal 3 — Sandbox Registration (Digital Channels)**  
  Any digital-native distribution (app, API, e-commerce embedded) requires IKD (Inovasi Keuangan Digital) registration with OJK before launch.  
  → *Apply for sandbox 4–5 months before target launch. Sandbox has 1-year initial period, extendable.*

- **[HIGH] POJK 13/2018 Pasal 32 — Data Localization**  
  All customer data must be stored in data centers located in Indonesia.  
  → *If using AWS/GCP/Azure, use Jakarta region only. No cross-border data transfer for PII.*

---

## Priority 3 — MEDIUM (Channel-Specific, Product-Specific)

Apply only when the specific channel or product type is used.

- **[MEDIUM — Digital Channel] SEOJK 18/2021 Bagian III — E-Policy Validity**  
  E-policy is legally valid only with a BSrE-certified (government-certified) electronic signature.  
  → *Integrate with Peruri or PrivyID for certified e-signature. Not just any digital signature.*

- **[MEDIUM — Digital Channel] SEOJK 18/2021 Bagian III.B — Digital Acknowledgement**  
  Customer must complete a digital acknowledgement (bukan tanda tangan biasa) before paying first premium.  
  → *Add explicit checklist + timestamp log to purchase flow. OJK can request audit logs.*

- **[MEDIUM — Bancassurance] POJK 14/2020 Pasal 5 — Referral vs Integration Model**  
  Referral model: bank only refers, cannot advise. Integration model: bank acts as full agent.  
  → *Choose model before contracting with bank partner. Integration model requires bank staff certification.*

- **[MEDIUM — Bancassurance] POJK 14/2020 Pasal 8 — Non-Bank Product Disclosure**  
  Bank must disclose to customer that insurance product is NOT a bank deposit and NOT covered by LPS.  
  → *Mandatory disclosure banner in all bancassurance touchpoints, physical and digital.*

- **[MEDIUM — Micro] POJK 76/2016 Pasal 6 — Sum Assured Caps**  
  Life micro: SA max Rp 20 million. Health micro: SA max Rp 10 million. Premium max Rp 300k/year.  
  → *Simulator enforces Rp 300k premium cap. Verify SA cap per sub-product during product design.*

- **[MEDIUM — Micro] POJK 76/2016 Pasal 14 — Claims Settlement SLA**  
  Micro insurance claims must be settled within 10 business days of complete documentation.  
  → *Automated claims processing is required. Manual review kills the SLA.*

- **[MEDIUM — Unit Link] SEOJK 5/2022 Pasal III.A — Risk Profile Assessment**  
  For investment-linked products, suitability assessment (risk profile) is mandatory before sale.  
  → *Build a 5-question risk questionnaire into PAYDI onboarding. Store responses.*

- **[MEDIUM — Unit Link] SEOJK 5/2022 Pasal V.A — Welcoming Call**  
  Mandatory post-sale welcoming call, recorded, to verify customer understanding of PAYDI product.  
  → *Integrate with call center or IVR within 3 days of policy issuance.*

---

## Priority 4 — FORWARD-LOOKING (2026–2027 Horizon)

Regulatory changes in motion — build awareness into roadmap.

- **[WATCH] POJK 5/2023 — ICS Transition (Risk-Based Capital)**  
  OJK is transitioning from RBC (Risk-Based Capital) to ICS (Insurance Capital Standard) as per IAIS global framework. Parallel run required during transition.  
  → *Ask your actuary for ICS impact assessment. Capital needs may increase 15–30% for some portfolios.*

- **[WATCH] Embedded Insurance Framework**  
  OJK has not issued a dedicated POJK for embedded insurance yet, but is consulting with industry (2024–2025). Products bundled with e-commerce or ride-hailing currently operate under POJK 13/2018 sandbox.  
  → *Monitor OJK consultation papers. Structure embedded products as referral model for now.*

- **[WATCH] OJK API Standardization**  
  OJK is developing open API standards for insurance data exchange as part of the broader Open Finance framework. Expect mandatory API standards by 2027.  
  → *Design product APIs with standard REST/JSON from day one. Avoid proprietary integrations.*

---

## Regulatory Coverage in This Simulator

| Regulation | Coverage in Simulator | Status |
|---|---|---|
| UU 40/2014 (Insurance Law) | Licensing check via LLM | ✓ |
| POJK 23/2015 (Product Registration) | Actuarial memorandum check | ✓ |
| POJK 69/2016 (Actuarial & RBC) | Deterministic SMR calculation (TMI 2011) | ✓ |
| POJK 76/2016 (Micro Insurance) | Premium cap hard-enforced in engine | ✓ |
| POJK 13/2018 (Digital Sandbox) | Channel-based compliance check via LLM | ✓ |
| POJK 14/2020 (Bancassurance) | Channel-based check via LLM | ✓ |
| POJK 5/2023 (Risk-Based Supervision) | ICS readiness check via LLM | ✓ |
| POJK 8/2023 (Consumer Protection) | Cooling-off + complaints check via LLM | ✓ |
| SEOJK 18/2021 (E-Policy) | Digital channel check via LLM | ✓ |
| SEOJK 5/2022 (PAYDI) | Unit-link product check via LLM | ✓ |
| UU PDP 27/2022 (Data Protection) | Data consent + localization check via LLM | ✓ |

---

## Key Contacts & Resources

- **OJK IKNB (Non-Bank Financial Institutions):** Handles all insurance licensing and product approval
- **OJK Innovation Office:** Manages IKD/Sandbox applications (POJK 13/2018)
- **AAJI (Asosiasi Asuransi Jiwa Indonesia):** Industry association, TMI mortality tables
- **PAI (Persatuan Aktuaris Indonesia):** FSAI certification body
- **LAPS-SJK:** OJK-designated financial sector dispute resolution body
- **Peruri / PrivyID / Vida:** BSrE-certified e-signature providers for e-policy

---

*Disclaimer: This dossier is for internal product planning. Regulatory interpretations should be verified with licensed Indonesian legal counsel and a registered actuary before any OJK submission.*
