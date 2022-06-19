import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { User } from "next-auth";
import { getSession, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Layout } from "../components/Layout";
import { UserAvatar } from "../components/UserAvatar";
import { useFetchFailHandler } from "../hooks/useFetchFailHandler";
import { usePermission } from "../hooks/usePermission";
import { redirectToLogIn } from "../lib/auth";
import { supportsPush } from "../lib/capabilities";
import { prisma } from "../lib/prisma";
import { usePushNotificationRegistration } from "../lib/pushRegistration";
import { aryIannaTimeZones } from "../lib/timezones";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useRouter } from "next/router";

type Props = {
  user: User;
};

const Settings: NextPage<Props> = ({ user }) => {
  const { t } = useTranslation();

  const handleFetchFail = useFetchFailHandler();

  function deleteAccount() {
    if (
      window.confirm(t("AreYouSure")) &&
      window.confirm(t("AreYouReallySure"))
    ) {
      handleFetchFail(fetch("/api/users/_self_", { method: "DELETE" })).then(
        (res) => res && signOut()
      );
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

    handleFetchFail(
      fetch("/api/users/_self_", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeZone,
          useEmailNotif: emailNotifications,
        }),
      })
    );
  }, [timeZone, emailNotifications, handleFetchFail]);

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

  const tzMap = useMemo(() => {
    const now = new Date();

    return new Map(
      aryIannaTimeZones
        .map((tz) => {
          const offset = getTimezoneOffset(now, tz);

          const a = Math.abs(offset);

          return {
            tz,
            title:
              (offset > 0 ? "-" : "+") +
              String(Math.floor(a / 60)).padStart(2, "0") +
              ":" +
              String(a % 60).padStart(2, "0"),
            offset,
          };
        })
        .sort((a, b) =>
          a.offset < b.offset
            ? 1
            : a.offset > b.offset
            ? -1
            : a.tz.localeCompare(b.tz)
        )
        .map(({ tz, title }) => [
          tz,
          `(UTC${title}) ${tz.replace(/_/g, "\xa0")}`,
        ])
    );
  }, []);

  const [name, setName] = useState<string>();

  const router = useRouter();

  const handleNameFormSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    handleFetchFail(
      fetch("/api/users/_self_", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name?.trim(),
        }),
      })
    ).then((res) => {
      if (res) {
        setName(undefined);

        router.replace(router.asPath);
      }
    });
  };

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
        <Box
          sx={{ display: "flex", gap: 1, alignItems: "center" }}
          component="form"
          onSubmit={handleNameFormSubmit}
        >
          <UserAvatar user={user} />

          {name !== undefined ? (
            <>
              <TextField
                label={t("YourName")}
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />

              <Box>
                <IconButton
                  type="submit"
                  size="small"
                  color="success"
                  disabled={name.trim().length === 0}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>

                <IconButton
                  type="button"
                  size="small"
                  color="error"
                  onClick={() => {
                    setName(undefined);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            <>
              <Typography>{user.name}</Typography>

              <IconButton size="small" onClick={() => setName(user.name ?? "")}>
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        <Box sx={{ mt: 1, mb: 2 }}>
          <LanguageSwitcher />
        </Box>

        <Autocomplete
          openText={t("open")}
          clearText={t("clear")}
          noOptionsText={t("noResults")}
          options={aryIannaTimeZones}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label={t("TimeZone")} />
          )}
          getOptionLabel={(id) => tzMap.get(id) ?? "?"}
          onChange={(_, value) => setTimeZone(value)}
          value={timeZone ?? ""}
          disableClearable
        />

        <Button
          onClick={() => deleteAccount()}
          color="error"
          sx={{ alignSelf: "flex-end" }}
        >
          {t("DeleteAccount")}
        </Button>
      </Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        {t("Notifications")}
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
        <FormGroup>
          <FormControlLabel
            control={<Switch />}
            label={t("EmailNotifications")}
            checked={emailNotifications}
            onChange={() => setEmailNotifications((b) => !b)}
            disabled={!user.email}
          />

          <FormControl>
            <FormControlLabel
              control={<Switch />}
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
      </Paper>
    </Layout>
  );
};

function getTimezoneOffset(d: Date, tz: string) {
  const a = d
    .toLocaleString("ja", { timeZone: tz })
    .split(/[/\s:]/)
    .map((x) => Number(x));

  a[1]--;

  const t1 = Date.UTC.apply(null, a as [number, number]);

  const t2 = new Date(d).setMilliseconds(0);

  return (t2 - t1) / 60 / 1000;
}

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
