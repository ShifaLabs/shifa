interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

export interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  gender: string;
  age: number;
  address: Address;
  profileImage?: string;
  specialization?: string;
  licenseNumber?: string;
  experienceYears?: number;
  status: "pending" | "active" | "inactive" | "rejected";
  isVerified?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedBy?: string; // Admin user ID
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
