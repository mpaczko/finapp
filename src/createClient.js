import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ivskrlpsuzozlmstgohw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2c2tybHBzdXpvemxtc3Rnb2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDgwNDEsImV4cCI6MjA3MTc4NDA0MX0.K7kVw7MTJiIXTkqD2e-JKXdRtuXacWaximBl1tpfpvQ"
);
