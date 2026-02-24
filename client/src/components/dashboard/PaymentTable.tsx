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
    <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="text-xl font-bold text-foreground">Recent Transactions</h3>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{payments.length} Payments</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Guest</th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Method</th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">TXN ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm italic">
                  No transactions found.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{format(new Date(payment.createdAt), 'hh:mm a')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{payment.guestId?.fullName || 'Guest'}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{payment.guestId?.email}</p>
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
                      <span className="text-xs font-bold text-foreground">{payment.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      payment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      payment.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {payment.status === 'completed' ? <CheckCircle2 className="w-3 h-3"/> : 
                       payment.status === 'failed' ? <XCircle className="w-3 h-3"/> : 
                       <Clock className="w-3 h-3"/>}
                      {payment.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
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
