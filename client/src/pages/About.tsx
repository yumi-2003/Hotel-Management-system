import { Shield, Award, Heart, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#0F2F2F]">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Luxury Hotel" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Redefining Modern Hospitality</h1>
          <p className="text-xl text-white/80 leading-relaxed font-light">
            Founded on the principles of comfort, elegance, and effortless stay experiences, 
            Comftay is more than just a destination. It's your sanctuary away from home.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-spa-teal font-black uppercase tracking-[0.2em] text-sm mb-4 block">Our Story</span>
            <h2 className="text-4xl font-bold text-[#0F2F2F] mb-8 leading-tight">Crafting Unforgettable Moments Since 2010</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                What started as a single boutique concept in the heart of the city has grown into a premiere 
                hospitality network dedicated to the modern traveller. We believe that luxury isn't just about 
                gold leaf and crystal—it's about the seamless integration of comfort, technology, and warmth.
              </p>
              <p>
                At Comftay, we meticulously design every interaction. From the effortless mobile check-in 
                to our curated room scent profiles, we ensure that your stay is not just a booking, but a memory.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-border pt-12">
              <div>
                <div className="text-4xl font-black text-spa-teal mb-2">150+</div>
                <div className="text-sm font-bold text-[#0F2F2F] uppercase tracking-wider">Premium Rooms</div>
              </div>
              <div>
                <div className="text-4xl font-black text-spa-teal mb-2">24/7</div>
                <div className="text-sm font-bold text-[#0F2F2F] uppercase tracking-wider">Guest Concierge</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700">
               <img 
                 src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                 alt="Hotel Interior" 
                 className="w-full h-auto"
               />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-spa-teal p-8 rounded-3xl shadow-xl hidden md:block">
               <Award className="text-white w-12 h-12" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0F2F2F] mb-4">The Pillars of Comftay</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our commitment to excellence is built on three core values that guide everything we do.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: Shield,
              title: "Absolute Privacy",
              desc: "Experience tranquility with our sound-engineered rooms and secure, private guest access paths."
            },
            {
              icon: Sparkles,
              title: "Modern Elegance",
              desc: "A fusion of minimalistic design and high-tech amenities tailored for the 21st-century explorer."
            },
            {
              icon: Heart,
              title: "Guest-First Care",
              desc: "Our team doesn't just work in service; they work in hospitality, ensuring every need is met before it's asked."
            }
          ].map((val, i) => (
            <div key={i} className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-spa-teal/10 flex items-center justify-center text-spa-teal mb-8 group-hover:scale-110 transition-transform">
                <val.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#0F2F2F] mb-4">{val.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-[#0F2F2F] mb-8">Ready for a Better Stay?</h2>
        <p className="text-xl text-muted-foreground mb-12">Join thousands of happy guests who have discovered the Comftay difference.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-[#0F2F2F] text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            Book Your Room
          </button>
          <button className="bg-white border border-border text-[#0F2F2F] px-10 py-5 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Contact Reservations
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
