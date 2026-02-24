import React from 'react';
import { CreditCard, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Reservation } from '../../types';

interface PaymentSectionProps {
  reservation: Reservation;
  onPaymentComplete: (method: 'Card' | 'Cash') => void;
  onCancel: () => void;
  loading: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ 
  reservation, 
  onPaymentComplete, 
  onCancel,
  loading 
}) => {
  const totalPrice = reservation.reservedRooms.reduce((sum, room) => sum + room.subtotal, 0);
  const [method, setMethod] = React.useState<'Card' | 'Cash'>('Card');
  const [paymentDetails, setPaymentDetails] = React.useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const isFormValid = method === 'Cash' || (
    paymentDetails.cardNumber.length >= 16 && 
    paymentDetails.expiry.length >= 5 && 
    paymentDetails.cvv.length >= 3
  );

  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-2xl border border-border animate-in fade-in zoom-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Summary */}
        <div className="bg-muted/50 p-8 lg:p-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Booking Summary</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-background shadow-sm flex items-center justify-center text-spa-teal flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Room Selection</p>
                <p className="text-lg font-bold text-foreground">
                  {typeof reservation.roomType === 'object' ? (reservation.roomType as any).typeName : 'Standard Room'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Check-in</p>
                <p className="text-base font-bold text-foreground">
                  {format(new Date(reservation.checkInDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Check-out</p>
                <p className="text-base font-bold text-foreground">
                  {format(new Date(reservation.checkOutDate), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-muted-foreground font-medium">Subtotal</p>
                <p className="text-foreground font-bold">${totalPrice.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground font-medium">Taxes & Fees</p>
                <p className="text-foreground font-bold">$0</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <p className="text-lg font-bold text-foreground">Total Amount</p>
                <p className="text-2xl font-black text-spa-teal">${totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Payment Option</h3>
            <div className="flex gap-2 p-1 bg-muted rounded-2xl mt-4">
              <button 
                onClick={() => setMethod('Card')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${method === 'Card' ? 'bg-background text-spa-teal shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Online Card
              </button>
              <button 
                onClick={() => setMethod('Cash')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${method === 'Cash' ? 'bg-background text-spa-teal shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Pay at Hotel
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {method === 'Card' ? (
              <>
                <div className="relative animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block ml-1">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="xxxx xxxx xxxx xxxx" 
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                      className="w-full h-14 bg-background border border-border rounded-2xl px-5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal transition-all uppercase"
                    />
                    <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block ml-1">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      value={paymentDetails.expiry}
                      onChange={(e) => setPaymentDetails({...paymentDetails, expiry: e.target.value.replace(/[^\d/]/g, '').slice(0, 5)})}
                      className="w-full h-14 bg-background border border-border rounded-2xl px-5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal transition-all uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block ml-1">CVV</label>
                    <input 
                      type="password" 
                      placeholder="***" 
                      value={paymentDetails.cvv}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                      className="w-full h-14 bg-background border border-border rounded-2xl px-5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal transition-all uppercase"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-full bg-spa-teal/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏨</span>
                </div>
                <p className="text-sm font-bold text-foreground">Pay at the front desk upon arrival.</p>
                <p className="text-xs text-muted-foreground mt-2">Your booking will be confirmed immediately.</p>
              </div>
            )}

            <div className="flex items-center gap-2 py-4 text-[#89D6D3]">
              <Lock className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-widest">
                {method === 'Card' ? 'Secure encrypted payment' : 'Guaranteed reservation'}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 h-14 rounded-2xl border border-border font-bold text-muted-foreground hover:bg-muted/50 transition-all active:scale-95"
              >
                Back
              </button>
              <button
                onClick={() => onPaymentComplete(method)}
                disabled={loading || !isFormValid}
                className="flex-[2] h-14 bg-[#89D6D3] hover:bg-[#78C5C2] text-white rounded-2xl font-black shadow-lg shadow-[#89D6D3]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    {method === 'Card' ? 'Pay & Complete' : 'Confirm Booking'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
