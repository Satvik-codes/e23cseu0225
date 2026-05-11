/**
 * App.jsx — root application component.
 * Sets up React Router, Material UI theme, and the top navigation bar.
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, CssBaseline,
  ThemeProvider, createTheme, useMediaQuery, IconButton, Drawer, List, ListItem, ListItemButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import MenuIcon from '@mui/icons-material/Menu';
import AllNotificationsPage from './pages/AllNotificationsPage';
import PriorityInboxPage from './pages/PriorityInboxPage';
import { Log } from './utils/logger';

// ---------------------------------------------------------------------------
// Material UI theme
// ---------------------------------------------------------------------------
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565C0' },
    secondary: { main: '#FF6F00' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
  },
});

// ---------------------------------------------------------------------------
// Navigation links config
// ---------------------------------------------------------------------------
const NAV_LINKS = [
  { to: '/', label: 'All Notifications', icon: <NotificationsIcon fontSize="small" /> },
  { to: '/priority', label: 'Priority Inbox', icon: <StarIcon fontSize="small" /> },
];

function NavBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  return (
    <>
      <AppBar position="sticky" elevation={2} sx={{ background: 'linear-gradient(90deg, #1565C0 0%, #0D47A1 100%)' }}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, letterSpacing: 0.5 }}>
            Campus Notifications
          </Typography>

          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)} id="mobile-menu-btn">
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <Box display="flex" gap={1}>
              {NAV_LINKS.map(({ to, label, icon }) => (
                <Button
                  key={to}
                  component={NavLink}
                  to={to}
                  end={to === '/'}
                  startIcon={icon}
                  sx={{
                    color: 'white',
                    backgroundColor: location.pathname === to ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                    fontWeight: 600,
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box width={220} pt={2}>
          <List>
            {NAV_LINKS.map(({ to, label, icon }) => (
              <ListItem key={to} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={to}
                  end={to === '/'}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ gap: 1, fontWeight: 600 }}
                >
                  {icon} {label}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default function App() {
  useEffect(() => {
    Log('info', 'component', 'App mounted');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Routes>
            <Route path="/" element={<AllNotificationsPage />} />
            <Route path="/priority" element={<PriorityInboxPage />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
