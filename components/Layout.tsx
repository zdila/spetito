import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
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
import MenuIcon from "@mui/icons-material/Menu";

type Props = { title: string; children: ReactNode };

const drawerWidth = 240;

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

  const drawer = (
    <>
      <Toolbar>
        <Logo />
      </Toolbar>

      <List sx={{ p: 0 }}>
        {menu.map((item) => (
          <ListItem key={item.path} disablePadding>
            <Link href={item.path} passHref>
              <ListItemButton component="a" selected={pathname === item.path}>
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
    </>
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", marginX: "auto", maxWidth: "1000px" }}>
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

      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { xs: "block", sm: "none" },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          <Box
            sx={{ opacity: mobileOpen ? 0 : 1, transition: "opacity 250ms" }}
          >
            <Logo />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={
            typeof document === "undefined" ? undefined : document.body
          }
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={[
            {
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                backgroundColor: "inherit",
                border: 0,
              },
            },
            (theme) => ({
              "@media (min-width: 1000px)": {
                "& .MuiDrawer-paper": {
                  left: "calc(100vw / 2 - 500px)", // hacking position because of opsition: fixed
                },
              },
            }),
          ]}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 3,
          pb: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ display: { xs: "block", sm: "none" } }} />

        {children}
      </Box>
    </Box>
  );
}
