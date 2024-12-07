import * as Sentry from '@sentry/nextjs';

export async function isImageValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok; // Return true if the response is ok (status in the range 200-299)
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error checking image URL:', error);
    // TODO show toast here
    return false;
  }
}
