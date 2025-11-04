/**
 * Get calendar emoji with current day number
 * Returns keycap number emojis (1️⃣, 2️⃣, 3️⃣, etc.) for dates 1-31
 */
export function getDateEmoji(date?: Date): string {
  const currentDate = date || new Date();
  const day = currentDate.getDate();
  
  // Keycap number emojis (0️⃣ through 9️⃣)
  const keycapDigits = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  
  // For single digit (1-9), return single keycap
  if (day < 10) {
    return keycapDigits[day];
  }
  
  // For two digits (10-31), combine two keycaps
  const tens = Math.floor(day / 10);
  const ones = day % 10;
  return keycapDigits[tens] + keycapDigits[ones];
}

/**
 * Get today's date emoji (shorthand)
 */
export function getTodayDateEmoji(): string {
  return getDateEmoji();
}
