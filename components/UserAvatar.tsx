import { Avatar, AvatarProps } from "@mui/material";

type User = { name?: string | null; image?: string | null };

type Props = {
  user: User;
} & AvatarProps;

export function getUserAvatarProps(user: User) {
  const hue =
    [...(user.name ?? "")]
      .map((c, i) => c.charCodeAt(0) * 3546 * i)
      .reduce((a, c) => a + c, 0) % 360;

  return {
    src: user.image ?? undefined,
    style: { backgroundColor: `hsl(${hue}, 50%, 50%)` },
    alt: "",
    children:
      user.name
        ?.split(" ")
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("") ?? "👤",
  };
}

export function UserAvatar({ user, ...rest }: Props) {
  return <Avatar {...getUserAvatarProps(user)} {...rest} />;
}
