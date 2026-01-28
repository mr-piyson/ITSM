import { redirect } from "next/navigation"

import AppLogo from "@/assets/icons/Logo"

import SignInTab from "./SignIn"
import SignUpTab from "./SignUp"
import { TabSwitcher } from "./TabSwitcher"
import { getUser } from "./auth.actions"

export default async function Auth(props: any) {
  const session = await getUser()
  if (session) redirect("/app")

  return (
    <div className=" relative  h-screen items-center justify-center lg:grid  lg:grid-cols-2 ">
      <div className=" max-md:hidden flex justify-between relative h-full flex-col bg-muted-foreground p-10 text-card-foreground lg:flex dark:border-r sm:hidden">
        <div className=" absolute inset-0 bg-muted " />
        <div className=" relative z-20 flex items-center text-3xl font-medium gap-2">
          <AppLogo className="w-12 h-12" />
          <span>ITSM</span>
        </div>
        {/* <ImageSlider /> */}
        <div className="relative z-20"></div>
      </div>
      <div className="w-full h-full flex flex-col justify-center items-center ">
        <TabSwitcher TabOne={<SignInTab />} TabTow={<SignUpTab />} />
      </div>
    </div>
  )
}
