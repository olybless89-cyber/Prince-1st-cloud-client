import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAccounts } from '@/services/api';
import { supabase } from '@/db/supabase';
import type { BankAccount } from '@/types';
import { toast } from 'sonner';

const CARD_TYPES = [
  { value: 'standard', label: 'Standard Debit', color: 'bg-primary text-primary-foreground' },
  { value: 'gold', label: 'Gold Debit', color: 'bg-yellow-500 text-white' },
  { value: 'platinum', label: 'Platinum Debit', color: 'bg-slate-700 text-white' },
];

export default function DebitCardPage() {
  const { user, profile } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<{ status: string; card_type: string; reference: string } | null>(null);
  const navigate = useNavigate();

  const [accountId, setAccountId] = useState('');
  const [cardType, setCardType] = useState('standard');
  const [address, setAddress] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getUserAccounts(user.id),
      supabase.from('debit_cards').select('status, card_type, reference').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]).then(([accs, existingRes]) => {
      setAccounts(accs);
      if (accs[0]) setAccountId(accs[0].id);
      setExisting(existingRes.data || null);
    }).finally(() => setLoading(false));
  }, [user]);

  const account = accounts.find((a) => a.id === accountId);
  const isValid = accountId && address.trim() && (existing?.status !== 'pending');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    if (!confirmed) { setConfirmed(true); return; }
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('debit_cards')
        .insert({
          user_id: user!.id,
          account_id: accountId,
          card_type: cardType,
          delivery_address: address.trim(),
          status: 'pending',
        })
        .select('reference, card_type, status')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('No card order returned');

      toast.success(`Debit card ordered: ${data.reference}`);
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Card order failed');
    } finally {
      setSubmitting(false);
      setConfirmed(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 max-w-xl">
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Order Debit Card</h1>
        <p className="text-muted-foreground text-sm mt-1">Request a new debit card for your account</p>
      </div>

      {existing?.status === 'pending' ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-border">
          <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="font-bold text-foreground mb-2">Card Order Pending</h3>
          <p className="text-muted-foreground text-sm mb-2">You already have a pending {existing.card_type} debit card request.</p>
          <div className="text-sm font-mono text-muted-foreground">{existing.reference}</div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-border">
          <h3 className="font-semibold text-foreground mb-2">No Accounts Available</h3>
          <p className="text-muted-foreground text-sm">You need at least one account to order a card.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 border border-border space-y-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Card Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CARD_TYPES.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCardType(value)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-sm font-medium transition-colors ${
                    cardType === value
                      ? `${color} border-transparent`
                      : 'bg-secondary border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Linked Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground text-sm">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_number} — {a.currency} {a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({a.account_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Delivery Address</label>
            <Input placeholder="Street, city, zip, country" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-border h-12" required />
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-muted/50 border border-border p-4">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Secure delivery</div>
              Cards are typically dispatched within 5–10 business days after admin approval.
            </div>
          </div>

          {confirmed && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm space-y-2">
              <div className="font-semibold text-primary">Confirm Card Order</div>
              <div className="text-muted-foreground">Ordering a <span className="text-foreground font-semibold">{CARD_TYPES.find(c => c.value === cardType)?.label}</span> linked to account <span className="text-foreground font-semibold">{account?.account_number}</span></div>
              <div className="text-muted-foreground text-xs">Delivery to: {address}</div>
            </div>
          )}

          <Button type="submit" disabled={!isValid || submitting} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base">
            <Truck className="w-4 h-4 mr-2" />
            {submitting ? 'Processing...' : confirmed ? 'Confirm Order' : 'Review Order'}
          </Button>
          {confirmed && (
            <Button type="button" variant="ghost" onClick={() => setConfirmed(false)} className="w-full border border-border text-muted-foreground">
              Cancel
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
