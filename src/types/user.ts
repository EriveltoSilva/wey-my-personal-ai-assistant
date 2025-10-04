export interface CreateUserFormData {
  email: string;
  username: string;
  full_name: string;
  password: string;
  phone: string;
  role: "super_admin" | "admin" | "user" | "agent";
}

export type AuthUser = {
  id: string;
  username: string;
  role: string;
  fullName: string;
};

// Phone data structure
export interface PhoneData {
  id: string;
  number: string;
  phone_type: "mobile" | "home" | "work" | "other";
  profile_id: string;
  created_at: string;
  updated_at: string;
}

// Profile data structure
export interface ProfileData {
  id: string;
  bio: string | null;
  gender: "male" | "female" | null;
  birthday: string | null;
  bi: string | null;
  is_national: boolean;
  passport_number: string | null;
  photo_url: string | null;
  user_id: string;
  phones: PhoneData[];
}

// User data structure from backend
export interface UserData {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  avatar?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Full user data with relations from profile-details endpoint
export interface UserWithRelationsData {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  avatar?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profile: ProfileData | null;
}

// Update user form data
export interface UpdateUserFormData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

// Update profile form data
export interface UpdateProfileFormData {
  bio: string;
  gender: "male" | "female";
  birthday: string;
  bi: string;
  is_national: boolean;
  passport_number: string;
}

// Create phone form data
export interface CreatePhoneFormData {
  number: string;
  phone_type: "mobile" | "home" | "work" | "other";
}

// Change password form data
export interface ChangePasswordFormData {
  password: string;
  new_password: string;
}
