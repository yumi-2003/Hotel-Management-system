import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      category: "Bookings & Check-In",
      questions: [
        {
          q: "What are the standard check-in and check-out times?",
          a: "Standard check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be available upon request, subject to availability and potential fees."
        },
        {
          q: "Can I cancel or modify my reservation?",
          a: "Yes, modifications can be made via your profile dashboard. For cancellations, our standard policy allows free cancellation up to 48 hours before your arrival date for most room types."
        },
        {
          q: "Is a security deposit required?",
          a: "A temporary hold of $100 per night is applied to your credit card at check-in for incidental charges. This is released immediately upon check-out provided no damages occurred."
        }
      ]
    },
    {
      category: "Amenities & Services",
      questions: [
        {
          q: "Is breakfast included in the room rate?",
          a: "Breakfast is included for 'Premium' and 'Luxury Suite' bookings. For Standard rooms, breakfast can be added during booking or at the front desk for $25 per person."
        },
        {
          q: "Do you offer airport shuttle services?",
          a: "Yes, we provide luxury shuttle services from Major International Airport. Please schedule your pickup at least 24 hours in advance via our concierge."
        },
        {
          q: "Is there high-speed Wi-Fi available?",
          a: "Complementary gigabit Wi-Fi is available throughout the hotel. No login password is required—simply connect to the 'Comftay_Guest' network and accept terms."
        }
      ]
    },
    {
      category: "Policies & Local Area",
      questions: [
        {
          q: "Are pets allowed at the property?",
          a: "We are a pet-friendly hotel for animals under 50lbs. A one-time pet cleaning fee of $75 applies. Service animals are always welcome at no additional charge."
        },
        {
          q: "How far are the main city attractions?",
          a: "We are centrally located. The main shopping district is a 5-minute walk, and the Central Business District is approximately 10 minutes by taxi."
        }
      ]
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Flattened for search
  const allQuestions = faqs.flatMap(cat => cat.questions);
  const filteredQuestions = searchTerm 
    ? allQuestions.filter(f => f.q.toLowerCase().includes(searchTerm.toLowerCase()) || f.a.toLowerCase().includes(searchTerm.toLowerCase()))
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <section className="bg-muted/20 py-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <HelpCircle className="mx-auto text-spa-teal mb-6" size={48} />
           <h1 className="text-4xl font-bold text-foreground mb-4">How can we help you?</h1>
           <p className="text-muted-foreground mb-10">Search our knowledge base or browse by category below.</p>
           
           <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input 
                type="text" 
                placeholder="Search for questions (e.g. check-in, wifi, parking)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl border border-border bg-background focus:border-spa-teal focus:ring-4 focus:ring-spa-teal/10 outline-none transition-all text-lg shadow-sm"
              />
           </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        {filteredQuestions ? (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-foreground mb-8">Search Results for "{searchTerm}"</h3>
            {filteredQuestions.length > 0 ? (
               filteredQuestions.map((f, i) => (
                <div key={i} className="p-8 rounded-3xl bg-card border border-border">
                   <h4 className="font-bold text-foreground mb-3 text-lg leading-snug">{f.q}</h4>
                   <p className="text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
               ))
            ) : (
              <div className="text-center py-12">
                 <p className="text-muted-foreground">No matching questions found. Try different keywords.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {faqs.map((category, catIdx) => (
              <div key={catIdx}>
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-spa-teal mb-8 ml-1">{category.category}</h3>
                <div className="space-y-4">
                  {category.questions.map((faq, qIdx) => {
                    const globalIdx = catIdx * 100 + qIdx; // Unique key for index
                    const isOpen = activeIndex === globalIdx;
                    
                    return (
                      <div 
                        key={qIdx} 
                        className={`border rounded-3xl transition-all duration-300 ${isOpen ? 'bg-spa-teal/[0.02] border-spa-teal shadow-lg' : 'bg-card border-border hover:border-spa-teal/40'}`}
                      >
                        <button 
                          onClick={() => toggleFAQ(globalIdx)}
                          className="w-full text-left px-8 py-6 flex justify-between items-center gap-4"
                        >
                          <span className="font-bold text-foreground text-lg leading-snug">{faq.q}</span>
                          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-spa-teal text-white' : 'bg-muted text-foreground'}`}>
                            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                           <div className="px-8 pb-8 text-muted-foreground leading-relaxed text-lg border-t border-spa-teal/5 pt-4">
                             {faq.a}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Support Banner */}
      <section className="bg-[#0F2F2F] py-20 px-6 mt-12">
         <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mx-auto mb-8">
               <MessageCircle size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
            <p className="text-white/60 mb-10 max-w-xl mx-auto text-lg leading-relaxed">Our guest support team is online 24/7 to assist with any specific requirements you might have.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button className="bg-spa-teal text-white px-8 py-4 rounded-2xl font-bold hover:bg-spa-teal-dark transition shadow-xl shadow-spa-teal/20">Live Chat Support</button>
               <button className="bg-white/5 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition">Call Front Desk</button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default FAQ;
