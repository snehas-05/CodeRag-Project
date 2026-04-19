import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { verifyOtp, resetPassword } from '../api/auth';
import toast from 'react-hot-toast';

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(initialEmail ? 1 : 0); // 0: Enter email, 1: Enter OTP, 2: Success
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the reset code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      setStep(2);
      toast.success('Code verified!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setStep(3); // Success state
      toast.success('Password reset successful!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-4 text-[#e2e8f0]">
        <div className="w-full max-w-md bg-[#11141d]/60 backdrop-blur-xl border border-[#1e293b] p-8 rounded-3xl shadow-2xl text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-[#00d4ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-[#00d4ff]" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
          <p className="text-[#94a3b8] mb-8">Your password has been updated. You can now login with your new credentials.</p>
          <Link
            to="/login"
            className="block w-full py-4 bg-gradient-to-r from-[#00d4ff] to-[#00a3ff] text-[#0a0c10] font-bold rounded-2xl transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1a1c2e] via-[#0a0c10] to-[#0a0c10] p-4 text-[#e2e8f0]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00d4ff]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7000ff]/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#7000ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#00d4ff]/20">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#94a3b8]">
                CodeRAG
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 2 ? 'New Password' : 'Verify Code'}
          </h1>
          <p className="text-[#94a3b8]">
            {step === 2 
              ? 'Set a secure password for your account.' 
              : `Enter the 6-digit code sent to ${email || 'your email'}.`}
          </p>
        </div>

        <div className="bg-[#11141d]/60 backdrop-blur-xl border border-[#1e293b] p-8 rounded-3xl shadow-2xl">
          {step === 2 ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8] ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#475569] group-focus-within:text-[#00d4ff] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#0a0c10]/50 border border-[#1e293b] rounded-2xl focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all outline-none placeholder:text-[#334155] text-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#00d4ff] to-[#00a3ff] text-[#0a0c10] font-bold rounded-2xl shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {!initialEmail && step === 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#94a3b8] ml-1">Email</label>
                  <input
                    type="email"
                    className="block w-full px-4 py-3.5 bg-[#0a0c10]/50 border border-[#1e293b] rounded-2xl focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all outline-none text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8] ml-1">Verification Code</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#475569] group-focus-within:text-[#00d4ff] transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#0a0c10]/50 border border-[#1e293b] rounded-2xl focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all outline-none tracking-[0.5em] font-mono text-center text-white"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#00d4ff] to-[#00a3ff] text-[#0a0c10] font-bold rounded-2xl shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#1e293b] text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Try a different email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
