import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MainHeader from 'app/shared-components/MainHeader';
import Report from './Report';
import Chart from './Chart'

const Index = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };
  
    return (
        <FusePageCarded
            className="min-h-0"
            sx={{ '& .FusePageCarded-header': {flexDirection: 'column'} }}
            header={
                <MainHeader module="Reports" backUrl="/app/campaigns" />
            }
            content={
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab label="Report" value="1" />
                                <Tab label="Chart" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <Report />
                        </TabPanel>
                        <TabPanel value="2">
                            <Chart />
                        </TabPanel>
                    </TabContext>
                </Box>
            }
            rightSidebarOpen={ false }
            scroll={isMobile ? 'normal' : 'content'}
        />
      
    );
}

export default Index;