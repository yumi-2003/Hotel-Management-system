import { useLocation } from 'react-router-dom';
import BookingBar from '../components/BookingBar';

const BookingPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roomType = searchParams.get('roomType') || '';

  return (
    <div className="bg-[#fcfdfd] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h1 className="text-[44px] font-bold text-[#0F2F2F] tracking-tight">Complete Your Booking</h1>
            <p className="text-[#0F2F2F]/50 text-base max-w-xl mx-auto leading-relaxed">
              You're just a few steps away from your perfect stay. Please review your selection and confirm your dates.
            </p>
          </div>

          <div className="relative z-10 -mt-4">
            <BookingBar initialRoomType={roomType} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#E6F4F3] flex items-center justify-center text-[#269490]">
                <span className="font-bold text-sm">01</span>
              </div>
              <h3 className="font-bold text-[#0F2F2F] text-sm">Select Dates</h3>
              <p className="text-[12px] text-[#0F2F2F]/50 leading-tight">Choose your check-in and check-out dates.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#E6F4F3] flex items-center justify-center text-[#269490]">
                <span className="font-bold text-sm">02</span>
              </div>
              <h3 className="font-bold text-[#0F2F2F] text-sm">Choose Room</h3>
              <p className="text-[12px] text-[#0F2F2F]/50 leading-tight">Confirm the room type that suits your needs.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#E6F4F3] flex items-center justify-center text-[#269490]">
                <span className="font-bold text-sm">03</span>
              </div>
              <h3 className="font-bold text-[#0F2F2F] text-sm">Book Now</h3>
              <p className="text-[12px] text-[#0F2F2F]/50 leading-tight">Complete your reservation instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
