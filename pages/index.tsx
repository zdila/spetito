import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
import { Layout } from "../components/Layout";
import { Offer } from "../components/Offer";

const Home: NextPage = () => {
  const testDate = new Date("2022--5-16T12:37:04");

  return (
    <Layout title="Offers">
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Create offer
      </Typography>

      <Paper
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField label="Offer" fullWidth multiline sx={{ flexGrow: 1 }} />

        <FormControl>
          <InputLabel id="demo-simple-select-label">Audience</InputLabel>

          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value="everyone"
            label="Audience"
            // onChange={handleChange}
          >
            <MenuItem value="everyone">Everyone</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="From"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="To"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
        />

        <Box sx={{ flexGrow: 1 }}>
          <Button
            sx={{ marginLeft: "auto", display: "block", height: "100%" }}
            variant="contained"
          >
            Add
          </Button>
        </Box>
      </Paper>

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Your offers
      </Typography>

      <Offer
        owner="Martin"
        from={testDate}
        audience={["Rodina", "Kamaráti"]}
        text="Dnes budem na záhrade, kľudne príďte, len sa mi prosím predtým ozvite. Ak do piatej, tak kúpim nejaký proviant naviac, ináč si doneste vlastný 🙂"
      />

      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
        Friend&apos;s offers
      </Typography>

      <Offer
        owner="Pepo"
        from={testDate}
        text="Idem sa bikovať na Lajošku, privítam spoločnosť."
      />
    </Layout>
  );
};

export default Home;
