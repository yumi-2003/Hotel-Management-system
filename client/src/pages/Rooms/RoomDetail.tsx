import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { RoomType } from '../../types';
import * as roomService from '../../services/roomService';
import { Button } from '../../components/ui/button';
import DynamicIcon from '../../components/common/DynamicIcon';
import { 
  Loader2, ArrowLeft, Users, Star, MessageSquare, ShieldCheck, 
  Clock, Trash2, X, Check
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string)?.replace('/api', '') || '';

const getAmenityIconName = (name: string, iconFromDb?: string) => {
  if (iconFromDb) return iconFromDb;
  
  const iconMap: Record<string, string> = {
    'wifi': 'Wifi',
    'tv': 'Tv',
    'coffee': 'Coffee',
    'tea': 'Coffee',
    'ac': 'Wind',
    'air': 'Wind',
    'conditioning': 'Wind',
    'desk': 'Monitor',
    'work': 'Monitor',
    'bath': 'Bath',
    'jacuzzi': 'Bath',
    'security': 'ShieldCheck',
    'pool': 'Waves',
    'swimming': 'Waves',
    'parking': 'Car',
    'breakfast': 'Utensils',
    'dining': 'Utensils',
    'food': 'Utensils',
    'smoking': 'Cigarette',
    'non-smoking': 'CigaretteOff',
    'gym': 'Dumbbell',
    'fitness': 'Dumbbell',
    'location': 'MapPin',
    'snowflake': 'Snowflake',
    'fridge': 'Snowflake',
  };

  const lowerName = name.toLowerCase();
  for (const key in iconMap) {
    if (lowerName.includes(key)) return iconMap[key];
  }
  return 'Check';
};

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [room, setRoom] = useState<RoomType | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'policies'>('overview');

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRoomData = async () => {
    if (!id) return;
    try {
      const [roomData, reviewsData] = await Promise.all([
        roomService.getRoomTypeById(id),
        roomService.getReviewsByRoomType(id)
      ]);
      setRoom(roomData);
      setReviews(reviewsData);
      if (roomData.images && roomData.images.length > 0) {
        setSelectedImage(roomData.images[0]);
      }
    } catch (error) {
      console.error("Failed to fetch room details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isAuthenticated) return;

    setSubmittingReview(true);
    try {
      // For simplicity, we'll just handle "Create" here. 
      // Backend update logic would be similar via roomService.updateReview if we add it.
      await roomService.createReview({
        roomTypeId: id,
        rating: reviewRating,
        comment: reviewComment
      });
      
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      
      // Refresh data
      const updatedReviews = await roomService.getReviewsByRoomType(id);
      setReviews(updatedReviews);
      
      // Also refresh room for updated rating avg
      const updatedRoom = await roomService.getRoomTypeById(id);
      setRoom(updatedRoom);
    } catch (error) {
      console.error("Failed to submit review", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await roomService.deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
      
      // Refresh room for rating
      if (id) {
        const updatedRoom = await roomService.getRoomTypeById(id);
        setRoom(updatedRoom);
      }
    } catch (error) {
      console.error("Failed to delete review", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-spa-teal" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Room not found</h2>
        <Button onClick={() => navigate('/rooms')}>Back to Rooms</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-12">
      {/* Top Navigation Bar */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/rooms')}
              className="flex items-center gap-2 text-muted-foreground hover:text-spa-teal transition"
            >
              <ArrowLeft size={20} />
              <span className="font-bold">Room Details</span>
            </button>
            {room.availability && (
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                room.availability.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {room.availability.available > 0 ? 'Available' : 'Booked'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Gallery and Info */}
          <div className="lg:w-2/3 space-y-8">
            {/* Gallery Wrapper */}
            <div className="space-y-4">
              <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm group relative">
                <img 
                  src={selectedImage || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'} 
                  alt={room.typeName} 
                  className="w-full h-full object-cover"
                />
                
                {/* Rating Overlay on Main Image */}
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-border">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-foreground">
                    {room.rating ? room.rating.toFixed(1) : 'No reviews'}
                  </span>
                </div>
              </div>
              
              {/* Thumbnails */}
              {room.images && room.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {room.images.map((img, index) => (
                    <button 
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`min-w-[100px] h-[75px] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === img ? 'border-spa-teal ring-4 ring-spa-teal/5' : 'border-transparent hover:border-spa-teal/50'}`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Tabs */}
            <div className="space-y-6">
              <div className="bg-muted p-1 rounded-xl inline-flex w-full overflow-hidden border border-border">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'amenities', label: 'Amenities' },
                  { id: 'policies', label: 'Policies' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-background text-spa-teal shadow-sm' 
                        : 'text-muted-foreground hover:text-spa-teal'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">Room Description</h2>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {room.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-spa-teal/20 transition-colors">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Room Size</span>
                        <div className="flex items-end gap-1">
                          <span className="text-2xl font-bold text-foreground">{room.sizeSqm || 300}</span>
                          <span className="text-sm font-medium text-muted-foreground mb-1">sqft</span>
                        </div>
                      </div>
                      <div className="p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-spa-teal/20 transition-colors">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Occupancy</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-foreground">{room.maxAdults} adults, {room.maxChildren} children</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {room.amenities.map((amenity: any, index) => {
                      const iconName = getAmenityIconName(amenity.name || '', amenity.icon);
                      return (
                        <div key={amenity._id || index} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-spa-teal/20 transition shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-spa-teal/10 flex items-center justify-center text-spa-teal">
                            <DynamicIcon name={iconName} size={20} />
                          </div>
                          <span className="text-sm font-bold text-foreground">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="space-y-4">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-spa-teal/10 flex items-center justify-center text-spa-teal flex-shrink-0">
                          <Clock size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">Check-in & Check-out</h4>
                          <p className="text-sm text-muted-foreground mt-1">Check-in from 2:00 PM. Check-out by 12:00 PM.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 border-t border-border/50 pt-4">
                        <div className="w-10 h-10 rounded-full bg-spa-teal/10 flex items-center justify-center text-spa-teal flex-shrink-0">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">Cancellation Policy</h4>
                          <p className="text-sm text-muted-foreground mt-1">Free cancellation up to 48 hours before check-in.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-border pt-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Guest Reviews</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={14} 
                          className={s <= (room.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-300 dark:text-muted"} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">Based on {reviews.length} reviews</span>
                  </div>
                </div>
                
                {isAuthenticated && !showReviewForm && (
                  <Button 
                    onClick={() => setShowReviewForm(true)}
                    className="bg-spa-teal hover:bg-spa-teal-dark text-white rounded-xl font-bold"
                  >
                    Write a Review
                  </Button>
                )}
              </div>

              {/* Add Review Form */}
              {showReviewForm && (
                <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-md animate-in slide-in-from-top-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-foreground">Write your review</h3>
                    <button onClick={() => setShowReviewForm(false)} className="text-muted-foreground hover:text-foreground">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setReviewRating(r)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star 
                              size={28} 
                              className={r <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-muted/50"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-2">Your Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience staying in this room..."
                        className="w-full h-32 p-4 rounded-xl border border-border focus:border-spa-teal focus:ring-1 focus:ring-spa-teal/20 outline-none transition-all bg-background"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                      <Button 
                        disabled={submittingReview}
                        type="submit" 
                        className="bg-spa-teal hover:bg-spa-teal-dark text-white rounded-xl font-bold min-w-[120px]"
                      >
                        {submittingReview ? <Loader2 size={20} className="animate-spin" /> : "Post Review"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                    <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground font-medium">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="bg-card border border-border rounded-2xl p-6 shadow-sm group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-spa-teal/10 flex items-center justify-center text-spa-teal font-bold overflow-hidden">
                            {rev.userId?.profileImage ? (
                                <img src={`${API_BASE}${rev.userId.profileImage}`} className="w-full h-full object-cover" alt="" />
                            ) : (
                                rev.userId?.fullName?.charAt(0) || 'G'
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm leading-none">
                              {rev.userId?.fullName || 'Guest'}
                            </h4>
                            <span className="text-[11px] text-muted-foreground font-bold uppercase mt-1 block">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                size={12} 
                                className={s <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-muted/50"} 
                              />
                            ))}
                          </div>
                          {user?._id === rev.userId?._id && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                              <button onClick={() => handleDeleteReview(rev._id)} className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl shadow-spa-teal/5 lg:sticky lg:top-24 items-center">
              <div className="mb-8">
                <div className="flex flex-col gap-1">
                  {room.discount && room.discount > 0 ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-foreground">${Math.round(room.basePrice * (1 - room.discount / 100))}</span>
                        <span className="text-muted-foreground font-bold line-through">${room.basePrice}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-spa-teal text-xs font-black uppercase tracking-widest">{room.discount}% Limited Offer</span>
                        <div className="px-3 py-1.5 bg-spa-teal/10 border border-spa-teal/20 rounded-xl inline-flex flex-col mt-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-spa-teal/80">
                            <span>Excl. 15% Taxes</span>
                            <span className="text-[9px] font-black bg-spa-teal/10 px-1.5 rounded-md">ESTIMATED</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs font-black text-spa-teal">Total with Taxes</span>
                            <span className="text-sm font-black text-spa-teal">${Math.round(Math.round(room.basePrice * (1 - room.discount / 100)) * 1.15)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-foreground">${room.basePrice}</span>
                        <span className="text-muted-foreground font-bold">/ night</span>
                      </div>
                      <div className="px-3 py-1.5 bg-muted/50 border border-border rounded-xl flex flex-col">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                          <span>Excl. 15% Taxes</span>
                          <span className="text-[9px] font-black bg-foreground/10 text-muted-foreground px-1.5 rounded-md uppercase">Estimated</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-black text-foreground">Total with Taxes</span>
                          <span className="text-sm font-black text-foreground">${Math.round(room.basePrice * 1.15)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                   <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Room Type</label>
                   <div className="px-5 py-3.5 bg-muted/20 rounded-2xl border border-border flex items-center justify-between">
                     <span className="font-bold text-foreground">{room.typeName}</span>
                     <span className="bg-spa-teal/10 text-spa-teal px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Official</span>
                   </div>
                </div>

                <div>
                   <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Max Occupancy</label>
                   <div className="px-5 py-3.5 bg-muted/20 rounded-2xl border border-border flex items-center justify-between">
                     <span className="font-bold text-foreground">{room.maxGuests} Guests</span>
                     <Users size={18} className="text-spa-teal" />
                   </div>
                </div>

                {room.availability && (
                  <div className="bg-muted/50 rounded-2xl p-5 border border-border">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 text-center">Current Availability</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <span className="text-lg font-black text-green-600 dark:text-green-500 block">{room.availability.available}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Available</span>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-blue-600 dark:text-blue-500 block">{room.availability.reserved}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Reserved</span>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-red-600 dark:text-red-500 block">{room.availability.occupied}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Booked</span>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-orange-600 dark:text-orange-500 block">{room.availability.maintenance}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Maint.</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-spa-teal/5 rounded-2xl p-5 border border-spa-teal/20">
                  <h4 className="text-xs font-black text-spa-teal uppercase tracking-widest mb-3">Includes</h4>
                  <ul className="space-y-2">
                    {room.amenities.slice(0, 3).map((a: any, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground/80 font-bold">
                        <Check size={14} className="text-spa-teal" /> {a.name}
                      </li>
                    ))}
                    {room.amenities.length > 3 && (
                      <li className="text-xs text-spa-teal/80 font-bold pl-5">+ {room.amenities.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <Button 
                  size="lg" 
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate(`/book?roomType=${room._id}`); 
                    }
                  }}
                  className="w-full bg-spa-teal hover:bg-spa-teal-dark text-white rounded-2xl h-16 text-lg font-black shadow-lg shadow-spa-teal/20 transition-all hover:-translate-y-1"
                >
                  Reserve Now
                </Button>
                
                <p className="text-[11px] text-center text-muted-foreground font-medium px-4">
                  You won't be charged until you complete your reservation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
