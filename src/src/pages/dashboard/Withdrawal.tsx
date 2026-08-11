import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Building2, Banknote, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAccounts } from '@/services/api';
import { supabase } from '@/db/supabase';
import type { BankAccount } from '@/types';
import { toast } from 'sonner';

const METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'atm', label: 'ATM Withdrawal', icon: Banknote },
  { value: 'check', label: 'Check Request', icon: ClipboardCheck },
];

export default function WithdrawalPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [accountId, setAccountId] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserAccounts(user.id).then((data) => {
      setAccounts(data);
      if (data[0]) setAccountId(data[0].id);
    }).finally(() => setLoading(false));
  }, [user]);

  const account = accounts.find((a) => a.id === accountId);
  const amountNum = parseFloat(amount) || 0;
  const isValid = accountId && amountNum > 0 && destination.trim() && account && amountNum <= account.balance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    if (!confirmed) { setConfirmed(true); return; }
    setSubmitting(true);

    try {
      const { data: txn, error } = await supabase
        .from('transactions')
        .insert({
          account_id: accountId,
          type: 'withdrawal',
          status: 'pending',
          amount: -amountNum,
          currency: account?.currency || 'USD',
          description: `${METHODS.find(m => m.value === method)?.label} request`,
          recipient_account: destination.trim(),
          metadata: { method },
        })
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (!txn) throw new Error('No transaction returned');

      toast.success(`Withdrawal request submitted: ${txn.reference}`);
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal request failed');
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
        <h1 className="text-2xl font-extrabold text-foreground">Withdraw Money</h1>
        <p className="text-muted-foreground text-sm mt-1">Request a withdrawal from your account</p>
      </div>

      {accounts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-border">
          <h3 className="font-semibold text-foreground mb-2">No Accounts Available</h3>
          <p className="text-muted-foreground text-sm">You need at least one account to make a withdrawal.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 border border-border space-y-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">From Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground text-sm">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_number} — {a.currency} {a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({a.account_type})
                </option>
              ))}
            </select>
            {account && (
              <p className="text-xs text-muted-foreground mt-2">Available: {account.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Withdrawal Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-sm font-medium transition-colors ${
                    method === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
              <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-secondary border-border h-12 pl-8 text-lg font-semibold" required />
            </div>
            {amountNum > 0 && account && amountNum > account.balance && (
              <p className="text-xs text-destructive mt-1">Insufficient balance</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {method === 'bank_transfer' ? 'Recipient Bank Account' : method === 'atm' ? 'ATM Location / Reference' : 'Payee Name'}
            </label>
            <Input placeholder={method === 'bank_transfer' ? 'e.g. SKB0012345678' : 'e.g. Details for processing'} value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-secondary border-border h-12" required />
          </div>

          {confirmed && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm space-y-2">
              <div className="font-semibold text-primary">Confirm Withdrawal</div>
              <div className="text-muted-foreground">Withdrawing <span className="text-foreground font-semibold">${amountNum.toFixed(2)}</span> via {METHODS.find(m => m.value === method)?.label} from account <span className="text-foreground font-semibold">{account?.account_number}</span></div>
              <div className="text-muted-foreground text-xs">An admin will review and approve your request before processing.</div>
            </div>
          )}

          <Button type="submit" disabled={!isValid || submitting} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            {submitting ? 'Processing...' : confirmed ? 'Confirm Withdrawal' : 'Review Withdrawal'}
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
