import { ShieldCheck, FileText, Clock, Ban, AlertTriangle, CheckCircle } from 'lucide-react';

const Policies = () => {
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-spa-teal/10 text-spa-teal mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Guest Policies</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Guidelines and rules to ensure a harmonious and premium stay for everyone at Comftay.</p>
        </header>

        <div className="space-y-8">
          {/* Check-In/Out */}
          <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
               <Clock className="text-spa-teal" size={24} />
               <h2 className="text-2xl font-bold text-foreground">Check-In & Check-Out</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h3 className="font-bold text-foreground mb-3">Check-In Procedure</h3>
                  <ul className="space-y-3 text-muted-foreground text-sm">
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> Start time: 3:00 PM</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> Minimum age: 18 years</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> Valid government ID required</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> Credit card for incidentals hold</li>
                  </ul>
               </div>
               <div>
                  <h3 className="font-bold text-foreground mb-3">Check-Out Procedure</h3>
                  <ul className="space-y-3 text-muted-foreground text-sm">
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> End time: 11:00 AM</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> Late checkout options available</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> Express checkout via mobile</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> Key card box in lobby</li>
                  </ul>
               </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
               <FileText className="text-spa-teal" size={24} />
               <h2 className="text-2xl font-bold text-foreground">Booking Cancellation</h2>
            </div>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
               <div className="p-6 bg-muted rounded-2xl border border-border">
                  <div className="font-bold text-foreground mb-2 flex items-center gap-2">
                     <AlertTriangle size={18} className="text-amber-500" /> Standard Cancellation
                  </div>
                  <p className="text-sm">Reservations cancelled at least 48 hours prior to arrival date (local time) will receive a full refund. Cancellations made within 48 hours will be charged for the first night's stay plus any applicable taxes.</p>
               </div>
               
               <div className="p-6 bg-muted rounded-2xl border border-border">
                  <div className="font-bold text-foreground mb-2 flex items-center gap-2">
                     <Ban size={18} className="text-red-500" /> Non-Refundable Rates
                  </div>
                  <p className="text-sm">Discounted promotional rates or seasonal packages marked as 'Non-Refundable' are ineligible for a refund upon cancellation or modification at any time after booking.</p>
               </div>
            </div>
          </div>

          {/* General House Rules */}
          <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-8 text-spa-teal">
               <h2 className="text-2xl font-bold text-foreground">General House Rules</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
               {[
                 { title: "No Smoking", desc: "We are a 100% smoke-free facility. A $250 recovery fee applies for smoking in guest rooms." },
                 { title: "Quiet Hours", desc: "To respect all guests, quiet hours are observed from 10:00 PM to 7:00 AM." },
                 { title: "Pet Policy", desc: "Pets under 50lbs are allowed in designated rooms with a $75 cleaning fee per stay." },
                 { title: "Damages", desc: "Guests are responsible for any damages beyond normal wear and tear to room furnishings." }
               ].map((rule, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-spa-teal mt-2 shrink-0" />
                    <div>
                       <div className="font-bold text-foreground mb-1">{rule.title}</div>
                       <div className="text-sm text-muted-foreground leading-snug">{rule.desc}</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="text-center pt-8">
             <p className="text-xs text-muted-foreground">Last updated: October 2023. These policies are subject to change without notice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;
