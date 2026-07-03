import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function DashboardLoadingState() {
  return (
    <main className="min-h-screen" aria-busy="true" aria-live="polite">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width={420} height={62} />
          <Skeleton variant="rounded" height={104} />
          <Skeleton variant="rounded" height={420} />
        </Stack>
      </Container>
    </main>
  );
}
