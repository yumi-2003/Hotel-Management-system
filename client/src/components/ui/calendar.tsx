import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit p-4 bg-white rounded-2xl shadow-xl", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-8 sm:flex-row sm:gap-x-12",
          defaultClassNames.months
        ),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 select-none p-0 opacity-70 hover:opacity-100 hover:bg-spa-cream rounded-lg transition-all",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 select-none p-0 opacity-70 hover:opacity-100 hover:bg-spa-cream rounded-lg transition-all",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-8 w-full items-center justify-center font-bold text-slate-800 text-base",
          defaultClassNames.month_caption
        ),
        weekday: cn(
          "text-slate-400 flex-1 select-none text-[0.75rem] font-bold uppercase tracking-wider",
          defaultClassNames.weekday
        ),
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-spa-mint/20 [&:has([data-selected].day-range-end)]:rounded-r-full [&:has([data-selected].day-range-start)]:rounded-l-full first:[&:has([data-selected])]:rounded-l-full last:[&:has([data-selected])]:rounded-r-full",
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-semibold aria-selected:opacity-100 hover:bg-spa-teal hover:text-white rounded-full transition-all"
        ),
        range_start: "day-range-start bg-spa-teal text-white rounded-full",
        range_end: "day-range-end bg-spa-teal text-white rounded-full",
        range_middle: "aria-selected:bg-spa-mint/20 aria-selected:text-spa-teal-dark",
        selected: "bg-spa-teal text-white hover:bg-spa-teal-dark hover:text-white focus:bg-spa-teal focus:text-white",
        today: "text-spa-teal font-bold underline underline-offset-4",
        outside: "day-outside text-slate-300 aria-selected:bg-spa-mint/10 aria-selected:text-slate-300 opacity-50",
        disabled: "text-slate-200 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4 text-spa-teal-dark", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4 text-spa-teal-dark", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4 text-spa-teal-dark", className)} {...props} />
          )
        },
        // Remove the custom DayButton override to rely on the simplified classNames mapping
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }
