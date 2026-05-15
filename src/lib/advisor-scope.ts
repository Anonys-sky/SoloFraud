/**
 * Determines whether an advisor chat message is in scope (scam / fraud / safety).
 * Off-topic messages must not trigger police drafts or SemakMule lookups.
 */
export function isScamRelatedAdvisorQuery(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length < 2) return false;

  const offTopicLife =
    /\b(girlfriend|boyfriend|dating|relationship advice|how to get a (girl|boy|girlfriend|boyfriend)|love life|marriage advice|homework|recipe|football|movie|weather)\b/i;
  const scamSignals =
    /\b(scam|fraud|phish|penipu|romance scam|love scam|bank|negara|bnm|pdrm|polis|parcel|customs|kastam|tac|otp|whatsapp|telegram|caller|sms|email|suspicious|impersonat|fake|invest|crypto|macau|hadiah|winner|compromised|semak|semakmule|997|nsrc|laporan|report a scam|blacklist|akaun|transfer|wang|hilang|authority|online safety|protect yourself|semak mule)\b/i;

  if (offTopicLife.test(t) && !scamSignals.test(t)) return false;
  if (scamSignals.test(t)) return true;
  if (/\+?60[\d\s-]{8,}|https?:\/\/|www\.|bit\.ly|RM\s?\d/i.test(text)) return true;
  if (
    /\b(is this (real|legit)|should i trust|someone (called|texted|messaged)|i (received|got) (a|an)|check (this|if)|help me (verify|check))\b/i.test(
      t
    )
  ) {
    return true;
  }

  return false;
}
