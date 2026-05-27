export type DatabaseJson = Record<string, unknown>;

export type GoalStatus =
  | "bulking"
  | "cutting"
  | "maintenance"
  | "recomp"
  | "other";
export type GenderKind =
  | "male"
  | "female"
  | "non_binary"
  | "other"
  | "prefer_not_to_say";
export type PartyMemberRole = "owner" | "admin" | "member";
export type PartyMemberStatus = "active" | "pending" | "blocked" | "left";
export type PostReactionKind = "like" | "dislike";
export type MemberRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ProfileRow = {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  nickname: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  gender: GenderKind | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  biceps_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  thigh_cm: number | null;
  neck_cm: number | null;
  goal_status: GoalStatus | null;
  streak_days: number;
  last_checkin_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PartyRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  theme_background_color: string;
  post_card_color: string;
  is_private: boolean;
  invite_code: string;
  created_at: string;
  updated_at: string;
};

export type PartyMemberRow = {
  id: string;
  party_id: string;
  user_id: string;
  role: PartyMemberRole;
  status: PartyMemberStatus;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PartyFavoriteRow = {
  id: string;
  party_id: string;
  user_id: string;
  created_at: string;
};

export type PostRow = {
  id: string;
  party_id: string;
  author_id: string;
  text_content: string | null;
  image_url: string | null;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PostReactionRow = {
  id: string;
  post_id: string;
  user_id: string;
  reaction: PostReactionKind;
  created_at: string;
  updated_at: string;
};

export type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CheckinRow = {
  id: string;
  user_id: string;
  checkin_date: string;
  note: string | null;
  created_at: string;
};

export type PartyJoinRequestRow = {
  id: string;
  party_id: string;
  user_id: string;
  invite_code: string | null;
  status: MemberRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};
