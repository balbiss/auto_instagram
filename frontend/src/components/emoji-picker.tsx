import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJIS = [
  "😀", "😂", "😍", "🥰", "😘", "😉", "😎", "🤩", "🥳", "😅",
  "🙌", "👏", "🙏", "💪", "👍", "👎", "✌️", "🤝", "👋", "💯",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🔥", "✨", "🎉",
  "😢", "😭", "😱", "😡", "🤔", "😴", "🤗", "😇", "🥺", "😬",
  "📸", "🎥", "🛍️", "💰", "🛒", "📦", "🚀", "⭐", "✅", "❌",
];

export function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" type="button" aria-label="Emoji">
          <Smile />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="flex size-7 items-center justify-center rounded-md text-lg hover:bg-accent"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
