import { Monitor } from "lucide-react"

export default function AppLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="!min-w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
      <Monitor className="w-6 h-6 text-primary-foreground" />
    </div>
  )
}
