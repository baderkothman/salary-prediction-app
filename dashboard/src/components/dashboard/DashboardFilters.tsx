import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
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
      title="Filters"
      description="Narrow down the prediction history below."
      icon={<FilterAltIcon color="primary" aria-hidden="true" />}
    >
      <Stack spacing={2}>
        <TextField
          label="Search role or location"
          size="small"
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
        />

        <FormControl size="small">
          <InputLabel id="filter-experience-label">Experience</InputLabel>
          <Select
            labelId="filter-experience-label"
            label="Experience"
            value={filters.experience}
            onChange={(event) => onChange("experience", event.target.value)}
          >
            <MenuItem value="all">All levels</MenuItem>
            {optionValues(options.experience_level).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="filter-company-size-label">Company size</InputLabel>
          <Select
            labelId="filter-company-size-label"
            label="Company size"
            value={filters.companySize}
            onChange={(event) => onChange("companySize", event.target.value)}
          >
            <MenuItem value="all">All sizes</MenuItem>
            {optionValues(options.company_size).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="filter-remote-ratio-label">Remote ratio</InputLabel>
          <Select
            labelId="filter-remote-ratio-label"
            label="Remote ratio"
            value={filters.remoteRatio}
            onChange={(event) => onChange("remoteRatio", event.target.value)}
          >
            <MenuItem value="all">All remote ratios</MenuItem>
            {optionValues(options.remote_ratio).map((value) => (
              <MenuItem key={value} value={String(value)}>
                {value}%
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography id="filter-salary-range-label" variant="body2" sx={{ fontWeight: 700 }}>
            Salary range
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
          />
          <Typography variant="caption" color="text.secondary">
            {formatCurrency(filters.salaryRange[0])} to{" "}
            {formatCurrency(filters.salaryRange[1])}
          </Typography>
        </Box>

        <TextField
          label="Start date"
          size="small"
          type="date"
          value={filters.startDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(event) => onChange("startDate", event.target.value)}
        />
        <TextField
          label="End date"
          size="small"
          type="date"
          value={filters.endDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(event) => onChange("endDate", event.target.value)}
        />
      </Stack>
    </SectionCard>
  );
}
