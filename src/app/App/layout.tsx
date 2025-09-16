import React from "react";
import { getUser } from "../Auth/auth.actions";
import { redirect } from "next/navigation";
import App from "./App";
import { SplashScreen } from "@/components/Splash-Screen";

export default async function Activity_Layout(props: any) {
  const user = await getUser();
  if (!user) redirect("/Auth");
  return (
    <SplashScreen>
      <App account={user}>{props.children}</App>
    </SplashScreen>
  );
}
