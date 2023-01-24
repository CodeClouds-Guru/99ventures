import { AppBar, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { selectFooterTheme } from 'app/store/fuse/settingsSlice';
import clsx from 'clsx';
import Grid from '@mui/material/Grid';

function UserNavbarFooter(props) {
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
                <Toolbar className="min-h-10 mt-5 mb-10 px-6 py-0 flex items-center">
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <Typography variant="caption">&#xA9; {year} | Scripteed</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption">All rights reserved</Typography>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
}

export default memo(UserNavbarFooter);

