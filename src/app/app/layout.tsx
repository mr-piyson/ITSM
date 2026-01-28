import { redirect } from "next/navigation"

import { SplashScreen } from "@/components/Splash-Screen"

import { getUser } from "../auth/auth.actions"
import App from "./App"

export default async function Activity_Layout(props: any) {
  const user = await getUser()
  if (!user) redirect("/auth")
  return (
    <SplashScreen>
      <App>{props.children}</App>
    </SplashScreen>
  )
}
