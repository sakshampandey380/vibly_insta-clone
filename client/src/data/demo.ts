import type { Conversation, Notification, Post, Reel, Story, User } from "../types/social";

export const demoUsers: User[] = [
  {
    id: 1,
    fullName: "Ariana Wells",
    username: "ariana.glow",
    email: "ariana@vibly.app",
    phone: "+91-9000011111",
    bio: "Creative director, film lover, and collector of soft sunsets.",
    website: "https://vibly.app/ariana",
    location: "Mumbai, India",
    avatarGradient: "from-sky-400 via-indigo-500 to-fuchsia-400",
    coverGradient: "from-sky-200 via-white to-fuchsia-100",
    followers: 12400,
    following: 689,
    postsCount: 42,
    isVerified: true,
    joinedAt: "2026-01-14T10:00:00.000Z",
    tagline: "Building soft visuals for bold brands.",
    isOnline: true
  },
  {
    id: 2,
    fullName: "Leo Carter",
    username: "leo.lens",
    email: "leo@vibly.app",
    phone: "+91-9000022222",
    bio: "Street photographer chasing blue hour and stories in motion.",
    location: "Bengaluru, India",
    avatarGradient: "from-cyan-300 via-blue-500 to-violet-500",
    coverGradient: "from-cyan-100 via-white to-violet-100",
    followers: 9800,
    following: 532,
    postsCount: 31,
    joinedAt: "2026-02-03T10:00:00.000Z",
    tagline: "Urban moments, dreamy edits.",
    isOnline: true
  },
  {
    id: 3,
    fullName: "Mia Hart",
    username: "mia.moodboard",
    email: "mia@vibly.app",
    phone: "+91-9000033333",
    bio: "Stylist. Moodboard addict. Cafe journaling ambassador.",
    location: "Delhi, India",
    avatarGradient: "from-pink-300 via-rose-500 to-orange-300",
    coverGradient: "from-rose-100 via-white to-orange-100",
    followers: 21500,
    following: 408,
    postsCount: 88,
    joinedAt: "2025-12-18T10:00:00.000Z",
    tagline: "Pastel palettes and polished chaos.",
    isOnline: false
  },
  {
    id: 4,
    fullName: "Noah Lin",
    username: "noah.wav",
    email: "noah@vibly.app",
    phone: "+91-9000044444",
    bio: "Music producer building soundtracks for night drives.",
    location: "Hyderabad, India",
    avatarGradient: "from-violet-400 via-fuchsia-400 to-pink-400",
    coverGradient: "from-violet-100 via-white to-pink-100",
    followers: 7600,
    following: 824,
    postsCount: 19,
    joinedAt: "2026-03-11T10:00:00.000Z",
    tagline: "Studio lights, synths, and soft bass.",
    isOnline: true
  },
  {
    id: 5,
    fullName: "Sana Brooke",
    username: "sana.daydream",
    email: "sana@vibly.app",
    phone: "+91-9000055555",
    bio: "Travel creator curating slow mornings around the world.",
    location: "Pune, India",
    avatarGradient: "from-emerald-300 via-sky-400 to-indigo-400",
    coverGradient: "from-emerald-100 via-white to-sky-100",
    followers: 14300,
    following: 390,
    postsCount: 57,
    joinedAt: "2026-01-29T10:00:00.000Z",
    tagline: "Passport stamps and calm skies.",
    isOnline: false
  }
];

export const demoStories: Story[] = [
  { id: 1, userId: 1, caption: "Morning edit", gradient: "from-sky-200 to-fuchsia-200", createdAt: "2026-05-15T07:00:00.000Z" },
  { id: 2, userId: 2, caption: "Blue hour", gradient: "from-cyan-200 to-indigo-200", createdAt: "2026-05-15T06:20:00.000Z" },
  { id: 3, userId: 3, caption: "Moodboard drop", gradient: "from-rose-200 to-orange-100", createdAt: "2026-05-15T05:15:00.000Z" },
  { id: 4, userId: 4, caption: "Studio night", gradient: "from-violet-200 to-pink-200", createdAt: "2026-05-14T22:20:00.000Z" },
  { id: 5, userId: 5, caption: "Cloudy runway", gradient: "from-emerald-100 to-sky-200", createdAt: "2026-05-14T20:45:00.000Z" }
];

export const demoPosts: Post[] = [
  {
    id: 1,
    userId: 1,
    location: "Bandra Seaface",
    caption: "A soft palette for the week ahead. Saving this light forever.",
    mediaType: "image",
    mediaGradient: "from-sky-200 via-white to-fuchsia-200",
    mediaLabel: "Editorial Preview",
    likes: 2819,
    likedByUser: false,
    savedByUser: false,
    createdAt: "2026-05-15T07:30:00.000Z",
    comments: [
      { id: 101, userId: 3, text: "This color story is unreal.", createdAt: "2026-05-15T07:50:00.000Z" },
      { id: 102, userId: 5, text: "The glow is perfect.", createdAt: "2026-05-15T08:05:00.000Z" }
    ]
  },
  {
    id: 2,
    userId: 2,
    location: "Indiranagar",
    caption: "Shot a moving cafe corner and turned it into a cinematic loop.",
    mediaType: "video",
    mediaGradient: "from-slate-800 via-violet-700 to-pink-500",
    mediaLabel: "Motion Clip",
    likes: 1942,
    likedByUser: true,
    savedByUser: false,
    createdAt: "2026-05-15T06:10:00.000Z",
    comments: [{ id: 103, userId: 1, text: "That transition is smooth.", createdAt: "2026-05-15T06:30:00.000Z" }]
  },
  {
    id: 3,
    userId: 3,
    location: "Lodhi Art District",
    caption: "Moodboard textures, velvet shadows, and a playful pink accent.",
    mediaType: "image",
    mediaGradient: "from-rose-200 via-white to-orange-100",
    mediaLabel: "Style Board",
    likes: 5421,
    likedByUser: false,
    savedByUser: true,
    createdAt: "2026-05-14T18:40:00.000Z",
    comments: [{ id: 104, userId: 4, text: "You always nail the atmosphere.", createdAt: "2026-05-14T20:00:00.000Z" }]
  },
  {
    id: 4,
    userId: 4,
    location: "Studio C",
    caption: "Tiny synths, giant feelings. Tonight's rough cut is finally landing.",
    mediaType: "video",
    mediaGradient: "from-violet-900 via-fuchsia-600 to-cyan-400",
    mediaLabel: "Studio Session",
    likes: 1260,
    likedByUser: false,
    savedByUser: false,
    createdAt: "2026-05-14T15:20:00.000Z",
    comments: []
  },
  {
    id: 5,
    userId: 5,
    location: "Auroville",
    caption: "Collected a few slow moments where everything felt like floating.",
    mediaType: "image",
    mediaGradient: "from-cyan-100 via-white to-indigo-200",
    mediaLabel: "Travel Diary",
    likes: 3190,
    likedByUser: false,
    savedByUser: false,
    createdAt: "2026-05-13T11:05:00.000Z",
    comments: [{ id: 105, userId: 2, text: "The softness here is beautiful.", createdAt: "2026-05-13T12:10:00.000Z" }]
  }
];

export const demoReels: Reel[] = [
  { id: 1, userId: 2, caption: "Midnight neon cut", audioName: "Afterglow", mediaGradient: "from-indigo-900 via-violet-700 to-pink-500", likes: 9312, comments: 181, shares: 77 },
  { id: 2, userId: 1, caption: "Soft focus transition", audioName: "Dream Script", mediaGradient: "from-sky-200 via-fuchsia-100 to-violet-300", likes: 7721, comments: 120, shares: 62 },
  { id: 3, userId: 5, caption: "Slow travel morning", audioName: "Cloud Bloom", mediaGradient: "from-cyan-100 via-sky-200 to-emerald-200", likes: 6044, comments: 88, shares: 49 }
];

export const demoNotifications: Notification[] = [
  { id: 1, actorId: 3, type: "follow", text: "started following you.", createdAt: "2026-05-15T06:30:00.000Z" },
  { id: 2, actorId: 2, type: "message", text: "sent you a new message.", createdAt: "2026-05-15T05:45:00.000Z", isRead: true },
  { id: 3, actorId: 5, type: "like", text: "liked your editorial preview.", createdAt: "2026-05-14T21:20:00.000Z", isRead: true }
];

export const demoConversations: Conversation[] = [
  {
    id: 1,
    participantIds: [1, 2],
    lastMessage: "I sent over the new cut.",
    updatedAt: "2026-05-15T07:10:00.000Z",
    messages: [
      { id: 1, senderId: 2, text: "I sent over the new cut.", createdAt: "2026-05-15T07:10:00.000Z" },
      { id: 2, senderId: 1, text: "Opening it now. The pacing already feels stronger.", createdAt: "2026-05-15T07:18:00.000Z" }
    ]
  },
  {
    id: 2,
    participantIds: [1, 3],
    lastMessage: "Let's lock the styling palette.",
    updatedAt: "2026-05-14T17:00:00.000Z",
    messages: [
      { id: 3, senderId: 3, text: "Let's lock the styling palette.", createdAt: "2026-05-14T17:00:00.000Z" }
    ]
  },
  {
    id: 3,
    participantIds: [1, 5],
    lastMessage: "The sunrise shots are unreal.",
    updatedAt: "2026-05-14T12:00:00.000Z",
    messages: [
      { id: 4, senderId: 5, text: "The sunrise shots are unreal.", createdAt: "2026-05-14T12:00:00.000Z" }
    ]
  }
];

export const demoCredentials = {
  identifier: "ariana.glow",
  password: "demo12345"
};
