import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import type { Amenity } from '../../types';

interface RoomFilterSidebarProps {
  // Price
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  minPrice: number;
  maxPrice: number;

  // Type
  availableTypes: string[];
  selectedTypes: string[];
  setSelectedTypes: (value: string[]) => void;

  // Amenities
  availableAmenities: Amenity[];
  selectedAmenities: string[];
  setSelectedAmenities: (value: string[]) => void;

  // Capacity
  capacity: { adults: number; children: number };
  setCapacity: (value: { adults: number; children: number }) => void;

  // Actions
  onReset: () => void;
}

const RoomFilterSidebar = ({
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  availableTypes,
  selectedTypes,
  setSelectedTypes,
  availableAmenities,
  selectedAmenities,
  setSelectedAmenities,
  capacity,
  setCapacity,
  onReset,
}: RoomFilterSidebarProps) => {
  
  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    }
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    } else {
      setSelectedAmenities(selectedAmenities.filter((id) => id !== amenityId));
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-8 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Filters</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground h-auto p-0"
        >
          Reset
        </Button>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Price per Night</Label>
        </div>
        <Slider
          defaultValue={[minPrice, maxPrice]}
          value={[priceRange[0], priceRange[1]]}
          min={minPrice}
          max={maxPrice}
          step={10}
          onValueChange={(val) => setPriceRange([val[0], val[1]])}
          className="my-4"
        />
        <div className="flex items-center justify-between text-sm text-primary font-medium">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <Separator />

      {/* Room Type */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Room Type</Label>
        <div className="space-y-3">
          {availableTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox 
                id={`type-${type}`} 
                checked={selectedTypes.includes(type)}
                onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
              />
              <Label 
                htmlFor={`type-${type}`} 
                className="text-sm font-normal cursor-pointer text-muted-foreground peer-data-[state=checked]:text-foreground"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Amenities */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Amenities</Label>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {availableAmenities.map((amenity) => (
            <div key={amenity._id} className="flex items-center space-x-2">
              <Checkbox 
                id={`amenity-${amenity._id}`} 
                checked={selectedAmenities.includes(amenity._id)}
                onCheckedChange={(checked) => handleAmenityChange(amenity._id, checked as boolean)}
              />
              <Label 
                htmlFor={`amenity-${amenity._id}`} 
                className="text-sm font-normal cursor-pointer text-muted-foreground peer-data-[state=checked]:text-foreground"
              >
                {amenity.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Capacity */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Capacity</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max-adults" className="text-xs text-muted-foreground">Adults</Label>
            <input
              id="max-adults"
              type="number"
              min={1}
              value={capacity.adults}
              onChange={(e) => setCapacity({ ...capacity, adults: parseInt(e.target.value) || 1 })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-children" className="text-xs text-muted-foreground">Children</Label>
            <input
              id="max-children"
              type="number"
              min={0}
              value={capacity.children}
              onChange={(e) => setCapacity({ ...capacity, children: parseInt(e.target.value) || 0 })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomFilterSidebar;
