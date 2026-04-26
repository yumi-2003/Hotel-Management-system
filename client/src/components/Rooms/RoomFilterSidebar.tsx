import { useState } from 'react';
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

  const [showAllTypes, setShowAllTypes] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

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

  const displayedTypes = showAllTypes ? availableTypes : availableTypes.slice(0, 5);
  const displayedAmenities = showAllAmenities ? availableAmenities : availableAmenities.slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-8 sticky top-24 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold bg-gradient-to-r from-spa-teal to-spa-teal-dark bg-clip-text text-transparent">Filters</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="text-muted-foreground hover:text-spa-teal h-auto p-2 hover:bg-spa-teal/10 rounded-xl transition-all font-bold"
        >
          Reset All
        </Button>
      </div>

      <Separator className="opacity-50" />

      {/* Price Range */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Price per Night</Label>
        </div>
        <div className="px-2">
          <Slider
            defaultValue={[minPrice, maxPrice]}
            value={[priceRange[0], priceRange[1]]}
            min={minPrice}
            max={maxPrice}
            step={10}
            onValueChange={(val) => setPriceRange([val[0], val[1]])}
            className="my-4"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="px-3 py-2 bg-muted/50 rounded-xl border border-border">
            <span className="text-xs font-bold text-muted-foreground block">Min</span>
            <span className="text-sm font-black text-foreground">${priceRange[0]}</span>
          </div>
          <div className="px-3 py-2 bg-muted/50 rounded-xl border border-border text-right">
            <span className="text-xs font-bold text-muted-foreground block">Max</span>
            <span className="text-sm font-black text-foreground">${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Room Type */}
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Room Type</Label>
        <div className="space-y-2.5">
          {displayedTypes.map((type) => (
            <div key={type} className="flex items-center space-x-3 p-1 rounded-lg hover:bg-muted/30 transition-colors group">
              <Checkbox 
                id={`type-${type}`} 
                checked={selectedTypes.includes(type)}
                onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                className="border-2 data-[state=checked]:bg-spa-teal data-[state=checked]:border-spa-teal h-5 w-5 rounded-md"
              />
              <Label 
                htmlFor={`type-${type}`} 
                className="text-sm font-bold cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors py-1 flex-1"
              >
                {type}
              </Label>
            </div>
          ))}
          {availableTypes.length > 5 && (
            <button 
              onClick={() => setShowAllTypes(!showAllTypes)}
              className="text-xs font-black text-spa-teal hover:text-spa-teal-dark uppercase tracking-tighter mt-1 pl-1"
            >
              {showAllTypes ? 'Show Less' : `+ ${availableTypes.length - 5} More Types`}
            </button>
          )}
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Amenities */}
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Amenities</Label>
        <div className="grid grid-cols-1 gap-2.5">
          {displayedAmenities.map((amenity) => (
            <div key={amenity._id} className="flex items-center space-x-3 p-1 rounded-lg hover:bg-muted/30 transition-colors group">
              <Checkbox 
                id={`amenity-${amenity._id}`} 
                checked={selectedAmenities.includes(amenity._id)}
                onCheckedChange={(checked) => handleAmenityChange(amenity._id, checked as boolean)}
                className="border-2 data-[state=checked]:bg-spa-teal data-[state=checked]:border-spa-teal h-5 w-5 rounded-md"
              />
              <Label 
                htmlFor={`amenity-${amenity._id}`} 
                className="text-sm font-bold cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors py-1 flex-1"
              >
                {amenity.name}
              </Label>
            </div>
          ))}
          {availableAmenities.length > 6 && (
            <button 
              onClick={() => setShowAllAmenities(!showAllAmenities)}
              className="text-xs font-black text-spa-teal hover:text-spa-teal-dark uppercase tracking-tighter mt-1 pl-1"
            >
              {showAllAmenities ? 'Show Less' : `+ ${availableAmenities.length - 6} More Amenities`}
            </button>
          )}
        </div>
      </div>

      <Separator />

      {/* Capacity */}
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Capacity</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="max-adults" className="text-[10px] font-black uppercase text-muted-foreground/70 ml-1">Adults</Label>
            <div className="relative">
              <input
                id="max-adults"
                type="number"
                min={1}
                value={capacity.adults}
                onChange={(e) => setCapacity({ ...capacity, adults: parseInt(e.target.value) || 1 })}
                className="flex h-11 w-full rounded-xl border border-border bg-muted/20 px-3 py-1 text-sm font-bold shadow-sm transition-all focus:border-spa-teal focus:ring-1 focus:ring-spa-teal/20 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-children" className="text-[10px] font-black uppercase text-muted-foreground/70 ml-1">Children</Label>
            <div className="relative">
              <input
                id="max-children"
                type="number"
                min={0}
                value={capacity.children}
                onChange={(e) => setCapacity({ ...capacity, children: parseInt(e.target.value) || 0 })}
                className="flex h-11 w-full rounded-xl border border-border bg-muted/20 px-3 py-1 text-sm font-bold shadow-sm transition-all focus:border-spa-teal focus:ring-1 focus:ring-spa-teal/20 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomFilterSidebar;
