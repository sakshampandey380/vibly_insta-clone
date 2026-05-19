export type MediaType = "image" | "video";
export type ContentVisibility = "public" | "followers" | "private";
export type ProfileType = "public" | "private";
export type VerificationStatus = "not_verified" | "pending_review" | "verified" | "rejected";
export type VerificationDocumentType = "school_id" | "aadhaar_id";
export type MessageMediaType = "image" | "video";
export type MessageStatus = "sent" | "delivered" | "seen";
export type ConversationStatus = "pending" | "active" | "rejected";

export interface SocialLinkMap {
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
  [key: string]: string | undefined;
}

export interface CustomLink {
  id: string;
  label: string;
  url: string;
}

export interface UserPreferences {
  hobbies: string[];
  favoriteNiche: string;
  favoriteSports: string[];
  favoriteShows: string[];
  favoriteAnime: string[];
  education: string;
  currentLocation: string;
  gender: string;
  interestedIn: string;
  socialLinks: SocialLinkMap;
  customLinks: CustomLink[];
}

export interface ThemeSelection {
  id: string;
  customBackground?: string | null;
  customGradient?: string | null;
}

export interface NotificationSettings {
  color: string;
  audioName?: string;
  audioUrl?: string | null;
}

export interface VerificationState {
  status: VerificationStatus;
  documentType?: VerificationDocumentType;
  documentName?: string;
  submittedAt?: string;
}

export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  website?: string;
  location: string;
  avatarGradient: string;
  coverGradient: string;
  followers: number;
  following: number;
  postsCount: number;
  isVerified?: boolean;
  joinedAt: string;
  tagline?: string;
  isOnline?: boolean;
  profileImage?: string | null;
  bannerImage?: string | null;
  profileType?: ProfileType;
  nickname?: string;
  isFollowing?: boolean;
  hasRequestedFollow?: boolean;
  followsYou?: boolean;
  canViewFullProfile?: boolean;
  canMessage?: boolean;
  mutualConnectionsCount?: number;
  verification?: VerificationState;
  preferences?: UserPreferences;
  appTheme?: ThemeSelection;
  chatTheme?: ThemeSelection;
  notificationSettings?: NotificationSettings;
}

export interface Story {
  id: number;
  userId: number;
  caption: string;
  gradient: string;
  createdAt: string;
}

export interface PostComment {
  id: number;
  userId: number;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Post {
  id: number;
  userId: number;
  title?: string;
  location?: string;
  caption: string;
  mediaType: MediaType;
  mediaGradient: string;
  mediaLabel: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaSizeBytes?: number;
  mediaSizeLabel?: string;
  durationSeconds?: number;
  durationLabel?: string;
  thumbnailUrl?: string | null;
  visibility?: ContentVisibility;
  likes: number;
  likedByUser?: boolean;
  savedByUser?: boolean;
  createdAt: string;
  updatedAt?: string;
  comments: PostComment[];
  isOwn?: boolean;
}

export interface Reel {
  id: number;
  userId: number;
  title?: string;
  caption: string;
  audioName: string;
  mediaGradient: string;
  likes: number;
  comments: number;
  shares: number;
  videoUrl?: string;
  thumbnailUrl?: string | null;
  mediaName?: string;
  mediaSizeBytes?: number;
  mediaSizeLabel?: string;
  location?: string;
  visibility?: ContentVisibility;
  durationSeconds?: number;
  durationLabel?: string;
  isOwn?: boolean;
}

export interface Notification {
  id: number;
  actorId: number;
  type: "like" | "comment" | "follow" | "message" | "save" | "mention" | "system";
  text: string;
  createdAt: string;
  isRead?: boolean;
}

export interface ConversationMessage {
  id: number;
  senderId: number;
  text: string;
  createdAt: string;
  mediaUrl?: string | null;
  mediaType?: MessageMediaType | null;
  status?: MessageStatus;
}

export interface ConversationTheme {
  id: string;
  label: string;
  background: string;
  bubbleClassName?: string;
}

export interface Conversation {
  id: number;
  participantIds: number[];
  lastMessage: string;
  updatedAt: string;
  messages: ConversationMessage[];
  status?: ConversationStatus;
  requestSenderId?: number;
  themeId?: string;
  customThemeUrl?: string | null;
  otherUserTyping?: boolean;
  unreadCount?: number;
}

export interface FollowRelation {
  followerId: number;
  followingId: number;
  status: "pending" | "accepted";
}

export interface BlockedUser {
  user: User;
  reason?: string;
}

export interface NicknameRecord {
  ownerId: number;
  targetUserId: number;
  nickname: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bio?: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  username: string;
  phone: string;
  bio: string;
  website?: string;
  location?: string;
}

export interface UpdateAccountSettingsPayload {
  profileType: ProfileType;
  username: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreatePostPayload {
  title: string;
  caption: string;
  location?: string;
  mediaType: MediaType;
  file: File;
  thumbnailFile?: File | null;
  visibility: ContentVisibility;
}

export interface UpdatePostPayload {
  title: string;
  caption: string;
  location?: string;
  visibility: ContentVisibility;
  file?: File | null;
  thumbnailFile?: File | null;
}

export interface CreateReelPayload {
  title: string;
  caption: string;
  location?: string;
  file: File;
  thumbnailFile?: File | null;
  visibility: ContentVisibility;
}

export interface UpdateReelPayload {
  title: string;
  caption: string;
  location?: string;
  visibility: ContentVisibility;
  file?: File | null;
  thumbnailFile?: File | null;
}
