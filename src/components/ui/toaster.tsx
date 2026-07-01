import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map(({ id, title, description, variant, open }) =>
        open ? (
          <div
            key={id}
            className={`border-2 p-4 font-bold transition-all ${
              variant === "destructive"
                ? "border-red-500 bg-[#0a0a0a] text-red-400"
                : "border-white bg-[#0a0a0a] text-white"
            }`}
          >
            {title && <div className="uppercase tracking-wider text-sm">{title}</div>}
            {description && (
              <div className="text-white/60 text-sm font-normal mt-1">{description}</div>
            )}
          </div>
        ) : null
      )}
    </div>
  )
}
