import { createBrowserClient } from "@supabase/ssr";

function getEnvVar(name: string): string {
  // In Next.js, client-side env vars must be prefixed with NEXT_PUBLIC_
  // They are embedded at build time, so we need to check process.env directly
  let value = process.env[name];
  
  // If not found, check common variations (without NEXT_PUBLIC_ prefix)
  if (!value && name.startsWith("NEXT_PUBLIC_")) {
    const altName = name.replace("NEXT_PUBLIC_", "");
    value = process.env[altName];
  }
  
  // If still not found, check with different casing
  if (!value) {
    const upperName = name.toUpperCase();
    value = process.env[upperName] || process.env[name.toLowerCase()];
  }
  
  if (!value) {
    // Get all env keys that might be relevant for debugging
    const allEnvKeys = typeof window !== "undefined" 
      ? [] // Client-side: env vars are embedded at build time
      : Object.keys(process.env).filter(k => 
          k.includes("SUPABASE") || 
          k.includes("RESEND") || 
          k.includes("ADMIN")
        );
    
    const errorMsg = typeof window !== "undefined"
      ? `Missing ${name}. This variable must be set in .env.local and the dev server must be restarted.`
      : `Missing ${name}. Found: ${allEnvKeys.join(", ") || "none"}`;
    
    console.error(
      `❌ Missing required environment variable: ${name}\n` +
      `   ${errorMsg}\n` +
      `   Please add ${name} to your .env.local file and restart the dev server.\n` +
      `   See ENV_SETUP.md for setup instructions.`
    );
    
    // In development, provide more helpful error
    if (process.env.NODE_ENV === "development") {
      throw new Error(
        `Missing required environment variable: ${name}.\n\n` +
        `This is a client-side component, so ${name} must be:\n` +
        `1. Set in .env.local file\n` +
        `2. Prefixed with NEXT_PUBLIC_ (already done)\n` +
        `3. Dev server restarted after adding to .env.local\n\n` +
        `Current env keys with "SUPABASE": ${allEnvKeys.join(", ") || "none"}\n\n` +
        `See ENV_SETUP.md for setup instructions.`
      );
    }
    
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please add ${name} to your .env.local file and restart the dev server. ` +
      `See ENV_SETUP.md for setup instructions.`
    );
  }
  return value;
}

export function createClient() {
  // Note: These are PUBLIC variables (safe to expose to client)
  // The anon key is protected by Row Level Security (RLS) in Supabase
  // The service role key is NEVER used here (server-side only)
  const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
