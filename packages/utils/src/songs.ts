import { ISong } from "./types";
import { fetchPublishedSongs } from "./api-client";

// Supabase storage base URL from environment variables
const supabaseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/songs`
  : "";

// Helper function to create song storage URL
const createSongUrl = (filename: string): string => {
  if (!supabaseStorageUrl) {
    console.error("Supabase URL not configured. Please check your environment variables.");
    return "";
  }
  return `${supabaseStorageUrl}/${encodeURIComponent(filename)}`;
};

// Static fallback songs (used if API unavailable)
export const staticSongs: Array<ISong> = [
  {
    id: "the-one-kodaline",
    title: "The One",
    artist: "Kodaline",
    sourceType: "upload",
    fileUrl: createSongUrl("The One - Kodaline.mp3"),
    thumbnailUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/The_One_single_cover.png/220px-The_One_single_cover.png",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "all-of-me-john-legend",
    title: "All Of Me",
    artist: "John Legend",
    sourceType: "upload",
    fileUrl: createSongUrl("All Of Me - John Legend.mp3"),
    thumbnailUrl: "https://cdn.imweb.me/thumbnail/20210617/07d16fbc20710.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "make-you-feel-my-love-adele",
    title: "Make You Feel My Love",
    artist: "Adele",
    sourceType: "upload",
    fileUrl: createSongUrl("Make You Feel My Love - Adele.mp3"),
    thumbnailUrl: "https://i1.sndcdn.com/artworks-000328637838-mlumy9-t500x500.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i-do-911",
    title: "I Do",
    artist: "911",
    sourceType: "upload",
    fileUrl: createSongUrl("I Do - 911.mp3"),
    thumbnailUrl: "https://i.ytimg.com/vi/Cgpzghb1zyo/maxresdefault.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wake-me-up-when-september-ends-green-d",
    title: "Wake Me Up When September Ends",
    artist: "Green D",
    sourceType: "upload",
    fileUrl: createSongUrl("Wake Me Up When September Ends - Green D.mp3"),
    thumbnailUrl: "https://i.ytimg.com/vi/rdpBZ5_b48g/maxresdefault.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cant-take-my-eyes-off-you",
    title: "Can't Take My Eyes Off You",
    artist: "Unknown",
    sourceType: "upload",
    fileUrl: createSongUrl("Can't Take My Eyes Off You.mp3"),
    thumbnailUrl: "https://i.ytimg.com/vi/-HGX_phi6WA/maxresdefault.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "say-you-wont-let-go-james-arthur",
    title: "Say You Won't Let Go",
    artist: "James Arthur",
    sourceType: "upload",
    fileUrl: createSongUrl("Say You Won't Let Go - James Arthur.mp3"),
    thumbnailUrl: "https://i1.sndcdn.com/artworks-000459317130-tbbjuk-t500x500.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "love-someone-lukas-graham",
    title: "Love Someone",
    artist: "Lukas Graham",
    sourceType: "upload",
    fileUrl: createSongUrl("Love Someone - Lukas Graham.mp3"),
    thumbnailUrl:
      "https://i.vdoc.vn/data/image/2018/10/20/hoc-tieng-anh-qua-bai-hat-love-someone-640.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "im-yours-jason-mraz",
    title: "I'm Yours",
    artist: "Jason Mraz",
    sourceType: "upload",
    fileUrl: createSongUrl("I'm Yours - Jason Mraz.mp3"),
    thumbnailUrl:
      "https://upload.wikimedia.org/wikipedia/vi/thumb/c/c3/Jason_Mraz_-_I%27m_Yours.jpg/220px-Jason_Mraz_-_I%27m_Yours.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "perfect-ed-sheeran",
    title: "Perfect",
    artist: "Ed Sheeran",
    sourceType: "upload",
    fileUrl: createSongUrl("Perfect - Ed Sheeran.mp3"),
    thumbnailUrl:
      "https://upload.wikimedia.org/wikipedia/vi/thumb/8/80/Ed_Sheeran_Perfect_Single_cover.jpg/220px-Ed_Sheeran_Perfect_Single_cover.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "perfect-tanner-patrick",
    title: "Perfect",
    artist: "Cover by Tanner Patrick",
    sourceType: "upload",
    fileUrl: createSongUrl("Perfect - Cover by Tanner Patrick.mp3"),
    thumbnailUrl:
      "https://upload.wikimedia.org/wikipedia/vi/thumb/8/80/Ed_Sheeran_Perfect_Single_cover.jpg/220px-Ed_Sheeran_Perfect_Single_cover.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "you-are-the-reason-calum-scott",
    title: "You Are The Reason",
    artist: "Calum Scott",
    sourceType: "upload",
    fileUrl: createSongUrl("You Are The Reason - Calum Scott.mp3"),
    thumbnailUrl: "https://avatar-ex-swe.nixcdn.com/song/2017/12/13/6/6/b/e/1513132182265_640.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "always-isak-danielson",
    title: "Always",
    artist: "Isak Danielson",
    sourceType: "upload",
    fileUrl: createSongUrl("Always - Isak Danielson.mp3"),
    thumbnailUrl: "https://i1.sndcdn.com/artworks-000360398808-ro02i7-t500x500.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "little-things-one-direction",
    title: "Little Things",
    artist: "One Direction",
    sourceType: "upload",
    fileUrl: createSongUrl("Little Things - One Direction.mp3"),
    thumbnailUrl:
      "https://upload.wikimedia.org/wikipedia/en/1/10/One_Direction_-_Little_Things.png",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i-know-you-know",
    title: "I Know You Know",
    artist: "Unknown",
    sourceType: "upload",
    fileUrl: createSongUrl("I Know You Know - Unknown.mp3"),
    thumbnailUrl: "https://i1.sndcdn.com/avatars-000437586054-giecep-t500x500.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "munn-loved-us-more",
    title: "Munn",
    artist: "Loved Us More",
    sourceType: "upload",
    fileUrl: createSongUrl("Munn - Loved Us More.mp3"),
    thumbnailUrl: "https://i.ytimg.com/vi/Svq5Q0LmaFc/maxresdefault.jpg",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get songs - tries API first, falls back to static data
 * Used by Next.js at build time for static generation
 */
export async function getSongs(): Promise<ISong[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // If API URL configured, try fetching from API
  if (apiUrl) {
    const apiSongs = await fetchPublishedSongs();
    if (apiSongs.length > 0) {
      console.log(`Fetched ${apiSongs.length} songs from API`);
      return apiSongs;
    }
  }

  // Fallback to static songs
  console.log("Using static song data (API unavailable or returned no songs)");
  return staticSongs;
}

// Keep existing exports for backward compatibility
export const songs = staticSongs;

// Helper function to get a song by ID
export const getSongById = (id: string): ISong | undefined => {
  return staticSongs.find(song => song.id === id);
};
