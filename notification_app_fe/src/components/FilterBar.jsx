/**
 * components/FilterBar.jsx — type filter dropdown and items-per-page selector.
 * Accepts filters and onFilterChange as props. Logs on every filter change.
 */

import React from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Button,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Log } from '../utils/logger';

const NOTIFICATION_TYPES = ['All', 'Placement', 'Result', 'Event'];
const LIMIT_OPTIONS = [5, 10, 20, 50];

/**
 * @param {{ filters: { notificationType: string, limit: number }, onFilterChange: Function }} props
 */
export default function FilterBar({ filters, onFilterChange }) {
  function handleTypeChange(e) {
    Log('debug', 'component', `FilterBar: type changed to ${e.target.value}`);
    onFilterChange({ ...filters, notificationType: e.target.value, page: 1 });
  }

  function handleLimitChange(e) {
    Log('debug', 'component', `FilterBar: limit changed to ${e.target.value}`);
    onFilterChange({ ...filters, limit: e.target.value, page: 1 });
  }

  function handleReset() {
    Log('debug', 'component', 'FilterBar: reset filters');
    onFilterChange({ notificationType: 'All', limit: 10, page: 1 });
  }

  return (
    <Box
      display="flex"
      gap={2}
      flexWrap="wrap"
      alignItems="center"
      mb={3}
      p={2}
      sx={{ backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}
    >
      <FilterListIcon color="action" />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="type-label">Notification Type</InputLabel>
        <Select
          labelId="type-label"
          value={filters.notificationType}
          label="Notification Type"
          onChange={handleTypeChange}
        >
          {NOTIFICATION_TYPES.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="limit-label">Per Page</InputLabel>
        <Select
          labelId="limit-label"
          value={filters.limit}
          label="Per Page"
          onChange={handleLimitChange}
        >
          {LIMIT_OPTIONS.map((l) => (
            <MenuItem key={l} value={l}>{l}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="outlined" size="small" onClick={handleReset}>
        Reset Filters
      </Button>
    </Box>
  );
}
