import { NavigationToolbar } from "../nav-menu"

type RequestslayoutProps = {
  children?: React.ReactNode
}

export default function RequestsLayout(props: RequestslayoutProps) {
  return (
    <div>
      <NavigationToolbar />
      {props.children}
    </div>
  )
}
