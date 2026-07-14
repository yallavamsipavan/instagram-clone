
// Auth

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    userId: number;
    username: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    fullName?: string;
}

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

// User

export interface UserProfile {
    id: number;
    username: string;
    fullName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isPrivate: boolean;
    followersCount: number;
    followingCount: number;
    postsCount: number;
}

export interface UpdateProfileRequest {
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
}

// Follow

export interface FollowResponse {
    userId: number;
    username: string;
    avatarUrl: string | null;
    status: 'PENDING' | 'ACCEPTED' | 'NOT_FOLLOWING' | 'SELF';
}

// Post

export interface Post {
    id: number;
    userId: number;
    username: string;
    userAvatarUrl: string | null;
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    caption: string | null;
    likesCount: number;
    commentsCount: number;
    likedByCurrentUser: boolean;
    createdAt: string;
}

// Comment

export interface Comment {
    id: number;
    postId: number;
    userId: number;
    username: string;
    userAvatarUrl: string | null;
    content: string;
    parentCommentId: number | null;
    likesCount: number;
    repliesCount: number;
    likedByCurrentUser: boolean;
    createdAt: string;
}

export interface CommentRequest {
    content: string;
    parentCommentId?: number;
}

// Notification

export interface Notification {
    id: number;
    type: 'FOLLOW_REQUEST' | 'FOLLOW_ACCEPTED' | 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT';
    actorId: number;
    actorUsername: string;
    actorAvatarUrl: string | null;
    entityId: number | null;
    isRead: boolean;
    createdAt: string;
}

// Message

export interface Message {
    id: number;
    senderId: number;
    senderUsername: string;
    receiverId: number;
    receiverUsername: string;
    content: string | null;
    messageType: 'TEXT' | 'POST_SHARE';
    sharedPostId: number | null;
    sharedPostMediaUrl: string | null;
    isRead: boolean;
    isDeleted: boolean;
    editedAt: string | null;
    createdAt: string;
}

export interface SendMessageRequest {
    content?: string;
    sharedPostId?: number;
}

export interface ConversationPreview {
    otherUserId: number;
    otherUsername: string;
    otherUserAvatarUrl: string | null;
    lastMessagePreview: string;
    lastMessageAt: string;
    lastMessageReadByMe: boolean;
}

// Generic paginated response (matches Spring's Page<T>)

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

// Generic error response (matches your GlobalExceptionHandler)

export interface ApiErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    details: string[] | null;
}