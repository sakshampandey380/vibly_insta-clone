import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  demoConversations,
  demoCredentials,
  demoNotifications,
  demoPosts,
  demoReels,
  demoStories,
  demoUsers
} from "../data/demo";
import { findAppTheme, findChatTheme } from "../lib/themes";
import {
  buildVideoThumbnail,
  formatBytes,
  formatDuration,
  readFileAsDataUrl,
  readVideoDuration,
  uploadRules,
  validateAudioFile,
  validateImageFile,
  validateVerificationFile,
  validateVideoFile
} from "../lib/upload";
import type {
  BlockedUser,
  ChangePasswordPayload,
  ContentVisibility,
  Conversation,
  ConversationMessage,
  ConversationStatus,
  CreatePostPayload,
  CreateReelPayload,
  FollowRelation,
  LoginPayload,
  NicknameRecord,
  Notification,
  NotificationSettings,
  Post,
  ProfileType,
  Reel,
  SignupPayload,
  Story,
  ThemeSelection,
  UpdateAccountSettingsPayload,
  UpdatePostPayload,
  UpdateProfilePayload,
  UpdateReelPayload,
  User,
  UserPreferences,
  VerificationDocumentType,
  VerificationState
} from "../types/social";

const AUTH_STORAGE_KEY = "vibly-auth-v2";
const STATE_STORAGE_KEY = "vibly-social-state-v2";

type FlashTone = "success" | "error" | "info";

interface FlashMessage {
  message: string;
  tone: FlashTone;
}

interface LocalUser extends User {
  password: string;
  profileType: ProfileType;
  verification: VerificationState;
  preferences: UserPreferences;
  appTheme: ThemeSelection;
  chatTheme: ThemeSelection;
  notificationSettings: NotificationSettings;
}

interface LocalPost extends Post {
  likedBy: number[];
  savedBy: number[];
  visibility: ContentVisibility;
}

interface LocalReel extends Reel {
  likedBy: number[];
  savedBy: number[];
  visibility: ContentVisibility;
}

interface LocalNotification extends Notification {
  userId: number;
}

interface LocalConversation extends Conversation {
  status: ConversationStatus;
}

interface BlockRelation {
  blockerId: number;
  blockedId: number;
  reason?: string;
  createdAt: string;
}

interface SocialState {
  users: LocalUser[];
  posts: LocalPost[];
  stories: Story[];
  reels: LocalReel[];
  notifications: LocalNotification[];
  conversations: LocalConversation[];
  follows: FollowRelation[];
  blocks: BlockRelation[];
  nicknames: NicknameRecord[];
}

interface MessageSendResult {
  success: boolean;
  conversationId?: number;
}

interface AuthContextValue {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  stories: Story[];
  reels: Reel[];
  notifications: Notification[];
  conversations: Conversation[];
  messageRequests: Conversation[];
  blockedUsers: BlockedUser[];
  mutualConnections: User[];
  incomingFollowRequests: User[];
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authReason?: string;
  flashMessage?: FlashMessage;
  activeAppBackground: string;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  requireAuth: (reason?: string, redirectPath?: string) => boolean;
  closeAuthModal: () => void;
  dismissFlashMessage: () => void;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  updateProfileMedia: (kind: "profile" | "banner", file: File | null) => Promise<void>;
  updateAccountSettings: (payload: UpdateAccountSettingsPayload) => Promise<void>;
  updatePreferences: (payload: UserPreferences) => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  submitVerification: (documentType: VerificationDocumentType, file: File) => Promise<void>;
  updateAppTheme: (themeId: string, customBackground?: string | null) => Promise<void>;
  updateGlobalChatTheme: (themeId: string, customBackground?: string | null) => Promise<void>;
  updateNotificationSettings: (payload: { color: string; audioFile?: File | null }) => Promise<void>;
  toggleLike: (postId: number) => boolean;
  toggleSave: (postId: number) => boolean;
  addComment: (postId: number, text: string) => boolean;
  toggleFollow: (userId: number) => boolean;
  respondToFollowRequest: (userId: number, accept: boolean) => void;
  createPost: (payload: CreatePostPayload) => Promise<boolean>;
  updatePost: (postId: number, payload: UpdatePostPayload) => Promise<void>;
  deletePost: (postId: number) => void;
  createReel: (payload: CreateReelPayload) => Promise<boolean>;
  updateReel: (reelId: number, payload: UpdateReelPayload) => Promise<void>;
  deleteReel: (reelId: number) => void;
  sendMessage: (payload: { conversationId?: number; recipientId?: number; text: string; file?: File | null }) => Promise<MessageSendResult>;
  respondToMessageRequest: (conversationId: number, accept: boolean) => void;
  markConversationSeen: (conversationId: number) => void;
  setConversationTheme: (conversationId: number, themeId: string, customBackground?: string | null) => Promise<void>;
  setNickname: (userId: number, nickname: string) => void;
  blockUser: (userId: number, reason?: string) => void;
  unblockUser: (userId: number) => void;
  findUserByUsername: (username?: string) => User | undefined;
  getConversationWithUser: (userId: number) => Conversation | undefined;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function defaultPreferences(location = ""): UserPreferences {
  return {
    hobbies: [],
    favoriteNiche: "",
    favoriteSports: [],
    favoriteShows: [],
    favoriteAnime: [],
    education: "",
    currentLocation: location,
    gender: "",
    interestedIn: "",
    socialLinks: {},
    customLinks: []
  };
}

function nextNumericId(items: Array<{ id: number }>) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function buildInitialState(): SocialState {
  const users: LocalUser[] = demoUsers.map((user) => ({
    ...user,
    password: demoCredentials.password,
    website: user.website ?? "",
    profileImage: null,
    bannerImage: null,
    profileType: "public",
    verification:
      user.isVerified
        ? { status: "verified" }
        : { status: "not_verified" },
    preferences: defaultPreferences(user.location),
    appTheme: { id: "sky-bloom", customBackground: null, customGradient: null },
    chatTheme: { id: "default-glass", customBackground: null, customGradient: null },
    notificationSettings: { color: "#1d4ed8", audioName: "", audioUrl: null }
  }));

  const posts: LocalPost[] = demoPosts.map((post) => ({
    ...post,
    title: post.mediaLabel,
    mediaUrl: undefined,
    mediaName: "",
    mediaSizeBytes: 0,
    mediaSizeLabel: "",
    durationSeconds: post.mediaType === "video" ? 34 : undefined,
    durationLabel: post.mediaType === "video" ? "0:34" : "",
    thumbnailUrl: null,
    visibility: "public",
    likedBy: post.likedByUser ? [1] : [],
    savedBy: post.savedByUser ? [1] : [],
    updatedAt: post.createdAt
  }));

  const reels: LocalReel[] = demoReels.map((reel) => ({
    ...reel,
    title: reel.caption,
    videoUrl: undefined,
    thumbnailUrl: null,
    mediaName: "",
    mediaSizeBytes: 0,
    mediaSizeLabel: "",
    location: "",
    visibility: "public",
    durationSeconds: 24,
    durationLabel: "0:24",
    likedBy: [],
    savedBy: []
  }));

  const notifications: LocalNotification[] = demoNotifications.map((notification) => ({
    ...notification,
    userId: 1
  }));

  const conversations: LocalConversation[] = demoConversations.map((conversation) => ({
    ...conversation,
    status: "active",
    requestSenderId: undefined,
    themeId: "default-glass",
    customThemeUrl: null,
    messages: conversation.messages.map((message) => ({
      ...message,
      mediaUrl: null,
      mediaType: null,
      status: message.senderId === 1 ? "seen" : "delivered"
    }))
  }));

  const follows: FollowRelation[] = [
    { followerId: 1, followingId: 2, status: "accepted" },
    { followerId: 2, followingId: 1, status: "accepted" },
    { followerId: 1, followingId: 3, status: "accepted" },
    { followerId: 3, followingId: 1, status: "accepted" },
    { followerId: 5, followingId: 1, status: "accepted" }
  ];

  return {
    users,
    posts,
    stories: demoStories,
    reels,
    notifications,
    conversations,
    follows,
    blocks: [],
    nicknames: []
  };
}

function loadState() {
  if (typeof window === "undefined") {
    return buildInitialState();
  }

  const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
  if (!raw) {
    return buildInitialState();
  }

  try {
    return JSON.parse(raw) as SocialState;
  } catch {
    window.localStorage.removeItem(STATE_STORAGE_KEY);
    return buildInitialState();
  }
}

function persistAuth(userId: number | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (userId) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId }));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function isBlockedBetween(blocks: BlockRelation[], firstUserId?: number | null, secondUserId?: number | null) {
  if (!firstUserId || !secondUserId) {
    return false;
  }

  return blocks.some(
    (entry) =>
      (entry.blockerId === firstUserId && entry.blockedId === secondUserId) ||
      (entry.blockerId === secondUserId && entry.blockedId === firstUserId)
  );
}

function isAcceptedFollower(follows: FollowRelation[], followerId?: number | null, followingId?: number | null) {
  if (!followerId || !followingId) {
    return false;
  }

  return follows.some(
    (entry) =>
      entry.followerId === followerId &&
      entry.followingId === followingId &&
      entry.status === "accepted"
  );
}

function getFollowRequest(follows: FollowRelation[], followerId?: number | null, followingId?: number | null) {
  if (!followerId || !followingId) {
    return undefined;
  }

  return follows.find(
    (entry) => entry.followerId === followerId && entry.followingId === followingId
  );
}

function canViewUserProfile(state: SocialState, viewerId: number | null, user: LocalUser) {
  if (viewerId === user.id) {
    return true;
  }

  if (isBlockedBetween(state.blocks, viewerId, user.id)) {
    return false;
  }

  if (user.profileType === "public") {
    return true;
  }

  return isAcceptedFollower(state.follows, viewerId, user.id);
}

function canViewContent(
  state: SocialState,
  viewerId: number | null,
  ownerId: number,
  visibility: ContentVisibility
) {
  const owner = state.users.find((user) => user.id === ownerId);
  if (!owner) {
    return false;
  }

  if (!canViewUserProfile(state, viewerId, owner)) {
    return false;
  }

  if (viewerId === ownerId) {
    return true;
  }

  if (visibility === "public") {
    return true;
  }

  if (visibility === "followers") {
    return isAcceptedFollower(state.follows, viewerId, ownerId);
  }

  return false;
}

function createMediaGradient(type: "image" | "video", seed = "") {
  const gradients =
    type === "video"
      ? [
          "from-slate-900 via-violet-700 to-pink-500",
          "from-indigo-900 via-blue-700 to-cyan-400",
          "from-fuchsia-900 via-rose-600 to-orange-400"
        ]
      : [
          "from-cyan-100 via-white to-violet-200",
          "from-rose-100 via-white to-orange-100",
          "from-emerald-100 via-white to-sky-100"
        ];

  const index = seed.length % gradients.length;
  return gradients[index];
}

function stripPrivateUserFields(user: User) {
  return {
    ...user,
    website: user.website ?? "",
    preferences: user.canViewFullProfile ? user.preferences : defaultPreferences(user.location),
    notificationSettings: undefined,
    appTheme: undefined,
    chatTheme: undefined
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<SocialState>(() => loadState());
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string>();
  const [pendingRedirect, setPendingRedirect] = useState<string>();
  const [flashMessage, setFlashMessage] = useState<FlashMessage>();

  useEffect(() => {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { userId: number };
      setCurrentUserId(parsed.userId);
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!flashMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setFlashMessage(undefined), 3200);
    return () => window.clearTimeout(timeout);
  }, [flashMessage]);

  const currentRawUser = useMemo(
    () => state.users.find((user) => user.id === currentUserId) ?? null,
    [state.users, currentUserId]
  );

  function showFlash(message: string, tone: FlashTone = "success") {
    setFlashMessage({ message, tone });
  }

  function withState(updater: (current: SocialState) => SocialState) {
    setState((current) => updater(current));
  }

  const currentUser = useMemo(() => {
    if (!currentRawUser) {
      return null;
    }

    const pendingSelf = mapUserForViewer(state, currentRawUser.id, currentRawUser);
    return stripPrivateUserFields(pendingSelf);
  }, [currentRawUser, state]);

  const users = useMemo(() => {
    return state.users
      .filter((user) => !isBlockedBetween(state.blocks, currentUserId, user.id))
      .map((user) => stripPrivateUserFields(mapUserForViewer(state, currentUserId, user)));
  }, [state, currentUserId]);

  const posts = useMemo(() => {
    return state.posts
      .filter((post) => canViewContent(state, currentUserId, post.userId, post.visibility))
      .map((post) => mapPostForViewer(post, currentUserId));
  }, [state, currentUserId]);

  const reels = useMemo(() => {
    return state.reels
      .filter((reel) => canViewContent(state, currentUserId, reel.userId, reel.visibility))
      .map((reel) => mapReelForViewer(reel, currentUserId));
  }, [state, currentUserId]);

  const conversations = useMemo(() => {
    return state.conversations
      .filter(
        (conversation) =>
          conversation.status === "active" &&
          conversation.participantIds.includes(currentUserId ?? -1) &&
          !conversation.participantIds.some((participantId) =>
            isBlockedBetween(state.blocks, currentUserId, participantId)
          )
      )
      .map((conversation) => mapConversationForViewer(conversation, currentUserId));
  }, [state, currentUserId]);

  const messageRequests = useMemo(() => {
    return state.conversations
      .filter(
        (conversation) =>
          conversation.status === "pending" &&
          conversation.participantIds.includes(currentUserId ?? -1) &&
          !conversation.participantIds.some((participantId) =>
            isBlockedBetween(state.blocks, currentUserId, participantId)
          )
      )
      .map((conversation) => mapConversationForViewer(conversation, currentUserId));
  }, [state, currentUserId]);

  const notifications = useMemo(() => {
    return state.notifications.filter((notification) => notification.userId === currentUserId);
  }, [state.notifications, currentUserId]);

  const blockedUsers = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return state.blocks
      .filter((entry) => entry.blockerId === currentUserId)
      .map((entry) => {
        const user = state.users.find((candidate) => candidate.id === entry.blockedId);
        return user
          ? {
              user: stripPrivateUserFields(mapUserForViewer(state, currentUserId, user)),
              reason: entry.reason
            }
          : undefined;
      })
      .filter(Boolean) as BlockedUser[];
  }, [state, currentUserId]);

  const mutualConnections = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return state.users
      .filter((user) => user.id !== currentUserId)
      .filter(
        (user) =>
          isAcceptedFollower(state.follows, currentUserId, user.id) &&
          isAcceptedFollower(state.follows, user.id, currentUserId) &&
          !isBlockedBetween(state.blocks, currentUserId, user.id)
      )
      .map((user) => stripPrivateUserFields(mapUserForViewer(state, currentUserId, user)));
  }, [state, currentUserId]);

  const incomingFollowRequests = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return state.follows
      .filter((follow) => follow.followingId === currentUserId && follow.status === "pending")
      .map((follow) => state.users.find((user) => user.id === follow.followerId))
      .filter(Boolean)
      .map((user) => stripPrivateUserFields(mapUserForViewer(state, currentUserId, user as LocalUser)));
  }, [state, currentUserId]);

  const isAuthenticated = Boolean(currentUser);
  const activeAppBackground = currentRawUser?.appTheme.customBackground?.trim()
    ? currentRawUser.appTheme.customBackground
    : findAppTheme(currentRawUser?.appTheme.id).background;

  function resolveRedirect(target: string | undefined, user: User) {
    if (!target || target === "/profile") {
      return `/${user.username}`;
    }

    return target;
  }

  function requireAuth(reason = "Please login or create an account to continue.", redirectPath?: string) {
    if (isAuthenticated) {
      return true;
    }

    setAuthReason(reason);
    setPendingRedirect(redirectPath);
    setIsAuthModalOpen(true);
    return false;
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  function dismissFlashMessage() {
    setFlashMessage(undefined);
  }

  async function login(payload: LoginPayload) {
    const match = state.users.find(
      (user) =>
        user.email.toLowerCase() === payload.identifier.toLowerCase() ||
        user.username.toLowerCase() === payload.identifier.toLowerCase()
    );

    if (!match) {
      throw new Error("We couldn't find an account with that email or username.");
    }

    if (match.password !== payload.password) {
      throw new Error("The password you entered is incorrect.");
    }

    setCurrentUserId(match.id);
    persistAuth(match.id);
    setIsAuthModalOpen(false);
    navigate(resolveRedirect(pendingRedirect, match));
    setPendingRedirect(undefined);
    showFlash("Login successful.");
  }

  async function signup(payload: SignupPayload) {
    if (payload.password !== payload.confirmPassword) {
      throw new Error("Confirm password must match password.");
    }

    const emailExists = state.users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    const phoneExists = state.users.some((user) => user.phone === payload.phone);
    const usernameExists = state.users.some(
      (user) => normalizeUsername(user.username) === normalizeUsername(payload.username)
    );

    if (emailExists && phoneExists) {
      throw new Error("This email and phone number already exist. Please login.");
    }
    if (emailExists) {
      throw new Error("This email already exists. Please login.");
    }
    if (phoneExists) {
      throw new Error("This phone number already exists. Please login.");
    }
    if (usernameExists) {
      throw new Error("Username already taken.");
    }

    const nextUserId = nextNumericId(state.users);
    const nextUser: LocalUser = {
      id: nextUserId,
      fullName: payload.fullName.trim(),
      username: payload.username.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      bio: payload.bio?.trim() || "New to Vibly, collecting beautiful moments.",
      location: "New creator space",
      website: "",
      avatarGradient: "from-indigo-400 via-violet-500 to-pink-400",
      coverGradient: "from-sky-100 via-white to-fuchsia-100",
      followers: 0,
      following: 0,
      postsCount: 0,
      isVerified: false,
      joinedAt: new Date().toISOString(),
      tagline: "Just joined the vibe.",
      isOnline: true,
      password: payload.password,
      profileImage: null,
      bannerImage: null,
      profileType: "public",
      verification: { status: "not_verified" },
      preferences: defaultPreferences(""),
      appTheme: { id: "sky-bloom", customBackground: null, customGradient: null },
      chatTheme: { id: "default-glass", customBackground: null, customGradient: null },
      notificationSettings: { color: "#1d4ed8", audioName: "", audioUrl: null }
    };

    withState((current) => ({
      ...current,
      users: [nextUser, ...current.users]
    }));
    setCurrentUserId(nextUser.id);
    persistAuth(nextUser.id);
    navigate(resolveRedirect(pendingRedirect, nextUser));
    setPendingRedirect(undefined);
    showFlash("Account created successfully.");
  }

  function logout() {
    setCurrentUserId(null);
    persistAuth(null);
    setPendingRedirect(undefined);
    navigate("/");
    showFlash("Logout successful.", "info");
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    const usernameTaken = state.users.some(
      (user) => user.id !== currentRawUser.id && normalizeUsername(user.username) === normalizeUsername(payload.username)
    );
    if (usernameTaken) {
      throw new Error("Username already taken.");
    }

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id
          ? {
              ...user,
              fullName: payload.fullName.trim(),
              username: payload.username.trim(),
              phone: payload.phone.trim(),
              bio: payload.bio.trim(),
              website: payload.website?.trim() ?? "",
              location: payload.location?.trim() || user.location,
              preferences: {
                ...user.preferences,
                currentLocation: payload.location?.trim() || user.preferences.currentLocation
              }
            }
          : user
      )
    }));

    navigate(`/${payload.username.trim()}`);
    showFlash("Updated successfully.");
  }

  async function updateProfileMedia(kind: "profile" | "banner", file: File | null) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    withState((current) => {
      const nextUsers = [...current.users];
      const userIndex = nextUsers.findIndex((user) => user.id === currentRawUser.id);
      if (userIndex === -1) {
        return current;
      }

      if (!file) {
        nextUsers[userIndex] = {
          ...nextUsers[userIndex],
          profileImage: kind === "profile" ? null : nextUsers[userIndex].profileImage,
          bannerImage: kind === "banner" ? null : nextUsers[userIndex].bannerImage
        };
        return { ...current, users: nextUsers };
      }

      return current;
    });

    if (!file) {
      showFlash(kind === "profile" ? "Profile photo removed successfully." : "Banner removed successfully.");
      return;
    }

    validateImageFile(file, kind === "profile" ? uploadRules.avatarMaxBytes : uploadRules.bannerMaxBytes);
    const dataUrl = await readFileAsDataUrl(file);

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id
          ? {
              ...user,
              profileImage: kind === "profile" ? dataUrl : user.profileImage,
              bannerImage: kind === "banner" ? dataUrl : user.bannerImage
            }
          : user
      )
    }));

    showFlash(kind === "profile" ? "Uploaded successfully." : "Updated successfully.");
  }

  async function updateAccountSettings(payload: UpdateAccountSettingsPayload) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    const usernameTaken = state.users.some(
      (user) => user.id !== currentRawUser.id && normalizeUsername(user.username) === normalizeUsername(payload.username)
    );
    if (usernameTaken) {
      throw new Error("Username already taken.");
    }

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id
          ? {
              ...user,
              username: payload.username.trim(),
              profileType: payload.profileType
            }
          : user
      )
    }));

    navigate(`/${payload.username.trim()}`);
    showFlash("Updated successfully.");
  }

  async function updatePreferences(payload: UserPreferences) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id
          ? {
              ...user,
              location: payload.currentLocation || user.location,
              preferences: payload
            }
          : user
      )
    }));
    showFlash("Updated successfully.");
  }

  async function changePassword(payload: ChangePasswordPayload) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }
    if (payload.currentPassword !== currentRawUser.password) {
      throw new Error("Current password is incorrect.");
    }
    if (payload.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }
    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error("Confirm password must match password.");
    }

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id ? { ...user, password: payload.newPassword } : user
      )
    }));
    showFlash("Password changed successfully.");
  }

  async function submitVerification(documentType: VerificationDocumentType, file: File) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    validateVerificationFile(file);
    await readFileAsDataUrl(file);

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id
          ? {
              ...user,
              verification: {
                status: "pending_review",
                documentType,
                documentName: file.name,
                submittedAt: new Date().toISOString()
              }
            }
          : user
      )
    }));
    showFlash("Verification submitted.");
  }

  async function updateAppTheme(themeId: string, customBackground?: string | null) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id
          ? {
              ...user,
              appTheme: {
                id: themeId,
                customBackground: customBackground ?? null,
                customGradient: customBackground ?? null
              }
            }
          : user
      )
    }));
    showFlash("Updated successfully.");
  }

  async function updateGlobalChatTheme(themeId: string, customBackground?: string | null) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id
          ? {
              ...user,
              chatTheme: {
                id: themeId,
                customBackground: customBackground ?? null,
                customGradient: customBackground ?? null
              }
            }
          : user
      )
    }));
    showFlash("Updated successfully.");
  }

  async function updateNotificationSettings(payload: { color: string; audioFile?: File | null }) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    let audioUrl = currentRawUser.notificationSettings.audioUrl ?? null;
    let audioName = currentRawUser.notificationSettings.audioName ?? "";
    if (payload.audioFile) {
      validateAudioFile(payload.audioFile);
      audioUrl = await readFileAsDataUrl(payload.audioFile);
      audioName = payload.audioFile.name;
    }

    withState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === currentRawUser.id
          ? {
              ...user,
              notificationSettings: {
                color: payload.color,
                audioName,
                audioUrl
              }
            }
          : user
      )
    }));
    showFlash("Updated successfully.");
  }

  function toggleLike(postId: number) {
    if (!requireAuth()) {
      return false;
    }

    withState((current) => ({
      ...current,
      posts: current.posts.map((post) => {
        if (post.id !== postId || !currentUserId) {
          return post;
        }

        const liked = post.likedBy.includes(currentUserId);
        return {
          ...post,
          likedBy: liked ? post.likedBy.filter((id) => id !== currentUserId) : [...post.likedBy, currentUserId],
          likes: liked ? post.likes - 1 : post.likes + 1
        };
      })
    }));
    return true;
  }

  function toggleSave(postId: number) {
    if (!requireAuth()) {
      return false;
    }

    withState((current) => ({
      ...current,
      posts: current.posts.map((post) => {
        if (post.id !== postId || !currentUserId) {
          return post;
        }

        const saved = post.savedBy.includes(currentUserId);
        return {
          ...post,
          savedBy: saved ? post.savedBy.filter((id) => id !== currentUserId) : [...post.savedBy, currentUserId]
        };
      })
    }));
    showFlash("Updated successfully.");
    return true;
  }

  function addComment(postId: number, text: string) {
    if (!requireAuth()) {
      return false;
    }

    if (!currentUserId || !text.trim()) {
      return false;
    }

    withState((current) => ({
      ...current,
      posts: current.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now(),
                  userId: currentUserId,
                  text: text.trim(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]
            }
          : post
      )
    }));
    showFlash("Updated successfully.");
    return true;
  }

  function toggleFollow(userId: number) {
    if (!requireAuth("Please login or create an account to follow people.", `/${state.users.find((user) => user.id === userId)?.username ?? ""}`)) {
      return false;
    }
    if (!currentRawUser || currentRawUser.id === userId || isBlockedBetween(state.blocks, currentRawUser.id, userId)) {
      return false;
    }

    const target = state.users.find((user) => user.id === userId);
    if (!target) {
      return false;
    }

    const existing = getFollowRequest(state.follows, currentRawUser.id, userId);
    withState((current) => {
      let nextFollows = [...current.follows];
      let nextUsers = [...current.users];
      const currentIndex = nextUsers.findIndex((user) => user.id === currentRawUser.id);
      const targetIndex = nextUsers.findIndex((user) => user.id === userId);

      if (currentIndex === -1 || targetIndex === -1) {
        return current;
      }

      if (existing?.status === "accepted") {
        nextFollows = nextFollows.filter(
          (follow) => !(follow.followerId === currentRawUser.id && follow.followingId === userId)
        );
        nextUsers[currentIndex] = { ...nextUsers[currentIndex], following: Math.max(0, nextUsers[currentIndex].following - 1) };
        nextUsers[targetIndex] = { ...nextUsers[targetIndex], followers: Math.max(0, nextUsers[targetIndex].followers - 1) };
      } else if (existing?.status === "pending") {
        nextFollows = nextFollows.filter(
          (follow) => !(follow.followerId === currentRawUser.id && follow.followingId === userId)
        );
      } else {
        nextFollows.push({
          followerId: currentRawUser.id,
          followingId: userId,
          status: target.profileType === "private" ? "pending" : "accepted"
        });
        if (target.profileType === "public") {
          nextUsers[currentIndex] = { ...nextUsers[currentIndex], following: nextUsers[currentIndex].following + 1 };
          nextUsers[targetIndex] = { ...nextUsers[targetIndex], followers: nextUsers[targetIndex].followers + 1 };
        }
      }

      return {
        ...current,
        users: nextUsers,
        follows: nextFollows,
        notifications:
          !existing
            ? [
                {
                  id: nextNumericId(current.notifications),
                  userId,
                  actorId: currentRawUser.id,
                  type: "follow",
                  text: target.profileType === "private" ? "sent you a follow request." : "started following you.",
                  createdAt: new Date().toISOString(),
                  isRead: false
                },
                ...current.notifications
              ]
            : current.notifications
      };
    });

    showFlash(target.profileType === "private" && !existing ? "Follow request sent." : "Updated successfully.");
    return true;
  }

  function respondToFollowRequest(userId: number, accept: boolean) {
    if (!currentRawUser) {
      return;
    }

    withState((current) => {
      const request = current.follows.find(
        (follow) => follow.followerId === userId && follow.followingId === currentRawUser.id && follow.status === "pending"
      );
      if (!request) {
        return current;
      }

      const nextUsers = [...current.users];
      const ownerIndex = nextUsers.findIndex((user) => user.id === currentRawUser.id);
      const followerIndex = nextUsers.findIndex((user) => user.id === userId);
      let nextFollows = [...current.follows];

      if (accept) {
        nextFollows = nextFollows.map((follow) =>
          follow === request ? { ...follow, status: "accepted" } : follow
        );
        if (ownerIndex !== -1) {
          nextUsers[ownerIndex] = { ...nextUsers[ownerIndex], followers: nextUsers[ownerIndex].followers + 1 };
        }
        if (followerIndex !== -1) {
          nextUsers[followerIndex] = { ...nextUsers[followerIndex], following: nextUsers[followerIndex].following + 1 };
        }
      } else {
        nextFollows = nextFollows.filter((follow) => follow !== request);
      }

      return {
        ...current,
        users: nextUsers,
        follows: nextFollows
      };
    });

    showFlash(accept ? "Updated successfully." : "Follow request rejected.", accept ? "success" : "info");
  }

  async function createPost(payload: CreatePostPayload) {
    if (!requireAuth("Please login or create an account to upload a post.", "/create")) {
      return false;
    }
    if (!currentRawUser) {
      return false;
    }

    if (payload.mediaType === "image") {
      validateImageFile(payload.file, uploadRules.postMaxBytes);
    } else {
      validateVideoFile(payload.file, uploadRules.postMaxBytes);
    }

    const mediaUrl = await readFileAsDataUrl(payload.file);
    const durationSeconds = payload.mediaType === "video" ? await readVideoDuration(payload.file) : undefined;
    const thumbnailUrl =
      payload.mediaType === "video"
        ? payload.thumbnailFile
          ? await readFileAsDataUrl(payload.thumbnailFile)
          : (await buildVideoThumbnail(payload.file)).thumbnailUrl
        : null;

    if (payload.thumbnailFile) {
      validateImageFile(payload.thumbnailFile, uploadRules.avatarMaxBytes);
    }

    const now = new Date().toISOString();
    const nextPost: LocalPost = {
      id: nextNumericId(state.posts),
      userId: currentRawUser.id,
      title: payload.title.trim() || payload.file.name,
      location: payload.location?.trim() || "",
      caption: payload.caption.trim(),
      mediaType: payload.mediaType,
      mediaGradient: createMediaGradient(payload.mediaType, payload.title),
      mediaLabel: payload.title.trim() || payload.file.name,
      mediaUrl,
      mediaName: payload.file.name,
      mediaSizeBytes: payload.file.size,
      mediaSizeLabel: formatBytes(payload.file.size),
      durationSeconds,
      durationLabel: durationSeconds ? formatDuration(durationSeconds) : "",
      thumbnailUrl,
      visibility: payload.visibility,
      likes: 0,
      likedByUser: false,
      savedByUser: false,
      createdAt: now,
      updatedAt: now,
      comments: [],
      likedBy: [],
      savedBy: []
    };

    withState((current) => ({
      ...current,
      posts: [nextPost, ...current.posts],
      users: current.users.map((user) =>
        user.id === currentRawUser.id ? { ...user, postsCount: user.postsCount + 1 } : user
      )
    }));
    showFlash("Uploaded successfully.");
    return true;
  }

  async function updatePost(postId: number, payload: UpdatePostPayload) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    const existing = state.posts.find((post) => post.id === postId);
    if (!existing || existing.userId !== currentRawUser.id) {
      throw new Error("You can only manage your own post.");
    }

    let mediaUrl = existing.mediaUrl;
    let mediaName = existing.mediaName;
    let mediaSizeBytes = existing.mediaSizeBytes;
    let mediaSizeLabel = existing.mediaSizeLabel;
    let durationSeconds = existing.durationSeconds;
    let durationLabel = existing.durationLabel;
    let thumbnailUrl = existing.thumbnailUrl;
    let mediaType = existing.mediaType;

    if (payload.file) {
      mediaType = payload.file.type.startsWith("video/") ? "video" : "image";
      if (mediaType === "image") {
        validateImageFile(payload.file, uploadRules.postMaxBytes);
      } else {
        validateVideoFile(payload.file, uploadRules.postMaxBytes);
      }
      mediaUrl = await readFileAsDataUrl(payload.file);
      mediaName = payload.file.name;
      mediaSizeBytes = payload.file.size;
      mediaSizeLabel = formatBytes(payload.file.size);
      if (mediaType === "video") {
        durationSeconds = await readVideoDuration(payload.file);
        durationLabel = formatDuration(durationSeconds);
        thumbnailUrl = payload.thumbnailFile
          ? await readFileAsDataUrl(payload.thumbnailFile)
          : (await buildVideoThumbnail(payload.file)).thumbnailUrl;
      } else {
        durationSeconds = undefined;
        durationLabel = "";
        thumbnailUrl = null;
      }
    } else if (payload.thumbnailFile) {
      validateImageFile(payload.thumbnailFile, uploadRules.avatarMaxBytes);
      thumbnailUrl = await readFileAsDataUrl(payload.thumbnailFile);
    }

    withState((current) => ({
      ...current,
      posts: current.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              title: payload.title.trim(),
              mediaLabel: payload.title.trim() || post.mediaLabel,
              caption: payload.caption.trim(),
              location: payload.location?.trim() || "",
              visibility: payload.visibility,
              mediaType,
              mediaGradient: createMediaGradient(mediaType, payload.title),
              mediaUrl,
              mediaName,
              mediaSizeBytes,
              mediaSizeLabel,
              durationSeconds,
              durationLabel,
              thumbnailUrl,
              updatedAt: new Date().toISOString()
            }
          : post
      )
    }));

    showFlash("Updated successfully.");
  }

  function deletePost(postId: number) {
    if (!currentRawUser) {
      return;
    }

    const existing = state.posts.find((post) => post.id === postId);
    if (!existing || existing.userId !== currentRawUser.id) {
      showFlash("You can only manage your own post.", "error");
      return;
    }

    withState((current) => ({
      ...current,
      posts: current.posts.filter((post) => post.id !== postId),
      users: current.users.map((user) =>
        user.id === currentRawUser.id ? { ...user, postsCount: Math.max(0, user.postsCount - 1) } : user
      )
    }));
    showFlash("Deleted successfully.");
  }

  async function createReel(payload: CreateReelPayload) {
    if (!requireAuth("Please login or create an account to upload a reel.", "/create")) {
      return false;
    }
    if (!currentRawUser) {
      return false;
    }

    validateVideoFile(payload.file, uploadRules.reelMaxBytes);
    const durationSeconds = await readVideoDuration(payload.file);
    if (durationSeconds > uploadRules.reelMaxDurationSeconds) {
      throw new Error("Reel must be 3 minutes or less.");
    }

    const videoUrl = await readFileAsDataUrl(payload.file);
    const thumbnailUrl = payload.thumbnailFile
      ? await readFileAsDataUrl(payload.thumbnailFile)
      : (await buildVideoThumbnail(payload.file)).thumbnailUrl;

    if (payload.thumbnailFile) {
      validateImageFile(payload.thumbnailFile, uploadRules.avatarMaxBytes);
    }

    const nextReel: LocalReel = {
      id: nextNumericId(state.reels),
      userId: currentRawUser.id,
      title: payload.title.trim() || payload.file.name,
      caption: payload.caption.trim(),
      audioName: payload.file.name,
      mediaGradient: createMediaGradient("video", payload.title),
      likes: 0,
      comments: 0,
      shares: 0,
      videoUrl,
      thumbnailUrl,
      mediaName: payload.file.name,
      mediaSizeBytes: payload.file.size,
      mediaSizeLabel: formatBytes(payload.file.size),
      location: payload.location?.trim() || "",
      visibility: payload.visibility,
      durationSeconds,
      durationLabel: formatDuration(durationSeconds),
      likedBy: [],
      savedBy: []
    };

    withState((current) => ({
      ...current,
      reels: [nextReel, ...current.reels]
    }));
    showFlash("Uploaded successfully.");
    return true;
  }

  async function updateReel(reelId: number, payload: UpdateReelPayload) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    const existing = state.reels.find((reel) => reel.id === reelId);
    if (!existing || existing.userId !== currentRawUser.id) {
      throw new Error("You can only manage your own reel.");
    }

    let videoUrl = existing.videoUrl;
    let thumbnailUrl = existing.thumbnailUrl;
    let mediaName = existing.mediaName;
    let mediaSizeBytes = existing.mediaSizeBytes;
    let mediaSizeLabel = existing.mediaSizeLabel;
    let durationSeconds = existing.durationSeconds;
    let durationLabel = existing.durationLabel;

    if (payload.file) {
      validateVideoFile(payload.file, uploadRules.reelMaxBytes);
      durationSeconds = await readVideoDuration(payload.file);
      if (durationSeconds > uploadRules.reelMaxDurationSeconds) {
        throw new Error("Reel must be 3 minutes or less.");
      }
      videoUrl = await readFileAsDataUrl(payload.file);
      mediaName = payload.file.name;
      mediaSizeBytes = payload.file.size;
      mediaSizeLabel = formatBytes(payload.file.size);
      thumbnailUrl = payload.thumbnailFile
        ? await readFileAsDataUrl(payload.thumbnailFile)
        : (await buildVideoThumbnail(payload.file)).thumbnailUrl;
      durationLabel = formatDuration(durationSeconds);
    } else if (payload.thumbnailFile) {
      validateImageFile(payload.thumbnailFile, uploadRules.avatarMaxBytes);
      thumbnailUrl = await readFileAsDataUrl(payload.thumbnailFile);
    }

    withState((current) => ({
      ...current,
      reels: current.reels.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              title: payload.title.trim(),
              caption: payload.caption.trim(),
              location: payload.location?.trim() || "",
              visibility: payload.visibility,
              videoUrl,
              thumbnailUrl,
              mediaName,
              mediaSizeBytes,
              mediaSizeLabel,
              durationSeconds,
              durationLabel
            }
          : reel
      )
    }));
    showFlash("Updated successfully.");
  }

  function deleteReel(reelId: number) {
    if (!currentRawUser) {
      return;
    }

    const existing = state.reels.find((reel) => reel.id === reelId);
    if (!existing || existing.userId !== currentRawUser.id) {
      showFlash("You can only manage your own reel.", "error");
      return;
    }

    withState((current) => ({
      ...current,
      reels: current.reels.filter((reel) => reel.id !== reelId)
    }));
    showFlash("Deleted successfully.");
  }

  async function sendMessage(payload: {
    conversationId?: number;
    recipientId?: number;
    text: string;
    file?: File | null;
  }) {
    if (!requireAuth("Please login or create an account to send messages.", "/messages")) {
      return { success: false };
    }
    if (!currentRawUser) {
      return { success: false };
    }

    const text = payload.text.trim();
    if (!text && !payload.file) {
      return { success: false };
    }

    let mediaUrl: string | null = null;
    let mediaType: "image" | "video" | null = null;
    if (payload.file) {
      if (payload.file.type.startsWith("image/")) {
        validateImageFile(payload.file, uploadRules.postMaxBytes);
        mediaType = "image";
      } else {
        validateVideoFile(payload.file, uploadRules.postMaxBytes);
        mediaType = "video";
      }
      mediaUrl = await readFileAsDataUrl(payload.file);
    }

    const existingConversation =
      payload.conversationId
        ? state.conversations.find((conversation) => conversation.id === payload.conversationId)
        : payload.recipientId
          ? state.conversations.find(
              (conversation) =>
                conversation.participantIds.includes(currentRawUser.id) &&
                conversation.participantIds.includes(payload.recipientId!) &&
                conversation.participantIds.length === 2
            )
          : undefined;

    const recipientId =
      payload.recipientId ??
      existingConversation?.participantIds.find((participantId) => participantId !== currentRawUser.id);

    if (!recipientId || isBlockedBetween(state.blocks, currentRawUser.id, recipientId)) {
      showFlash("You cannot message this user.", "error");
      return { success: false };
    }

    if (existingConversation?.status === "pending" && existingConversation.requestSenderId === currentRawUser.id) {
      showFlash("Message request sent.", "info");
      return { success: true, conversationId: existingConversation.id };
    }

    const now = new Date().toISOString();
    const nextMessage: ConversationMessage = {
      id: Date.now(),
      senderId: currentRawUser.id,
      text,
      createdAt: now,
      mediaUrl,
      mediaType,
      status: "delivered"
    };

    let nextConversationId = existingConversation?.id ?? Date.now();
    withState((current) => {
      const activeExisting =
        existingConversation &&
        current.conversations.find((conversation) => conversation.id === existingConversation.id);

      if (activeExisting) {
        return {
          ...current,
          conversations: current.conversations.map((conversation) =>
            conversation.id === activeExisting.id
              ? {
                  ...conversation,
                  lastMessage: text || mediaType === "image" ? "Image" : "Video",
                  updatedAt: now,
                  messages: [...conversation.messages, nextMessage]
                }
              : conversation
          ),
          notifications: [
            {
              id: nextNumericId(current.notifications),
              userId: recipientId,
              actorId: currentRawUser.id,
              type: "message",
              text: existingConversation.status === "pending" ? "sent you a message request." : "sent you a new message.",
              createdAt: now,
              isRead: false
            },
            ...current.notifications
          ]
        };
      }

      const nextConversation: LocalConversation = {
        id: nextConversationId,
        participantIds: [currentRawUser.id, recipientId],
        lastMessage: text || (mediaType === "image" ? "Image" : "Video"),
        updatedAt: now,
        messages: [nextMessage],
        status: "pending",
        requestSenderId: currentRawUser.id,
        themeId: currentRawUser.chatTheme.id,
        customThemeUrl: currentRawUser.chatTheme.customBackground ?? null
      };

      return {
        ...current,
        conversations: [nextConversation, ...current.conversations],
        notifications: [
          {
            id: nextNumericId(current.notifications),
            userId: recipientId,
            actorId: currentRawUser.id,
            type: "message",
            text: "sent you a message request.",
            createdAt: now,
            isRead: false
          },
          ...current.notifications
        ]
      };
    });

    if (existingConversation?.status === "active") {
      showFlash("Message sent.");
    } else if (existingConversation?.status === "pending") {
      showFlash("Message request sent.");
    } else {
      showFlash("Message request sent.");
    }

    return { success: true, conversationId: nextConversationId };
  }

  function respondToMessageRequest(conversationId: number, accept: boolean) {
    if (!currentRawUser) {
      return;
    }

    withState((current) => ({
      ...current,
      conversations: current.conversations
        .map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                status: (accept ? "active" : "rejected") as ConversationStatus
              }
            : conversation
        )
        .filter((conversation) => conversation.status !== "rejected")
    }));

    showFlash(accept ? "Message request accepted." : "Message request rejected.", accept ? "success" : "info");
  }

  function markConversationSeen(conversationId: number) {
    if (!currentRawUser) {
      return;
    }

    withState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.senderId !== currentRawUser.id ? { ...message, status: "seen" } : message
              )
            }
          : conversation
      )
    }));
  }

  async function setConversationTheme(conversationId: number, themeId: string, customBackground?: string | null) {
    if (!currentRawUser) {
      throw new Error("You need to login first.");
    }

    withState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              themeId,
              customThemeUrl: customBackground ?? null
            }
          : conversation
      )
    }));
    showFlash("Updated successfully.");
  }

  function setNickname(userId: number, nickname: string) {
    if (!currentRawUser) {
      return;
    }

    withState((current) => {
      const existing = current.nicknames.find(
        (entry) => entry.ownerId === currentRawUser.id && entry.targetUserId === userId
      );
      const nextNicknames = existing
        ? current.nicknames.map((entry) =>
            entry === existing ? { ...entry, nickname: nickname.trim() } : entry
          )
        : [...current.nicknames, { ownerId: currentRawUser.id, targetUserId: userId, nickname: nickname.trim() }];

      return {
        ...current,
        nicknames: nickname.trim()
          ? nextNicknames
          : current.nicknames.filter(
              (entry) => !(entry.ownerId === currentRawUser.id && entry.targetUserId === userId)
            )
      };
    });
    showFlash("Updated successfully.");
  }

  function blockUser(userId: number, reason?: string) {
    if (!currentRawUser || currentRawUser.id === userId) {
      return;
    }

    withState((current) => {
      const alreadyBlocked = current.blocks.some(
        (entry) => entry.blockerId === currentRawUser.id && entry.blockedId === userId
      );
      if (alreadyBlocked) {
        return current;
      }

      const nextUsers = current.users.map((user) => {
        if (user.id === currentRawUser.id) {
          return {
            ...user,
            following: Math.max(
              0,
              user.following -
                current.follows.filter(
                  (follow) =>
                    follow.followerId === currentRawUser.id &&
                    follow.followingId === userId &&
                    follow.status === "accepted"
                ).length
            )
          };
        }
        if (user.id === userId) {
          return {
            ...user,
            followers: Math.max(
              0,
              user.followers -
                current.follows.filter(
                  (follow) =>
                    follow.followerId === currentRawUser.id &&
                    follow.followingId === userId &&
                    follow.status === "accepted"
                ).length
            )
          };
        }
        return user;
      });

      return {
        ...current,
        users: nextUsers,
        follows: current.follows.filter(
          (follow) =>
            !(
              (follow.followerId === currentRawUser.id && follow.followingId === userId) ||
              (follow.followerId === userId && follow.followingId === currentRawUser.id)
            )
        ),
        conversations: current.conversations.filter(
          (conversation) =>
            !(conversation.participantIds.includes(currentRawUser.id) && conversation.participantIds.includes(userId))
        ),
        blocks: [
          {
            blockerId: currentRawUser.id,
            blockedId: userId,
            reason: reason?.trim() || "",
            createdAt: new Date().toISOString()
          },
          ...current.blocks
        ]
      };
    });

    showFlash("User blocked successfully.");
  }

  function unblockUser(userId: number) {
    if (!currentRawUser) {
      return;
    }

    withState((current) => ({
      ...current,
      blocks: current.blocks.filter(
        (entry) => !(entry.blockerId === currentRawUser.id && entry.blockedId === userId)
      )
    }));
    showFlash("User unblocked successfully.");
  }

  function findUserByUsername(username?: string) {
    if (!username) {
      return undefined;
    }

    const match = state.users.find((user) => user.username === username);
    return match ? stripPrivateUserFields(mapUserForViewer(state, currentUserId, match)) : undefined;
  }

  function getConversationWithUser(userId: number) {
    if (!currentRawUser) {
      return undefined;
    }

    const match = state.conversations.find(
      (conversation) =>
        conversation.participantIds.includes(currentRawUser.id) &&
        conversation.participantIds.includes(userId) &&
        conversation.participantIds.length === 2
    );
    return match ? mapConversationForViewer(match, currentUserId) : undefined;
  }

  const value = {
    currentUser,
    users,
    posts,
    stories: state.stories,
    reels,
    notifications,
    conversations,
    messageRequests,
    blockedUsers,
    mutualConnections,
    incomingFollowRequests,
    isAuthenticated,
    isAuthModalOpen,
    authReason,
    flashMessage,
    activeAppBackground,
    login,
    signup,
    logout,
    requireAuth,
    closeAuthModal,
    dismissFlashMessage,
    updateProfile,
    updateProfileMedia,
    updateAccountSettings,
    updatePreferences,
    changePassword,
    submitVerification,
    updateAppTheme,
    updateGlobalChatTheme,
    updateNotificationSettings,
    toggleLike,
    toggleSave,
    addComment,
    toggleFollow,
    respondToFollowRequest,
    createPost,
    updatePost,
    deletePost,
    createReel,
    updateReel,
    deleteReel,
    sendMessage,
    respondToMessageRequest,
    markConversationSeen,
    setConversationTheme,
    setNickname,
    blockUser,
    unblockUser,
    findUserByUsername,
    getConversationWithUser
  } satisfies AuthContextValue;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function mapUserForViewer(state: SocialState, viewerId: number | null, user: LocalUser): User {
  const acceptedFollow = isAcceptedFollower(state.follows, viewerId, user.id);
  const requestedFollow = getFollowRequest(state.follows, viewerId, user.id)?.status === "pending";
  const followsYou = isAcceptedFollower(state.follows, user.id, viewerId);
  const canViewFullProfile = canViewUserProfile(state, viewerId, user);
  const mutualConnectionsCount = viewerId
    ? state.users.filter(
        (candidate) =>
          candidate.id !== viewerId &&
          candidate.id !== user.id &&
          isAcceptedFollower(state.follows, viewerId, candidate.id) &&
          isAcceptedFollower(state.follows, candidate.id, viewerId) &&
          isAcceptedFollower(state.follows, user.id, candidate.id) &&
          isAcceptedFollower(state.follows, candidate.id, user.id)
      ).length
    : 0;
  const nickname = state.nicknames.find(
    (entry) => entry.ownerId === viewerId && entry.targetUserId === user.id
  )?.nickname;

  return {
    ...user,
    profileType: user.profileType,
    nickname,
    isFollowing: acceptedFollow,
    hasRequestedFollow: requestedFollow,
    followsYou,
    canViewFullProfile,
    canMessage: Boolean(viewerId && viewerId !== user.id && !isBlockedBetween(state.blocks, viewerId, user.id)),
    mutualConnectionsCount
  };
}

function mapPostForViewer(post: LocalPost, viewerId: number | null): Post {
  return {
    ...post,
    likedByUser: viewerId ? post.likedBy.includes(viewerId) : false,
    savedByUser: viewerId ? post.savedBy.includes(viewerId) : false,
    isOwn: viewerId === post.userId
  };
}

function mapReelForViewer(reel: LocalReel, viewerId: number | null): Reel {
  return {
    ...reel,
    isOwn: viewerId === reel.userId
  };
}

function mapConversationForViewer(conversation: LocalConversation, viewerId: number | null): Conversation {
  return {
    ...conversation,
    messages: conversation.messages.map((message) => ({
      ...message,
      status: message.senderId === viewerId ? message.status ?? "delivered" : message.status ?? "seen"
    })),
    unreadCount: conversation.messages.filter(
      (message) => message.senderId !== viewerId && message.status !== "seen"
    ).length
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
