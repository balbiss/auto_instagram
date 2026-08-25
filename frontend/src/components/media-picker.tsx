import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type MediaOption = {
  id: string | number;
  media_type: string;
  thumbnail_url: string;
  caption: string | null;
  permalink?: string;
};

export function MediaPicker({
  options,
  value,
  onChange,
  emptyLabel,
}: {
  options: MediaOption[];
  value: string;
  onChange: (v: string) => void;
  emptyLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => String(o.id) === value);

  function select(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm"
        >
          {selected ? (
            <>
              <img src={selected.thumbnail_url} alt="" className="size-5 shrink-0 rounded object-cover" />
              <span className="min-w-0 flex-1 truncate text-left">{selected.caption ?? String(selected.id)}</span>
            </>
          ) : (
            <span className="flex-1 text-left text-muted-foreground">{emptyLabel}</span>
          )}
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-80 overflow-y-auto p-1.5" align="start">
        <button
          type="button"
          onClick={() => select("")}
          className={`w-full rounded-md px-2 py-2 text-left text-sm hover:bg-accent ${!value ? "bg-brand-tint text-brand" : ""}`}
        >
          {emptyLabel}
        </button>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => select(String(o.id))}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent ${
              value === String(o.id) ? "bg-brand-tint text-brand" : ""
            }`}
          >
            <img src={o.thumbnail_url} alt="" className="size-9 shrink-0 rounded-md object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {o.media_type === "VIDEO" ? "Reel" : "Post"}
              </span>
              <span className="block truncate">{o.caption ?? String(o.id)}</span>
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
