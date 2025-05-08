import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useId, useMemo, useState } from "react";

export function TimeZoneSelect({
  selectedTimeZone,
  onTimeZoneChange,
}: {
  selectedTimeZone: string;
  onTimeZoneChange: (timeZone: string) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const timezones = Intl.supportedValuesOf("timeZone");

  const formattedTimezones = useMemo(() => {
    return timezones
      .map((timezone) => {
        const formatter = new Intl.DateTimeFormat("en", {
          timeZone: timezone,
          timeZoneName: "shortOffset",
        });
        const parts = formatter.formatToParts(new Date());
        const offset =
          parts.find((part) => part.type === "timeZoneName")?.value ?? "";
        const modifiedOffset =
          offset === "GMT" ? "UTC+0" : offset.replace("GMT", "UTC");

        return {
          value: timezone,
          label: `(${modifiedOffset}) ${timezone.replace(/_/g, " ")}`,
          numericOffset: parseInt(
            offset.replace("GMT", "").replace("+", "") || "0",
          ),
        };
      })
      .sort((a, b) => a.numericOffset - b.numericOffset);
  }, [timezones]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" size="sm">
          {selectedTimeZone
            ? formattedTimezones.find(
                (timezone) => timezone.value === selectedTimeZone,
              )?.value
            : "Select timezone"}

          <ChevronDownIcon className="ml-1 size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className="w-80">
          <CommandInput placeholder="Search timezones..." />
          <CommandList className="overflow-auto">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {formattedTimezones.map(({ value: itemValue, label }) => (
                <CommandItem
                  key={itemValue}
                  value={label}
                  onSelect={() => {
                    onTimeZoneChange(
                      itemValue === selectedTimeZone ? "" : itemValue,
                    );
                    setOpen(false);
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{label}</span>
                    {selectedTimeZone === itemValue && (
                      <CheckIcon className="text-primary size-4" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
