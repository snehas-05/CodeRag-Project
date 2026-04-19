import client from './client';
import { AuthResponse } from '../types';

export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/register', {
    email,
    password,
  });
  return response.data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const body = new URLSearchParams({
    username: email,
    password,
  });

  const response = await client.post<AuthResponse>('/auth/login', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

export async function updateProfile(data: {
  fullName?: string;
  username?: string;
}): Promise<any> {
  const response = await client.put('/auth/me', {
    full_name: data.fullName,
    username: data.username,
  });
  return response.data;
}

export async function getMe(): Promise<any> {
  const response = await client.get('/auth/me');
  return response.data;
}

export async function forgotPassword(email: string): Promise<any> {
  const response = await client.post('/auth/forgot-password', { email });
  return response.data;
}

export async function verifyOtp(email: string, otp: string): Promise<any> {
  const response = await client.post('/auth/verify-otp', { email, otp });
  return response.data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<any> {
  const response = await client.post('/auth/reset-password', {
    email,
    otp,
    new_password: newPassword,
  });
  return response.data;
}
