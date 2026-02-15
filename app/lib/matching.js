export function hardFilter(child, familyProfile) {
  // Example: city match OR family says they can relocate
  const prefs = familyProfile.preferences || {};
  const canRelocate = !!prefs.canRelocate;

  if (child.city !== familyProfile.city && !canRelocate) return false;

  // Needs support check
  const familySupports = new Set((prefs.supports || [])); // e.g. ["medical", "therapy"]
  const required = new Set((child.needs?.requiredSupports || []));
  for (const r of required) if (!familySupports.has(r)) return false;

  return true;
}

export function compatibilityScore(child, familyProfile) {
  const prefs = familyProfile.preferences || {};
  let score = 0;
  const reasons = [];

  // Age range fit
  const ageOk = prefs.ageMin <= child.ageMax && prefs.ageMax >= child.ageMin;
  if (ageOk) { score += 30; reasons.push("Age range matches"); }

  // Siblings preference (example)
  if (child.preferences?.hasSiblings && prefs.acceptsSiblings) {
    score += 15; reasons.push("Open to siblings");
  }

  // Supports
  const supports = new Set((prefs.supports || []));
  const required = (child.needs?.requiredSupports || []);
  const covered = required.filter(r => supports.has(r)).length;
  score += Math.min(30, covered * 10);
  if (covered) reasons.push("Covers required supports");

  // Stability/time
  if (prefs.availability === "high") { score += 10; reasons.push("High availability"); }

  return { score, reasons };
}
