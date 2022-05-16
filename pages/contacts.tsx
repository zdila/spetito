import { Paper, TextField, Typography } from "@mui/material";
import type { NextPage } from "next";
import { Layout } from "../components/Layout";

const Contacts: NextPage = () => {
  return (
    <Layout title="Contacts">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Search
      </Typography>

      <Paper sx={{ p: 2 }}>
        <TextField fullWidth />
      </Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Invites
      </Typography>

      <Paper sx={{ p: 2 }}></Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Groups
      </Typography>

      <Paper sx={{ p: 2 }}></Paper>
    </Layout>
  );
};

export default Contacts;
