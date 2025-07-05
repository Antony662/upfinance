import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6868413d5e313db290775785", 
  requiresAuth: true // Ensure authentication is required for all operations
});
