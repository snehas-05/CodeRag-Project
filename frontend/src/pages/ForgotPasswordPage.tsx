import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { forgotPassword } from '../api/auth';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      toast.success('OTP sent to your email');
      // Pass the email to the reset page via state
      navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-[#94a3b8]">Enter your email for a reset code.</p>
        </div>

        <div className="bg-[#11141d]/60 backdrop-blur-xl border border-[#1e293b] p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#94a3b8] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#475569] group-focus-within:text-[#00d4ff] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#0a0c10]/50 border border-[#1e293b] rounded-2xl focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all outline-none placeholder:text-[#334155] text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#00d4ff] to-[#00a3ff] hover:from-[#33ddff] hover:to-[#1ab2ff] text-[#0a0c10] font-bold rounded-2xl shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#1e293b] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
