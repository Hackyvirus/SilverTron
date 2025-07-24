'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function WithdrawalRequestForm({ onSubmit }: { onSubmit: () => void }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount.');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('reason', reason);
      if (attachment) {
        formData.append('attachment', attachment);
      } 

      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || 'Something went wrong.');
      } else {
        setMessage('Withdrawal request submitted successfully!');
        setIsError(false);
        onSubmit();
      }
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md max-w-2xl mx-auto my-8 font-sans">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">Withdrawal Request</h2>
      <p className="mb-6 text-gray-600">Fill out the form to request a withdrawal.</p>

      <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="Enter amount to withdraw"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="reason">Reason / Notes</Label>
          <Textarea
            id="reason"
            name="reason"
            placeholder="Add any notes or reasons for withdrawal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>


        {message && (
          <div className={`text-center text-sm mt-2 ${isError ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-6 py-2 rounded-md"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  );
}
