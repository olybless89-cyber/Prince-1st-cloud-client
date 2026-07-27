import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Building2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [step, setStep] = useState<'identify' | 'pin'>('identify');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setStep('pin');
    setTimeout(() => pinRefs.current[0]?.focus(), 100);
  };

  const handlePinChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin];
    next[i] = val;
    setPin(next);
    if (val && i < 3) pinRefs.current[i + 1]?.focus();
  };

  const handlePinKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin.length < 4) { toast.error('Please enter your 4-digit PIN.'); return; }
    setLoading(true);
    try {
      let emailToUse = identifier.trim();

      // If not an email, look up the real email by username
      if (!emailToUse.includes('@')) {
        const { data: profile, error: lookupError } = await supabase
          .from('profiles')
          .select('email, id')
          .eq('username', emailToUse)
          .maybeSingle();
        if (lookupError) {
          toast.error('Could not verify username. Please try again.');
          setLoading(false);
          return;
        }
        if (!profile?.email) {
          toast.error('Username not found. Please check and try again.');
          setLoading(false);
          return;
        }
        emailToUse = profile.email;
      }

      // PIN is stored as skb_XXXX (6 chars) to meet Supabase min-length requirement
      const PIN_SECRET = `skb_${enteredPin}`;
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailToUse, password: PIN_SECRET });
      if (error) throw error;

      // Send login alert (non-blocking)
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('first_name, username').eq('id', data.user.id).maybeSingle();
        supabase.functions.invoke('send-email', {
          body: {
            type: 'login_alert',
            to: emailToUse,
            user_id: data.user.id,
            data: { first_name: profile?.first_name || profile?.username || 'User' },
          },
        }).catch(() => null);
      }

      // Fetch profile to determine role and redirect correctly
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      toast.success('Welcome back!');
      if (profileData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : 'Login failed').toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('user not found') || msg.includes('does not exist')) {
        toast.error('Incorrect PIN. Please try again.');
      } else if (msg.includes('email not confirmed')) {
        toast.error('Account not confirmed. Please contact support.');
      } else {
        toast.error('Login failed. Please try again.');
      }
      setPin(['', '', '', '']);
      pinRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20" style={{ background: 'linear-gradient(135deg, #f0faf9 0%, #ffffff 50%, #f5fbfa 100%)' }}>
      <div className="w-full max-w-md">
        {/* Teal top accent bar */}
        <div className="h-1 w-24 bg-primary rounded-full mx-auto mb-8" />

        <div className="bg-white rounded-3xl p-10 text-center shadow-[0_4px_32px_rgba(2,121,107,0.10)] border border-[#e2f0ee]">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>

          {step === 'identify' ? (
            <>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Welcome Back</h2>
              <p className="text-slate-500 text-sm mb-8">Enter your username or email to continue</p>
              <form onSubmit={handleIdentify} className="text-left space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Username or Email</label>
                  <Input type="text" placeholder="johnsmith or john@email.com" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                    className="bg-white border-[#cce8e3] h-12 text-base text-slate-800 focus:border-primary focus:ring-primary/20" required autoFocus />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-base font-semibold shadow-sm">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
              <p className="text-sm text-slate-500 mt-6">
                No account? <Link to="/register" className="text-primary hover:underline font-semibold">Open Account</Link>
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">{identifier[0]?.toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-1">{identifier}</h2>
              <p className="text-slate-500 text-sm mb-8">Enter your 4-digit PIN to sign in</p>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">PIN</label>
                  <div className="flex gap-4 justify-center mb-2">
                    {pin.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { pinRefs.current[i] = el; }}
                        type={showPin ? 'text' : 'password'}
                        maxLength={1}
                        value={d}
                        onChange={(e) => handlePinChange(i, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                        className={cn('w-14 h-16 rounded-xl border-2 text-center text-2xl font-bold bg-white text-slate-800 outline-none transition-all', d ? 'border-primary shadow-sm' : 'border-[#cce8e3]', 'focus:border-primary focus:ring-2 focus:ring-primary/20')}
                        inputMode="numeric"
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowPin(!showPin)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary mx-auto transition-colors mt-2">
                    {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPin ? 'Hide' : 'Show'} PIN
                  </button>
                </div>
                <Button type="submit" disabled={loading || pin.join('').length < 4} className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-base font-semibold shadow-sm">
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
              <button onClick={() => { setStep('identify'); setPin(['', '', '', '']); }} className="text-sm text-slate-400 hover:text-primary transition-colors mt-4 block mx-auto">
                ← Use a different account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
