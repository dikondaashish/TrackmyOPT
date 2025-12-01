/**
 * Document Reminder Generation Utility
 * 
 * Automatically generates reminders for documents with expiry dates
 * Uses database function for consistency
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Generate reminders for a document with expiry date
 * Creates 4 reminders: 6 months, 3 months, 1 month, 7 days before expiry
 * 
 * @param userId - User ID
 * @param documentId - Document ID
 * @param documentName - Document filename
 * @param expiryDate - Expiry date (YYYY-MM-DD)
 */
export async function generateRemindersForDocument(
  userId: string,
  documentId: string,
  documentName: string,
  expiryDate: string
): Promise<void> {
  try {

    // Use service role client for database function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Call database function to create reminders
    const { error } = await supabase.rpc('create_document_reminders', {
      p_user_id: userId,
      p_document_id: documentId,
      p_document_name: documentName,
      p_expiry_date: expiryDate,
    });

    if (error) {
      console.error('❌ Error creating reminders:', error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Failed to generate reminders:', error);
    // Don't throw - reminders are nice-to-have, not critical
  }
}

/**
 * Calculate reminder dates
 * Returns array of dates when reminders should be sent
 */
export function calculateReminderDates(expiryDate: string): Date[] {
  const expiry = new Date(expiryDate);
  const reminderOffsets = [180, 90, 30, 7]; // days before expiry

  return reminderOffsets
    .map((days) => {
      const reminderDate = new Date(expiry);
      reminderDate.setDate(reminderDate.getDate() - days);
      return reminderDate;
    })
    .filter((date) => date >= new Date()); // Only future dates
}

/**
 * Get reminder type label
 */
export function getReminderLabel(daysBefore: number): string {
  const labels: Record<number, string> = {
    180: '6 months',
    90: '3 months',
    30: '1 month',
    7: '7 days',
  };

  return labels[daysBefore] || `${daysBefore} days`;
}

/**
 * Format reminder message
 */
export function formatReminderMessage(
  documentName: string,
  daysBefore: number
): string {
  const label = getReminderLabel(daysBefore);
  
  return `Your document "${documentName}" will expire in ${label}. Please renew it soon.`;
}

/**
 * Check if reminders exist for a document
 */
export async function documentHasReminders(documentId: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('document_reminders')
      .select('id')
      .eq('document_id', documentId)
      .limit(1);

    if (error) throw error;

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking reminders:', error);
    return false;
  }
}

