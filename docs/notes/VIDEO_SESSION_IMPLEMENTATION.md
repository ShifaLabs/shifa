# Video Session Auto-Creation Feature Implementation

## Overview

This feature automatically creates a video meeting session immediately after payment confirmation for video consultation appointments. The meeting link is displayed in both patient and doctor dashboards, with time-based validation ensuring the link is only accessible during the scheduled appointment window.

## Key Changes

### 1. Payment Service Integration - Auto Video Session Creation

**File:** `src/features/payment/payment.service.ts`

- **Enhancement:** Modified `confirmPaymentByTransactionId()` function to automatically create video session for video consultations
- **Behavior:**
  - When payment is confirmed, checks if `consultationType === "video"`
  - Automatically calls `createCall()` to initialize Stream.io video session
  - Generates unique `callId` using `generateCallId(appointmentId)`
  - Stores video session details in `appointment.videoSession` object
  - Adds audit trail entry: "Video session created"
- **Error Handling:** Video session creation failure doesn't block payment confirmation (graceful degradation)

### 2. Patient Dashboard - Video Join Component

**New Files Created:**

- `src/components/Dashboard/Patient/VideoJoinButton.jsx` - Smart video join button with time validation
- `src/app/consultation/[id]/page.jsx` - Full-screen video consultation page

**Features:**

- **Time-Based Access Control:**
  - Join window: 10 minutes before appointment → 60 minutes after appointment
  - Before window: Shows countdown message ("You can join X minutes before")
  - After window: Shows "Video call has ended" message
  - During window: Shows active "Join Video Consultation" button
- **Token Retrieval:** Fetches Stream.io API key and token from `/api/video/token`
- **Session Management:** Stores credentials in sessionStorage for video client
- **Navigation:** Redirects to `/consultation/[appointmentId]` page

**Modified Files:**

- `src/app/dashboard/patient/appointments/[id]/page.jsx` - Added VideoJoinButton component

### 3. Doctor Dashboard - Complete Appointment Management

**New Files Created:**

- `src/features/appointments/appointments.doctor.service.ts` - Backend service for doctor appointments
- `src/app/dashboard/doctor/appointments/page.jsx` - Doctor appointments listing page
- `src/app/dashboard/doctor/appointments/[id]/page.jsx` - Doctor appointment details page
- `src/components/Dashboard/Doctor/DoctorConfirmButton.jsx` - Button to confirm appointments

**Features:**

- **Appointments Listing:**
  - Shows all appointments assigned to doctor
  - Displays patient name, appointment date/time, status, consultation type
  - Visual badges for payment status (Paid/Unpaid) and video availability
  - Filterable by status with color-coded badges
  - Auto-hides expired appointments after 15 minutes
- **Appointment Details:**
  - Full patient information (name, email, phone, age, gender)
  - Appointment metadata (ID, date, time, symptoms, payment amount)
  - Video join button (same component as patient - time validated)
  - Confirm button (changes status from Approved → Confirmed)
  - Complete audit trail timeline

### 4. Video Session Flow

**Complete Workflow:**

```
1. Patient books appointment → Status: PendingPayment, paymentStatus: unpaid
   ↓
2. Patient pays via SSLCommerz → Payment gateway redirect
   ↓
3. Payment success → confirmPaymentByTransactionId() called
   ↓
4. FOR VIDEO CONSULTATIONS:
   - Status updated: PendingPayment → Approved
   - paymentStatus updated: unpaid → paid
   - Video session created automatically via Stream.io
   - videoSession object stored: { provider: "stream", callId: "consultation_xxx", createdAt: Date }
   ↓
5. Patient Dashboard:
   - Sees "Join Video Consultation" button
   - Button enabled 10 minutes before appointment time
   - Clicking button fetches Stream.io token and redirects to consultation page
   ↓
6. Doctor Dashboard:
   - Sees same "Join Video Consultation" button
   - Can confirm appointment (Approved → Confirmed)
   - Both doctor and patient can join the same video session
```

## Files Modified

### Payment System

1. `src/features/payment/payment.service.ts`
   - Added video session creation logic
   - Imported `createCall` and `generateCallId` from video service
   - Updated `confirmPaymentByTransactionId()` function

2. `src/app/api/payment/init/route.js`
   - Changed success URL from `/payment/success` to `/dashboard/payment/success`

3. `src/app/dashboard/payment/success/[tran_id]/page.tsx`
   - Moved from `(main)` route group to `dashboard` route group

### Patient Dashboard

4. `src/app/dashboard/patient/appointments/[id]/page.jsx`
   - Added VideoJoinButton import and component
   - Updated action buttons layout
   - Changed video access condition to include "Approved" status

### Doctor Dashboard (All New)

5. `src/features/appointments/appointments.doctor.service.ts`
6. `src/app/dashboard/doctor/appointments/page.jsx`
7. `src/app/dashboard/doctor/appointments/[id]/page.jsx`
8. `src/components/Dashboard/Doctor/DoctorConfirmButton.jsx`

### Video Components (All New)

9. `src/components/Dashboard/Patient/VideoJoinButton.jsx`
10. `src/app/consultation/[id]/page.jsx`

## Technical Implementation Details

### Video Session Creation

```typescript
// Auto-creation during payment confirmation
if (appointment.consultationType === "video") {
  const callId =
    appointment?.videoSession?.callId ||
    generateCallId(appointment._id.toString());

  await createCall({
    callId,
    appointmentId: appointment._id.toString(),
    createdByUserId: appointment.patient.toString(),
    doctorId: appointment.doctor.toString(),
    patientId: appointment.patient.toString(),
  });

  updatePayload.$set.videoSession = {
    provider: "stream",
    callId,
    createdAt: new Date(),
  };
}
```

### Time Validation Logic

```javascript
const appointmentDate = new Date(appointment.appointmentDate);
const now = new Date();
const joinFrom = new Date(appointmentDate.getTime() - 10 * 60 * 1000); // 10 min before
const joinUntil = new Date(appointmentDate.getTime() + 60 * 60 * 1000); // 60 min after

const canJoinNow = now >= joinFrom && now <= joinUntil;
```

### Token Retrieval

```javascript
const response = await fetch("/api/video/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ appointmentId: appointment._id }),
});

const { apiKey, token, callId } = await response.json();

// Store in sessionStorage for video client
sessionStorage.setItem("streamApiKey", apiKey);
sessionStorage.setItem("streamToken", token);
sessionStorage.setItem("streamCallId", callId);
```

## Database Schema Changes

### Appointment Document

```javascript
{
  videoSession: {
    provider: "stream",        // Video provider (currently Stream.io)
    callId: "consultation_xxx", // Unique call identifier
    createdAt: Date            // When video session was created
  }
}
```

## Security & Validation

1. **Authentication:** All endpoints require valid session
2. **Authorization:**
   - Patient can only access their own appointments
   - Doctor can only access appointments assigned to them
3. **Time Validation:** Video join restricted to ±10/60 minute window
4. **Payment Verification:** Video session only created after successful payment
5. **Token Security:** Stream.io tokens generated server-side, short-lived

## Testing Checklist

- [x] Payment confirmation creates video session for video consultations
- [x] Payment confirmation does NOT create video session for in-person consultations
- [x] Patient can see video join button after payment
- [x] Doctor can see video join button for approved appointments
- [x] Video join button disabled before join window
- [x] Video join button disabled after join window
- [x] Video join button active during valid time window
- [x] Token retrieval works correctly
- [x] Consultation page loads with Stream.io client
- [x] Doctor appointments listing shows all assigned appointments
- [x] Doctor can view appointment details
- [x] Doctor can confirm appointments
- [x] Audit trail records all status changes

## Environment Variables Required

```env
# Stream.io Configuration
STREAM_API_KEY=your_api_key
STREAM_SECRET=your_secret

# Next.js App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Future Enhancements

1. **Recording:** Auto-record video sessions for medical records
2. **Prescription Integration:** Allow doctors to write prescriptions during video call
3. **Chat:** Add text chat alongside video for sharing documents/images
4. **Waiting Room:** Implement virtual waiting room for patients
5. **Notifications:** Send email/SMS when video session is ready
6. **Rescheduling:** Allow rescheduling with automatic video session update
7. **Multi-participant:** Support for specialist consultations (multiple doctors)

## Notes

- Video sessions are created immediately upon payment confirmation
- Call ID format: `consultation_{appointmentId}`
- Time window is configurable (currently hardcoded: -10 min, +60 min)
- Stream.io handles all video infrastructure (WebRTC, TURN servers, etc.)
- Session storage used for video credentials (cleared on page close)
- Video consultation page is full-screen for optimal experience
