import { Paper, TextField, Typography } from "@mui/material";
import type { NextPage } from "next";
import { Layout } from "../components/Layout";

const Settings: NextPage = () => {
  return (
    <Layout title="Settings">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Profile
      </Typography>

      <Paper sx={{ p: 2 }}></Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Notifications
      </Typography>

      <Paper sx={{ p: 2 }}></Paper>
    </Layout>
  );
};

export default Settings;
