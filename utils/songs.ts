import { ISong } from "../components/Player";

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

export const songs: Array<ISong> = [
  {
    id: "the-one-kodaline",
    name: "The One",
    author: "Kodaline",
    audio: createSongUrl("The One - Kodaline.mp3"),
    img: "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/The_One_single_cover.png/220px-The_One_single_cover.png",
  },
  {
    id: "all-of-me-john-legend",
    name: "All Of Me",
    author: "John Legend",
    audio: createSongUrl("All Of Me - John Legend.mp3"),
    img: "https://cdn.imweb.me/thumbnail/20210617/07d16fbc20710.jpg",
  },
  {
    id: "make-you-feel-my-love-adele",
    name: "Make You Feel My Love",
    author: "Adele",
    audio: createSongUrl("Make You Feel My Love - Adele.mp3"),
    img: "https://i1.sndcdn.com/artworks-000328637838-mlumy9-t500x500.jpg",
  },
  {
    id: "i-do-911",
    name: "I Do",
    author: "911",
    audio: createSongUrl("I Do - 911.mp3"),
    img: "https://i.ytimg.com/vi/Cgpzghb1zyo/maxresdefault.jpg",
  },
  {
    id: "wake-me-up-when-september-ends-green-d",
    name: "Wake Me Up When September Ends",
    author: "Green D",
    audio: createSongUrl("Wake Me Up When September Ends - Green D.mp3"),
    img: "https://i.ytimg.com/vi/rdpBZ5_b48g/maxresdefault.jpg",
  },
  {
    id: "cant-take-my-eyes-off-you",
    name: "Can't Take My Eyes Off You",
    author: "",
    audio: createSongUrl("Can't Take My Eyes Off You.mp3"),
    img: "https://i.ytimg.com/vi/-HGX_phi6WA/maxresdefault.jpg",
  },
  {
    id: "say-you-wont-let-go-james-arthur",
    name: "Say You Won't Let Go",
    author: "James Arthur",
    audio: createSongUrl("Say You Won't Let Go - James Arthur.mp3"),
    img: "https://i1.sndcdn.com/artworks-000459317130-tbbjuk-t500x500.jpg",
  },
  {
    id: "love-someone-lukas-graham",
    name: "Love Someone",
    author: "Lukas Graham",
    audio: createSongUrl("Love Someone - Lukas Graham.mp3"),
    img: "https://i.vdoc.vn/data/image/2018/10/20/hoc-tieng-anh-qua-bai-hat-love-someone-640.jpg",
  },
  {
    id: "im-yours-jason-mraz",
    name: "I'm Yours",
    author: "Jason Mraz",
    audio: createSongUrl("I'm Yours - Jason Mraz.mp3"),
    img: "https://upload.wikimedia.org/wikipedia/vi/thumb/c/c3/Jason_Mraz_-_I%27m_Yours.jpg/220px-Jason_Mraz_-_I%27m_Yours.jpg",
  },
  {
    id: "perfect-ed-sheeran",
    name: "Perfect",
    author: "Ed Sheeran",
    audio: createSongUrl("Perfect - Ed Sheeran.mp3"),
    img: "https://upload.wikimedia.org/wikipedia/vi/thumb/8/80/Ed_Sheeran_Perfect_Single_cover.jpg/220px-Ed_Sheeran_Perfect_Single_cover.jpg",
  },
  {
    id: "perfect-tanner-patrick",
    name: "Perfect",
    author: "Cover by Tanner Patrick",
    audio: createSongUrl("Perfect - Cover by Tanner Patrick.mp3"),
    img: "https://upload.wikimedia.org/wikipedia/vi/thumb/8/80/Ed_Sheeran_Perfect_Single_cover.jpg/220px-Ed_Sheeran_Perfect_Single_cover.jpg",
  },
  {
    id: "you-are-the-reason-calum-scott",
    name: "You Are The Reason",
    author: "Calum Scott",
    audio: createSongUrl("You Are The Reason - Calum Scott.mp3"),
    img: "https://avatar-ex-swe.nixcdn.com/song/2017/12/13/6/6/b/e/1513132182265_640.jpg",
  },
  {
    id: "always-isak-danielson",
    name: "Always",
    author: "Isak Danielson",
    audio: createSongUrl("Always - Isak Danielson.mp3"),
    img: "https://i1.sndcdn.com/artworks-000360398808-ro02i7-t500x500.jpg",
  },
  {
    id: "little-things-one-direction",
    name: "Little Things",
    author: "One Direction",
    audio: createSongUrl("Little Things - One Direction.mp3"),
    img: "https://upload.wikimedia.org/wikipedia/en/1/10/One_Direction_-_Little_Things.png",
  },
  {
    id: "i-know-you-know",
    name: "I Know You Know",
    author: "",
    audio: createSongUrl("I Know You Know - Unknown.mp3"),
    img: "https://i1.sndcdn.com/avatars-000437586054-giecep-t500x500.jpg",
  },
  {
    id: "munn-loved-us-more",
    name: "Munn",
    author: "Loved Us More",
    audio: createSongUrl("Munn - Loved Us More.mp3"),
    img: "https://i.ytimg.com/vi/Svq5Q0LmaFc/maxresdefault.jpg",
  },
];

// Helper function to get a song by ID
export const getSongById = (id: string): ISong | undefined => {
  return songs.find(song => song.id === id);
};
