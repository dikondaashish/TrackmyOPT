# 🧪 Document Vault - End-to-End Testing Guide

## Overview

Comprehensive testing guide for the complete Document Vault feature including all security, AI, and user flow scenarios.

---

## 📋 Testing Checklist

### **1. Authentication & Authorization**

#### **Test 1.1: Non-authenticated users**
- [ ] Navigate to `/dashboard/documents` without login
- [ ] **Expected:** Redirect to login page
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 1.2: Non-premium users**
- [ ] Log in as free user
- [ ] Navigate to `/dashboard/documents`
- [ ] **Expected:** Premium upsell modal appears
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 1.3: Premium users**
- [ ] Log in as premium user
- [ ] Navigate to `/dashboard/documents`
- [ ] **Expected:** Passcode setup modal (first time)
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **2. Passcode Protection**

#### **Test 2.1: First-time passcode setup**
- [ ] Enter 6-digit passcode (e.g., `123456`)
- [ ] Confirm with same passcode
- [ ] **Expected:** Passcode saved, shows verification modal
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 2.2: Passcode mismatch**
- [ ] Enter passcode: `123456`
- [ ] Confirm with: `654321`
- [ ] **Expected:** Error "Passcodes do not match"
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 2.3: Invalid passcode format**
- [ ] Enter passcode: `12345` (5 digits)
- [ ] **Expected:** Error "Passcode must be exactly 6 digits"
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 2.4: Passcode verification**
- [ ] Enter correct 6-digit passcode
- [ ] **Expected:** Vault unlocks, shows document grid
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 2.5: Wrong passcode**
- [ ] Enter incorrect passcode
- [ ] **Expected:** Error message, shows remaining attempts
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 2.6: Lockout after 3 failed attempts**
- [ ] Enter wrong passcode 3 times
- [ ] **Expected:** Account locked for 10 minutes
- [ ] Countdown timer shows
- [ ] Passcode input disabled
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 2.7: Auto-unlock after timeout**
- [ ] Wait for lockout to expire (or manipulate time)
- [ ] **Expected:** Can try passcode again
- [ ] Failed attempts reset to 3
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **3. Document Upload**

#### **Test 3.1: Valid PDF upload**
- [ ] Click "Upload Document"
- [ ] Select a PDF file (<10MB)
- [ ] Click "Upload & Analyze"
- [ ] **Expected:** 
  - Progress bar shows 0-100%
  - 4 processing stages display
  - Success screen with document details
  - Document appears in grid
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 3.2: Valid image upload (JPEG)**
- [ ] Upload a JPEG image
- [ ] **Expected:** Same as 3.1
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 3.3: Invalid file type**
- [ ] Try to upload .exe or .zip file
- [ ] **Expected:** Error "Invalid file type"
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 3.4: File too large (>10MB)**
- [ ] Try to upload 15MB file
- [ ] **Expected:** Error "File too large. Maximum size is 10MB"
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 3.5: Rate limit (21st upload)**
- [ ] Upload 20 documents successfully
- [ ] Try to upload 21st document
- [ ] **Expected:** Error "Daily upload limit reached"
- [ ] Shows time until reset
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 3.6: Virus scan (if enabled)**
- [ ] Upload EICAR test file
- [ ] **Expected:** Error "File failed virus scan"
- [ ] **Status:** ✅ Pass / ❌ Fail / ⏭️ Skipped

---

### **4. AI Document Analysis**

#### **Test 4.1: Passport recognition**
- [ ] Upload a passport image/PDF
- [ ] **Expected:**
  - Classified as "passport"
  - Confidence > 80%
  - Extracted: name, number, nationality, DOB
  - Issue and expiry dates detected
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 4.2: I-20 recognition**
- [ ] Upload an I-20 document
- [ ] **Expected:**
  - Classified as "i20"
  - Extracted: SEVIS ID, school, program end date
  - Confidence > 70%
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 4.3: EAD Card recognition**
- [ ] Upload EAD card image
- [ ] **Expected:**
  - Classified as "ead_card"
  - Extracted: USCIS #, category, dates
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 4.4: Generic document**
- [ ] Upload unrecognized document
- [ ] **Expected:**
  - Classified as "other"
  - Lower confidence score
  - Basic text extraction
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **5. Document Grid & Display**

#### **Test 5.1: Empty state**
- [ ] New user with no documents
- [ ] **Expected:** Shows "No documents yet" message
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 5.2: Document cards**
- [ ] Upload 3 documents
- [ ] **Expected:** 3 cards displayed in grid
- [ ] Each card shows:
  - Document icon
  - Filename
  - Type
  - Upload date
  - Expiry badge (if applicable)
  - AI confidence
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 5.3: Expiry status badges**
- [ ] Upload documents with various expiry dates:
  - Expires in 200 days → Green "Good"
  - Expires in 45 days → Yellow "Attention"
  - Expires in 15 days → Orange "Warning"
  - Expires in 3 days → Red "Critical"
  - Already expired → Gray "Expired"
- [ ] **Expected:** Correct badge color and text
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **6. Statistics**

#### **Test 6.1: Stats calculation**
- [ ] Upload 10 documents (mix of types and expiry dates)
- [ ] **Expected:** Stats show:
  - Total: 10
  - Expiring Soon: X (within 30 days)
  - Expired: Y (past date)
  - Most Common: [document type]
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **7. Search & Filter**

#### **Test 7.1: Category filter**
- [ ] Click "Passport" category pill
- [ ] **Expected:** Only passport documents shown
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 7.2: Search by filename**
- [ ] Type "passport" in search box
- [ ] **Expected:** Only documents with "passport" in filename
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 7.3: Search by content**
- [ ] Search for text from document summary
- [ ] **Expected:** Matching documents shown
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 7.4: Sort by newest**
- [ ] Select "Newest First" from sort dropdown
- [ ] **Expected:** Most recent uploads first
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 7.5: Sort by expiring soon**
- [ ] Select "Expiring Soon"
- [ ] **Expected:** Documents closest to expiry first
- [ ] Documents with no expiry at end
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **8. Document View**

#### **Test 8.1: View document details**
- [ ] Click "View" on a document card
- [ ] **Expected:** Modal opens with:
  - Document metadata
  - AI-extracted fields
  - Issue/expiry dates
  - Download button
  - Delete button
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 8.2: Download document**
- [ ] Click "Download" in view modal
- [ ] **Expected:** Signed URL opens in new tab
- [ ] File downloads or displays
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 8.3: Signed URL expiry**
- [ ] Get signed URL
- [ ] Wait 6 minutes
- [ ] Try to access URL
- [ ] **Expected:** Access denied or error
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **9. Document Delete**

#### **Test 9.1: Delete with confirmation**
- [ ] Click delete button
- [ ] **Expected:** Confirmation dialog appears
- [ ] Click "Cancel" → No deletion
- [ ] Click "Delete" → Document removed from grid
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 9.2: S3 cleanup**
- [ ] Delete a document
- [ ] Try to access old signed URL
- [ ] **Expected:** File removed from S3
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 9.3: Database cleanup**
- [ ] Delete document with reminders
- [ ] **Expected:** Reminders also deleted (cascade)
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **10. Automatic Reminders**

#### **Test 10.1: Reminder generation**
- [ ] Upload document with expiry date 1 year away
- [ ] **Expected:** 4 reminders created:
  - 6 months before expiry
  - 3 months before expiry
  - 1 month before expiry
  - 7 days before expiry
- [ ] Query database to verify
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 10.2: No reminder for documents without expiry**
- [ ] Upload document with no expiry date
- [ ] **Expected:** No reminders created
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 10.3: Cron job execution**
- [ ] Set document expiry to today + 30 days
- [ ] Run cron job manually (or wait for scheduled run)
- [ ] **Expected:** Email sent
- [ ] Reminder marked as "sent"
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 10.4: Email content**
- [ ] Receive reminder email
- [ ] **Expected:** Email contains:
  - Document name
  - Expiry date
  - Days remaining
  - Urgency badge
  - Link to view document
  - Correct color coding
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 10.5: User preferences respected**
- [ ] Disable document reminders in settings
- [ ] Wait for reminder date
- [ ] **Expected:** No email sent
- [ ] Reminder marked as "cancelled"
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **11. Security**

#### **Test 11.1: User isolation**
- [ ] Log in as User A, upload document
- [ ] Log in as User B
- [ ] **Expected:** User B cannot see User A's documents
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 11.2: RLS policies**
- [ ] Try to query documents table directly with wrong user_id
- [ ] **Expected:** No results or error
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 11.3: API authentication**
- [ ] Call `/api/documents` without session
- [ ] **Expected:** 401 Unauthorized
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 11.4: Passcode hashing**
- [ ] Check database
- [ ] **Expected:** Passcode stored as bcrypt hash, not plaintext
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **12. Rate Limiting**

#### **Test 12.1: Check rate limit status**
- [ ] Call `/api/documents/rate-limit`
- [ ] **Expected:** Returns limit, remaining, resetAt
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 12.2: Rate limit headers**
- [ ] Upload a document
- [ ] Check response headers
- [ ] **Expected:** Includes:
  - X-RateLimit-Limit: 20
  - X-RateLimit-Remaining: [number]
  - X-RateLimit-Reset: [ISO date]
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 12.3: Rate limit reset at midnight**
- [ ] Hit rate limit (20 uploads)
- [ ] Wait until next day (or manipulate time)
- [ ] **Expected:** Can upload again
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **13. Responsive Design**

#### **Test 13.1: Desktop (1920x1080)**
- [ ] Open vault on desktop
- [ ] **Expected:** 3-column grid, all features visible
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 13.2: Tablet (768x1024)**
- [ ] Open vault on tablet
- [ ] **Expected:** 2-column grid, responsive layout
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 13.3: Mobile (375x667)**
- [ ] Open vault on mobile
- [ ] **Expected:** 1-column grid, touch-friendly buttons
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **14. Error Handling**

#### **Test 14.1: Network error during upload**
- [ ] Disconnect internet, try to upload
- [ ] **Expected:** Error message displayed
- [ ] Retry option available
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 14.2: Gemini API failure**
- [ ] Upload with invalid API key
- [ ] **Expected:** Graceful fallback, document still saved
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 14.3: S3 upload failure**
- [ ] Upload with invalid S3 credentials
- [ ] **Expected:** Error message, no database entry
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### **15. Performance**

#### **Test 15.1: Upload speed**
- [ ] Upload 5MB PDF
- [ ] **Expected:** Completes in <30 seconds
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 15.2: AI processing time**
- [ ] Monitor Gemini API call duration
- [ ] **Expected:** <15 seconds for typical document
- [ ] **Status:** ✅ Pass / ❌ Fail

#### **Test 15.3: Grid load time**
- [ ] User with 50 documents
- [ ] **Expected:** Grid loads in <2 seconds
- [ ] **Status:** ✅ Pass / ❌ Fail

---

## 🔧 Testing Tools

### **Manual Testing:**
- Chrome DevTools (Network, Console)
- Different screen sizes/devices
- Multiple user accounts

### **API Testing:**
```bash
# Test upload
curl -X POST https://www.trackmyopt.com/api/documents/upload \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -F "file=@test.pdf"

# Test rate limit
curl https://www.trackmyopt.com/api/documents/rate-limit \
  -H "Cookie: YOUR_SESSION_COOKIE"

# Test cron job
curl https://www.trackmyopt.com/api/cron/send-document-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **Database Testing:**
```sql
-- Check uploaded documents
SELECT * FROM documents WHERE user_id = 'YOUR_USER_ID';

-- Check reminders
SELECT * FROM document_reminders WHERE user_id = 'YOUR_USER_ID';

-- Check passcode
SELECT * FROM document_passcodes WHERE user_id = 'YOUR_USER_ID';
```

---

## 📊 Test Results Template

**Date:** ___________  
**Tester:** ___________  
**Environment:** Production / Staging

| Category | Tests Passed | Tests Failed | Pass Rate |
|----------|-------------|--------------|-----------|
| Authentication | __/3 | __ | __% |
| Passcode | __/7 | __ | __% |
| Upload | __/6 | __ | __% |
| AI Analysis | __/4 | __ | __% |
| Display | __/3 | __ | __% |
| Statistics | __/1 | __ | __% |
| Search/Filter | __/5 | __ | __% |
| View/Download | __/3 | __ | __% |
| Delete | __/3 | __ | __% |
| Reminders | __/5 | __ | __% |
| Security | __/4 | __ | __% |
| Rate Limiting | __/3 | __ | __% |
| Responsive | __/3 | __ | __% |
| Error Handling | __/3 | __ | __% |
| Performance | __/3 | __ | __% |
| **TOTAL** | **__/56** | **__** | **__%** |

---

## 🐛 Bug Report Template

**Test ID:** ___________  
**Severity:** Critical / High / Medium / Low  
**Description:** ___________  
**Steps to Reproduce:**
1. ___________
2. ___________
3. ___________

**Expected Result:** ___________  
**Actual Result:** ___________  
**Screenshots:** ___________  
**Logs:** ___________  

---

**Testing Status:** ⏳ In Progress  
**Target Pass Rate:** 95%  
**Ready for Production:** When pass rate ≥ 95%

