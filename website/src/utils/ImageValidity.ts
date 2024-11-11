export async function isImageValid(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok; // Return true if the response is ok (status in the range 200-299)
    } catch (error) {
      console.error('Error checking image URL:', error);
      return false;
    }
  }
  