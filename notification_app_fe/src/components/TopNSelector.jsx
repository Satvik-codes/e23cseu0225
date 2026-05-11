/**
 * components/TopNSelector.jsx — slider/button group for selecting top-N on the priority page.
 * Accepts value and onChange as props. Options: 5, 10, 15, 20.
 */

import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Log } from '../utils/logger';

const N_OPTIONS = [5, 10, 15, 20];

/**
 * @param {{ value: number, onChange: Function }} props
 */
export default function TopNSelector({ value, onChange }) {
  function handleChange(_e, newValue) {
    if (newValue === null) return; // keep at least one selected
    Log('debug', 'component', `TopNSelector changed to n=${newValue}`);
    onChange(newValue);
  }

  return (
    <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Show top:
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size="small"
        color="primary"
      >
        {N_OPTIONS.map((n) => (
          <ToggleButton key={n} value={n} sx={{ minWidth: 48, fontWeight: 600 }}>
            {n}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
