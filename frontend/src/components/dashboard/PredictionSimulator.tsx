import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    bgcolor: "var(--sl-panel-low)",
    fontSize: 14,
    "& fieldset": { borderColor: "var(--sl-border)" },
    "&:hover fieldset": { borderColor: "var(--sl-border-strong)" },
    "&.Mui-focused fieldset": { borderColor: "#000", borderWidth: 1 },
  },
  "& .MuiInputLabel-root": {
    fontFamily: 'var(--font-jetbrains-mono), monospace',
    fontSize: 12,
    fontWeight: 600,
    color: "var(--sl-muted)",
  },
};

function ChipButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outlined"
      sx={{
        minWidth: 0,
        px: 2,
        py: 0.85,
        borderRadius: "999px",
        borderColor: active ? "#000" : "var(--sl-border)",
        bgcolor: active ? "var(--sl-secondary-container)" : "transparent",
        color: active ? "var(--sl-secondary-text)" : "var(--sl-text)",
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: 12,
        fontWeight: 700,
        textTransform: "none",
        "&:hover": {
          borderColor: "#000",
          bgcolor: active ? "var(--sl-secondary-container)" : "var(--sl-panel-high)",
        },
      }}
    >
      {label}
    </Button>
  );
}

export default function PredictionSimulator({
  simulator,
  options,
  analyzing,
  onChange,
  onSubmit,
}: PredictionSimulatorProps) {
  const remoteOptions = optionValues(options.remote_ratio).sort((a, b) => a - b);
  const minRemote = remoteOptions[0] ?? 0;
  const maxRemote = remoteOptions[remoteOptions.length - 1] ?? 100;

  return (
    <SectionCard
      title="Job Details"
      description="Tell us about the job. Every field already has a value, so you can press the button right away and adjust later."
    >
      <Stack
        spacing={3}
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Autocomplete
          size="small"
          options={options.job_title}
          value={simulator.job_title}
          onChange={(_, value) => onChange("job_title", value ?? simulator.job_title)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Job Title"
              placeholder="Type to search, e.g. Data Scientist"
              sx={fieldSx}
            />
          )}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Typography className="sl-label" sx={{ color: "var(--sl-muted)", mb: 1 }}>
              Experience Level
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {optionValues(options.experience_level).map((value) => (
                <ChipButton
                  key={value}
                  label={value.replace("-level", "").replace("Executive", "Exec")}
                  active={simulator.experience_level === value}
                  onClick={() => onChange("experience_level", value)}
                />
              ))}
            </Stack>
          </Box>

          <FormControl size="small" sx={fieldSx}>
            <InputLabel id="simulator-employment-label">Employment Type</InputLabel>
            <Select
              labelId="simulator-employment-label"
              label="Employment Type"
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

          <Box>
            <Typography className="sl-label" sx={{ color: "var(--sl-muted)", mb: 1 }}>
              Company Size
            </Typography>
            <Stack direction="row" spacing={1}>
              {optionValues(options.company_size).map((value) => (
                <Button
                  key={value}
                  type="button"
                  onClick={() => onChange("company_size", value)}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    py: 0.85,
                    borderRadius: "6px",
                    borderColor:
                      simulator.company_size === value ? "#000" : "var(--sl-border)",
                    bgcolor:
                      simulator.company_size === value
                        ? "var(--sl-secondary-container)"
                        : "transparent",
                    color: "var(--sl-text)",
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontWeight: 700,
                    textTransform: "none",
                    minWidth: 0,
                    fontSize: 12,
                  }}
                >
                  {value}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography className="sl-label" sx={{ color: "var(--sl-muted)", mb: 2 }}>
              How much remote work?
            </Typography>
            <Slider
              value={simulator.remote_ratio}
              min={minRemote}
              max={maxRemote}
              step={50}
              marks={remoteOptions.map((value) => ({ value }))}
              onChange={(_, value) => onChange("remote_ratio", Number(value))}
              sx={{
                color: "#000",
                mx: 0.5,
                "& .MuiSlider-rail": { color: "var(--sl-panel-high)" },
                "& .MuiSlider-thumb": {
                  width: 14,
                  height: 14,
                  border: "2px solid #000",
                  bgcolor: "#fff",
                },
              }}
            />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                On-site
              </Typography>
              <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                Hybrid
              </Typography>
              <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                Remote
              </Typography>
            </Stack>
          </Box>

          <FormControl size="small" sx={fieldSx}>
            <InputLabel id="simulator-work-year-label">Year</InputLabel>
            <Select
              labelId="simulator-work-year-label"
              label="Year"
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

          <Autocomplete
            size="small"
            options={options.employee_residence}
            getOptionLabel={formatCountry}
            value={simulator.employee_residence}
            onChange={(_, value) =>
              onChange("employee_residence", value ?? simulator.employee_residence)
            }
            renderInput={(params) => (
              <TextField {...params} label="Where the employee lives" sx={fieldSx} />
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
            renderInput={(params) => (
              <TextField {...params} label="Where the company is based" sx={fieldSx} />
            )}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={analyzing}
          sx={{
            bgcolor: "#000",
            color: "#fff",
            borderRadius: "8px",
            py: 1.4,
            boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 13,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#111" },
          }}
          startIcon={analyzing ? <CircularProgress color="inherit" size={18} /> : null}
        >
          {analyzing ? "Estimating your salary..." : "Estimate Salary"}
        </Button>
        <Typography
          className="sl-label"
          sx={{ color: "var(--sl-muted)", textAlign: "center", textTransform: "none" }}
        >
          Takes a few seconds. Your result is saved automatically under My Results.
        </Typography>
      </Stack>
    </SectionCard>
  );
}
