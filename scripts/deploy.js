/**
 * Deployment helper script for QUIZUP
 * 
 * This script prepares your application for deployment by:
 * 1. Optimizing images
 * 2. Running production build checks
 * 
 * Usage: node scripts/deploy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Print with colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function print(message, type = 'info') {
  const prefix = {
    'info': `${colors.blue}ℹ️ INFO${colors.reset}:`,
    'success': `${colors.green}✅ SUCCESS${colors.reset}:`,
    'warning': `${colors.yellow}⚠️ WARNING${colors.reset}:`,
    'error': `${colors.red}❌ ERROR${colors.reset}:`,
  };
  
  console.log(`${prefix[type]} ${message}`);
}

function runCommand(command, errorMessage) {
  try {
    print(`Running: ${colors.bright}${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    print(errorMessage || `Failed to run command: ${command}`, 'error');
    return false;
  }
}

async function deploy() {
  print(`Starting deployment preparation for QUIZUP...`, 'info');
  
  // Step 1: Make sure all changes are committed
  print(`Checking git status...`, 'info');
  const gitStatus = execSync('git status --porcelain').toString().trim();
  
  if (gitStatus) {
    print(`You have uncommitted changes. Please commit them before deploying.`, 'warning');
    print(`Run 'git add .' and 'git commit -m "your message"' to commit changes.`, 'info');
    return;
  }
  
  // Step 2: Run image optimization
  print(`Optimizing images for production...`, 'info');
  if (!runCommand('npm run optimize-images', 'Image optimization failed. Check if sharp is installed.')) {
    return;
  }
  
  // Step 3: Basic build verification
  print(`Checking for build issues...`, 'info');
  if (!runCommand('npm run lint', 'Linting failed. Please fix the issues before deploying.')) {
    return;
  }
  
  // Step 4: Verify Vercel configuration
  if (fs.existsSync('./vercel.json')) {
    print(`Vercel configuration found.`, 'success');
  } else {
    print(`No vercel.json found. This might not be an issue, but a properly configured vercel.json can help with deployment settings.`, 'warning');
  }
  
  // Step 5: Check for environment variables template
  print(`Make sure you have the following environment variables configured in Vercel:`, 'info');
  console.log(`
DATABASE_URL = Your Supabase PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = Your Clerk publishable key
CLERK_SECRET_KEY = Your Clerk secret key
NEXT_PUBLIC_APP_URL = Your Vercel deployment URL (after first deployment)
  `);
  
  // Deployment guide
  print(`Your project is ready for deployment!`, 'success');
  print(`
Deployment Steps:

1. Login to Vercel and GitHub
2. Import your repository: ${colors.yellow}https://github.com/shubhxmsingh/Shubham_Singh_CSE2_QUIZUP${colors.reset}
3. Configure the environment variables as listed above
4. Deploy!
`, 'info');
}

deploy().catch(error => {
  print(`Deployment preparation failed: ${error.message}`, 'error');
  process.exit(1);
}); 