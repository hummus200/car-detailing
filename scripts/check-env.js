#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Run: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

const requiredVars = {
  // Public (client-side) - MUST have NEXT_PUBLIC_ prefix
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'Supabase Project URL',
    public: true,
    required: true,
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase Anonymous Key (public, protected by RLS)',
    public: true,
    required: true,
  },
  // Secret (server-side only) - MUST NOT have NEXT_PUBLIC_ prefix
  'SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Supabase Service Role Key (SECRET - server-side only)',
    public: false,
    required: true,
  },
  'RESEND_API_KEY': {
    description: 'Resend API Key (SECRET - server-side only)',
    public: false,
    required: true,
  },
  'ADMIN_EMAIL': {
    description: 'Admin email for notifications',
    public: false,
    required: true,
  },
  // Optional
  'NEXT_PUBLIC_APP_URL': {
    description: 'App URL for email links (optional)',
    public: true,
    required: false,
  },
};

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  console.log('\n🔍 Checking environment variables...\n');
  
  // Check if .env.local exists
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.log('\n📝 Create a .env.local file in the root directory with:');
    if (fs.existsSync(envExamplePath)) {
      console.log('   (See .env.example for reference)');
    }
    console.log('\nRequired variables:');
    Object.entries(requiredVars).forEach(([key, info]) => {
      console.log(`   ${key} - ${info.description}${info.required ? ' (REQUIRED)' : ' (optional)'}`);
    });
    return false;
  }
  
  // Load .env.local
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  console.log('📋 Found environment variables:\n');
  
  let allValid = true;
  const foundKeys = Object.keys(envVars);
  const requiredKeys = Object.keys(requiredVars);
  
  // Check each required variable
  requiredKeys.forEach(key => {
    const info = requiredVars[key];
    const value = envVars[key];
    const isSet = value && value.length > 0 && !value.includes('your-') && !value.includes('example');
    
    if (info.required) {
      if (isSet) {
        console.log(`   ✅ ${key}`);
        if (info.public) {
          console.log(`      ${info.description} (PUBLIC - safe to expose)`);
        } else {
          const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
          console.log(`      ${info.description} (SECRET)`);
          console.log(`      Value: ${masked}`);
        }
      } else {
        console.log(`   ❌ ${key} - MISSING or not set properly`);
        console.log(`      ${info.description}`);
        allValid = false;
      }
    } else {
      if (isSet) {
        console.log(`   ⚠️  ${key} - Set (optional)`);
      } else {
        console.log(`   ⚪ ${key} - Not set (optional)`);
      }
    }
  });
  
  // Check for incorrectly named variables
  console.log('\n🔍 Checking for incorrectly named variables...\n');
  foundKeys.forEach(key => {
    if (!requiredKeys.includes(key)) {
      // Check if it's a common mistake
      if (key.includes('SUPABASE') || key.includes('RESEND') || key.includes('ADMIN')) {
        console.log(`   ⚠️  Found: ${key}`);
        if (key.startsWith('NEXT_PUBLIC_') && !key.includes('SUPABASE_URL') && !key.includes('SUPABASE_ANON')) {
          console.log(`      ⚠️  WARNING: This looks like it should be SECRET (remove NEXT_PUBLIC_ prefix)`);
        } else if (!key.startsWith('NEXT_PUBLIC_') && (key.includes('SUPABASE_URL') || key.includes('SUPABASE_ANON'))) {
          console.log(`      ⚠️  WARNING: This should have NEXT_PUBLIC_ prefix for client-side access`);
        }
      }
    }
  });
  
  // Check for security issues
  console.log('\n🔒 Security check...\n');
  const secretKeys = foundKeys.filter(k => !k.startsWith('NEXT_PUBLIC_'));
  const publicKeys = foundKeys.filter(k => k.startsWith('NEXT_PUBLIC_'));
  
  console.log(`   ✅ ${secretKeys.length} secret variables (server-side only)`);
  console.log(`   ✅ ${publicKeys.length} public variables (client-side accessible)`);
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /SUPABASE_SERVICE_ROLE_KEY.*NEXT_PUBLIC/, name: 'Service role key with NEXT_PUBLIC_' },
    { pattern: /RESEND_API_KEY.*NEXT_PUBLIC/, name: 'Resend API key with NEXT_PUBLIC_' },
  ];
  
  let securityIssues = false;
  envContent.split('\n').forEach(line => {
    dangerousPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(line)) {
        console.log(`   ❌ SECURITY ISSUE: ${name}`);
        securityIssues = true;
      }
    });
  });
  
  if (!securityIssues) {
    console.log('   ✅ No security issues detected');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (allValid) {
    console.log('✅ All required environment variables are set correctly!');
    return true;
  } else {
    console.log('❌ Some required environment variables are missing or incorrect.');
    console.log('\n📖 See ENV_SETUP.md for detailed setup instructions.');
    return false;
  }
}

// Run check
const isValid = checkEnvFile();
process.exit(isValid ? 0 : 1);
