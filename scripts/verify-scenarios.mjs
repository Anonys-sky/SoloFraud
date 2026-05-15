/**
 * Quick scenario checks (no API). Run: node scripts/verify-scenarios.mjs
 */

const offTopicLife =
  /\b(girlfriend|boyfriend|dating|relationship advice|how to get a (girl|boy|girlfriend|boyfriend)|love life|marriage advice|homework|recipe|football|movie|weather)\b/i;
const scamSignals =
  /\b(scam|fraud|phish|penipu|romance scam|love scam|bank|negara|bnm|pdrm|polis|parcel|customs|kastam|tac|otp|whatsapp|telegram|caller|sms|email|suspicious|impersonat|fake|invest|crypto|macau|hadiah|winner|compromised|semak|semakmule|997|nsrc|laporan|report a scam|blacklist|akaun|transfer|wang|hilang|authority|online safety|protect yourself|semak mule)\b/i;

function isInScope(text) {
  const t = text.trim().toLowerCase();
  if (t.length < 2) return false;
  if (offTopicLife.test(t) && !scamSignals.test(t)) return false;
  if (scamSignals.test(t)) return true;
  if (/\+?60[\d\s-]{8,}|https?:\/\/|www\.|bit\.ly|RM\s?\d/i.test(text)) return true;
  if (
    /\b(is this (real|legit)|should i trust|someone (called|texted|messaged)|i (received|got) (a|an)|check (this|if)|help me (verify|check))\b/i.test(
      t
    )
  )
    return true;
  return false;
}

function offlineHighRisk(msg) {
  const m = msg.toLowerCase();
  return (
    (m.includes("tac") && (m.includes("nombor") || m.includes("code"))) ||
    (m.includes("bank") && (m.includes("alert") || m.includes("security") || m.includes("blocked"))) ||
    m.includes("hadiah") ||
    m.includes("tahniah") ||
    m.includes("parcel") ||
    m.includes("maybank") ||
    m.includes("cimb")
  );
}

const cases = [
  {
    name: "Analyzer: Macau scam (BM)",
    text: "Tahniah! Anda telah memenangi RM50,000 daripada Maybank. Sila klik link ini: bit.ly/maybnk-winner2026",
    expectInScope: true,
    expectHighRisk: true,
  },
  {
    name: "Analyzer: TAC theft",
    text: "CIMB ALERT: Unauthorized login detected. Reply with your 6-digit TAC code immediately.",
    expectInScope: true,
    expectHighRisk: true,
  },
  {
    name: "Analyzer: Parcel scam",
    text: "Your parcel #MY839201 is held at customs. Pay RM12.90 within 2 hours: https://pos-my-delivery.cc/pay",
    expectInScope: true,
    expectHighRisk: true,
  },
  {
    name: "Analyzer: off-topic girlfriend",
    text: "can u give me advice to get girlfriend?",
    expectInScope: false,
    expectHighRisk: false,
  },
  {
    name: "Advisor: Bank Negara (in scope)",
    text: "Someone called saying they're from Bank Negara and my account is compromised. Is this real?",
    expectInScope: true,
    expectHighRisk: false,
  },
  {
    name: "Analyzer: empty-ish",
    text: "hello how are you",
    expectInScope: false,
    expectHighRisk: false,
  },
];

let passed = 0;
let failed = 0;

for (const c of cases) {
  const inScope = isInScope(c.text);
  const highRisk = offlineHighRisk(c.text);
  const scopeOk = inScope === c.expectInScope;
  const riskOk = !c.expectHighRisk || highRisk;
  const ok = scopeOk && riskOk;
  if (ok) {
    passed++;
    console.log(`✓ ${c.name}`);
  } else {
    failed++;
    console.log(`✗ ${c.name}`);
    console.log(`  inScope: ${inScope} (expected ${c.expectInScope})`);
    console.log(`  heuristicHighRisk: ${highRisk} (expected ${c.expectHighRisk})`);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
