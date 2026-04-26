import { supabase } from "../createClient";

export const getUserId = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
};
