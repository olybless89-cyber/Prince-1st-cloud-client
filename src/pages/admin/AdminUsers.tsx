import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { Search, UserCog, Ban, CheckCircle, Mail, ChevronDown, ChevronUp, Edit3, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Profile } from '@/types';

interface UserWithAccounts extends Profile {
  account_count: number;
  total_balance: number;
  accounts: { id: string; account_number: string; account_type: string; balance: number; currency: string; is_active: boolean }[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'first_name'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserWithAccounts | null>(null);
  const [editBalance, setEditBalance] = useState<Record<string, string>>({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order(sortField, { ascending: sortDir === 'asc' });

    if (!profiles) { setLoading(false); return; }

    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const { data: accs } = await supabase
          .from('bank_accounts')
          .select('id, account_number, account_type, balance, currency, is_active')
          .eq('user_id', p.id);
        const accounts = accs || [];
        const account_count = accounts.length;
        const total_balance = accounts.reduce((s, a) => s + a.balance, 0);
        return { ...p, account_count, total_balance, accounts };
      })
    );
    setUsers(enriched);
    setLoading(false);
  }, [sortField, sortDir]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(userId);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) toast.error('Failed to update role');
    else { toast.success(`Role updated to ${newRole}`); await loadUsers(); }
    setActionLoading(null);
  };

  const toggleAccountStatus = async (accountId: string, currentIsActive: boolean) => {
    const newIsActive = !currentIsActive;
    setActionLoading(accountId);
    const { error } = await supabase.from('bank_accounts').update({ is_active: newIsActive }).eq('id', accountId);
    if (error) toast.error('Failed to update account status');
    else { toast.success(newIsActive ? 'Account activated' : 'Account frozen'); await loadUsers(); if (editUser) setEditUser(prev => prev ? { ...prev, accounts: prev.accounts.map(a => a.id === accountId ? { ...a, is_active: newIsActive } : a) } : null); }
    setActionLoading(null);
  };

  const saveBalance = async (accountId: string, newBalanceStr: string) => {
    const newBalance = parseFloat(newBalanceStr);
    if (isNaN(newBalance) || newBalance < 0) { toast.error('Invalid balance amount'); return; }
    setActionLoading('bal_' + accountId);
    const { error } = await supabase.from('bank_accounts').update({ balance: newBalance }).eq('id', accountId);
    if (error) toast.error('Failed to update balance');
    else {
      toast.success('Balance updated successfully');
      await loadUsers();
      setEditUser(prev => prev ? { ...prev, accounts: prev.accounts.map(a => a.id === accountId ? { ...a, balance: newBalance } : a), total_balance: prev.accounts.reduce((s, a) => s + (a.id === accountId ? newBalance : a.balance), 0) } : null);
    }
    setActionLoading(null);
  };

  const sendEmail = async (user: UserWithAccounts) => {
    const email = user.email;
    if (!email) { toast.error('No email on file'); return; }
    setActionLoading(user.id + '_email');
    try {
      const res = await supabase.functions.invoke('send-email', {
        body: { type: 'login_alert', to: email, user_id: user.id, data: { first_name: user.first_name || user.username } },
      });
      if (res.error) throw res.error;
      toast.success(`Email sent to ${email}`);
    } catch { toast.error('Failed to send email'); }
    setActionLoading(null);
  };

  const openEdit = (u: UserWithAccounts) => {
    setEditUser(u);
    const init: Record<string, string> = {};
    u.accounts.forEach(a => { init[a.id] = String(a.balance); });
    setEditBalance(init);
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const SortBtn = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => { setSortField(field); setSortDir(d => field === sortField ? (d === 'asc' ? 'desc' : 'asc') : 'desc'); }}>
      {label}
      {sortField === field ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} total registered users</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, username, email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
                <th className="text-left px-6 py-3"><SortBtn field="first_name" label="User" /></th>
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Country</th>
                <th className="text-left px-6 py-3">Accounts</th>
                <th className="text-left px-6 py-3">Total Balance</th>
                <th className="text-left px-6 py-3">Role</th>
                <th className="text-left px-6 py-3"><SortBtn field="created_at" label="Joined" /></th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {Array.from({ length: 8 }).map((__, j) => <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>)}
                  </tr>
                ))
                : filtered.length === 0
                  ? <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">No users found</td></tr>
                  : filtered.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-foreground">{u.first_name} {u.last_name}</div>
                            <div className="text-xs text-muted-foreground">@{u.username || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{u.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{u.country || '—'}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{u.account_count}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-semibold">${u.total_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="border border-border text-xs h-8 px-2" onClick={() => openEdit(u)}>
                            <Edit3 className="w-3 h-3 mr-1" />Manage
                          </Button>
                          <Button size="sm" variant="ghost" className="border border-border text-xs h-8 px-2"
                            onClick={() => toggleRole(u.id, u.role)} disabled={actionLoading === u.id}>
                            {u.role === 'admin' ? <><Ban className="w-3 h-3 mr-1" />Demote</> : <><UserCog className="w-3 h-3 mr-1" />Promote</>}
                          </Button>
                          {u.email && (
                            <Button size="sm" variant="ghost" className="border border-border text-xs h-8 px-2"
                              onClick={() => sendEmail(u)} disabled={actionLoading === u.id + '_email'}>
                              <Mail className="w-3 h-3 mr-1" />Email
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="text-xs text-muted-foreground text-right">Showing {filtered.length} of {users.length} users</div>
      )}

      {/* ── Account Management Modal ── */}
      <Dialog open={!!editUser} onOpenChange={open => !open && setEditUser(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {(editUser?.first_name?.[0] || editUser?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div className="text-foreground">{editUser?.first_name} {editUser?.last_name}</div>
                <div className="text-xs text-muted-foreground font-normal">@{editUser?.username} · {editUser?.email}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Profile info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="glass-card rounded-xl p-3 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Phone</div>
                <div className="font-medium text-foreground">{editUser?.phone || '—'}</div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Country</div>
                <div className="font-medium text-foreground">{editUser?.country || '—'}</div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-border">
                <div className="text-xs text-muted-foreground mb-1">KYC Status</div>
                <div className={`font-semibold ${editUser?.kyc_status === 'approved' ? 'text-green-400' : editUser?.kyc_status === 'pending' ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                  {editUser?.kyc_status || 'not submitted'}
                </div>
              </div>
              <div className="glass-card rounded-xl p-3 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Role</div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${editUser?.role === 'admin' ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}`}>
                  {editUser?.role}
                </span>
              </div>
            </div>

            {/* Accounts */}
            <div>
              <div className="text-sm font-semibold text-foreground mb-3">Bank Accounts</div>
              {editUser?.accounts.length === 0
                ? <div className="text-sm text-muted-foreground py-4 text-center">No accounts found</div>
                : editUser?.accounts.map(acc => (
                  <div key={acc.id} className="glass-card rounded-xl p-4 border border-border mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold text-foreground capitalize">{acc.account_type} · {acc.currency}</div>
                        <div className="text-xs text-muted-foreground font-mono">{acc.account_number}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${acc.is_active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                        {acc.is_active ? 'active' : 'frozen'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          type="number"
                          value={editBalance[acc.id] ?? String(acc.balance)}
                          onChange={e => setEditBalance(prev => ({ ...prev, [acc.id]: e.target.value }))}
                          className="pl-7 h-9 bg-secondary border-border text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 text-xs"
                        onClick={() => saveBalance(acc.id, editBalance[acc.id] ?? String(acc.balance))}
                        disabled={actionLoading === 'bal_' + acc.id}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />Save
                      </Button>
                      <Button size="sm" variant="ghost" className={`h-9 px-3 text-xs border ${acc.is_active ? 'border-red-400/30 text-red-400 hover:bg-red-400/10' : 'border-green-400/30 text-green-400 hover:bg-green-400/10'}`}
                        onClick={() => toggleAccountStatus(acc.id, acc.is_active)}
                        disabled={actionLoading === acc.id}>
                        {acc.is_active ? <><Ban className="w-3.5 h-3.5 mr-1" />Freeze</> : <><CheckCircle className="w-3.5 h-3.5 mr-1" />Unfreeze</>}
                      </Button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface UserWithAccounts extends Profile {
  account_count: number;
  total_balance: number;
}
