# 📦 Document Vault Implementation Guide

## 🎯 Feature Overview

**Premium-only secure document storage with AI-powered analysis, automatic expiry tracking, and reminder generation.**

### Key Features:
- ✅ **Premium Gating:** Only premium users can access
- ✅ **Passcode Protection:** 6-digit PIN required for vault access
- ✅ **AWS S3 Storage:** Secure, encrypted file storage
- ✅ **AI Document Analysis:** OpenAI + Megallm.io for OCR and classification
- ✅ **Automatic Metadata Extraction:** Extract passport numbers, SEVIS IDs, dates, etc.
- ✅ **Expiry Tracking:** Color-coded status (green/yellow/red)
- ✅ **Auto-Reminders:** 6 months, 3 months, 1 month, 7 days before expiry
- ✅ **Multi-Channel Notifications:** Email, SMS, in-app
- ✅ **Signed URLs:** Time-limited (5 min) secure document access

---

## 📊 Current Status

### ✅ Completed:
- [x] Database schema (migration 005)
- [x] Database documentation

### 🚧 In Progress:
- [ ] AWS S3 integration
- [ ] Passcode system
- [ ] Premium gating
- [ ] Document upload API
- [ ] AI analysis integration
- [ ] Frontend UI components
- [ ] Reminder system
- [ ] Cron job for reminders

---

## 🗂️ File Structure

```
web/
├── app/
│   ├── api/
│   │   ├── documents/
│   │   │   ├── route.ts                    # GET (list), POST (upload)
│   │   │   ├── [id]/route.ts                # GET (single), PATCH (update), DELETE
│   │   │   ├── [id]/download/route.ts       # Generate signed URL
│   │   │   ├── analyze/route.ts             # AI analysis endpoint
│   │   │   └── passcode/
│   │   │       ├── setup/route.ts           # Create passcode
│   │   │       ├── verify/route.ts          # Verify passcode
│   │   │       └── reset/route.ts           # Reset passcode
│   │   └── cron/
│   │       └── send-document-reminders/route.ts  # Daily reminder check
│   │
│   └── dashboard/
│       └── documents/
│           └── page.tsx                     # Main documents page
│
├── components/
│   └── documents/
│       ├── DocumentVault.tsx                # Main vault component
│       ├── PasscodeSetup.tsx                # Passcode creation flow
│       ├── PasscodeEntry.tsx                # Passcode verification
│       ├── PremiumUpsell.tsx                # Non-premium blocker
│       ├── UploadModal.tsx                  # Document upload UI
│       ├── DocumentCard.tsx                 # Single document display
│       ├── DocumentList.tsx                 # Grid of documents
│       ├── AIAnalysisProgress.tsx           # Analysis loading state
│       ├── DocumentPreview.tsx              # PDF/image preview
│       └── DocumentFilters.tsx              # Search and filter UI
│
├── lib/
│   ├── s3.ts                                # AWS S3 upload/download
│   ├── document-ai.ts                       # OpenAI integration
│   ├── megallm.ts                           # Megallm.io OCR
│   ├── passcode.ts                          # Hashing and verification
│   └── document-utils.ts                    # Helper functions
│
└── supabase/
    └── migrations/
        └── 005_add_document_vault_tables.sql  # ✅ DONE

extension/
└── (No extension integration for now - web only)
```

---

## 🔐 Environment Variables Required

Add to Vercel/`.env.local`:

```env
# AWS S3 (for document storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=trackmyopt-documents
AWS_S3_BUCKET_URL=https://trackmyopt-documents.s3.amazonaws.com

# OpenAI (for document analysis)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Megallm.io (for OCR)
MEGALLM_API_KEY=your_megallm_key
MEGALLM_API_URL=https://api.megallm.io/v1

# Existing (already set)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
CRON_SECRET=...
```

---

## 📋 API Endpoints Specification

### **1. GET /api/documents**
**Purpose:** List user's documents  
**Auth:** Required (premium)  
**Query params:**
- `type` (optional): Filter by document type
- `search` (optional): Search by name
- `expired` (optional): Filter by expiry status

**Response:**
```json
{
  "ok": true,
  "documents": [
    {
      "id": "uuid",
      "file_name": "passport.pdf",
      "document_type": "passport",
      "expiry_date": "2030-01-01",
      "expiry_status": "good",
      "issue_date": "2020-01-01",
      "extracted_fields": {
        "full_name": "John Doe",
        "passport_number": "A12345678"
      },
      "tags": ["travel", "important"],
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### **2. POST /api/documents**
**Purpose:** Upload new document  
**Auth:** Required (premium + passcode verified)  
**Body:** `multipart/form-data`
- `file`: File (PDF/JPG/PNG)
- `document_type`: string (optional, AI will detect if not provided)
- `notes`: string (optional)

**Process:**
1. Validate file type and size
2. Upload to S3
3. Trigger AI analysis (async)
4. Save metadata to database
5. Return document ID

**Response:**
```json
{
  "ok": true,
  "document": {
    "id": "uuid",
    "file_name": "passport.pdf",
    "status": "analyzing"
  }
}
```

### **3. POST /api/documents/analyze**
**Purpose:** AI analysis of document  
**Auth:** Internal (called from upload endpoint)  
**Body:**
```json
{
  "document_id": "uuid",
  "s3_key": "documents/user_id/file.pdf"
}
```

**AI Steps:**
1. Download file from S3
2. OCR with Megallm.io
3. Classify document type with OpenAI
4. Extract metadata based on type
5. Update database with results
6. Generate reminders if expiry date found

### **4. GET /api/documents/[id]/download**
**Purpose:** Generate signed S3 URL for download  
**Auth:** Required (premium + owner)  
**Response:**
```json
{
  "ok": true,
  "url": "https://s3.amazonaws.com/...",
  "expires_in": 300
}
```

### **5. POST /api/documents/passcode/setup**
**Purpose:** Create vault passcode (first time)  
**Auth:** Required (premium)  
**Body:**
```json
{
  "passcode": "123456"
}
```

### **6. POST /api/documents/passcode/verify**
**Purpose:** Verify passcode before vault access  
**Auth:** Required (premium)  
**Body:**
```json
{
  "passcode": "123456"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "jwt_token_for_session"
}
```

---

## 🎨 UI Components Specification

### **1. Premium Upsell Screen**
**When:** Non-premium user clicks "Documents"  
**Features:**
- Gradient background
- List of benefits
- "Upgrade to Premium" CTA button
- Lock icon illustration

### **2. Passcode Setup Modal**
**When:** Premium user, first time  
**Steps:**
1. Welcome screen: "Secure Your Vault"
2. Enter 6-digit PIN (numeric keyboard)
3. Confirm PIN
4. Success message → Enter vault

### **3. Passcode Entry Screen**
**When:** Premium user with existing passcode  
**Features:**
- 6-digit PIN entry (masked dots)
- Biometric option (future)
- "Forgot Passcode?" link
- 3 attempts before lockout
- Lockout timer display

### **4. Document Upload Modal**
**Features:**
- Drag-and-drop zone
- File type icons
- Progress bar during upload
- AI analysis progress:
  - "Uploading..."
  - "Analyzing document..."
  - "Extracting information..."
  - "Complete!"
- Extracted fields display (editable)
- Document type dropdown (if AI wrong)
- Save button

### **5. Document Card**
**Features:**
- Document icon (based on type)
- File name (editable on hover)
- Document type badge
- Expiry date with status color:
  - 🟢 Green: > 90 days
  - 🟡 Yellow: 30-90 days
  - 🔴 Red: < 30 days
  - ⚫ Grey: No expiry / Expired
- Quick actions (dropdown):
  - View
  - Download
  - Edit
  - Delete
- Hover effect with shadow

### **6. Document List/Grid**
**Features:**
- Grid view (3 columns on desktop)
- List view toggle
- Search bar (by name)
- Filters:
  - Document type
  - Expiry status
  - Date range
- Sort options:
  - Name
  - Date uploaded
  - Expiry date
- Empty state with illustration

---

## 🤖 AI Analysis Specification

### **Document Type Detection**

Use OpenAI Vision or GPT-4o-mini to classify:

**Prompt:**
```
Analyze this document and classify it into one of these categories:
1. Passport
2. Visa
3. I-20 Form
4. EAD Card (Employment Authorization Document)
5. I-983 Training Plan
6. Offer Letter
7. Paystub
8. Receipt Notice (I-797)
9. Other

Return ONLY the category name.
```

### **Metadata Extraction by Type**

#### **Passport:**
- Full name
- Passport number
- Nationality
- Date of birth
- Issue date
- Expiry date
- Place of birth

#### **I-20:**
- SEVIS ID
- Student name
- School name
- Program end date
- DSO name
- DSO signature date
- CPT authorization (if any)
- OPT endorsement (if any)

#### **EAD Card:**
- USCIS number
- Full name
- Category (C03B, C03C, etc.)
- Card number
- Start date (Valid from)
- Expiry date (Card expires)
- Date of birth

#### **Receipt Notice (I-797):**
- Receipt number
- Case type
- Applicant name
- Received date
- Notice date
- Priority date (if any)

#### **Offer Letter:**
- Employer name
- Job title
- Start date
- Salary
- Employee name

#### **Paystub:**
- Employer name
- Employee name
- Pay period
- Pay date
- Gross pay
- Net pay

### **OpenAI Integration Example:**

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: "You are an expert at analyzing immigration documents..."
    },
    {
      role: "user",
      content: [
        { type: "text", text: "Extract all relevant information from this document." },
        { type: "image_url", image_url: { url: imageBase64 } }
      ]
    }
  ],
  response_format: { type: "json_object" }
});
```

---

## ⏰ Reminder System

### **Reminder Generation Logic:**

When document with expiry date is saved:
1. Calculate reminder dates:
   - 6 months before: `expiry_date - 180 days`
   - 3 months before: `expiry_date - 90 days`
   - 1 month before: `expiry_date - 30 days`
   - 7 days before: `expiry_date - 7 days`

2. Create reminder records (only if date is in future)
3. Store in `document_reminders` table

### **Cron Job:**
- **Path:** `/api/cron/send-document-reminders`
- **Schedule:** Daily at 9:00 AM UTC (`0 9 * * *`)
- **Process:**
  1. Query reminders where `send_at <= today` AND `status = 'pending'`
  2. For each reminder:
     - Send email via Resend
     - Create in-app notification
     - Send SMS if enabled (premium)
     - Mark as `sent`
  3. Log results

---

## 🔒 Security Checklist

- [x] Database RLS policies
- [ ] Passcode hashing (bcrypt, 10 rounds)
- [ ] Failed attempt tracking
- [ ] Temporary lockout (10 min after 3 failures)
- [ ] S3 bucket encryption (AES-256)
- [ ] Signed URLs with 5-min expiry
- [ ] File type validation (magic numbers, not just extension)
- [ ] File size limits (10MB max)
- [ ] Virus scanning (ClamAV or AWS S3 antivirus)
- [ ] Rate limiting on upload endpoint
- [ ] CORS restrictions
- [ ] Audit logging (document access, downloads)

---

## 📦 NPM Packages Needed

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.x",
    "@aws-sdk/s3-request-presigner": "^3.x",
    "bcryptjs": "^2.4.3",
    "openai": "^4.x",
    "pdf-parse": "^1.x",
    "sharp": "^0.33.x"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.x"
  }
}
```

---

## 🧪 Testing Checklist

### **Premium Gating:**
- [ ] Non-premium sees upsell screen
- [ ] Premium can access

### **Passcode:**
- [ ] First time setup flow works
- [ ] Passcode entry required on return
- [ ] 3 failed attempts → lockout
- [ ] Lockout expires after 10 min
- [ ] Forgot passcode → email verification

### **Upload:**
- [ ] PDF upload works
- [ ] JPG/PNG upload works
- [ ] File too large → rejected
- [ ] Invalid file type → rejected
- [ ] AI analysis completes
- [ ] Metadata extracted correctly

### **Documents:**
- [ ] List displays all documents
- [ ] Search filters work
- [ ] Type filter works
- [ ] Expiry status colors correct
- [ ] Download generates signed URL
- [ ] Signed URL expires after 5 min
- [ ] Delete removes document
- [ ] Edit updates metadata

### **Reminders:**
- [ ] Auto-generated on upload (if expiry date)
- [ ] Cron job sends reminders
- [ ] Email notification received
- [ ] In-app notification shows
- [ ] Reminder marked as sent

---

## 🚀 Deployment Steps

1. **Run Database Migration:**
   ```sql
   -- In Supabase SQL Editor
   -- Run: web/supabase/migrations/005_add_document_vault_tables.sql
   ```

2. **Set Environment Variables in Vercel:**
   - AWS credentials
   - OpenAI API key
   - Megallm.io API key

3. **Create S3 Bucket:**
   ```bash
   # AWS CLI
   aws s3 mb s3://trackmyopt-documents --region us-east-1
   aws s3api put-bucket-encryption \
     --bucket trackmyopt-documents \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

4. **Configure Cron Job in `vercel.json`:**
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/send-document-reminders",
         "schedule": "0 9 * * *"
       }
     ]
   }
   ```

5. **Deploy to Vercel:**
   ```bash
   git push origin main
   ```

---

## 📈 Future Enhancements

- [ ] Biometric authentication (Touch ID/Face ID)
- [ ] Shared documents (with family/attorney)
- [ ] Document templates (auto-fill forms)
- [ ] Bulk upload
- [ ] OCR text search within documents
- [ ] Document version history
- [ ] Automatic document renewal detection
- [ ] Integration with USCIS for auto-updates
- [ ] Document comparison (old vs new passport)
- [ ] AI fraud detection
- [ ] Mobile app (React Native)

---

**Last Updated:** 2025-11-18  
**Status:** 🚧 In Progress  
**Next Step:** AWS S3 Integration + Passcode System

