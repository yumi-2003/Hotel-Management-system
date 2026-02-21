import React from 'react';
import { format } from 'date-fns';
import { Printer, Download, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceViewProps {
  booking: any;
  onClose: () => void;
}

// Normalize Tailwind 4 oklab/oklch colors so html2canvas can render safely
const sanitizeOklchForHtml2Canvas = (clonedDoc: Document) => {
  const elements = clonedDoc.getElementsByTagName('*');
  const defaultView = clonedDoc.defaultView || window;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    const style = defaultView.getComputedStyle(el);

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

const InvoiceView: React.FC<InvoiceViewProps> = ({ booking, onClose }) => {
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
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
        windowWidth: width,
        windowHeight: height,
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
      console.error('PDF Generation Error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white overflow-y-auto">
      <div 
        ref={invoiceRef}
        className="bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300 print:shadow-none print:rounded-none"
      >
        {/* Header */}
        <div className="bg-[#0F2F2F] p-8 text-white flex justify-between items-start print:bg-white print:text-black print:border-b print:border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-spa-teal flex items-center justify-center">
                <span className="font-black text-white text-xl">C</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">COMFTAY</h2>
            </div>
            <div className="text-xs text-slate-400 space-y-1 print:text-slate-600">
              <div className="flex items-center gap-2"><MapPin className="w-3 h-3"/> 123 Paradise Road, Ocean Bay</div>
              <div className="flex items-center gap-2"><Phone className="w-3 h-3"/> +1 234 567 890</div>
              <div className="flex items-center gap-2"><Mail className="w-3 h-3"/> hello@sparesort.com</div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black text-spa-teal mb-2">INVOICE</h1>
            <p className="text-slate-400 text-sm">#{booking.bookingCode}</p>
            <p className="text-slate-400 text-xs mt-1">{format(new Date(), 'MMM dd, yyyy')}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Guest & Status Box */}
          <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-[#0F2F2F]">{booking.guestId?.fullName || 'Guest'}</h3>
              <p className="text-slate-500 text-sm">{booking.guestId?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Status</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <CheckCircle2 className="w-3 h-3"/>
                {booking.status === 'confirmed' ? 'PAID' : 'PAY ON ARRIVAL'}
              </div>
              <p className="text-slate-400 text-[10px] mt-2 font-mono uppercase">Method: {booking.paymentId?.paymentMethod || 'Cash'}</p>
            </div>
          </div>

          {/* Details Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Nights</th>
                <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</th>
                <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {booking.bookedRooms.map((room: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-bold text-[#0F2F2F]">Room {room.roomId?.roomNumber || 'Standard'}</p>
                    <p className="text-slate-400 text-xs">Stay Period: {format(new Date(booking.checkInDate), 'MMM dd')} - {format(new Date(booking.checkOutDate), 'MMM dd')}</p>
                  </td>
                  <td className="py-4 text-center text-sm font-bold text-slate-600">{room.nights}</td>
                  <td className="py-4 text-right text-sm font-bold text-slate-600">${room.pricePerNight.toLocaleString()}</td>
                  <td className="py-4 text-right text-sm font-bold text-[#0F2F2F]">${room.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-[#0F2F2F] font-bold">${booking.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Taxes & Fees (0%)</span>
                <span className="text-[#0F2F2F] font-bold">$0</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-lg font-black text-[#0F2F2F]">TOTAL</span>
                <span className="text-2xl font-black text-spa-teal">${booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-8 bg-slate-50 flex justify-between items-center print:hidden">
          <button 
            onClick={onClose}
            className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm uppercase tracking-widest"
          >
            Close
          </button>
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-[#0F2F2F] rounded-2xl flex items-center gap-2 text-sm font-bold text-white hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
