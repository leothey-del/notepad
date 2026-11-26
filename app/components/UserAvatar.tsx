"use client";

type UserAvatarProps = {
  username: string;
  imageUrl?: string | null;
};

export default function UserAvatar({ username, imageUrl }: UserAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={username}
        title={username}
        className="h-8 w-8 rounded-full border border-gray-900 object-cover"
      />
    );
  }

  return (
    <div
      title={username}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-medium uppercase text-white"
    >
      {username.charAt(0)}
    </div>
  );
}