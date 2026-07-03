import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

type StatCardProps = {
  label: string;
  value: string | number;
  selected?: boolean;
  onSelect?: () => void;
};

export default function StatCard({ label, value, selected, onSelect }: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: selected ? "2px solid #1e40af" : "1px solid #dbeafe",
        borderRadius: 2,
      }}
    >
      <CardActionArea
        onClick={onSelect}
        aria-pressed={selected}
        sx={{ height: "100%" }}
      >
        <CardContent>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
