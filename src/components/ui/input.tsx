import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return <input className={cn("flex h-10 w-full rounded-md border px-3 py-2", className)} {...props} />
}
