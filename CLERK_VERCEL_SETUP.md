# Clerk Setup for Vercel Deployment

This document outlines the process for properly configuring Clerk authentication for Vercel deployments.

## Current Implementation Status

The application already implements the correct Clerk integration patterns for Next.js App Router:

- Uses `@clerk/nextjs` package (currently version 6.18.0)
- Implements `<ClerkProvider>` in `app/layout.tsx` 
- Uses `clerkMiddleware()` from `@clerk/nextjs/server` in `middleware.ts`
- Provides UI components like `<SignInButton>`, `<SignUpButton>`, and `<UserButton>`
- Configured with appropriate environment variables

## Environment Variables Required

These environment variables need to be set for Clerk to function properly in Vercel:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key from your Clerk dashboard
- `CLERK_SECRET_KEY` - Your Clerk secret key from your Clerk dashboard
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Recommended: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Recommended: `/sign-up`

## Automatic Sync Using Doppler

The project includes an automatic sync mechanism to push Doppler secrets to Vercel:

1. Make sure you have the Doppler CLI installed and authenticated:
   ```bash
   npm install -g @doppler/cli
   doppler login
   ```

2. Set your Clerk environment variables in Doppler:
   ```bash
   doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   doppler secrets set CLERK_SECRET_KEY="your_clerk_secret_key"
   ```

3. Set the required Vercel environment variables for the sync script:
   - `VERCEL_TOKEN`: Your Vercel access token
   - `VERCEL_PROJECT_ID` or `VERCEL_PROJECT_NAME`: Your Vercel project identifier

4. Run the sync script:
   ```bash
   # For development environment
   npm run env:sync:dev
   
   # For preview environment
   npm run env:sync:preview
   
   # For production environment
   npm run env:sync:prod
   ```

## Manual Setup in Vercel Dashboard

Alternatively, you can manually add these environment variables in your Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (set as Build & Runtime)
   - `CLERK_SECRET_KEY` (set as encrypted Build & Runtime)
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (set as Build & Runtime)
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (set as Build & Runtime)

## Important Notes

- The `CLERK_SECRET_KEY` should never be exposed in client-side code or stored in plain text in version control
- The `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is safe to expose to the client and is required for frontend Clerk functionality
- When using the sync script, sensitive keys like `CLERK_SECRET_KEY` will be encrypted in Vercel automatically
- Remember to redeploy your application after adding or changing environment variables

## Testing the Connection

After setting up the environment variables:

1. Redeploy your application on Vercel
2. Check the application logs for any Clerk initialization errors
3. Test the authentication flow by signing up/in to ensure Clerk is properly connected