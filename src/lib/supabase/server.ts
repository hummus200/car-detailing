import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnvVar(name: string, isPublic = false): string {
  // Check for the exact name first
  let value = process.env[name];
  
  // If not found and it's a public variable, check without NEXT_PUBLIC_ prefix
  if (!value && isPublic && name.startsWith("NEXT_PUBLIC_")) {
    const altName = name.replace("NEXT_PUBLIC_", "");
    value = process.env[altName];
  }
  
  // If still not found, check with different casing
  if (!value) {
    const upperName = name.toUpperCase();
    value = process.env[upperName] || process.env[name.toLowerCase()];
  }
  
  if (!value) {
    const prefix = isPublic ? "NEXT_PUBLIC_" : "";
    const envKeys = Object.keys(process.env).filter(k => 
      k.includes("SUPABASE") || k.includes("RESEND") || k.includes("ADMIN")
    ).join(", ") || "none";
    
    console.error(
      `❌ Missing required environment variable: ${name}\n` +
      `   Expected: ${prefix}${name}\n` +
      `   Found env keys: ${envKeys}\n` +
      `   Please add ${prefix}${name} to your .env.local file.\n` +
      `   See ENV_SETUP.md for setup instructions.`
    );
    
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please add ${prefix}${name} to your .env.local file. ` +
      `See ENV_SETUP.md for setup instructions.`
    );
  }
  return value;
}

export function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL", true);
  const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", true);

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// Service role client for admin operations (bypasses RLS)
// ⚠️ SECURITY: This uses the service role key which bypasses RLS
// This should ONLY be used in server-side code, NEVER exposed to client
export function createServiceClient() {
  const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL", true);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    // Fallback to anon key if service role key is not set (for development)
    // This is less secure but allows development without service role key
    console.warn(
      "⚠️ SUPABASE_SERVICE_ROLE_KEY not set. Using anon key (limited permissions). " +
      "For production, set SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", true);
    const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Use service role key (server-side only, never exposed to client)
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
