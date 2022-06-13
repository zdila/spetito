import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Layout } from "../components/Layout";
import { usePermission } from "../hooks/usePermission";
import { redirectToLogIn } from "../lib/auth";
import { supportsPush } from "../lib/capabilities";
import { prisma } from "../lib/prisma";
import { usePushNotificationRegistration } from "../lib/pushRegistration";
import { aryIannaTimeZones } from "../lib/timezones";

type Props = {
  user: User;
};

const Settings: NextPage<Props> = ({ user }) => {
  const { t } = useTranslation();

  function deleteAccount() {
    if (
      window.confirm(t("AreYouSure")) &&
      window.confirm(t("AreYouReallySure"))
    ) {
      fetch("/api/users/_self_", { method: "DELETE" }).then(() => signOut());
    }
  }

  const [timeZone, setTimeZone] = useState<string | null>(user.timeZone);

  const [emailNotifications, setEmailNotifications] = useState(
    user.useEmailNotif
  );

  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;

      return;
    }

    fetch("/api/users/_self_", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeZone,
        useEmailNotif: emailNotifications,
      }),
    });
  }, [timeZone, emailNotifications]);

  const notifPerm = usePermission("notifications");

  const [registerPn, unregisterPn, registered] =
    usePushNotificationRegistration(t);

  const [disabledPn, setDisabledPn] = useState(true);

  useEffect(() => {
    setDisabledPn(notifPerm === "denied" || notifPerm === "unsupported");
  }, [notifPerm]);

  const handlePnCheck = (_: unknown, checked: boolean) => {
    document.cookie = `PUSH_NOTIF=${checked}; path=/`;

    if (checked) {
      registerPn();
    } else {
      unregisterPn();
    }
  };

  const [supportsPush1, setSupportsPush1] = useState(true);

  // for SSR
  useEffect(() => {
    setSupportsPush1(supportsPush);
  }, []);

  return (
    <Layout title={t("Settings")}>
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("Profile")}
      </Typography>

      <Paper
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {user.image && <Avatar src={user.image} />}

          <Typography>{user.name}</Typography>
        </Box>

        <LanguageSwitcher />

        <Autocomplete
          options={aryIannaTimeZones}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label={t("TimeZone")} />
          )}
          onChange={(_, value) => setTimeZone(value)}
          value={timeZone ?? ""}
          disableClearable
        />

        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label={t("EmailNotifications")}
            checked={emailNotifications}
            onChange={() => setEmailNotifications((b) => !b)}
            disabled={!user.email}
          />

          <FormControl>
            <FormControlLabel
              control={<Checkbox indeterminate={registered === null} />}
              label={t("BrowserNotifications")}
              checked={registered ?? false}
              onChange={handlePnCheck}
              disabled={registered === null || disabledPn}
            />

            {(!supportsPush1 || notifPerm === "denied") && (
              <FormHelperText>
                {t(
                  notifPerm === "denied"
                    ? "NotificationsDenied"
                    : "PushNotifUnsupported"
                )}
              </FormHelperText>
            )}
          </FormControl>
        </FormGroup>

        <Button onClick={() => deleteAccount()} color="error">
          {t("DeleteAccount")}
        </Button>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context);

  const user = session?.user;

  if (!user) {
    return redirectToLogIn(context, "/settings");
  }

  // TODO make it effective on all pages
  if (context.locale) {
    await prisma.user.update({
      data: { language: context.locale },
      where: { id: user.id },
    });
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
      user,
    },
  };
};

export default Settings;
