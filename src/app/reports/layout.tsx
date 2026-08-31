import { Suspense } from "react"


type ReportLayoutProps = {
  children?: React.ReactNode
}

export default function ReportLayout(props: ReportLayoutProps) {
  return (
    <main className="h-screen">
      <Suspense>{props.children}</Suspense>
    </main>
  )
}
