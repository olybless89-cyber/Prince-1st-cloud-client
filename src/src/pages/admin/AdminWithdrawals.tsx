import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { CheckCircle, XCircle, Search, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PendingWithdrawal {
  id: string;
  account_id: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  recipient_account: string | null;
  metadata: { method?: string };
  created_at: string;
  account: { account_number: string; account_type: string; balance: number; user_id: string; profiles: { first_name: string | null; last_name: string | null; username: string | null; email: string | null } | null } | null;
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<PendingWithdrawal | null>(null);

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*, account:account_id(account_number, account_type, balance, user_id, profiles:user_id(first_name, last_name, username, email))')
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load withdrawals');
    } else {
      setWithdrawals((data as unknown as PendingWithdrawal[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadWithdrawals(); }, [loadWithdrawals]);

  const approve = async (w: PendingWithdrawal) => {
    setActionLoading(w.id);
    const { data: account, error: accErr } = await supabase
      .from('bank_accounts')
      .select('balance')
      .eq('id', w.account_id)
      .maybeSingle();
    if (accErr || !account) {
      toast.error('Account not found');
      setActionLoading(null);
      return;
    }
    if (account.balance < Math.abs(w.amount)) {
      toast.error('Insufficient balance in user account');
      setActionLoading(null);
      return;
    }

    const { error: updErr } = await supabase
      .from('bank_accounts')
      .update({ balance: account.balance + w.amount })
      .eq('id', w.account_id);
    if (updErr) {
      toast.error('Failed to debit balance');
      setActionLoading(null);
      return;
    }

    const { error: txnErr } = await supabase
      .from('transactions')
      .update({ status: 'completed', description: w.description.replace('Pending', 'Completed') })
      .eq('id', w.id);
    if (txnErr) {
      toast.error('Failed to update transaction');
      setActionLoading(null);
      return;
    }

    toast.success(`Withdrawal ${w.reference} approved and balance debited`);
    setSelected(null);
    await loadWithdrawals();
    setActionLoading(null);
  };

  const reject = async (w: PendingWithdrawal) => {
    setActionLoading(w.id);
    const { error } = await supabase.from('transactions').update({ status: 'failed' }).eq('id', w.id);
    if (error) toast.error('Failed to reject withdrawal');
    else {
      toast.success(`Withdrawal ${w.reference} rejected`);
      setSelected(null);
      await loadWithdrawals();
    }
    setActionLoading(null);
  };

  const filtered = withdrawals.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const p = w.account?.profiles;
    return (
      w.reference.toLowerCase().includes(q) ||
      w.account?.account_number.toLowerCase().includes(q) ||
      p?.email?.toLowerCase().includes(q) ||
      p?.username?.toLowerCase().includes(q) ||
      `${p?.first_name || ''} ${p?.last_name || ''}`.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Pending Withdrawals</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and approve user withdrawal requests</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by reference, user, account..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
                <th className="text-left px-6 py-3">User</th>
                <th className="text-left px-6 py-3">Account</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Method</th>
                <th className="text-left px-6 py-3">Reference</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>)}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No pending withdrawals</td></tr>
              ) : filtered.map((w) => {
                const p = w.account?.profiles;
                return (
                  <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">{p?.first_name} {p?.last_name}</div>
                      <div className="text-xs text-muted-foreground">@{p?.username || '---'} · {p?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{w.account?.account_number}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-400">{w.currency} {Math.abs(w.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{w.metadata?.method?.replace('_', ' ') || '---'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{w.reference}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-2 text-xs" onClick={() => setSelected(w)} disabled={actionLoading === w.id}>
                        <ArrowUpRight className="w-3 h-3 mr-1" />Review
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Review Withdrawal</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="glass-card rounded-xl p-4 border border-border text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Amount</div>
                <div className="text-3xl font-extrabold text-red-400 mt-1">
                  {selected.currency} {Math.abs(selected.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{selected.reference}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">User</span><span className="font-medium">{selected.account?.profiles?.first_name} {selected.account?.profiles?.last_name} (@{selected.account?.profiles?.username})</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="font-medium font-mono">{selected.account?.account_number}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium capitalize">{selected.metadata?.method?.replace('_', ' ') || '---'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Destination</span><span className="font-medium">{selected.recipient_account || '---'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Current Balance</span><span className="font-medium">{selected.currency} {selected.account?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Balance After</span><span className="font-medium">{selected.currency} {((selected.account?.balance || 0) + selected.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => approve(selected)} disabled={actionLoading === selected.id}>
                  <CheckCircle className="w-4 h-4 mr-2" />Approve
                </Button>
                <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10" onClick={() => reject(selected)} disabled={actionLoading === selected.id}>
                  <XCircle className="w-4 h-4 mr-2" />Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
