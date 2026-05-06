export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'WATCH';
export type ProductType = 'life' | 'health' | 'travel' | 'micro';
export type Channel = 'digital' | 'agent' | 'bancassurance' | 'embedded';

export interface DossierItem {
  priority: Priority;
  regulation: string;
  issue: string;
  action: string;
  products: ProductType[] | 'all';
  channels: Channel[] | 'all';
}

export const DOSSIER_ITEMS: DossierItem[] = [
  // ── CRITICAL — always show ──────────────────────────────────────────────────
  {
    priority: 'CRITICAL',
    regulation: 'UU 40/2014 Pasal 7',
    issue: 'Minimum paid-up capital requirement before operating',
    action: 'Life insurer: Rp 150 billion paid-up capital minimum. General insurer: Rp 100 billion. If building B2B2C on a licensed carrier, obtain formal Principal Agreement. If applying for own license, prepare capital injection documentation.',
    products: 'all',
    channels: 'all',
  },
  {
    priority: 'CRITICAL',
    regulation: 'POJK 23/2015 Pasal 2 & 9',
    issue: 'OJK product approval + actuarial memorandum required before any marketing',
    action: 'File actuarial memorandum signed by FSAI-certified actuary at least 60 days before target launch. No beta or soft launches until OJK approval is received in writing.',
    products: 'all',
    channels: 'all',
  },
  {
    priority: 'CRITICAL',
    regulation: 'POJK 69/2016 Pasal 24',
    issue: 'Solvency margin must stay above 120% at all times',
    action: 'Do not launch if projected RBC drops below 150% — buffer needed for growth. OJK monitors quarterly. Engage appointed actuary for quarterly RBC certification.',
    products: 'all',
    channels: 'all',
  },
  {
    priority: 'CRITICAL',
    regulation: 'POJK 23/2015 Pasal 46',
    issue: 'Policy wording must be in clear Bahasa Indonesia — no ambiguous clauses',
    action: 'Engage certified legal translator for all policy documents. Budget 3–4 weeks. All exclusion clauses must be in bold and explained in plain language. English-only policies are legally invalid.',
    products: 'all',
    channels: 'all',
  },

  // ── HIGH — digital/embedded ─────────────────────────────────────────────────
  {
    priority: 'HIGH',
    regulation: 'POJK 13/2018 Pasal 3',
    issue: 'Digital distribution requires OJK IKD (Inovasi Keuangan Digital) registration',
    action: 'Apply for Regulatory Sandbox via OJK Innovation Office at minimum 4–5 months before launch. Sandbox is valid 1 year, extendable. All digital partner platforms (e-commerce, super-app) must be listed in the registration.',
    products: 'all',
    channels: ['digital', 'embedded'],
  },
  {
    priority: 'HIGH',
    regulation: 'POJK 13/2018 Pasal 32',
    issue: 'Customer data must be stored in Indonesian data centers (data localization)',
    action: 'Use AWS Jakarta (ap-southeast-3), GCP Jakarta, or Azure Indonesia region only. No cross-border PII transfer. Document data residency architecture for OJK audit.',
    products: 'all',
    channels: ['digital', 'embedded'],
  },
  {
    priority: 'HIGH',
    regulation: 'SEOJK 18/2021 Bagian III.A',
    issue: 'E-policy requires BSrE-certified electronic signature to be legally valid',
    action: 'Integrate with government-certified e-signature provider: Peruri, PrivyID, or Vida. Standard digital signatures (DocuSign, Adobe) are not sufficient for OJK purposes.',
    products: 'all',
    channels: ['digital', 'embedded'],
  },
  {
    priority: 'HIGH',
    regulation: 'SEOJK 18/2021 Bagian III.B',
    issue: 'Digital acknowledgement required from customer before first premium payment',
    action: 'Add explicit checklist + timestamp log to purchase flow. Customer must confirm understanding of: coverage, exclusions, premium, cooling-off rights. OJK can request audit logs for these confirmations.',
    products: 'all',
    channels: ['digital', 'embedded'],
  },

  // ── HIGH — consumer protection (all channels) ────────────────────────────────
  {
    priority: 'HIGH',
    regulation: 'POJK 8/2023 Pasal 12',
    issue: '14-day cooling-off period mandatory for all customers',
    action: 'Build cooling-off cancellation flow in policy admin system from Day 1. Full premium refund, no admin fee. Policy admin system must flag and block cancellation requests outside the 14-day window.',
    products: 'all',
    channels: 'all',
  },
  {
    priority: 'HIGH',
    regulation: 'POJK 8/2023 Pasal 18',
    issue: 'Free complaints mechanism required — resolution within 20 business days',
    action: 'Define escalation: in-app → email → OJK LAPS-SJK. Document SLA. Non-resolution within 20 days creates OJK reportable incident. Assign dedicated complaints officer.',
    products: 'all',
    channels: 'all',
  },
  {
    priority: 'HIGH',
    regulation: 'UU PDP 27/2022 Pasal 16',
    issue: 'Explicit separate consent required for insurance (sensitive) data processing',
    action: 'Redesign onboarding consent flow. Cannot bundle with T&C. Separate explicit consent per data type (health, financial, biometric). Double-opt-in for health data. Fine up to 2% of annual Indonesian revenue for breach.',
    products: 'all',
    channels: 'all',
  },

  // ── MEDIUM — bancassurance ───────────────────────────────────────────────────
  {
    priority: 'MEDIUM',
    regulation: 'POJK 14/2020 Pasal 5',
    issue: 'Must choose and document referral vs integration bancassurance model',
    action: 'Referral model: bank only refers, cannot advise — lower liability. Integration model: bank acts as full agent — requires bank staff OJK certification. Choose before signing bank partnership agreement.',
    products: 'all',
    channels: ['bancassurance'],
  },
  {
    priority: 'MEDIUM',
    regulation: 'POJK 14/2020 Pasal 8',
    issue: 'Mandatory disclosure: insurance is not a bank product, not covered by LPS',
    action: 'Add mandatory disclosure banner at every bancassurance touchpoint (physical and digital). Bank relationship managers must verbally disclose before any product discussion. Log disclosures.',
    products: 'all',
    channels: ['bancassurance'],
  },
  {
    priority: 'MEDIUM',
    regulation: 'POJK 14/2020 Pasal 16',
    issue: 'Commission and fee to bank must be disclosed transparently to customer',
    action: 'Include commission amount or percentage in pre-sales disclosure document. Cannot be bundled or hidden. Disclose in RIPLAY (Ringkasan Informasi Produk dan Layanan).',
    products: 'all',
    channels: ['bancassurance'],
  },

  // ── MEDIUM — micro-specific ──────────────────────────────────────────────────
  {
    priority: 'MEDIUM',
    regulation: 'POJK 76/2016 Pasal 6',
    issue: 'Micro sum assured cap: Rp 20M (life) / Rp 10M (health)',
    action: 'Simulator enforces Rp 300k annual premium cap. Verify SA cap per sub-product during design. Products exceeding caps must be re-classified as standard (non-micro) and re-filed with OJK.',
    products: ['micro'],
    channels: 'all',
  },
  {
    priority: 'MEDIUM',
    regulation: 'POJK 76/2016 Pasal 14',
    issue: 'Micro claims must be settled within 10 business days',
    action: 'Automated claims processing is mandatory — manual review cannot meet SLA. Build straight-through processing for claims below Rp 5M. Assign dedicated micro claims team.',
    products: ['micro'],
    channels: 'all',
  },

  // ── MEDIUM — health-specific ─────────────────────────────────────────────────
  {
    priority: 'MEDIUM',
    regulation: 'POJK 23/2015 Pasal 4',
    issue: 'Health premium must be backed by Indonesian morbidity / utilization data',
    action: 'Supplement TMI 2011 (mortality-based) with Indonesian hospital utilization data. Source from BPJS Kesehatan published statistics or partner with hospital network for claims frequency data before OJK filing.',
    products: ['health'],
    channels: 'all',
  },

  // ── WATCH — forward-looking ───────────────────────────────────────────────────
  {
    priority: 'WATCH',
    regulation: 'POJK 5/2023 Pasal 15',
    issue: 'ICS (Insurance Capital Standard) replaces RBC — transition in progress',
    action: 'Request ICS impact assessment from appointed actuary. Capital requirements may increase 15–30% for some portfolios. Build capital buffer now. OJK requires parallel ICS + RBC run during transition period.',
    products: 'all',
    channels: 'all',
  },
  {
    priority: 'WATCH',
    regulation: 'POJK 13/2018 (Pending)',
    issue: 'No dedicated POJK for embedded insurance yet — regulatory gap',
    action: 'Embedded products currently operate under POJK 13/2018 sandbox. Monitor OJK consultation papers (expected 2026). Structure all embedded products as referral model for lowest regulatory risk in the interim.',
    products: 'all',
    channels: ['embedded'],
  },
];

export function getFilteredItems(
  productType: ProductType,
  channels: Channel[]
): DossierItem[] {
  return DOSSIER_ITEMS.filter((item) => {
    const productMatch =
      item.products === 'all' || item.products.includes(productType);
    const channelMatch =
      item.channels === 'all' ||
      channels.some((ch) => (item.channels as Channel[]).includes(ch));
    return productMatch && channelMatch;
  }).sort((a, b) => {
    const order: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'WATCH'];
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  });
}
