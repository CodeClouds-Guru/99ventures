import AppBar from '@mui/material/AppBar';
import { ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { selectFooterTheme } from 'app/store/fuse/settingsSlice';
import clsx from 'clsx';
import Grid from '@mui/material/Grid';

function FooterLayout1(props) {
  const footerTheme = useSelector(selectFooterTheme);
  const year = new Date().getFullYear()
  return (
    <ThemeProvider theme={footerTheme}>
      <AppBar
        id="fuse-footer"
        className={clsx('relative z-20 shadow-md', props.className)}
        color="default"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? footerTheme.palette.background.paper
              : footerTheme.palette.background.default,
        }}
      >
        <Toolbar className="min-h-48 md:min-h-64 px-8 sm:px-12 py-0 flex items-center overflow-x-auto">
        <Grid container spacing={2}>
          <Grid item xs={10}>
            <p>&#xA9; {year} | 99 Ventures</p>
          </Grid>
          <Grid item xs={2}>
            <p>All rights reserved.</p>
          </Grid>
        </Grid>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default memo(FooterLayout1);
