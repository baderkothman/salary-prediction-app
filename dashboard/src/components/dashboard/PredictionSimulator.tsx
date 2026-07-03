import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import type { AnalyzeInput, SalaryOptions } from "@/lib/predictions";
import { optionValues } from "@/utils/dashboard-data";
import { formatCountry } from "@/utils/country-codes";
import SectionCard from "./SectionCard";

type PredictionSimulatorProps = {
  simulator: AnalyzeInput;
  options: SalaryOptions;
  analyzing: boolean;
  onChange: <K extends keyof AnalyzeInput>(key: K, value: AnalyzeInput[K]) => void;
  onSubmit: () => void;
};

export default function PredictionSimulator({
  simulator,
  options,
  analyzing,
  onChange,
  onSubmit,
}: PredictionSimulatorProps) {
  return (
    <SectionCard
      title="Prediction Simulator"
      description="Try a scenario to estimate and save a new salary prediction."
      icon={<PlayArrowIcon color="primary" aria-hidden="true" />}
    >
      <Stack
        spacing={2}
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <FormControl size="small">
          <InputLabel id="simulator-work-year-label">Work year</InputLabel>
          <Select
            labelId="simulator-work-year-label"
            label="Work year"
            value={String(simulator.work_year)}
            onChange={(event) => onChange("work_year", Number(event.target.value))}
          >
            {optionValues(options.work_year).map((value) => (
              <MenuItem key={value} value={String(value)}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="simulator-experience-label">Experience</InputLabel>
          <Select
            labelId="simulator-experience-label"
            label="Experience"
            value={simulator.experience_level}
            onChange={(event) => onChange("experience_level", event.target.value)}
          >
            {optionValues(options.experience_level).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="simulator-employment-label">Employment</InputLabel>
          <Select
            labelId="simulator-employment-label"
            label="Employment"
            value={simulator.employment_type}
            onChange={(event) => onChange("employment_type", event.target.value)}
          >
            {optionValues(options.employment_type).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          size="small"
          options={options.job_title}
          value={simulator.job_title}
          onChange={(_, value) => onChange("job_title", value ?? simulator.job_title)}
          renderInput={(params) => (
            <TextField
              id={params.id}
              disabled={params.disabled}
              fullWidth={params.fullWidth}
              size={params.size}
              slotProps={params.slotProps}
              label="Job title"
            />
          )}
        />

        <Stack direction="row" spacing={1}>
          <Autocomplete
            size="small"
            options={options.employee_residence}
            getOptionLabel={formatCountry}
            value={simulator.employee_residence}
            onChange={(_, value) =>
              onChange("employee_residence", value ?? simulator.employee_residence)
            }
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                id={params.id}
                disabled={params.disabled}
                fullWidth={params.fullWidth}
                size={params.size}
                slotProps={params.slotProps}
                label="Residence country"
              />
            )}
          />
          <Autocomplete
            size="small"
            options={options.company_location}
            getOptionLabel={formatCountry}
            value={simulator.company_location}
            onChange={(_, value) =>
              onChange("company_location", value ?? simulator.company_location)
            }
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                id={params.id}
                disabled={params.disabled}
                fullWidth={params.fullWidth}
                size={params.size}
                slotProps={params.slotProps}
                label="Company country"
              />
            )}
          />
        </Stack>

        <FormControl size="small">
          <InputLabel id="simulator-remote-ratio-label">Remote ratio</InputLabel>
          <Select
            labelId="simulator-remote-ratio-label"
            label="Remote ratio"
            value={String(simulator.remote_ratio)}
            onChange={(event) => onChange("remote_ratio", Number(event.target.value))}
          >
            {optionValues(options.remote_ratio).map((value) => (
              <MenuItem key={value} value={String(value)}>
                {value}%
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="simulator-company-size-label">Company size</InputLabel>
          <Select
            labelId="simulator-company-size-label"
            label="Company size"
            value={simulator.company_size}
            onChange={(event) => onChange("company_size", event.target.value)}
          >
            {optionValues(options.company_size).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          startIcon={analyzing ? <CircularProgress size={18} /> : <PlayArrowIcon />}
          disabled={analyzing}
        >
          Analyze and save
        </Button>
      </Stack>
    </SectionCard>
  );
}
