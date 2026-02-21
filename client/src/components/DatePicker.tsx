import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  label: string;
  value?: Date;
  onChange: (date?: Date) => void;
  minDate?: Date;
};

export function DatePicker({
  label,
  value,
  onChange,
  minDate,
}: DatePickerProps) {
  return (
    <div className="w-full">
      <p className="text-sm font-semibold text-foreground">{label}</p>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "mt-2 w-full justify-start gap-3 rounded-xl border-border bg-background px-3 py-6 text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarDays size={16} className="text-muted-foreground" />
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) => (minDate ? date < minDate : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
