import { Redirect } from "expo-router";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/components/AuthProvider";

export default function IndexRoute() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return <LoadingState message="Opening Charter..." />;
  }

  return <Redirect href={session ? "/dashboard" : "/login"} />;
}
