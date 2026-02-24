import { MapPin, Phone, Mail, Clock, Send, Globe, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '../components/ui/button';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <section className="bg-[#0F2F2F] py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Get in Touch</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto font-light">
            We're here to assist with your bookings, special requests, or any questions about our premium services.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-6 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-8">Contact Details</h3>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-spa-teal/10 flex items-center justify-center text-spa-teal shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Global Headquarters</div>
                      <div className="text-sm text-muted-foreground mt-1">123 Luxury Ave, Suite 500<br />New York, NY 10001</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Direct Line</div>
                      <div className="text-sm text-muted-foreground mt-1">+1 (212) 555-0199</div>
                      <div className="text-[10px] text-orange-500 uppercase font-black mt-1">Available 24/7</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Support Email</div>
                      <div className="text-sm text-muted-foreground mt-1">stay@comftay.com</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Front Desk</div>
                      <div className="text-sm text-muted-foreground mt-1">Open 24 Hours / 7 Days</div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                   <div className="font-bold text-foreground mb-4">Follow Our Updates</div>
                   <div className="flex gap-3">
                      {[Instagram, Facebook, Twitter, Globe].map((Icon, i) => (
                        <button key={i} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-spa-teal hover:text-white hover:border-spa-teal transition-all">
                          <Icon size={18} />
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-spa-teal p-8 rounded-[2rem] text-white shadow-xl shadow-spa-teal/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2">Corporate Bookings?</h4>
                  <p className="text-white/80 text-sm mb-6">Learn about our exclusive rates for businesses and annual volume discounts.</p>
                  <Button className="bg-white text-spa-teal hover:bg-white/90 rounded-xl font-bold">Contact Sales</Button>
                </div>
                <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-500">
                   <Globe size={120} />
                </div>
             </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8">
            <div className="bg-card p-10 rounded-[2.5rem] shadow-sm border border-border">
               <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Send Us a Message</h2>
               <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">We typically respond to all enquiries within 6 hours of receipt during business days.</p>
               
               <form className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-foreground/80 ml-1">Full Name</label>
                     <input 
                       type="text" 
                       placeholder="Enter your name"
                       className="w-full px-6 py-4 rounded-2xl bg-background border border-border focus:border-spa-teal focus:ring-0 outline-none transition"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-foreground/80 ml-1">Email Address</label>
                     <input 
                       type="email" 
                       placeholder="Your active email"
                       className="w-full px-6 py-4 rounded-2xl bg-background border border-border focus:border-spa-teal focus:ring-0 outline-none transition"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-foreground/80 ml-1">Subject</label>
                   <select className="w-full px-6 py-4 rounded-2xl bg-background border border-border focus:border-spa-teal outline-none transition appearance-none cursor-pointer">
                     <option>General Enquiry</option>
                     <option>Booking Modification</option>
                     <option>Special Packages</option>
                     <option>Feedback & Suggestions</option>
                     <option>Other</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-foreground/80 ml-1">Your Message</label>
                   <textarea 
                     rows={6} 
                     placeholder="How can we help you?"
                     className="w-full px-6 py-4 rounded-2xl bg-background border border-border focus:border-spa-teal outline-none transition resize-none"
                   ></textarea>
                 </div>

                 <Button className="w-full py-8 rounded-2xl bg-spa-teal hover:bg-spa-teal-dark text-white font-bold text-lg shadow-xl shadow-spa-teal/20 flex items-center justify-center gap-3">
                    <Send size={20} /> Send Message
                 </Button>
               </form>
            </div>
            
            {/* Map Placeholder */}
            <div className="mt-8 h-80 bg-muted rounded-[2.5rem] relative overflow-hidden group">
               <img 
                 src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1174&q=80" 
                 alt="Map Visualization" 
                 className="w-full h-full object-cover grayscale opacity-60 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100"
               />
               <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] group-hover:bg-transparent group-hover:backdrop-blur-0 transition-all">
                  <div className="bg-card p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                     <div className="w-12 h-12 bg-spa-teal rounded-xl flex items-center justify-center text-white">
                        <MapPin size={24} />
                     </div>
                     <div className="pr-4">
                        <div className="font-bold text-foreground">Comftay Premium</div>
                        <div className="text-xs text-muted-foreground">Click to view on Google Maps</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
