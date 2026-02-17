import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black/95 group-[.toaster]:text-foreground group-[.toaster]:border-slate-700 group-[.toaster]:shadow-lg backdrop-blur-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-rose-500 group-[.toast]:text-white hover:group-[.toast]:bg-rose-600",
          cancelButton:
            "group-[.toast]:bg-slate-700 group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
