-- Migration: Update document reminder intervals
-- From: 180, 90, 30, 7 days (6 months, 3 months, 1 month, 7 days)
-- To: 60, 45, 30, 20, 10, 5, 0 days

-- Drop and recreate the function with new intervals
CREATE OR REPLACE FUNCTION public.create_document_reminders(
  p_user_id UUID,
  p_document_id UUID,
  p_document_name TEXT,
  p_expiry_date DATE
)
RETURNS VOID AS $$
DECLARE
  -- New intervals: 60, 45, 30, 20, 10, 5, 0 days before expiry
  reminder_intervals INTEGER[] := ARRAY[60, 45, 30, 20, 10, 5, 0];
  reminder_labels TEXT[] := ARRAY['60 days', '45 days', '30 days', '20 days', '10 days', '5 days', 'today'];
  reminder_type TEXT;
  reminder_date DATE;
  i INTEGER;
BEGIN
  -- Delete existing reminders for this document
  DELETE FROM public.document_reminders WHERE document_id = p_document_id;
  
  -- Create new reminders
  FOR i IN 1..array_length(reminder_intervals, 1) LOOP
    reminder_date := p_expiry_date - reminder_intervals[i];
    
    -- Only create reminder if it's in the future or today
    IF reminder_date >= CURRENT_DATE THEN
      reminder_type := CASE reminder_intervals[i]
        WHEN 60 THEN '60_days'
        WHEN 45 THEN '45_days'
        WHEN 30 THEN '30_days'
        WHEN 20 THEN '20_days'
        WHEN 10 THEN '10_days'
        WHEN 5 THEN '5_days'
        WHEN 0 THEN 'expiry_day'
      END;
      
      INSERT INTO public.document_reminders (
        user_id,
        document_id,
        reminder_type,
        reminder_message,
        send_at
      ) VALUES (
        p_user_id,
        p_document_id,
        reminder_type,
        CASE 
          WHEN reminder_intervals[i] = 0 THEN 
            format('⚠️ URGENT: Your document "%s" expires TODAY! Please renew it immediately or update the expiry date if already renewed.', p_document_name)
          WHEN reminder_intervals[i] <= 10 THEN
            format('🚨 Your document "%s" will expire in %s! Please renew it as soon as possible or update the expiry date if already renewed.', p_document_name, reminder_labels[i])
          ELSE
            format('📅 Your document "%s" will expire in %s. Please plan to renew it soon or update the expiry date if already renewed.', p_document_name, reminder_labels[i])
        END,
        reminder_date::TIMESTAMPTZ + INTERVAL '9 hours' -- Send at 9 AM
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.create_document_reminders(UUID, UUID, TEXT, DATE) IS 
  'Create automatic reminders for a document at 60, 45, 30, 20, 10, 5 days and expiry day';
