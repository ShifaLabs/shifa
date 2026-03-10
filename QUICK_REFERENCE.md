# Quick Reference Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Shifa Doctor Registration System         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DOCTOR REGISTRATION                                        │
│  ├─ Frontend: /dashboard/be-doctor                        │
│  ├─ Form: DoctorFormValues (Zod validated)               │
│  └─ API: POST /api/doctors/become-doctor                 │
│         └─ Creates doctor with status: "pending"         │
│                                                             │
│  ADMIN APPROVAL                                             │
│  ├─ Frontend: /dashboard/admin/doctor-approvals          │
│  ├─ Server Actions: doctor-approval.action.ts            │
│  └─ API: POST /api/admin/approve-doctor                  │
│         └─ Updates doctor status to "active" or "inactive"│
│                                                             │
│  DATABASE                                                   │
│  └─ Collection: users (role: "doctor")                   │
│         ├─ Personal Info (name, email, phone, etc)      │
│         ├─ Professional Info (specialization, license)  │
│         ├─ Availability (days, times, slot duration)    │
│         └─ Status Fields (status, approvalStatus, etc)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Files Reference

### 1. Form Component

**File**: `src/app/dashboard/be-doctor/page.tsx`

```typescript
// Schema Definition
const doctorFormSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  // ... 15 more fields
  availableDays: z.array(z.number()).min(1), // Multi-day support
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

// Form Submission
async function onSubmit(data: DoctorFormValues) {
  const response = await fetch("/api/doctors/become-doctor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

### 2. Registration API

**File**: `src/app/api/doctors/become-doctor/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = becomeDoctorSchema.parse(body);

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Create doctor with pending status
  const doctorResult = await usersCollection.insertOne({
    // ... all fields
    status: "pending",
    approvalStatus: "pending",
    // ... other fields
  });

  return NextResponse.json(
    {
      success: true,
      message: "Application submitted successfully!",
      data: { doctorId: doctorResult.insertedId },
    },
    { status: 201 },
  );
}
```

### 3. Admin Approval API

**File**: `src/app/api/admin/approve-doctor/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { doctorId, action, reason } = approvalSchema.parse(body);

  if (action === "approve") {
    // Update to active
    await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(doctorId) },
      {
        $set: {
          approvalStatus: "approved",
          status: "active",
          isVerified: true,
          approvedAt: now,
        },
      },
    );
  } else if (action === "reject") {
    // Update to inactive
    await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(doctorId) },
      {
        $set: {
          approvalStatus: "rejected",
          status: "inactive",
          approvalReason: reason,
        },
      },
    );
  }
}

export async function GET(request: NextRequest) {
  // Fetch pending/approved/rejected doctors with pagination
  const doctors = await usersCollection
    .find({ role: "doctor", approvalStatus: "pending" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}
```

### 4. Server Actions

**File**: `src/features/Auth/doctor-approval.action.ts`

```typescript
export async function approveDoctorAction(
  doctorId: string,
  approvedBy: string,
): Promise<ApproveDoctorlResult> {
  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(doctorId), role: "doctor" },
    {
      $set: {
        approvalStatus: "approved",
        status: "active",
        isVerified: true,
        approvedBy,
        approvedAt: now,
      },
    },
  );

  return { success: true, message: "Approved!", data: result.value };
}
```

### 5. Admin Dashboard

**File**: `src/app/dashboard/admin/doctor-approvals/page.tsx`

```typescript
export default function AdminDoctorApprovalPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetchPendingDoctors();
  }, [page]);

  const fetchPendingDoctors = async () => {
    const result = await getPendingDoctorsAction(page, 10);
    setDoctors(result.data);
  };

  const handleApprove = async (doctor: Doctor) => {
    const result = await approveDoctorAction(doctor._id, "admin");
    if (result.success) {
      fetchPendingDoctors(); // Refresh list
    }
  };

  const handleReject = async (doctor: Doctor, reason: string) => {
    const result = await rejectDoctorAction(doctor._id, reason);
    if (result.success) {
      fetchPendingDoctors(); // Refresh list
    }
  };
}
```

## Status Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Doctor Status Workflow                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Registration Submission                                    │
│  └─> status: "pending"                                     │
│      └─> approvalStatus: "pending"                         │
│          └─> isVerified: false                             │
│              └─> [Cannot access dashboard features yet]    │
│                                                             │
│  Admin Reviews Application                                  │
│  ├─ Option 1: APPROVE                                      │
│  │  └─> status: "active"                                  │
│  │      └─> approvalStatus: "approved"                    │
│  │          └─> isVerified: true                          │
│  │              └─> [Can now access all features]         │
│  │                                                         │
│  └─ Option 2: REJECT                                       │
│     └─> status: "inactive"                                │
│         └─> approvalStatus: "rejected"                    │
│             └─> approvalReason: "..."                     │
│                 └─> [Cannot access features]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

```typescript
// Doctor Document Example
{
  _id: ObjectId("507f1f77bcf86cd799439011"),

  // Authentication
  email: "dr.smith@example.com",
  password: "$2a$12$...", // hashed
  role: "doctor",
  provider: "credentials",

  // Personal Info
  fullName: "Dr. Jane Smith",
  gender: "female",
  age: 35,
  phone: "+1 (555) 123-4567",

  // Address
  address: {
    street: "456 Medical Center Drive",
    city: "Los Angeles",
    country: "USA",
    zipCode: "90001"
  },

  // Professional
  specialization: "Dermatology",
  licenseNumber: "MED-87654321",

  // Availability & Billing
  consultationFee: 100,
  availableDays: [1, 2, 3, 4, 5], // Mon-Fri
  startTime: "10:00",
  endTime: "18:00",
  slotDuration: 45,

  // Status & Approval
  status: "active", // pending, active, inactive, rejected
  approvalStatus: "approved", // pending, approved, rejected
  isVerified: true,
  approvedBy: "admin",
  approvalReason: null,
  approvedAt: ISODate("2024-03-10T12:00:00Z"),

  // Profile
  profileImage: null,
  profileCompleted: true,

  // Metadata
  createdAt: ISODate("2024-03-10T10:00:00Z"),
  updatedAt: ISODate("2024-03-10T12:00:00Z")
}
```

## Type Definitions

```typescript
// Form Values Type
type DoctorFormValues = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  gender: "male" | "female" | "other";
  age: number;
  street: string;
  city: string;
  country: string;
  zipCode: string;
  specialization: string;
  licenseNumber: string;
  consultationFee: number;
  availableDays: number[]; // 0-6 for Sun-Sat
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  slotDuration: number; // minutes
};

// Doctor Document Type
interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  gender: string;
  age: number;
  address: Address;
  specialization?: string;
  licenseNumber?: string;
  status: "pending" | "active" | "inactive" | "rejected";
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvalReason?: string;
  consultationFee?: number;
  availableDays?: number[];
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}
```

## Error Handling

### Validation Errors

```typescript
// Client-side: Zod schema validation
const schema = z.object({
  email: z.string().email(), // ✅ Validates format
  age: z.number().min(18), // ✅ Validates age
  availableDays: z.array(z.number()).min(1), // ✅ Requires at least 1 day
});

// Server-side: Additional validation
if (existingUser) {
  return NextResponse.json(
    { success: false, message: "User already exists" },
    { status: 400 },
  );
}
```

### Success Responses

```typescript
{
  "success": true,
  "message": "Application submitted successfully! Your profile is now pending admin approval.",
  "data": {
    "doctorId": "507f1f77bcf86cd799439011",
    "email": "doctor@example.com",
    "status": "pending"
  }
}
```

### Error Responses

```typescript
{
  "success": false,
  "message": "Failed to submit application",
  "errors": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "path": ["fullName"],
      "message": "Full name must be at least 2 characters"
    }
  ]
}
```

## Testing Commands

### Doctor Registration

```bash
curl -X POST http://localhost:3000/api/doctors/become-doctor \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. Test",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "gender": "male",
    "age": 35,
    "street": "123 Street",
    "city": "City",
    "country": "Country",
    "zipCode": "12345",
    "specialization": "cardiology",
    "licenseNumber": "MED-12345",
    "consultationFee": 50,
    "availableDays": [1,2,3,4,5],
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 30
  }'
```

### Get Pending Doctors

```bash
curl "http://localhost:3000/api/admin/approve-doctor?status=pending&page=1&limit=10"
```

### Approve Doctor

```bash
curl -X POST http://localhost:3000/api/admin/approve-doctor \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "507f1f77bcf86cd799439011",
    "action": "approve"
  }'
```

### Reject Doctor

```bash
curl -X POST http://localhost:3000/api/admin/approve-doctor \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "507f1f77bcf86cd799439011",
    "action": "reject",
    "reason": "License could not be verified"
  }'
```

## Troubleshooting

### Issue: Module not found error

**Solution**: Run `npm install` and restart dev server

### Issue: Database connection fails

**Solution**: Verify MONGO_URI and DB_NAME env variables

### Issue: Password hashing fails

**Solution**: Ensure bcryptjs is installed: `npm install bcryptjs`

### Issue: Form shows validation errors

**Solution**: Check Zod schema matches form field names exactly

### Issue: Admin approval doesn't work

**Solution**:

1. Verify MongoDB ObjectId is valid
2. Check doctor exists with role: "doctor"
3. Ensure admin user has necessary permissions
