export interface SignupRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string;
    image: string | null;
  };
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse {
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string;
    image: string | null;
  };
  token?: string; // For future JWT implementation
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  verified: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UserResponse {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string;
  image: string | null;
  createdAt: Date;
}

export interface GetUserResponse {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string;
  image: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  image?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string;
    image: string | null;
  };
}
