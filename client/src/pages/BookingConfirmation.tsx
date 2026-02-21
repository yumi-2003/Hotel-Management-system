import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Home,
  MapPin,
  Clock,
  ShieldCheck,
  Download,
  ArrowRight,
  ClipboardList,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Robust shim to strip/replace Tailwind 4 oklch/oklab colors before html2canvas parses them
const sanitizeOklchForHtml2Canvas = (clonedDoc: Document) => {
  const defaultView = clonedDoc.defaultView || window;

  // 1) Clean up <style> tags that contain oklab/oklch so parser never sees them
  const styleTags = clonedDoc.getElementsByTagName('style');
  for (let i = 0; i < styleTags.length; i++) {
    const node = styleTags[i];
    if (node.textContent && node.textContent.includes('okl')) {
      node.textContent = node.textContent
        .replace(/oklch\([^)]+\)/g, '#0f172a')
        .replace(/oklab\([^)]+\)/g, '#0f172a');
    }
  }

  // 2) Walk all elements and normalize computed + inline styles
  const elements = clonedDoc.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    const style = defaultView.getComputedStyle(el);

    // Inline style attributes may contain CSS variables with oklch
    const inline = el.getAttribute('style');
    if (inline && inline.includes('okl')) {
      el.setAttribute(
        'style',
        inline
          .replace(/oklch\([^)]+\)/g, '#0f172a')
          .replace(/oklab\([^)]+\)/g, '#0f172a'),
      );
    }

    // Background Color
    if (style.backgroundColor.includes('okl')) {
      if (el.classList.contains('bg-slate-50')) el.style.backgroundColor = '#f8fafc';
      else if (el.classList.contains('bg-slate-100')) el.style.backgroundColor = '#f1f5f9';
      else if (el.classList.contains('bg-spa-teal')) el.style.backgroundColor = '#14b8a6';
      else if (el.classList.contains('bg-[#0F2F2F]')) el.style.backgroundColor = '#0F2F2F';
      else el.style.backgroundColor = '#ffffff';
    }

    // Text Color
    if (style.color.includes('okl')) {
      if (el.classList.contains('text-slate-400')) el.style.color = '#94a3b8';
      else if (el.classList.contains('text-slate-500')) el.style.color = '#64748b';
      else if (el.classList.contains('text-slate-600')) el.style.color = '#475569';
      else if (el.classList.contains('text-spa-teal')) el.style.color = '#14b8a6';
      else el.style.color = '#0F2F2F';
    }

    // Border Color
    if (style.borderColor.includes('okl')) {
      el.style.borderColor = '#e2e8f0';
    }

    // Box Shadow (Tailwind 4 shadows use oklch)
    if (style.boxShadow.includes('okl')) {
      el.style.boxShadow =
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    }

    // Outlines / Rings
    if (style.outlineColor.includes('okl')) {
      el.style.outlineColor = '#e2e8f0';
    }

    // SVGs
    if (style.fill.includes('okl')) el.style.fill = 'currentColor';
    if (style.stroke.includes('okl')) el.style.stroke = 'currentColor';

    // Gradients
    if (style.backgroundImage.includes('okl')) {
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = '#0F2F2F';
    }
  }
};

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, error, status } = location.state || {};

  // If no state, redirect to home
  React.useEffect(() => {
    if (!status) {
      navigate('/');
    }
  }, [status, navigate]);

  if (!status) return null;

  const isSuccess = status === 'success';

  const summaryRef = React.useRef<HTMLDivElement>(null);
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const element = invoiceRef.current;
      const width = element.scrollWidth;
      const height = element.scrollHeight;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        width,
        height,
        onclone: sanitizeOklchForHtml2Canvas,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`invoice-${booking.bookingCode}.pdf`);
    } catch (error) {
      console.error('Invoice Download Error:', error);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Status Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-2 shadow-xl">
            {isSuccess ? (
              <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center text-white ring-8 ring-green-500/10">
                <CheckCircle2 size={40} />
              </div>
            ) : (
              <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center text-white ring-8 ring-red-500/10">
                <XCircle size={40} />
              </div>
            )}
          </div>
          <h1 className="text-4xl font-black text-[#0F2F2F] tracking-tight">
            {isSuccess ? 'Booking Confirmed!' : 'Payment Failed'}
          </h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            {isSuccess 
              ? `Your stay at Comftay has been successfully scheduled. We've sent a confirmation email to your inbox.`
              : `We couldn't process your payment. ${error || 'Please check your details and try again.'}`}
          </p>
        </div>

        {isSuccess ? (
          <div
            ref={summaryRef}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
          >
            {/* Summary Card */}
            <div
              className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden"
            >
              <div className="bg-[#0F2F2F] p-8 text-white flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Confirmation Code</p>
                  <p className="text-2xl font-mono font-bold tracking-wider">{booking.bookingCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <p className="text-sm font-bold bg-spa-teal/20 text-spa-teal px-3 py-1 rounded-full inline-block">
                    {booking.status === 'confirmed' ? 'PAID' : 'PAY AT HOTEL'}
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-spa-teal flex-shrink-0">
                        <Home className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room Type</p>
                        <p className="font-bold text-[#0F2F2F]">Premium Standard Room</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-spa-teal flex-shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Period</p>
                        <p className="font-bold text-[#0F2F2F]">
                          {format(new Date(booking.checkInDate), 'MMM dd')} - {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-spa-teal flex-shrink-0">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guests & Duration</p>
                        <p className="font-bold text-[#0F2F2F]">
                          {booking.adultsCount} Adults, {booking.childrenCount} Children • {booking.bookedRooms[0]?.nights || 0} Nights
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-spa-mint/10 flex items-center justify-center text-spa-teal flex-shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Breakdown</p>
                          <p className="text-xl font-black text-spa-teal">${booking.totalPrice.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                          <span>Subtotal</span>
                          <span>${(booking.subtotalAmount || booking.totalPrice / 1.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-0.5">
                          <span>Taxes & Fees (15%)</span>
                          <span>${(booking.taxAmount || booking.totalPrice - (booking.totalPrice / 1.15)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100 mt-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-600">Check-in: 2:00 PM</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <Link to="/contact" className="text-xs font-semibold text-spa-teal hover:underline">Get Directions</Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-600">Free Cancellation (24h)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/my-reservations"
                className="flex-1 h-14 bg-[#0F2F2F] hover:bg-black text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <ClipboardList className="w-5 h-5" />
                My Bookings
              </Link>
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 h-14 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download Invoice
              </button>
              <Link
                to="/"
                className="flex-1 h-14 bg-spa-mint/20 text-spa-teal font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-spa-mint/30 transition-all active:scale-95"
              >
                <ArrowRight className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-12 rounded-[40px] shadow-xl border border-white text-center">
              <p className="text-slate-500 mb-8 italic">"{error}"</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="h-14 bg-spa-teal hover:bg-spa-teal-dark text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                >
                  Retry Payment
                </button>
                <button
                  onClick={() => navigate('/my-reservations')}
                  className="h-14 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Change Payment Method
                </button>
                <Link
                  to="/"
                  className="text-slate-400 font-bold hover:text-slate-600 transition-all text-sm uppercase tracking-widest mt-4"
                >
                  Cancel Booking
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden minimal invoice layout for PDF export */}
      {isSuccess && (
        <div
          ref={invoiceRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: '600px',
            padding: '32px 40px 40px',
            backgroundColor: '#ffffff',
            color: '#0F2F2F',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginBottom: '4px' }}>
              Booking Confirmation
            </p>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
              {booking.bookingCode}
            </h1>
            <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
              {booking.status === 'confirmed' ? 'Payment Confirmed' : 'Reserved - Pay at Hotel'}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginBottom: '4px' }}>
              Guest
            </p>
            <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              {booking.guestId?.fullName || 'Guest'}
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {booking.guestId?.email}
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {booking.adultsCount} Adults, {booking.childrenCount} Children
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginBottom: '4px' }}>
              Stay
            </p>
            <p style={{ fontSize: '13px', margin: 0 }}>
              Check‑in:{' '}
              {format(new Date(booking.checkInDate), 'MMM dd, yyyy')} at 2:00 PM
            </p>
            <p style={{ fontSize: '13px', margin: 0 }}>
              Check‑out:{' '}
              {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
            </p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Nights: {booking.bookedRooms[0]?.nights || 0}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginBottom: '4px' }}>
              Room Type
            </p>
            <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
              Premium Standard Room
            </p>
          </div>

          <div style={{ maxWidth: '360px', marginLeft: '0', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>${(booking.subtotalAmount || booking.totalPrice / 1.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Taxes &amp; Fees (15%)</span>
              <span style={{ fontWeight: 700 }}>${(booking.taxAmount || booking.totalPrice - (booking.totalPrice / 1.15)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>Total Amount</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f766e' }}>
                ${booking.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
