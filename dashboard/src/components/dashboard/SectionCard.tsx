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
      sx={{ border: "1px solid #dbeafe", borderRadius: 2, p: 2 }}
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
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                    {title}
                  </Typography>
                </Stack>
              ) : null}
              {description ? (
                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
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
