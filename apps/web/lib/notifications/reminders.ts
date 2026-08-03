/**
 * Document Reminder Generation Utility
 * 
 * Automatically generates reminders for documents with expiry dates
 * Uses database function for consistency
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Generate reminders for a document with expiry date
 * Creates 10 reminders: 60, 45, 30, 20, 15, 10, 5, 3, 2, 1 days before expiry
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

