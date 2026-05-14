export function getStartOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function shouldResetDailyUsage(referenceDate: Date, usageDate: Date) {
  return getStartOfUtcDay(referenceDate) > getStartOfUtcDay(usageDate);
}

export function shouldResetMonthlyTokens(referenceDate: Date, lastTokenReset: Date) {
  const oneMonthAgo = new Date(referenceDate);
  oneMonthAgo.setMonth(referenceDate.getMonth() - 1);
  return lastTokenReset < oneMonthAgo;
}
