import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { CheckCircle, XCircle, Search, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CardOrder {
  id: string;
  user_id: string;
  account_id: string;
  card_type: string;
  status: string;
  delivery_address: string;
  reference: string;
  notes: string | null;
  created_at: string;
  account: { account_number: string; account_type: string } | null;
  profiles: { first_name: string | null; last_name: string | null; username: string | null; email: string | null } | null;
}

export default function AdminDebitCards() {
  const [cards, setCards] = useState<CardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<CardOrder | null>(null);

  const loadCards = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('debit_cards')
      .select('*, account:account_id(account_number, account_type), profiles:user_id(first_name, last_name, username, email)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load card orders');
    } else {
      setCards((data as unknown as CardOrder[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  const updateStatus = async (card: CardOrder, status: string) => {
    setActionLoading(card.id);
    const { error } = await supabase.from('debit_cards').update({ status, notes: status === 'shipped' ? 'Card has been dispatched' : status === 'delivered' ? 'Card delivered successfully' : card.notes }).eq('id', card.id);
    if (error) {
      toast.error('Failed to update card order');
    } else {
      toast.success(`Card order ${card.reference} marked as ${status}`);
      setSelected(null);
      await loadCards();
    }
    setActionLoading(null);
  };

  const filtered = cards.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const p = c.profiles;
    return (
      c.reference.toLowerCase().includes(q) ||
      c.account?.account_number.toLowerCase().includes(q) ||
      p?.email?.toLowerCase().includes(q) ||
      p?.username?.toLowerCase().includes(q) ||
      `${p?.first_name || ''} ${p?.last_name || ''}`.toLowerCase().includes(q)
    );
  });

  const statusColor = (status: string) => {
    if (status === 'pending') return 'bg-yellow-400/10 text-yellow-400';
    if (status === 'approved') return 'bg-primary/10 text-primary';
    if (status === 'shipped') return 'bg-blue-400/10 text-blue-400';
    if (status === 'delivered') return 'bg-green-400/10 text-green-400';
    if (status === 'rejected') return 'bg-red-400/10 text-red-400';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Debit Card Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track user debit card orders</p>
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
                <th className="text-left px-6 py-3">Card</th>
                <th className="text-left px-6 py-3">Account</th>
                <th className="text-left px-6 py-3">Status</th>
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
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No card orders yet</td></tr>
              ) : filtered.map((c) => {
                const p = c.profiles;
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">{p?.first_name} {p?.last_name}</div>
                      <div className="text-xs text-muted-foreground">@{p?.username || '---'} · {p?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground capitalize">{c.card_type} Debit</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{c.account?.account_number}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(c.status)}`}>{c.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{c.reference}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-2 text-xs" onClick={() => setSelected(c)} disabled={actionLoading === c.id}>
                        <CreditCard className="w-3 h-3 mr-1" />Manage
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
            <DialogTitle>Manage Card Order</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="glass-card rounded-xl p-4 border border-border text-center">
                <CreditCard className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground capitalize">{selected.card_type} Debit Card</div>
                <div className="text-sm text-muted-foreground font-mono">{selected.reference}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">User</span><span className="font-medium">{selected.profiles?.first_name} {selected.profiles?.last_name} (@{selected.profiles?.username})</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="font-medium font-mono">{selected.account?.account_number}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-medium">{selected.delivery_address}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ordered</span><span className="font-medium">{new Date(selected.created_at).toLocaleDateString()}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => updateStatus(selected, 'approved')} disabled={actionLoading === selected.id || selected.status !== 'pending'}>
                  <CheckCircle className="w-4 h-4 mr-2" />Approve
                </Button>
                <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10" onClick={() => updateStatus(selected, 'shipped')} disabled={actionLoading === selected.id || selected.status === 'shipped'}>
                  <Truck className="w-4 h-4 mr-2" />Ship
                </Button>
                <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10" onClick={() => updateStatus(selected, 'delivered')} disabled={actionLoading === selected.id || selected.status === 'delivered'}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />Deliver
                </Button>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => updateStatus(selected, 'rejected')} disabled={actionLoading === selected.id || selected.status === 'rejected'}>
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
