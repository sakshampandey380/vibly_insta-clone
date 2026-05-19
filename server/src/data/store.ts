import bcrypt from "bcrypt";

export interface UserRecord {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  profileImage: string | null;
  coverImage: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  gender?: string | null;
  education?: string | null;
  interestedIn?: string | null;
  hobbies?: string[];
  favoriteNiche?: string | null;
  favoriteSports?: string[];
  favoriteShows?: string[];
  favoriteAnime?: string[];
  socialLinks?: Record<string, string>;
  customLinks?: Array<{ label: string; url: string }>;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: string | null;
  verificationStatus?: "not_verified" | "pending_review" | "verified" | "rejected";
  verificationDocumentType?: "school_id" | "aadhaar_id" | null;
  verificationDocumentPath?: string | null;
  appThemeId?: string | null;
  appThemeCustom?: string | null;
  chatThemeId?: string | null;
  chatThemeCustom?: string | null;
  notificationColor?: string | null;
  notificationAudioPath?: string | null;
  isPrivate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostRecord {
  id: number;
  userId: number;
  title?: string | null;
  caption: string | null;
  location: string | null;
  mediaUrl: string;
  mediaType: "image" | "video";
  thumbnailUrl?: string | null;
  visibility: "public" | "followers" | "private";
  createdAt: string;
  updatedAt: string;
}

export interface ReelRecord {
  id: number;
  userId: number;
  title?: string | null;
  caption: string | null;
  videoUrl: string;
  coverImage: string | null;
  audioName: string | null;
  location: string | null;
  durationSeconds?: number | null;
  visibility: "public" | "followers" | "private";
  createdAt: string;
  updatedAt: string;
}

export interface PostLikeRecord {
  id: number;
  postId: number;
  userId: number;
  createdAt: string;
}

export interface PostCommentRecord {
  id: number;
  postId: number;
  userId: number;
  commentText: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPostRecord {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
}

export interface FollowerRecord {
  id: number;
  followerId: number;
  followingId: number;
  status: "pending" | "accepted";
  createdAt: string;
}

export interface MessageRecord {
  id: number;
  conversationId: number;
  senderId: number;
  messageText: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | null;
  status?: "sent" | "delivered" | "seen";
  createdAt: string;
}

export interface ConversationRecord {
  id: number;
  participantIds: number[];
  status?: "pending" | "active" | "rejected";
  requestSenderId?: number | null;
  themeId?: string | null;
  customThemeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: number;
  userId: number;
  actorId: number | null;
  type: "like" | "comment" | "follow" | "message" | "save" | "mention" | "system";
  postId: number | null;
  reelId: number | null;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface BlockRecord {
  id: number;
  blockerId: number;
  blockedId: number;
  reason: string | null;
  createdAt: string;
}

export interface NicknameRecord {
  id: number;
  ownerId: number;
  targetUserId: number;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  users: UserRecord[];
  posts: PostRecord[];
  reels: ReelRecord[];
  postLikes: PostLikeRecord[];
  postComments: PostCommentRecord[];
  savedPosts: SavedPostRecord[];
  followers: FollowerRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  notifications: NotificationRecord[];
  blocks: BlockRecord[];
  nicknames: NicknameRecord[];
}

let store: Store | null = null;

export async function initializeStore() {
  if (store) {
    return;
  }

  const demoPasswordHash = await bcrypt.hash("demo12345", 10);
  const now = new Date().toISOString();

  const users: UserRecord[] = [
    {
      id: 1,
      fullName: "Ariana Wells",
      username: "ariana.glow",
      email: "ariana@vibly.app",
      phone: "+91-9000011111",
      passwordHash: demoPasswordHash,
      profileImage: "/uploads/demo-ariana.png",
      coverImage: "/uploads/demo-cover-ariana.png",
      bio: "Creative director, film lover, and collector of soft sunsets.",
      website: "https://vibly.app/ariana",
      location: "Mumbai, India",
      gender: null,
      education: null,
      interestedIn: null,
      hobbies: [],
      favoriteNiche: null,
      favoriteSports: [],
      favoriteShows: [],
      favoriteAnime: [],
      socialLinks: {},
      customLinks: [],
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      verificationStatus: "verified",
      verificationDocumentType: null,
      verificationDocumentPath: null,
      appThemeId: "sky-bloom",
      appThemeCustom: null,
      chatThemeId: "default-glass",
      chatThemeCustom: null,
      notificationColor: "#1d4ed8",
      notificationAudioPath: null,
      isPrivate: false,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 2,
      fullName: "Leo Carter",
      username: "leo.lens",
      email: "leo@vibly.app",
      phone: "+91-9000022222",
      passwordHash: demoPasswordHash,
      profileImage: "/uploads/demo-leo.png",
      coverImage: "/uploads/demo-cover-leo.png",
      bio: "Street photographer chasing blue hour and stories in motion.",
      website: null,
      location: "Bengaluru, India",
      gender: null,
      education: null,
      interestedIn: null,
      hobbies: [],
      favoriteNiche: null,
      favoriteSports: [],
      favoriteShows: [],
      favoriteAnime: [],
      socialLinks: {},
      customLinks: [],
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      verificationStatus: "not_verified",
      verificationDocumentType: null,
      verificationDocumentPath: null,
      appThemeId: "sky-bloom",
      appThemeCustom: null,
      chatThemeId: "default-glass",
      chatThemeCustom: null,
      notificationColor: "#1d4ed8",
      notificationAudioPath: null,
      isPrivate: false,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 3,
      fullName: "Mia Hart",
      username: "mia.moodboard",
      email: "mia@vibly.app",
      phone: "+91-9000033333",
      passwordHash: demoPasswordHash,
      profileImage: "/uploads/demo-mia.png",
      coverImage: "/uploads/demo-cover-mia.png",
      bio: "Stylist. Moodboard addict. Cafe journaling ambassador.",
      website: null,
      location: "Delhi, India",
      gender: null,
      education: null,
      interestedIn: null,
      hobbies: [],
      favoriteNiche: null,
      favoriteSports: [],
      favoriteShows: [],
      favoriteAnime: [],
      socialLinks: {},
      customLinks: [],
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      verificationStatus: "not_verified",
      verificationDocumentType: null,
      verificationDocumentPath: null,
      appThemeId: "sky-bloom",
      appThemeCustom: null,
      chatThemeId: "default-glass",
      chatThemeCustom: null,
      notificationColor: "#1d4ed8",
      notificationAudioPath: null,
      isPrivate: false,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 4,
      fullName: "Noah Lin",
      username: "noah.wav",
      email: "noah@vibly.app",
      phone: "+91-9000044444",
      passwordHash: demoPasswordHash,
      profileImage: "/uploads/demo-noah.png",
      coverImage: "/uploads/demo-cover-noah.png",
      bio: "Music producer building soundtracks for night drives.",
      website: null,
      location: "Hyderabad, India",
      gender: null,
      education: null,
      interestedIn: null,
      hobbies: [],
      favoriteNiche: null,
      favoriteSports: [],
      favoriteShows: [],
      favoriteAnime: [],
      socialLinks: {},
      customLinks: [],
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      verificationStatus: "not_verified",
      verificationDocumentType: null,
      verificationDocumentPath: null,
      appThemeId: "sky-bloom",
      appThemeCustom: null,
      chatThemeId: "default-glass",
      chatThemeCustom: null,
      notificationColor: "#1d4ed8",
      notificationAudioPath: null,
      isPrivate: false,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 5,
      fullName: "Sana Brooke",
      username: "sana.daydream",
      email: "sana@vibly.app",
      phone: "+91-9000055555",
      passwordHash: demoPasswordHash,
      profileImage: "/uploads/demo-sana.png",
      coverImage: "/uploads/demo-cover-sana.png",
      bio: "Travel creator curating slow mornings around the world.",
      website: null,
      location: "Pune, India",
      gender: null,
      education: null,
      interestedIn: null,
      hobbies: [],
      favoriteNiche: null,
      favoriteSports: [],
      favoriteShows: [],
      favoriteAnime: [],
      socialLinks: {},
      customLinks: [],
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      verificationStatus: "not_verified",
      verificationDocumentType: null,
      verificationDocumentPath: null,
      appThemeId: "sky-bloom",
      appThemeCustom: null,
      chatThemeId: "default-glass",
      chatThemeCustom: null,
      notificationColor: "#1d4ed8",
      notificationAudioPath: null,
      isPrivate: false,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  const posts: PostRecord[] = [
    { id: 1, userId: 1, title: "Editorial Preview", caption: "A soft palette for the week ahead. Saving this light forever.", location: "Bandra Seaface", mediaUrl: "/uploads/media/demo-post-1.jpg", mediaType: "image", thumbnailUrl: null, visibility: "public", createdAt: now, updatedAt: now },
    { id: 2, userId: 2, title: "Motion Clip", caption: "Shot a moving cafe corner and turned it into a cinematic loop.", location: "Indiranagar", mediaUrl: "/uploads/media/demo-post-2.mp4", mediaType: "video", thumbnailUrl: null, visibility: "public", createdAt: now, updatedAt: now },
    { id: 3, userId: 3, title: "Style Board", caption: "Moodboard textures, velvet shadows, and a playful pink accent.", location: "Lodhi Art District", mediaUrl: "/uploads/media/demo-post-3.jpg", mediaType: "image", thumbnailUrl: null, visibility: "public", createdAt: now, updatedAt: now },
    { id: 4, userId: 4, title: "Studio Session", caption: "Tiny synths, giant feelings. Tonight's rough cut is finally landing.", location: "Studio C", mediaUrl: "/uploads/media/demo-post-4.mp4", mediaType: "video", thumbnailUrl: null, visibility: "public", createdAt: now, updatedAt: now },
    { id: 5, userId: 5, title: "Travel Diary", caption: "Collected a few slow moments where everything felt like floating.", location: "Auroville", mediaUrl: "/uploads/media/demo-post-5.jpg", mediaType: "image", thumbnailUrl: null, visibility: "public", createdAt: now, updatedAt: now }
  ];

  const reels: ReelRecord[] = [
    { id: 1, userId: 2, title: "Midnight neon cut", caption: "Midnight neon cut", videoUrl: "/uploads/media/demo-reel-1.mp4", coverImage: null, audioName: "Afterglow", location: "Bengaluru", durationSeconds: 24, visibility: "public", createdAt: now, updatedAt: now },
    { id: 2, userId: 1, title: "Soft focus transition", caption: "Soft focus transition", videoUrl: "/uploads/media/demo-reel-2.mp4", coverImage: null, audioName: "Dream Script", location: "Mumbai", durationSeconds: 28, visibility: "public", createdAt: now, updatedAt: now },
    { id: 3, userId: 5, title: "Slow travel morning", caption: "Slow travel morning", videoUrl: "/uploads/media/demo-reel-3.mp4", coverImage: null, audioName: "Cloud Bloom", location: "Auroville", durationSeconds: 31, visibility: "public", createdAt: now, updatedAt: now }
  ];

  const postLikes: PostLikeRecord[] = [{ id: 1, postId: 2, userId: 1, createdAt: now }];
  const postComments: PostCommentRecord[] = [
    { id: 1, postId: 1, userId: 3, commentText: "This color story is unreal.", createdAt: now, updatedAt: now },
    { id: 2, postId: 1, userId: 5, commentText: "The glow is perfect.", createdAt: now, updatedAt: now },
    { id: 3, postId: 2, userId: 1, commentText: "That transition is smooth.", createdAt: now, updatedAt: now }
  ];
  const savedPosts: SavedPostRecord[] = [{ id: 1, userId: 1, postId: 3, createdAt: now }];
  const followers: FollowerRecord[] = [
    { id: 1, followerId: 2, followingId: 1, status: "accepted", createdAt: now },
    { id: 2, followerId: 3, followingId: 1, status: "accepted", createdAt: now },
    { id: 3, followerId: 5, followingId: 1, status: "accepted", createdAt: now }
  ];
  const conversations: ConversationRecord[] = [
    { id: 1, participantIds: [1, 2], status: "active", requestSenderId: null, themeId: "default-glass", customThemeUrl: null, createdAt: now, updatedAt: now },
    { id: 2, participantIds: [1, 3], status: "active", requestSenderId: null, themeId: "default-glass", customThemeUrl: null, createdAt: now, updatedAt: now },
    { id: 3, participantIds: [1, 5], status: "active", requestSenderId: null, themeId: "default-glass", customThemeUrl: null, createdAt: now, updatedAt: now }
  ];
  const messages: MessageRecord[] = [
    { id: 1, conversationId: 1, senderId: 2, messageText: "I sent over the new cut.", mediaUrl: null, mediaType: null, status: "seen", createdAt: now },
    { id: 2, conversationId: 1, senderId: 1, messageText: "Opening it now. The pacing already feels stronger.", mediaUrl: null, mediaType: null, status: "seen", createdAt: now },
    { id: 3, conversationId: 2, senderId: 3, messageText: "Let's lock the styling palette.", mediaUrl: null, mediaType: null, status: "delivered", createdAt: now }
  ];
  const notifications: NotificationRecord[] = [
    { id: 1, userId: 1, actorId: 3, type: "follow", postId: null, reelId: null, message: "started following you.", isRead: false, createdAt: now },
    { id: 2, userId: 1, actorId: 2, type: "message", postId: null, reelId: null, message: "sent you a new message.", isRead: true, createdAt: now },
    { id: 3, userId: 1, actorId: 5, type: "like", postId: 1, reelId: null, message: "liked your editorial preview.", isRead: true, createdAt: now }
  ];
  const blocks: BlockRecord[] = [];
  const nicknames: NicknameRecord[] = [];

  store = {
    users,
    posts,
    reels,
    postLikes,
    postComments,
    savedPosts,
    followers,
    conversations,
    messages,
    notifications,
    blocks,
    nicknames
  };
}

export function getStore() {
  if (!store) {
    throw new Error("Store is not initialized.");
  }
  return store;
}

export function nextId<T extends { id: number }>(items: T[]) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

export function sanitizeUser(user: UserRecord) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export function serializeUserProfile(user: UserRecord) {
  const activeStore = getStore();
  return {
    ...sanitizeUser(user),
    followersCount: activeStore.followers.filter((entry) => entry.followingId === user.id && entry.status === "accepted").length,
    followingCount: activeStore.followers.filter((entry) => entry.followerId === user.id && entry.status === "accepted").length,
    postsCount: activeStore.posts.filter((entry) => entry.userId === user.id).length
  };
}

export function serializePost(post: PostRecord, viewerId?: number) {
  const activeStore = getStore();
  const author = activeStore.users.find((user) => user.id === post.userId);
  return {
    ...post,
    user: author ? serializeUserProfile(author) : null,
    likesCount: activeStore.postLikes.filter((entry) => entry.postId === post.id).length,
    comments: activeStore.postComments.filter((entry) => entry.postId === post.id),
    likedByViewer: viewerId ? activeStore.postLikes.some((entry) => entry.postId === post.id && entry.userId === viewerId) : false,
    savedByViewer: viewerId ? activeStore.savedPosts.some((entry) => entry.postId === post.id && entry.userId === viewerId) : false
  };
}

export function serializeReel(reel: ReelRecord, viewerId?: number) {
  const activeStore = getStore();
  const author = activeStore.users.find((user) => user.id === reel.userId);
  return {
    ...reel,
    user: author ? serializeUserProfile(author) : null,
    likedByViewer: Boolean(viewerId && false)
  };
}

export function isBlockedBetween(firstUserId?: number | null, secondUserId?: number | null) {
  if (!firstUserId || !secondUserId) {
    return false;
  }

  const activeStore = getStore();
  return activeStore.blocks.some(
    (entry) =>
      (entry.blockerId === firstUserId && entry.blockedId === secondUserId) ||
      (entry.blockerId === secondUserId && entry.blockedId === firstUserId)
  );
}

export function isAcceptedFollower(followerId?: number | null, followingId?: number | null) {
  if (!followerId || !followingId) {
    return false;
  }

  const activeStore = getStore();
  return activeStore.followers.some(
    (entry) => entry.followerId === followerId && entry.followingId === followingId && entry.status === "accepted"
  );
}

export function canViewUserProfile(user: UserRecord, viewerId?: number | null) {
  if (viewerId === user.id) {
    return true;
  }
  if (isBlockedBetween(viewerId, user.id)) {
    return false;
  }
  if (!user.isPrivate) {
    return true;
  }
  return isAcceptedFollower(viewerId, user.id);
}

export function canViewContent(
  ownerId: number,
  visibility: "public" | "followers" | "private",
  viewerId?: number | null
) {
  const owner = getStore().users.find((user) => user.id === ownerId);
  if (!owner) {
    return false;
  }

  if (!canViewUserProfile(owner, viewerId)) {
    return false;
  }

  if (viewerId === ownerId) {
    return true;
  }
  if (visibility === "public") {
    return true;
  }
  if (visibility === "followers") {
    return isAcceptedFollower(viewerId, ownerId);
  }
  return false;
}
