'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type WithdrawalRequest = {
  id: string;
  amount: number;
  reason: string | null;
  attachment: string | null;
  status: string;
  createdAt: string;
  profile: {
    fullName: string;
    email: string;
    userId: string;
  };
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editedAmounts, setEditedAmounts] = useState<Record<string, number>>({});

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/auth/admin/login';
        return;
      }

      if (res.status === 403) {
        toast.error('Access denied. Admins only.');
        return;
      }

      if (!res.ok) throw new Error(data.message || 'Failed to fetch data');

      setWithdrawals(data);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    id: string,
    action: 'approve' | 'reject',
    amountOverride?: number
  ) => {
    setProcessingId(id);
    try {
      const amountToSend = amountOverride ?? editedAmounts[id];

      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action, amount: action === 'approve' ? amountToSend : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Action failed');
        return;
      }

      toast.success(`Withdrawal ${action}d successfully`);
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(`Failed to ${action}: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAmountChange = (id: string, value: string) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      setEditedAmounts((prev) => ({ ...prev, [id]: parsed }));
    } else {
      setEditedAmounts((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Withdrawal Requests</h2>
        <p className="text-sm text-muted-foreground">Review and manage withdrawal approvals</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading withdrawals...</p>
        </div>
      ) : withdrawals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No withdrawal requests found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => {
            const isPending = withdrawal.status === 'pending';
            const amountValue =
              editedAmounts[withdrawal.id] ?? withdrawal.amount;

            return (
              <Card key={withdrawal.id}>
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  {/* Left - User Info */}
                  <div className="flex-1 space-y-2 w-full md:w-auto">
                    <div>
                      <p className="text-base font-medium text-foreground">
                        {withdrawal.profile.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">{withdrawal.profile.email}</p>
                    </div>

                    <p className="text-sm">
                      Submitted:{' '}
                      <span className="text-muted-foreground">
                        {new Date(withdrawal.createdAt).toLocaleString()}
                      </span>
                    </p>

                    {withdrawal.reason && (
                      <p className="text-sm text-muted-foreground">
                        Reason: {withdrawal.reason}
                      </p>
                    )}

                    {withdrawal.attachment && (
                      <a
                        href={`/uploads/${withdrawal.attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View Attachment
                      </a>
                    )}
                  </div>

                  {/* Right - Actions */}
                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full capitalize ${
                          withdrawal.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : withdrawal.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Amount ($):</label>
                      <Input
                        type="number"
                        min={1}
                        value={amountValue}
                        className="w-24 h-8 px-2 text-sm"
                        onChange={(e) =>
                          handleAmountChange(withdrawal.id, e.target.value)
                        }
                        disabled={!isPending || processingId === withdrawal.id}
                      />
                    </div>

                    {isPending && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAction(withdrawal.id, 'approve', amountValue)
                          }
                          disabled={
                            processingId === withdrawal.id || !amountValue || amountValue <= 0
                          }
                        >
                          {processingId === withdrawal.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(withdrawal.id, 'reject')}
                          disabled={processingId === withdrawal.id}
                        >
                          {processingId === withdrawal.id ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
