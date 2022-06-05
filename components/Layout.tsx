import {
  Alert,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { usePermission } from "../hooks/usePermission";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ListIcon from "@mui/icons-material/List";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { supportsPush } from "../lib/capabilities";
import { useTranslation } from "next-i18next";
import { set } from "idb-keyval";
import { Logo } from "./Logo";
import MenuBookIcon from "@mui/icons-material/MenuBook";

type Props = { title: string; children: ReactNode };

function toBase64(arrayBuffer: ArrayBuffer | null) {
  return (
    arrayBuffer &&
    btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer) as any))
    // .replace(/\+/g, "-")
    // .replace(/\//g, "_")
    // .replace(/=+$/, "")
  );
}

const menu = [
  {
    path: "/",
    Icon: LocalActivityIcon,
    nameKey: "Offers",
  },
  {
    path: "/friends",
    Icon: PersonIcon,
    nameKey: "Friends",
  },
  {
    path: "/lists",
    Icon: ListIcon,
    nameKey: "Lists",
  },
  {
    path: "/settings",
    Icon: SettingsIcon,
    nameKey: "Settings",
  },
  {
    path: "/support",
    Icon: MenuBookIcon,
    nameKey: "Support",
  },
];

export function Layout({ children, title }: Props) {
  const { pathname } = useRouter();

  const notifPerm = usePermission("notifications");

  const pushPerm = usePermission("push");

  const { t } = useTranslation("common");

  const registerServiceWorkerAndSubscribeToPush = useCallback(async () => {
    navigator.serviceWorker.register("/sw.js"); // no need to await

    const swr = await navigator.serviceWorker.ready;

    set("notifTranslations", t("notifTranslations", { returnObjects: true }));

    const subscription = await swr.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBKEY,
    });

    await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        auth: toBase64(subscription.getKey("auth")),
        p256dh: toBase64(subscription.getKey("p256dh")),
      }),
    });
  }, [t]);

  useEffect(() => {
    if (supportsPush && notifPerm === "granted" && pushPerm === "granted") {
      registerServiceWorkerAndSubscribeToPush();
    }
  }, [notifPerm, pushPerm, registerServiceWorkerAndSubscribeToPush]);

  const handleRegisterClick = () => {
    Notification.requestPermission();
  };

  const handleLogOutClick = async () => {
    const swr = await navigator.serviceWorker.getRegistration();

    const sub = await swr?.pushManager.getSubscription();

    if (sub?.endpoint) {
      await fetch("/api/push/" + encodeURIComponent(sub.endpoint), {
        method: "DELETE",
      });
    }

    signOut();
  };

  const [supportsPush1, setSupportsPush1] = useState(true);

  // for SSR
  useEffect(() => {
    setSupportsPush1(supportsPush);
  }, []);

  return (
    <Container>
      <Head>
        <title>{title} | Offerbook</title>
      </Head>

      {!supportsPush1 ? (
        <Alert sx={{ mt: 2 }} severity="error">
          {t("PushNotifUnsupported")}
        </Alert>
      ) : notifPerm === "prompt" ? (
        <Alert
          sx={{ mt: 2 }}
          severity="warning"
          action={
            <Button onClick={handleRegisterClick} color="inherit" size="small">
              {t("EnableNotifications")}
            </Button>
          }
        >
          {t("NotificationsNotEnabled")}
        </Alert>
      ) : (
        notifPerm === "denied" && (
          <Alert sx={{ mt: 2 }} severity="error">
            {t("NotificationsDenied")}
          </Alert>
        )
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={3} lg={2}>
          <Logo />

          <List>
            {menu.map((item) => (
              <ListItem key={item.path} disablePadding>
                <Link href={item.path} passHref>
                  <ListItemButton
                    component="a"
                    selected={pathname === item.path}
                  >
                    <ListItemIcon>
                      <item.Icon />
                    </ListItemIcon>

                    <ListItemText>{t(item.nameKey)}</ListItemText>
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogOutClick}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>

                <ListItemText>{t("LogOut")}</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        </Grid>

        <Grid item xs={12} sm={8} md={9} lg={10}>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            {title}
          </Typography>

          {children}
        </Grid>
      </Grid>
    </Container>
  );
}
