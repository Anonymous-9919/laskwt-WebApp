import { Providers } from "@/app/providers";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { LanguageToggle } from "@/components/shell/language-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="absolute end-4 top-4 flex items-center gap-1.5">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </Providers>
  );
}
