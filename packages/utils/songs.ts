import { ISong } from "./types/song";
import { fetchSongs, fetchSignedUrl, fetchSongById } from "./apiClient";

// Cache for storing signed URLs and their expiration times
type SignedUrlCache = {
  [key: string]: {
    url: string;
    expires: number;
  };
};

// This cache will store signed URLs to avoid too many requests
const signedUrlCache: SignedUrlCache = {};

// Default duration for signed URLs (1 hour in seconds)
const DEFAULT_EXPIRY = 60 * 60;

// Helper function to get a signed URL for a song file, using cache when possible
export const getSongUrl = async (filename: string): Promise<string> => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds

  // If we have a cached URL that's not expired, return it
  if (signedUrlCache[filename] && signedUrlCache[filename].expires > now) {
    return signedUrlCache[filename].url;
  }

  // Get a new signed URL from the API
  const signedUrl = await fetchSignedUrl(filename, DEFAULT_EXPIRY);

  if (signedUrl) {
    // Cache the new signed URL with expiration time
    signedUrlCache[filename] = {
      url: signedUrl,
      expires: now + DEFAULT_EXPIRY - 300, // Expire 5 minutes before actual expiry for safety
    };
    return signedUrl;
  }

  // In case we couldn't get a signed URL
  console.error(`Could not generate signed URL for ${filename}`);
  return "";
};

// Song metadata without URLs
export const songMetadata: Array<Omit<ISong, "audio">> = [
  {
    id: "the-one-kodaline",
    name: "The One",
    author: "Kodaline",
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/The_One_single_cover.png/220px-The_One_single_cover.png",
  },
  {
    id: "all-of-me-john-legend",
    name: "All Of Me",
    author: "John Legend",
    img: "https://cdn.imweb.me/thumbnail/20210617/07d16fbc20710.jpg",
  },
  {
    id: "make-you-feel-my-love-adele",
    name: "Make You Feel My Love",
    author: "Adele",
    img: "https://i1.sndcdn.com/artworks-000328637838-mlumy9-t500x500.jpg",
  },
  {
    id: "i-do-911",
    name: "I Do",
    author: "911",
    img: "https://i.ytimg.com/vi/Cgpzghb1zyo/maxresdefault.jpg",
  },
  {
    id: "wake-me-up-when-september-ends-green-d",
    name: "Wake Me Up When September Ends",
    author: "Green D",
    img: "https://i.ytimg.com/vi/rdpBZ5_b48g/maxresdefault.jpg",
  },
  {
    id: "cant-take-my-eyes-off-you",
    name: "Can't Take My Eyes Off You",
    author: "",
    img: "https://i.ytimg.com/vi/-HGX_phi6WA/maxresdefault.jpg",
  },
  {
    id: "say-you-wont-let-go-james-arthur",
    name: "Say You Won't Let Go",
    author: "James Arthur",
    img: "https://i1.sndcdn.com/artworks-000459317130-tbbjuk-t500x500.jpg",
  },
  {
    id: "love-someone-lukas-graham",
    name: "Love Someone",
    author: "Lukas Graham",
    img: "https://i.vdoc.vn/data/image/2018/10/20/hoc-tieng-anh-qua-bai-hat-love-someone-640.jpg",
  },
  {
    id: "im-yours-jason-mraz",
    name: "I'm Yours",
    author: "Jason Mraz",
    img: "https://upload.wikimedia.org/wikipedia/vi/thumb/c/c3/Jason_Mraz_-_I%27m_Yours.jpg/220px-Jason_Mraz_-_I%27m_Yours.jpg",
  },
  {
    id: "perfect-ed-sheeran",
    name: "Perfect",
    author: "Ed Sheeran",
    img: "https://upload.wikimedia.org/wikipedia/vi/thumb/8/80/Ed_Sheeran_Perfect_Single_cover.jpg/220px-Ed_Sheeran_Perfect_Single_cover.jpg",
  },
  {
    id: "perfect-tanner-patrick",
    name: "Perfect",
    author: "Cover by Tanner Patrick",
    img: "https://upload.wikimedia.org/wikipedia/vi/thumb/8/80/Ed_Sheeran_Perfect_Single_cover.jpg/220px-Ed_Sheeran_Perfect_Single_cover.jpg",
  },
  {
    id: "you-are-the-reason-calum-scott",
    name: "You Are The Reason",
    author: "Calum Scott",
    img: "https://avatar-ex-swe.nixcdn.com/song/2017/12/13/6/6/b/e/1513132182265_640.jpg",
  },
  {
    id: "always-isak-danielson",
    name: "Always",
    author: "Isak Danielson",
    img: "https://i1.sndcdn.com/artworks-000360398808-ro02i7-t500x500.jpg",
  },
  {
    id: "little-things-one-direction",
    name: "Little Things",
    author: "One Direction",
    img: "https://upload.wikimedia.org/wikipedia/en/1/10/One_Direction_-_Little_Things.png",
  },
  {
    id: "i-know-you-know",
    name: "I Know You Know",
    author: "",
    img: "https://i1.sndcdn.com/avatars-000437586054-giecep-t500x500.jpg",
  },
  {
    id: "munn-loved-us-more",
    name: "Munn",
    author: "Loved Us More",
    img: "https://i.ytimg.com/vi/Svq5Q0LmaFc/maxresdefault.jpg",
  },
];

// Map song metadata to filename
const songFilenames: Record<string, string> = {
  "the-one-kodaline": "The One - Kodaline.mp3",
  "all-of-me-john-legend": "All Of Me - John Legend.mp3",
  "make-you-feel-my-love-adele": "Make You Feel My Love - Adele.mp3",
  "i-do-911": "I Do - 911.mp3",
  "wake-me-up-when-september-ends-green-d": "Wake Me Up When September Ends - Green D.mp3",
  "cant-take-my-eyes-off-you": "Can't Take My Eyes Off You.mp3",
  "say-you-wont-let-go-james-arthur": "Say You Won't Let Go - James Arthur.mp3",
  "love-someone-lukas-graham": "Love Someone - Lukas Graham.mp3",
  "im-yours-jason-mraz": "I'm Yours - Jason Mraz.mp3",
  "perfect-ed-sheeran": "Perfect - Ed Sheeran.mp3",
  "perfect-tanner-patrick": "Perfect - Cover by Tanner Patrick.mp3",
  "you-are-the-reason-calum-scott": "You Are The Reason - Calum Scott.mp3",
  "always-isak-danielson": "Always - Isak Danielson.mp3",
  "little-things-one-direction": "Little Things - One Direction.mp3",
  "i-know-you-know": "I Know You Know - Unknown.mp3",
  "munn-loved-us-more": "Munn - Loved Us More.mp3",
};

// Function to get a song by ID with a signed URL from the API
export const getSongById = async (id: string): Promise<ISong | null> => {
  // Get the song from the API
  const apiSong = await fetchSongById(id);
  if (apiSong) {
    return apiSong;
  }

  // If API doesn't have song by ID endpoint yet, construct it ourselves
  const metadata = songMetadata.find(song => song.id === id);
  if (!metadata) return null;

  const filename = songFilenames[id];
  if (!filename) return null;

  const audioUrl = await getSongUrl(filename);

  return {
    ...metadata,
    audio: audioUrl,
  };
};

// Function to get all songs with signed URLs from the API
export const getAllSongs = async (): Promise<ISong[]> => {
  // Get songs from the API
  const apiSongs = await fetchSongs();
  if (apiSongs.length > 0) {
    return apiSongs;
  }

  // If the API call fails or returns empty, log the error
  console.error("Failed to get songs from API");
  return [];
};
