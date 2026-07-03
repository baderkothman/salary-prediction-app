import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type SectionCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export default function SectionCard({
  title,
  description,
  icon,
  action,
  children,
}: SectionCardProps) {
  const hasHeader = Boolean(title || action);

  return (
    <Paper
      elevation={0}
      component="section"
      sx={{
        border: "1px solid var(--sl-border)",
        borderRadius: "8px",
        p: 3,
        bgcolor: "var(--sl-panel)",
        boxShadow: "var(--sl-shadow)",
        overflow: "hidden",
      }}
    >
      <Stack spacing={2}>
        {hasHeader ? (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            sx={{
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box>
              {title ? (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  {icon}
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontSize: 24,
                      lineHeight: "32px",
                      fontWeight: 700,
                      color: "var(--sl-text)",
                    }}
                  >
                    {title}
                  </Typography>
                </Stack>
              ) : null}
              {description ? (
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mt: 0.5, color: "var(--sl-muted)" }}
                >
                  {description}
                </Typography>
              ) : null}
            </Box>
            {action}
          </Stack>
        ) : null}
        {children}
      </Stack>
    </Paper>
  );
}
