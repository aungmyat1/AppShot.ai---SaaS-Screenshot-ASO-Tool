import { Screenshot } from '../types';

/**
 * MOCK CLIENT-SIDE SERVICE
 * This service mimics the behavior of the server-side image processing worker.
 * In the full-stack version, this would be handled by the 'server/r2Service.ts' logic.
 */

// Simulated "R2" bucket URL for demo purposes
const MOCK_CDN_BASE = 'https://cdn.appshot.ai/demo';

export const processAndUploadMock = async (screenshot: Screenshot, appId: string, index: number): Promise<Screenshot> => {
  // Simulate network delay for "Downloading -> Optimizing -> Uploading"
  // Sharp optimization usually takes 100-300ms per image
  await new Promise(resolve => setTimeout(resolve, 400));

  // In a real app, this URL would be the Cloudflare R2 URL (e.g., https://pub-xyz.r2.dev/user/app/shot-1.webp)
  // For this demo, we append a query param to the original URL to simulate a "processed" version,
  // or we could replace it. To ensure images still load in the UI, we keep the valid picsum URL
  // but update metadata to reflect "optimization".
  
  const optimizedUrl = `${screenshot.url}&format=webp&q=85`;

  return {
    ...screenshot,
    // Add the storage metadata as defined in the updated types
    storagePath: `u_demo/${appId}/screenshot-${index}.webp`,
    optimized: true,
    optimizedUrl: optimizedUrl,
    // Simulate slight dimension change if we were resizing (mock data is 1080x1920)
    width: 1080, 
    height: 1920
  };
};