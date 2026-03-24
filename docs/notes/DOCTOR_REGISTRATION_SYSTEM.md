# Doctor Registration & Admin Approval System

## Overview

This document describes the complete doctor registration system with admin approval workflow for the Shifa platform.

## Components

### 1. **Doctor Registration Form** (`src/app/dashboard/be-doctor/page.tsx`)

- Fixed TypeScript errors with proper form control typing
- Changed `dayOfWeek` field to `availableDays` array for proper multi-day selection
- Added real-time validation using Zod schema
- Added success/error message display
- Form collects:
  - Personal Information (name, email, password, phone, gender, age)
  - Address Information (street, city, country, zipCode)
  - Professional Details (specialization, licenseNumber)
  - Availability & Billing (consultationFee, availableDays, startTime, endTime, slotDuration)

### 2. **Database Schema Updates** (`src/Types/types.ts`)

Updated the Doctor interface to include approval fields:

```typescript
interface Doctor {
  // ... existing fields
  status: "pending" | "active" | "inactive" | "rejected";
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedBy?: string; // Admin user ID
  approvalReason?: string;
  approvedAt?: string;
  // ... other fields
}
```

### 3. **Doctor Registration API** (`src/app/api/doctors/become-doctor/route.ts`)

#### POST Request

- Creates a new doctor record with `pending` status
- Hashes password using bcryptjs
- Sets `approvalStatus: "pending"` to indicate awaiting admin review
- Returns doctor ID and status

**Request:**

```json
{
  "fullName": "Dr. John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "+1234567890",
  "gender": "male",
  "age": 35,
  "street": "123 Medical Plaza",
  "city": "New York",
  "country": "USA",
  "zipCode": "10001",
  "specialization": "cardiology",
  "licenseNumber": "MED-12345678",
  "consultationFee": 75,
  "availableDays": [1, 2, 3, 4, 5],
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30
}
```

**Response:**

```json
{
  "success": true,
  "message": "Application submitted successfully! Your profile is now pending admin approval.",
  "data": {
    "doctorId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "status": "pending"
  }
}
```

### 4. **Admin Approval API** (`src/app/api/admin/approve-doctor/route.ts`)

#### GET - Fetch Pending Doctors

```
GET /api/admin/approve-doctor?status=pending&page=1&limit=10
```

Returns paginated list of doctors by approval status.

#### POST - Approve or Reject Doctor

**Approve Request:**

```json
{
  "doctorId": "507f1f77bcf86cd799439011",
  "action": "approve"
}
```

**Reject Request:**

```json
{
  "doctorId": "507f1f77bcf86cd799439011",
  "action": "reject",
  "reason": "License number could not be verified"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Doctor John Doe has been approved successfully!",
  "data": {
    "doctorId": "507f1f77bcf86cd799439011",
    "status": "approved",
    "approvalStatus": "approved"
  }
}
```

### 5. **Server Actions** (`src/features/Auth/doctor-approval.action.ts`)

Server-side actions for admin operations:

- `approveDoctorAction(doctorId, approvedBy)` - Approve a doctor
- `rejectDoctorAction(doctorId, reason)` - Reject a doctor
- `getPendingDoctorsAction(page, limit)` - Get pending doctors
- `getAllDoctorsAction(page, limit, status?)` - Get all doctors by status

### 6. **Admin Dashboard** (`src/app/dashboard/admin/doctor-approvals/page.tsx`)

Complete admin interface for managing doctor applications with:

- **List View**: Display pending doctors with full details
- **Information Cards**: Show doctor details (contact, professional info, availability, billing)
- **Action Buttons**: Approve/Reject with confirmation dialogs
- **Rejection Form**: Text area for providing rejection reasons
- **Pagination**: Navigate through applications
- **Success/Error Messages**: Real-time feedback

## Workflow

### 1. Doctor Registration

```
1. Doctor fills form on /dashboard/be-doctor
2. Form submits to POST /api/doctors/become-doctor
3. Doctor account created with status: "pending", approvalStatus: "pending"
4. Success message shown to doctor
```

### 2. Admin Review

```
1. Admin visits /dashboard/admin/doctor-approvals
2. Fetches GET /api/admin/approve-doctor?status=pending
3. Reviews doctor details
4. Clicks Approve or Reject button
```

### 3. Admin Approval

```
1. Admin clicks "Approve"
2. Confirmation dialog appears
3. Submits POST /api/admin/approve-doctor with action: "approve"
4. Doctor status updated to: "active", approvalStatus: "approved"
5. Doctor can now see appointments and consultations
```

### 4. Admin Rejection

```
1. Admin clicks "Reject"
2. Rejection dialog with reason textarea appears
3. Submits POST /api/admin/approve-doctor with action: "reject"
4. Doctor status updated to: "inactive", approvalStatus: "rejected"
5. Doctor receives notification (can be added later)
```

## Status Fields

### status (Doctor Account Status)

- `pending`: Initial state, awaiting approval
- `active`: Doctor is verified and can accept appointments
- `inactive`: Doctor is suspended or rejected
- `rejected`: Doctor application was rejected

### approvalStatus (Approval Workflow)

- `pending`: Awaiting admin review
- `approved`: Admin approved the doctor
- `rejected`: Admin rejected the doctor

## Database Fields

```typescript
// New fields added to doctor document
{
  status: "pending" | "active" | "inactive" | "rejected",
  approvalStatus: "pending" | "approved" | "rejected",
  approvedBy: string (admin user ID),
  approvalReason: string (reason for rejection),
  approvedAt: Date (when approved),

  // Existing fields
  fullName: string,
  email: string,
  password: string (hashed),
  phone: string,
  gender: string,
  age: number,
  address: { street, city, country, zipCode },
  specialization: string,
  licenseNumber: string,
  consultationFee: number,
  availableDays: number[] (0-6, Sunday=0),
  startTime: string (HH:MM format),
  endTime: string (HH:MM format),
  slotDuration: number (minutes),
  createdAt: Date,
  updatedAt: Date
}
```

## Key Fixes Applied

### 1. TypeScript Control Type Error

**Before:**

```typescript
const form = useForm<DoctorFormValues>({
  resolver: zodResolver(doctorFormSchema),
  // ... caused type mismatch
});
form.control; // ❌ Type error
```

**After:**

```typescript
const form = useForm<DoctorFormValues>({
  resolver: zodResolver(doctorFormSchema),
  // Properly typed
});
form.control; // ✅ Correct type
```

### 2. Multi-Day Selection

**Before:**

```typescript
dayOfWeek: z.coerce.string().min(1); // Single string
// Form treated as array - type mismatch
```

**After:**

```typescript
availableDays: z.array(z.number()).min(1); // Array of numbers
// Form properly handles multi-select
```

## API Endpoints

| Method | Endpoint                                   | Purpose                     |
| ------ | ------------------------------------------ | --------------------------- |
| POST   | `/api/doctors/become-doctor`               | Doctor submits registration |
| GET    | `/api/admin/approve-doctor?status=pending` | Fetch pending doctors       |
| POST   | `/api/admin/approve-doctor`                | Approve/reject doctor       |

## Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Send approval/rejection emails to doctors
   - Add verification code for doctor registration

2. **Authentication**
   - Add role-based access control to admin endpoints
   - Verify admin user before allowing approvals

3. **Document Verification**
   - Add file upload for license verification
   - Implement document review workflow

4. **Search & Filter**
   - Search doctors by name, email, specialization
   - Filter by approval date, specialization

5. **Batch Operations**
   - Approve/reject multiple doctors at once
   - Export doctors list to CSV

## Testing

### Test Doctor Registration

```bash
curl -X POST http://localhost:3000/api/doctors/become-doctor \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. Test",
    "email": "test@example.com",
    "password": "password123",
    ...
  }'
```

### Test Admin Approval

```bash
curl -X POST http://localhost:3000/api/admin/approve-doctor \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "507f1f77bcf86cd799439011",
    "action": "approve"
  }'
```

### Test Getting Pending Doctors

```bash
curl http://localhost:3000/api/admin/approve-doctor?status=pending
```

## Notes

- Database `USERS` collection stores both doctors and patients
- Doctors are identified by `role: "doctor"`
- Patient appointments can only be booked with doctors where `status: "active"`
- Doctor dashboard should check for `approvalStatus: "approved"` before showing features
- Admin endpoints should be protected with role-based middleware (TODO)
