import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: "h-8 w-8", text: "text-base", subtext: "text-[10px]" },
    md: { icon: "h-9 w-9", text: "text-lg", subtext: "text-xs" },
    lg: { icon: "h-12 w-12", text: "text-xl", subtext: "text-sm" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25", s.icon)}>
        {/* Book Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[60%] w-[60%]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Open book */}
          <path
            d="M12 6.5C10.5 5.5 8.5 5 6 5C4.5 5 3.2 5.3 2 5.8V18.8C3.2 18.3 4.5 18 6 18C8.5 18 10.5 18.5 12 19.5C13.5 18.5 15.5 18 18 18C19.5 18 20.8 18.3 22 18.8V5.8C20.8 5.3 19.5 5 18 5C15.5 5 13.5 5.5 12 6.5Z"
            fill="white"
            fillOpacity="0.9"
          />
          {/* Center line */}
          <path
            d="M12 6.5V19.5"
            stroke="white"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Bookmark */}
          <path
            d="M16 3V8L17.5 6.5L19 8V3H16Z"
            fill="#f472b6"
          />
        </svg>
      </div>
      {showText && (
        <div className="hidden sm:block">
          <h1 className={cn("font-bold tracking-tight leading-tight text-foreground", s.text)}>
            BookStore
          </h1>
          <p className={cn("text-muted-foreground leading-tight font-medium", s.subtext)}>
            Manager
          </p>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 h-9 w-9", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-[60%] w-[60%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 6.5C10.5 5.5 8.5 5 6 5C4.5 5 3.2 5.3 2 5.8V18.8C3.2 18.3 4.5 18 6 18C8.5 18 10.5 18.5 12 19.5C13.5 18.5 15.5 18 18 18C19.5 18 20.8 18.3 22 18.8V5.8C20.8 5.3 19.5 5 18 5C15.5 5 13.5 5.5 12 6.5Z"
          fill="white"
          fillOpacity="0.9"
        />
        <path
          d="M12 6.5V19.5"
          stroke="white"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 3V8L17.5 6.5L19 8V3H16Z"
          fill="#f472b6"
        />
      </svg>
    </div>
  );
}

