import { Avatar } from "@mui/material";
import { User } from "@prisma/client";

type Props = { user: { name?: string | null; image?: string | null } };

export function UserAvatar({ user }: Props) {
  const hue =
    [...(user.name ?? "")]
      .map((c, i) => c.charCodeAt(0) * 3546 * i)
      .reduce((a, c) => a + c, 0) % 360;

  return (
    <Avatar
      src={user.image ?? undefined}
      alt=""
      style={{ backgroundColor: `hsl(${hue}, 50%, 50%)` }}
    >
      {user.name
        ?.split(" ")
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("") ?? "👤"}
    </Avatar>
  );
}
