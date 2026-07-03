import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import type { SalaryPrediction } from "@/types/prediction";
import { formatCurrency, formatDate, getChartUrl } from "@/utils/dashboard-formatters";
import { formatCountry } from "@/utils/country-codes";

type PredictionCardProps = {
  prediction: SalaryPrediction;
  expanded: boolean;
  selected: boolean;
  onToggleExpanded: () => void;
  onToggleSelected: () => void;
};

export default function PredictionCard({
  prediction,
  expanded,
  selected,
  onToggleExpanded,
  onToggleSelected,
}: PredictionCardProps) {
  const chartUrl = getChartUrl(prediction.chart_url);
  const jobTitle = prediction.job_title ?? "Unknown job title";

  return (
    <Card
      elevation={0}
      sx={{
        border: selected ? "2px solid #1e40af" : "1px solid #e2e8f0",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ p: 2, alignItems: { md: "center" } }}
        >
          <Checkbox
            checked={selected}
            onChange={onToggleSelected}
            slotProps={{
              input: {
                "aria-label": `Select ${jobTitle} for comparison`,
              },
            }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {jobTitle}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 1 }}>
              <Chip label={prediction.experience_level ?? "No level"} size="small" />
              <Chip label={prediction.employment_type ?? "No type"} size="small" />
              <Chip label={prediction.company_size ?? "No size"} size="small" />
              <Chip label={`Remote: ${prediction.remote_ratio ?? "N/A"}%`} size="small" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Company: {formatCountry(prediction.company_location)} - Residence:{" "}
              {formatCountry(prediction.employee_residence)} - Created:{" "}
              {formatDate(prediction.created_at)}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 170 }}>
            <Typography color="text.secondary">Predicted Salary</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {formatCurrency(prediction.predicted_salary)}
            </Typography>
          </Box>

          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <IconButton
              onClick={onToggleExpanded}
              aria-label={expanded ? "Collapse prediction details" : "Expand prediction details"}
              aria-expanded={expanded}
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 180ms ease",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: chartUrl ? "1fr 320px" : "1fr" },
              gap: 2,
              p: 2,
            }}
          >
            <Typography sx={{ whiteSpace: "pre-line" }}>
              {prediction.llm_analysis || "No LLM analysis was saved for this prediction."}
            </Typography>

            {chartUrl ? (
              <Box
                component="img"
                src={chartUrl}
                alt={`Salary comparison chart for ${jobTitle}`}
                loading="lazy"
                sx={{
                  width: "100%",
                  borderRadius: 1.5,
                  border: "1px solid #e2e8f0",
                }}
              />
            ) : null}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
