import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Code2, ArrowRight, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

/**
 * CodeRAG 2026 Architecture: RegisterPage
 * 
 * Features:
 * - Complex form validation (Confirm password).
 * - Live password strength visualizer.
 * - Multi-tenant organization support.
 * - Auto-login upon successful registration.
 */

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let strength = 0;
    if (pw.length > 8) strength += 25;
    if (/[A-Z]/.test(pw)) strength += 25;
    if (/[0-9]/.test(pw)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pw)) strength += 25;
    return strength;
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordStrength < 75) {
      setError("Please choose a stronger password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
      });

      setAuth(response.user, response.accessToken, response.tenantId);
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <div className="container mx-auto max-w-5xl flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-12 lg:gap-24">
        
        {/* Left Side: Context */}
        <div className="hidden lg:block w-full lg:w-1/2">
           <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-8">
              <ShieldCheck className="text-cyan-400" size={32} />
           </div>
           <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
             Secure your <span className="text-cyan-400">knowledge</span> base.
           </h1>
           <p className="text-slate-400 text-xl leading-relaxed mb-10">
             Join hundreds of engineering teams using CodeRAG to automate bug fixes and architect reviews with secure, tenant-isolated AI.
           </p>

           <div className="space-y-6">
             {[
               "End-to-end encrypted codebase analysis",
               "Dedicated tenant isolation by default",
               "Zero-trust Workload Identity integration"
             ].map((text, i) => (
               <div key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <span>{text}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full lg:w-1/2 max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <Code2 className="text-slate-800" size={64} />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-500 text-sm mb-8">Set up your workspace and organization.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Company</label>
                  <input
                    required
                    value={formData.organizationName}
                    onChange={(e) => updateField('organizationName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                />
                
                {/* Password Strength Meter */}
                <div className="flex gap-1 mt-2">
                   {[25, 50, 75, 100].map((level) => (
                     <div 
                       key={level} 
                       className={`h-1 flex-1 rounded-full transition-colors ${
                         passwordStrength >= level 
                           ? (passwordStrength <= 50 ? 'bg-amber-500' : 'bg-emerald-500') 
                           : 'bg-slate-800'
                       }`} 
                     />
                   ))}
                </div>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-slate-950 font-bold py-3 px-4 rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-xs mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-bold hover:text-cyan-400 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
