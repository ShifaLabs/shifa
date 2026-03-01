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
  role: string;
  phone: string;
  gender: string;
  age: number;
  address: Address;
  profileImage?: string;
  specialization?: string;
  licenseNumber?: string;
  experienceYears?: number;
  status: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}
