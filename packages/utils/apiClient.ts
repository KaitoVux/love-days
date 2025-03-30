import { ISong } from "./types/song";

// API base URL - this should be set as an environment variable in your app
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Interface representing the response from the signed URL endpoint
 */
interface SignedUrlResponse {
  filename: string;
  signedUrl: string;
  expiresIn: number;
}

/**
 * Maximum number of retries for API calls
 */
const MAX_RETRIES = 3;

/**
 * Base delay for exponential backoff in milliseconds
 */
const BASE_DELAY = 300;

/**
 * Generic function to fetch data with retries
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    // Calculate delay with exponential backoff and jitter
    const delay = BASE_DELAY * Math.pow(2, MAX_RETRIES - retries) * (0.5 + Math.random() * 0.5);

    console.warn(`Retrying API call to ${url} in ${delay}ms. Retries left: ${retries - 1}`);

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry the request
    return fetchWithRetry<T>(url, options, retries - 1);
  }
}

/**
 * Fetch all songs from the API
 */
export const fetchSongs = async (): Promise<ISong[]> => {
  try {
    return await fetchWithRetry<ISong[]>(`${apiUrl}/songs`);
  } catch (error) {
    console.error("Error fetching songs from API:", error);
    return [];
  }
};

/**
 * Get a signed URL for a specific song file
 */
export const fetchSignedUrl = async (
  filename: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const data = await fetchWithRetry<SignedUrlResponse>(
      `${apiUrl}/songs/signed-url/${encodeURIComponent(filename)}?expiresIn=${expiresIn}`
    );
    return data.signedUrl;
  } catch (error) {
    console.error(`Error fetching signed URL for ${filename}:`, error);
    return null;
  }
};

/**
 * Get information about a specific song by its ID
 * Note: This would typically be implemented server-side, but for now we'll return null
 * as this functionality would need to be added to the API
 */
export const fetchSongById = async (id: string): Promise<ISong | null> => {
  try {
    const songs = await fetchSongs();
    return songs.find(song => song.id === id) || null;
  } catch (error) {
    console.error(`Error fetching song by ID ${id}:`, error);
    return null;
  }
};
