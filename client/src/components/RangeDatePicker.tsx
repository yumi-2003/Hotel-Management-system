import * as React from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  minDate?: Date;
  placeholder?: string;
  className?: string;
  labelMode?: "from" | "to" | "range";
};

export default function RangeDatePicker({
  value,
  onChange,
  minDate,
  placeholder = "Pick dates",
  className,
  labelMode = "range",
}: Props) {
  const [open, setOpen] = React.useState(false);

  // mobile first
  const [monthsToShow, setMonthsToShow] = React.useState(1);

  React.useEffect(() => {
    const update = () => setMonthsToShow(window.innerWidth >= 640 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getLabel = () => {
    if (!value?.from) return placeholder;
    
    if (labelMode === "from") {
      return format(value.from, "MMM dd, yyyy");
    }
    
    if (labelMode === "to" && value.to) {
      return format(value.to, "MMM dd, yyyy");
    }
    
    if (value.to) {
      return `${format(value.from, "MMM dd, yyyy")} - ${format(value.to, "MMM dd, yyyy")}`;
    }
    
    return format(value.from, "MMM dd, yyyy");
  };

  const label = getLabel();

  // auto close when both selected
  React.useEffect(() => {
    if (value?.from && value?.to) setOpen(false);
  }, [value?.from, value?.to]);

  // disable past + check-out must be after check-in
  const disabledDays = (date: Date) => {
    if (minDate && date < minDate) return true;

    if (value?.from && !value?.to) {
      if (date <= value.from) return true;
    }

    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start gap-3 rounded-xl px-3 py-6 text-left font-normal shadow-sm",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="h-4 w-4" />
          <span className="text-sm">{label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-2 overflow-hidden rounded-3xl shadow-2xl border-none bg-white z-[100]"
      >
        <Calendar
          mode="range"
          numberOfMonths={monthsToShow}
          selected={value}
          onSelect={onChange}
          disabled={disabledDays}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
