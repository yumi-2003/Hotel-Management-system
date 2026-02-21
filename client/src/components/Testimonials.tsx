import { Star, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as roomService from '../services/roomService';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Business Traveler",
    content: "The best hotel experience I've ever had. Fast WiFi, excellent room service, and truly a home away from home.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Family Vacation",
    content: "Perfect for our family getaway. The kids loved the pool, and the staff went above and beyond to make us comfortable.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 3,
    name: "Emma Davis",
    role: "Honeymoon Couple",
    content: "Absolutely stunning lake views and impeccable service. We couldn't have asked for a better romantic retreat.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

const Testimonials = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await roomService.getAllReviews();
        // Assuming data is an array of reviews
        const topReviews = data.filter((r: any) => r.rating >= 4).slice(0, 3);
        setReviews(topReviews);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const displayData = reviews.length > 0 ? reviews.map(r => ({
    id: r._id,
    name: r.userId?.fullName || 'Guest',
    role: `Stayed in ${r.roomTypeId?.typeName || 'our hotel'}`,
    content: r.comment,
    rating: r.rating,
    avatar: r.userId?.profileImage || `https://ui-avatars.com/api/?name=${r.userId?.fullName || 'G'}&background=random`
  })) : testimonials;

  if (displayData.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">What Our Guests Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Read about the experiences of our valued guests.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayData.map(testimonial => (
            <div key={testimonial.id} className="bg-card p-8 rounded-2xl shadow-sm border border-border transition-all hover:shadow-md">
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
