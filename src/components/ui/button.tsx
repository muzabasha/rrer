import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function Button({ className, variant: _variant, size: _size, ...props }: ButtonProps) {
  return <button className={cn("inline-flex items-center justify-center rounded-md", className)} {...props} />
}
