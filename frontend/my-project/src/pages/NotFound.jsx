import {
  Button,
  Typography
} from "@mui/material";

import {
  Link
} from "react-router-dom";

export default function NotFound() {

  return (

    <div
      className="
        min-h-screen
        flex
        flex-col
        items-center
        justify-center
        gap-3
      "
    >

      <Typography
        variant="h2"
        fontWeight={800}
      >

        404

      </Typography>

      <Typography
        color="text.secondary"
      >

        Page not found.

      </Typography>

      <Button
        component={Link}
        to="/"
        variant="contained"
      >

        Go Home

      </Button>

    </div>

  );
}