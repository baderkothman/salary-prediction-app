import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

import type { SalaryOptions } from "@/lib/predictions";
import type { Filters } from "@/types/dashboard";
import { formatCurrency } from "@/utils/dashboard-formatters";
import { optionValues } from "@/utils/dashboard-data";
import SectionCard from "./SectionCard";

type DashboardFiltersProps = {
  filters: Filters;
  options: SalaryOptions;
  salaryBounds: { min: number; max: number };
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
};

export default function DashboardFilters({
  filters,
  options,
  salaryBounds,
  onChange,
}: DashboardFiltersProps) {
  return (
    <SectionCard
      title="Filter Your Results"
      description="Show only the results you care about. The chart and the list update as you change these."
      icon={<FilterAltIcon sx={{ color: "#000" }} aria-hidden="true" />}
    >
      <Stack spacing={2}>
        <Box>
          <FieldTitle>Search by job title or country</FieldTitle>
          <TextField
            placeholder="e.g. Data Scientist"
            size="small"
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
            sx={fieldSx}
            fullWidth
          />
        </Box>

        <Box>
          <FieldTitle>Experience level</FieldTitle>
          <FormControl fullWidth size="small" sx={fieldSx}>
            <Select
              value={filters.experience}
              onChange={(event) => onChange("experience", event.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All levels</MenuItem>
              {optionValues(options.experience_level).map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FieldTitle>Company size</FieldTitle>
          <FormControl fullWidth size="small" sx={fieldSx}>
            <Select
              value={filters.companySize}
              onChange={(event) => onChange("companySize", event.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All sizes</MenuItem>
              {optionValues(options.company_size).map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FieldTitle>Remote work</FieldTitle>
          <FormControl fullWidth size="small" sx={fieldSx}>
            <Select
              value={filters.remoteRatio}
              onChange={(event) => onChange("remoteRatio", event.target.value)}
              displayEmpty
            >
              <MenuItem value="all">Any amount</MenuItem>
              {optionValues(options.remote_ratio).map((value) => (
                <MenuItem key={value} value={String(value)}>
                  {formatRemoteOption(value)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography
            id="filter-salary-range-label"
            className="sl-label"
            sx={{ color: "var(--sl-muted)", mb: 1 }}
          >
            Salary range (per year)
          </Typography>
          <Slider
            value={filters.salaryRange}
            min={salaryBounds.min}
            max={salaryBounds.max}
            step={1000}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatCurrency(value)}
            aria-labelledby="filter-salary-range-label"
            getAriaValueText={(value) => formatCurrency(value)}
            onChange={(_, value) => onChange("salaryRange", value as [number, number])}
            sx={{
              color: "#000",
              "& .MuiSlider-rail": { color: "var(--sl-panel-high)" },
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                border: "2px solid #000",
                bgcolor: "#fff",
              },
            }}
          />
          <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
            {formatCurrency(filters.salaryRange[0])} to{" "}
            {formatCurrency(filters.salaryRange[1])}
          </Typography>
        </Box>

        <Box>
          <FieldTitle>Created after</FieldTitle>
          <TextField
            size="small"
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
            sx={fieldSx}
            fullWidth
          />
        </Box>

        <Box>
          <FieldTitle>Created before</FieldTitle>
          <TextField
            size="small"
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange("endDate", event.target.value)}
            sx={fieldSx}
            fullWidth
          />
        </Box>
      </Stack>
    </SectionCard>
  );
}

function FieldTitle({ children }: { children: string }) {
  return (
    <Typography className="sl-label" sx={{ color: "var(--sl-muted)", mb: 1 }}>
      {children}
    </Typography>
  );
}

function formatRemoteOption(value: number) {
  if (value === 0) return "0% - fully on-site";
  if (value === 100) return "100% - fully remote";
  return `${value}% remote`;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    bgcolor: "var(--sl-panel-low)",
    fontSize: 14,
    "& fieldset": { borderColor: "var(--sl-border)" },
    "&:hover fieldset": { borderColor: "var(--sl-border-strong)" },
    "&.Mui-focused fieldset": { borderColor: "#000", borderWidth: 1 },
  },
};
