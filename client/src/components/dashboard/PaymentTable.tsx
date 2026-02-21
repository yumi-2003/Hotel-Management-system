import React from 'react';
import { format } from 'date-fns';
import { CreditCard, Banknote, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface Payment {
  _id: string;
  guestId: { fullName: string; email: string };
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  createdAt: string;
}

interface PaymentTableProps {
  payments: Payment[];
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#0F2F2F]">Recent Transactions</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{payments.length} Payments</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">TXN ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm italic">
                  No transactions found.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#0F2F2F]">{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{format(new Date(payment.createdAt), 'hh:mm a')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#0F2F2F]">{payment.guestId?.fullName || 'Guest'}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{payment.guestId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-spa-teal">${payment.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {payment.paymentMethod.toLowerCase() === 'card' ? (
                        <CreditCard className="w-4 h-4 text-spa-teal" />
                      ) : (
                        <Banknote className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-xs font-bold text-slate-600">{payment.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {payment.status === 'completed' ? <CheckCircle2 className="w-3 h-3"/> : 
                       payment.status === 'failed' ? <XCircle className="w-3 h-3"/> : 
                       <Clock className="w-3 h-3"/>}
                      {payment.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                      {payment.transactionId || '---'}
                    </code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;
