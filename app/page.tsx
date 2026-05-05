"use client";

import { useState, useEffect } from "react";

function LoadingMessage() {
  const [step, setStep] = useState(0);
  const messages = [
    "computing TMI 2011 mortality table...",
    "applying prospective reserve method...",
    "running OJK regulatory check...",
    "finalizing compliance citations..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < messages.length - 1 ? s + 1 : s));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return <span className="italic text-[#8c857b] tracking-wider text-sm">{messages[step]}</span>;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    productName: "Term Life Indonesia",
    productType: "life",
    ageMin: 25,
    ageMax: 55,
    geography: "Indonesia",
    sumAssured: 500000000,
    policyTerm: 10,
    distributionChannel: "digital"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.productName,
          productType: formData.productType,
          targetMarket: {
            ageRange: [formData.ageMin, formData.ageMax],
            geography: formData.geography
          },
          coverage: {
            sumAssured: formData.sumAssured,
            policyTerm: formData.policyTerm
          },
          distribution: {
            channels: [formData.distributionChannel]
          }
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to calculate pricing.");
    } finally {
      setLoading(false);
    }
  };

  const s = result?.summary;

  return (
    <main className="min-h-screen bg-[#F9F8F6] text-[#4A443C] selection:bg-[#DED7CF] font-sans">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-16 md:mb-24 flex flex-col items-start border-b border-[#EBE8E3] pb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-[#2D2A26] mb-4 font-serif">
            Actuarial Simulator
          </h1>
          <p className="text-[#8C857B] text-lg font-light tracking-wide">
            Indonesian insurance pricing · OJK regulatory compliance · TMI 2011 mortality table
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Form Section */}
          <section className="lg:col-span-5">
            <h2 className="text-xl font-medium tracking-wide mb-8 text-[#2D2A26]">Product Configuration</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8C857B] mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full bg-transparent border-b border-[#DED7CF] py-2 focus:border-[#4A443C] outline-none transition-colors text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8C857B] mb-2">Product Type</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full bg-transparent border-b border-[#DED7CF] py-2 focus:border-[#4A443C] outline-none transition-colors text-lg appearance-none cursor-pointer"
                  >
                    <option value="life">Life Insurance</option>
                    <option value="health">Health Insurance</option>
                    <option value="travel">Travel Insurance</option>
                    <option value="micro">Micro Insurance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8C857B] mb-2">Sum Assured (IDR)</label>
                  <input
                    type="number"
                    value={Number.isNaN(formData.sumAssured) ? "" : formData.sumAssured}
                    onChange={(e) => setFormData({ ...formData, sumAssured: parseInt(e.target.value) })}
                    className="w-full bg-transparent border-b border-[#DED7CF] py-2 focus:border-[#4A443C] outline-none transition-colors text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8C857B] mb-2">Policy Term (yrs)</label>
                  <input
                    type="number"
                    value={Number.isNaN(formData.policyTerm) ? "" : formData.policyTerm}
                    onChange={(e) => setFormData({ ...formData, policyTerm: parseInt(e.target.value) })}
                    className="w-full bg-transparent border-b border-[#DED7CF] py-2 focus:border-[#4A443C] outline-none transition-colors text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8C857B] mb-2">Min Age</label>
                  <input
                    type="number"
                    value={Number.isNaN(formData.ageMin) ? "" : formData.ageMin}
                    onChange={(e) => setFormData({ ...formData, ageMin: parseInt(e.target.value) })}
                    className="w-full bg-transparent border-b border-[#DED7CF] py-2 focus:border-[#4A443C] outline-none transition-colors text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8C857B] mb-2">Max Age</label>
                  <input
                    type="number"
                    value={Number.isNaN(formData.ageMax) ? "" : formData.ageMax}
                    onChange={(e) => setFormData({ ...formData, ageMax: parseInt(e.target.value) })}
                    className="w-full bg-transparent border-b border-[#DED7CF] py-2 focus:border-[#4A443C] outline-none transition-colors text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#8C857B] mb-2">Distribution Channel</label>
                <select
                  value={formData.distributionChannel}
                  onChange={(e) => setFormData({ ...formData, distributionChannel: e.target.value })}
                  className="w-full bg-transparent border-b border-[#DED7CF] py-2 focus:border-[#4A443C] outline-none transition-colors text-lg appearance-none cursor-pointer"
                >
                  <option value="digital">Digital (e-commerce, app)</option>
                  <option value="agent">Agency Force</option>
                  <option value="bancassurance">Bancassurance</option>
                  <option value="embedded">Embedded Insurance</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-12 py-4 px-6 uppercase tracking-widest text-xs transition-all duration-500 flex items-center justify-between group ${
                  loading
                    ? "bg-[#EBE8E3] text-[#A69F96] cursor-not-allowed"
                    : "bg-[#2D2A26] text-[#F9F8F6] hover:bg-[#4A443C]"
                }`}
              >
                {loading ? "Calculating..." : "Calculate Premium"}
                {!loading && <span className="transform transition-transform group-hover:translate-x-2">→</span>}
              </button>
            </form>
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7 flex flex-col justify-center min-h-[400px]">
            {!loading && !result && (
              <div className="h-full flex items-center justify-center border border-[#EBE8E3] bg-[#FAF9F7]">
                <p className="text-[#A69F96] text-sm tracking-widest uppercase font-light text-center px-12 leading-relaxed">
                  Premium computed from TMI 2011 mortality table · Regulations verified against OJK POJK
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse bg-[#FAF9F7] border border-[#EBE8E3]">
                <div className="w-16 h-16 border-[1px] border-[#DED7CF] border-t-[#8C857B] rounded-full animate-spin"></div>
                <LoadingMessage />
              </div>
            )}

            {result && !result.success && (
              <div className="bg-[#FFF4F2] border-l-4 border-[#D97972] p-8">
                <h3 className="text-xl font-medium text-[#2D2A26] mb-2">Calculation Failed</h3>
                <p className="text-[#8C857B] text-sm mb-4">Check API key or input values.</p>
                <div className="bg-white/50 p-4 font-mono text-xs text-[#D97972]">
                  {result.message || result.error || "Unknown error"}
                </div>
              </div>
            )}

            {result && result.success && s && (
              <div className="space-y-10 animate-fade-in">

                {/* Premium Hero */}
                <div className="bg-[#F2EFEA] p-10 border border-[#EBE8E3]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-widest text-[#8C857B]">Monthly Premium</p>
                    <span className="text-[10px] uppercase tracking-widest bg-[#EBE8E3] text-[#4A443C] px-2 py-1">
                      Deterministic · TMI 2011
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl text-[#8C857B] font-light">IDR</span>
                    <span className="text-5xl lg:text-6xl font-light text-[#2D2A26] font-serif">
                      {s.monthlyPremium?.toLocaleString() || "---"}
                    </span>
                    <span className="text-sm text-[#8C857B] tracking-wide ml-2">/ month</span>
                  </div>
                  <div className="flex gap-6 text-sm text-[#8C857B]">
                    <span>Annual: IDR {s.annualPremium?.toLocaleString() || "---"}</span>
                    <span>·</span>
                    <span>Net (pure risk): IDR {s.netAnnualPremium?.toLocaleString() || "---"}</span>
                    <span>·</span>
                    <span>Entry age: {s.entryAge}</span>
                  </div>
                </div>

                {/* Actuarial Breakdown */}
                <div>
                  <h2 className="text-xl font-serif text-[#2D2A26] mb-6">Actuarial Breakdown</h2>

                  {/* Premium Breakdown */}
                  <div className="bg-[#FAF9F7] p-8 border border-[#EBE8E3] mb-6">
                    <h3 className="text-sm uppercase tracking-widest text-[#2D2A26] mb-5">Premium Components</h3>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "Expected Claims (net premium)", key: "claims" },
                        { label: "Expenses", key: "expenses" },
                        { label: "Commission", key: "commission" },
                        { label: "Profit Margin", key: "profit" },
                      ].map(({ label, key }) => (
                        <div key={key} className="flex justify-between border-b border-[#EBE8E3] pb-2">
                          <span className="text-[#4A443C]">{label}</span>
                          <span className="font-medium">
                            Rp {(s.premiumBreakdown?.[key] || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between bg-[#F2F5F1] p-3 -mx-3 font-semibold text-[#2D2A26] mt-2">
                        <span>Total Annual Premium</span>
                        <span>Rp {s.annualPremium?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actuarial Assumptions */}
                  <div className="bg-[#FAF9F7] p-8 border border-[#EBE8E3] mb-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm uppercase tracking-widest text-[#2D2A26]">Actuarial Assumptions</h3>
                      <span className="text-[10px] uppercase tracking-widest bg-[#EBE8E3] text-[#4A443C] px-2 py-1">
                        {s.assumptions?.mortalityTable || "TMI 2011"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-8">
                      {[
                        { label: "Mortality Rate (qx)", value: `${(s.assumptions?.mortalityRate * 1000 || 0).toFixed(2)}‰` },
                        { label: "Morbidity Rate", value: s.assumptions?.morbidityRate > 0 ? `${(s.assumptions.morbidityRate * 100).toFixed(1)}%` : "N/A" },
                        { label: "Discount Rate", value: `${(s.assumptions?.discountRate * 100 || 0).toFixed(1)}%` },
                        { label: "Inflation Rate", value: `${(s.assumptions?.inflationRate * 100 || 0).toFixed(1)}%` },
                        { label: "Expense Ratio", value: `${(s.assumptions?.expenseRatio * 100 || 0).toFixed(0)}%` },
                        { label: "Commission Rate", value: `${(s.assumptions?.commissionRate * 100 || 0).toFixed(0)}%` },
                        { label: "Lapse Rate", value: `${(s.assumptions?.lapseRate * 100 || 0).toFixed(1)}%` },
                        { label: "Claims Ratio", value: `${(s.profitability?.claimsRatio * 100 || 0).toFixed(1)}%` },
                        { label: "IRR", value: `${(s.profitability?.irr * 100 || 0).toFixed(0)}%` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[#8C857B] text-xs mb-1">{label}</p>
                          <p className="text-base font-medium text-[#2D2A26]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reserve Projections */}
                  <div className="bg-[#FAF9F7] p-8 border border-[#EBE8E3] mb-6">
                    <h3 className="text-sm uppercase tracking-widest text-[#2D2A26] mb-5">Reserve Projections</h3>
                    <div className="grid grid-cols-3 gap-8">
                      {[
                        { label: "Year 1", value: s.reserves?.year1 },
                        { label: "Year 5", value: s.reserves?.year5 },
                        { label: "Year 10", value: s.reserves?.year10 },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[#8C857B] text-xs mb-1">{label}</p>
                          <p className="font-medium text-[#2D2A26]">Rp {(value || 0).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#EBE8E3] flex gap-8 text-sm">
                      <div>
                        <p className="text-[#8C857B] text-xs mb-1">Solvency Margin Ratio</p>
                        <p className={`font-medium ${(s.riskMetrics?.solvencyMarginRatio || 0) >= 1.2 ? "text-[#7D8C7A]" : "text-[#D97972]"}`}>
                          {(s.riskMetrics?.solvencyMarginRatio || 0).toFixed(2)}x
                          {(s.riskMetrics?.solvencyMarginRatio || 0) >= 1.2 ? " ✓" : " ✗ < 1.20 OJK min"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#8C857B] text-xs mb-1">VaR (95th pct)</p>
                        <p className="font-medium text-[#2D2A26]">Rp {(s.riskMetrics?.valueAtRisk || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence + Regulatory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Confidence */}
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-[#2D2A26] border-b border-[#EBE8E3] pb-3 mb-5 flex justify-between">
                      <span>Model Confidence</span>
                      <span>{Math.round((s.confidenceBreakdown?.overall || 0) * 100)}%</span>
                    </h3>
                    <ul className="space-y-4">
                      {Object.entries(s.confidenceBreakdown || {}).map(([key, value]) => {
                        if (key === "overall") return null;
                        const score = Number(value);
                        return (
                          <li key={key} className="text-sm">
                            <div className="flex justify-between text-[#8C857B] mb-1">
                              <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                              <span>{Math.round(score * 100)}%</span>
                            </div>
                            <div className="w-full h-[1px] bg-[#EBE8E3]">
                              <div className="h-full bg-[#8C857B]" style={{ width: `${score * 100}%` }}></div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Regulatory */}
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-[#2D2A26] border-b border-[#EBE8E3] pb-3 mb-5 flex justify-between">
                      <span>OJK Regulatory Status</span>
                      <span className={
                        !s.complianceStatus || s.complianceStatus === "Unknown" ? "text-[#B5AFA6]" :
                        String(s.complianceStatus).toLowerCase().includes("compliant") ? "text-[#7D8C7A]" :
                        s.complianceStatus === "requires_sandbox" ? "text-[#C9A84C]" :
                        "text-[#D97972]"
                      }>
                        {!s.complianceStatus || s.complianceStatus === "Unknown" ? "Pending" : s.complianceStatus}
                      </span>
                    </h3>

                    {(!s.complianceStatus || s.complianceStatus === "Unknown") && Object.keys(s.complianceChecks || {}).length === 0 && (
                      <p className="text-sm text-[#B5AFA6] italic">Regulatory check timed out. Re-run to retry.</p>
                    )}

                    <ul className="space-y-3">
                      {Object.entries(s.complianceChecks || {}).map(([rule, status]) => (
                        <li key={rule} className="flex justify-between items-center text-sm border-b border-[#F2EFEA] pb-2 last:border-0">
                          <span className="text-[#8C857B] truncate pr-4 text-xs">{rule}</span>
                          <span className={`uppercase tracking-widest text-[10px] px-2 py-1 ${
                            String(status).toLowerCase() === "pass"
                              ? "bg-[#F2F5F1] text-[#7D8C7A]"
                              : String(status).toLowerCase() === "n/a"
                              ? "bg-[#F2EFEA] text-[#B5AFA6]"
                              : "bg-[#FFF4F2] text-[#D97972]"
                          }`}>
                            {String(status)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {s.recommendations?.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-[#EBE8E3]">
                        <h4 className="text-xs uppercase tracking-widest text-[#8C857B] mb-4">POJK Citations</h4>
                        <ul className="space-y-3">
                          {s.recommendations.map((rec: any, i: number) => (
                            <li key={i} className="bg-[#F9F8F6] p-3 border-l-2 border-[#DED7CF] text-sm">
                              <p className="text-[#2D2A26] font-medium mb-1">{rec.issue}</p>
                              <p className="text-[#8C857B] mb-2">{rec.action}</p>
                              {rec.articleReference && (
                                <span className="inline-block bg-[#EBE8E3] text-[#4A443C] text-[10px] px-2 py-1 uppercase tracking-wider">
                                  {rec.articleReference}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
