import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export default function DashboardLoadingState() {
  return (
    <main className="min-h-screen" aria-busy="true" aria-live="polite">
      <Box sx={{ height: 64, borderBottom: "1px solid var(--sl-border)" }} />
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width={420} height={62} />
          <Skeleton variant="rounded" height={278} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" height={420} />
        </Stack>
      </Container>
    </main>
  );
}
