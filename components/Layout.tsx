import {
  Alert,
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { usePermission } from "../hooks/usePermission";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ListIcon from "@mui/icons-material/List";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { supportsPush } from "../lib/capabilities";
import { useTranslation } from "next-i18next";
import { Logo } from "./Logo";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MenuIcon from "@mui/icons-material/Menu";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { usePushNotificationRegistration } from "../lib/pushRegistration";
import { getCookie } from "../lib/cookies";
import { useFetchFailHandler } from "../hooks/useFetchFailHandler";

type Props = {
  title: string;
  children: ReactNode;
};

const drawerWidth = 200;

const menuItems: {
  path: string;
  altPaths?: string[];
  Icon: OverridableComponent<any>;
  nameKey: string;
}[] = [
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
    altPaths: ["/privacy-policy", "/terms-and-conditions"],
  },
];

export function Layout({ children, title }: Props) {
  const { pathname } = useRouter();

  const notifPerm = usePermission("notifications");

  const pushPerm = usePermission("push");

  const { t } = useTranslation("common");

  const [registerPn, unregisterPn] = usePushNotificationRegistration(t);

  useEffect(() => {
    if (
      getCookie("PUSH_NOTIF") !== "false" &&
      supportsPush &&
      notifPerm === "granted" &&
      pushPerm === "granted"
    ) {
      registerPn();
    }
  }, [notifPerm, pushPerm, registerPn]);

  const handleRegisterClick = () => {
    Notification.requestPermission();
  };

  const handleLogOutClick = () => {
    if (window.confirm(t("AreYouSure"))) {
      // TODO handle error
      unregisterPn().finally(() => {
        signOut();
      });
    }
  };

  const [considerPush, setConsiderPush] = useState(false);

  // for SSR
  useEffect(() => {
    setConsiderPush(supportsPush && getCookie("PUSH_NOTIF") !== "false");
  }, []);

  const session = useSession();

  const timeZone =
    session.status === "authenticated"
      ? session.data?.user?.timeZone
      : "_loading_";

  const handleFetchFail = useFetchFailHandler();

  useEffect(() => {
    if (timeZone) {
      return;
    }

    handleFetchFail(
      fetch("/api/users/_self_", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })
    );
  }, [timeZone, handleFetchFail]);

  const drawer = (
    <>
      <Toolbar>
        <Logo />
      </Toolbar>

      <List sx={{ p: 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <Link href={item.path} passHref>
              <ListItemButton
                component="a"
                selected={
                  pathname === item.path || item.altPaths?.includes(pathname)
                }
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
    </>
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleIgnoreClick = () => {
    document.cookie = "PUSH_NOTIF=false; path=/; SameSite=Lax";

    setConsiderPush(false);
  };

  return (
    <Box sx={{ marginX: "auto", maxWidth: "1200px" }}>
      <Head>
        <title>{(title ? title + " | " : "") + "Spetito"}</title>
      </Head>

      <Box sx={{ display: "flex" }}>
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

            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
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
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                backgroundColor: "inherit",
                border: 0,
              },
              "@media (min-width: 1200px)": {
                "& .MuiDrawer-paper": {
                  left: "calc(100vw / 2 - 600px)", // hacking position because of opsition: fixed
                },
              },
            }}
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

          {!considerPush ? null : notifPerm === "prompt" ? (
            <Alert
              sx={{ mt: 2 }}
              severity="warning"
              action={
                <>
                  <Button
                    onClick={handleRegisterClick}
                    color="inherit"
                    size="small"
                    variant="text"
                    sx={{ mr: 1 }}
                  >
                    {t("EnableNotifications")}
                  </Button>

                  <Button
                    onClick={handleIgnoreClick}
                    color="inherit"
                    size="small"
                    variant="text"
                  >
                    {t("Ignore")}
                  </Button>
                </>
              }
            >
              {t("NotificationsNotEnabled")}
            </Alert>
          ) : (
            notifPerm === "denied" && (
              <Alert
                sx={{ mt: 2 }}
                severity="error"
                action={
                  <Button
                    onClick={handleIgnoreClick}
                    color="inherit"
                    size="small"
                    variant="text"
                  >
                    {t("Ignore")}
                  </Button>
                }
              >
                {t("NotificationsDenied")}
              </Alert>
            )
          )}

          {children}
        </Box>
      </Box>
    </Box>
  );
}
