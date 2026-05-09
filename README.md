Access here: https://insurance-actuarial-simulator.vercel.app/

---

🏛️ Actuarial Simulator
A PM's Guide to Indonesian Insurance Regulation — Powered by AI
-- 
**The Problem** </br>
You're a product manager at an insurtech in Indonesia. You have a brilliant idea for a new insurance product. But between you and launch lies a labyrinth of OJK regulations: POJK 23/2015, 69/2016, 76/2016, 13/2018 — each with dozens of articles, annexes, and compliance requirements.
Questions that keep you up at night:

Which specific regulatory articles apply to my product?</br>
How do I price this thing actuarially without a degree in mathematics?</br>
What will the compliance team flag before I even get to the first review? </br>
How do reserves work for different policy terms and demographics? </br>

Traditional approach: Email the actuarial team, wait 2 weeks, get a spreadsheet you don't fully understand, rinse and repeat. </br>
This tool gives you the dossier in 30 seconds.</br>

**What This Does** </br>
The Actuarial Simulator is a multi-agent AI system that lets non-technical product managers:

Structure an insurance product (just input: age, geography, sum assured, term) </br>
Price it actuarially using the Gompertz mortality model </br>
Validate it against real Indonesian OJK regulations — article by article </br>

**You get a comprehensive regulatory and actuarial dossier that tells you:** </br>
✅ What's compliant </br>
⚠️ What needs adjustment </br>
📊 Expected reserves over 1, 5, and 10 years </br>
🎯 Confidence breakdowns for model assumptions </br>

**Target user:** Insurance Product Managers, Insurtech founders, Strategy teams navigating Indonesia's regulatory landscape. </br>

**Why I Built This** </br>
I'm not an actuary. I'm not a data scientist. I'm a product manager who got tired of being blocked by technical gatekeepers when exploring new insurance products.
I wanted to understand: Could modern LLMs (specifically NVIDIA's Llama 3.1 70B) handle the kind of structured, regulation-heavy reasoning that insurance requires?
Turns out: Yes.
This project started as an experiment to see if I could build something useful without writing complex ML pipelines or multi-provider orchestrations. Just one powerful model, clear agent roles, and a lot of regulatory PDF reading.
If you're a PM who's ever felt like you need a PhD to have a productive conversation about insurance products — this is for you.

--

**The Three Agents
🎯 Product Agent**

What it does: Takes your raw inputs and structures them into a formal insurance product definition </br>
Input: Age, Geography, Sum Assured, Policy Term </br>
Output: Clean JSON representing target market and coverage </br>
Value: Translates "I want to offer life insurance to 30-year-olds in Jakarta" into a structured product spec </br>

**🧮 Actuary Agent**

What it does: The mathematical engine. Calculates premiums and reserves using the Gompertz mortality model </br>
Formula: q(x) = 0.0001 * e^(0.09*x) </br>
Output: </br>
Monthly/annual premium </br>
Expected reserves at 1, 5, and 10 years </br>
Confidence breakdown (Overall, Data Quality, Model Accuracy, Assumptions Reliability) </br>

**Value:** You get actuarial pricing without needing to understand actuarial science </br>

**⚖️ Regulatory Agent**

What it does: Validates your product against Indonesian OJK regulations </br>
Regulations checked: </br>

POJK 23/2015 (Product Development) </br>
POJK 69/2016 (Health Insurance) </br>
POJK 76/2016 (Sharia Insurance) </br>
POJK 13/2018 (Innovation) </br>

Output: Rule-by-rule compliance breakdown </br>
Value: Know exactly which articles you're violating before you submit to compliance </br>

-----

**Technical Architecture (For the Curious)**

**Why NVIDIA Only?**
Originally, this used a complex orchestration between NVIDIA and Google Gemini (for fallback and consensus). I ripped it all out. </br>
Reason:

❌ Free-tier Gemini = frequent 404s and rate limits </br>
❌ Waiting for fallback/consensus = slow </br>
✅ Llama 3.1 70B via NVIDIA = fast, reliable, accurate enough for all three agent roles </br>

**Stack:**

Model: Llama 3.1 70B via NVIDIA NIM </br>
Architecture: Pipelined multi-agent system </br>
Frontend: Wabi-Sabi design philosophy (muted earth tones, high whitespace, organic layouts) </br>
Mortality Model: Gompertz (q(x) = 0.0001 * e^(0.09*x)) </br>


**Design Philosophy: Wabi-Sabi** </br>
Financial software is usually dense, cramped, and anxiety-inducing. </br>
This tool embraces Wabi-Sabi — the Japanese aesthetic of finding beauty in imperfection and transience: </br>

Color Palette: Muted earthy tones, organic whites (#F9F8F6), soft charcoal (#2D2A26) </br>
Typography: Clean sans-serif for UI, elegant serif for headings </br>
Layout: High whitespace, minimal borders, asymmetrical balance </br>
Goal: Create a calm, breathable experience that makes complex regulatory analysis feel approachable </br>

**Because navigating OJK regulations shouldn't feel like drowning.** </br>
