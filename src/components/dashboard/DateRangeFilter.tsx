import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DateRange } from '@/hooks/useFundingData';
import { LanguageCode } from '@/lib/constants';
import { translations } from '@/lib/localization';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedLanguage?: LanguageCode;
}

export const DateRangeFilter = ({ dateRange, onDateRangeChange, selectedLanguage = 'en' }: DateRangeFilterProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const t = translations[selectedLanguage];

  const presets = [
    { label: t.last7Days, getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: t.last30Days, getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: t.last3Months, getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
    { label: t.last6Months, getValue: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
    { label: t.thisYear, getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
    { label: t.lastYear, getValue: () => ({ from: startOfYear(subMonths(new Date(), 12)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: t.allTime, getValue: () => ({ from: new Date('2020-01-01'), to: new Date() }) },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    onDateRangeChange(preset.getValue());
  };

  const formatDateRange = () => {
    return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {t.quickSelect}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 min-w-[240px] justify-start">
            <Calendar className="w-4 h-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarComponent
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateRangeChange({ from: range.from, to: range.to });
                setIsCalendarOpen(false);
              } else if (range?.from) {
                onDateRangeChange({ from: range.from, to: range.from });
              }
            }}
            numberOfMonths={2}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
