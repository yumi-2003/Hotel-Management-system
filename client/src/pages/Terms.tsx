import { FileText, Shield, Gavel, ExternalLink } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-foreground mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">Please read these terms carefully before using our booking platform.</p>
        </div>

        <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-10">
          <section>
            <div className="flex items-center gap-2 text-foreground mb-6">
               <Gavel size={24} className="text-spa-teal" />
               <h2 className="text-2xl font-bold m-0 italic underline decoration-spa-teal/30">1. Agreement to Terms</h2>
            </div>
            <p>
              By accessing our website and making a reservation, you agree to be bound by these Terms and Conditions. 
              These terms constitute a legally binding agreement between you and Comftay Premium Hospitality Group. 
              If you do not agree with any part of these terms, you must not use our services.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 text-foreground mb-6">
               <Shield size={24} className="text-spa-teal" />
               <h2 className="text-2xl font-bold m-0 italic underline decoration-spa-teal/30">2. Privacy Policy</h2>
            </div>
            <p>
              Your use of our services is also governed by our Privacy Policy, which is incorporated into these terms by 
              this reference. We take your data security seriously and only process personal information in 
              accordance with GDPR and other relevant local regulations.
            </p>
            <button className="flex items-center gap-2 text-spa-teal font-bold hover:underline py-2">
              Read Our Full Privacy Policy <ExternalLink size={16} />
            </button>
          </section>

          <section>
            <div className="flex items-center gap-2 text-foreground mb-6">
               <FileText size={24} className="text-spa-teal" />
               <h2 className="text-2xl font-bold m-0 italic underline decoration-spa-teal/30">3. User Responsibility</h2>
            </div>
            <p>
              Users are responsible for maintaining the confidentiality of their account credentials. Any activity 
              occuring under your account is your sole responsibility. You agree to provide accurate and complete 
              information during the booking process and keep your contact details updated.
            </p>
            <ul className="list-disc pl-6 space-y-4 mt-6">
               <li>You must be at least 18 years of age to create an account.</li>
               <li>Illegal activities or misuse of the platform will result in immediate termination.</li>
               <li>Users are responsible for ensuring their payment methods remain valid for reservation holds.</li>
            </ul>
          </section>

          <section>
             <div className="bg-muted p-8 rounded-3xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">4. Limitation of Liability</h3>
                <p className="text-sm">
                   Comftay Premium Hospitality Group shall not be liable for any indirect, incidental, or consequential 
                   damages resulting from the use or inability to use the platform. While we strive for 100% uptime, 
                   we do not guarantee that the service will be uninterrupted or error-free.
                </p>
             </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 italic underline decoration-spa-teal/30">5. Governing Law</h2>
            <p>
               These terms shall be governed by and construed in accordance with the laws of the State of New York, 
               without regard to its conflict of law provisions. Any legal action or proceeding arising under these 
               terms shall be brought exclusively in the courts located in New York City.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-10 border-t border-border flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-black">
           <span>Comftay Legal Dept.</span>
           <span>Effective Date: 01/2024</span>
        </div>
      </div>
    </div>
  );
};

export default Terms;
