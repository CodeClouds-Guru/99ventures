import { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box, tabsClasses, Typography } from '@mui/material';
import MembersList from './listing/Listing';
import MembersSettings from './MembersSettings';
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'div'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const MembersContent = () => {
    const [value, setValue] = useState(0);
    const [selectedTab, setSelectedTab] = useState('');

    const handleChange = (event, newValue) => {
        setValue(newValue);
        setSelectedTab(event.target.id);
    };

    return (
        <Box sx={{ width: '100%' }} className="px-10">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="visible arrows tabs example"
                    sx={{
                        [`& .${tabsClasses.scrollButtons}`]: {
                            '&.Mui-disabled': { opacity: 0.3 },
                        },
                    }}
                >
                    <Tab value={0} label="List" {...a11yProps(0)} />
                    <Tab value={1} label="Settings" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} panel={selectedTab} index={0}>
                <MembersList />
            </TabPanel>
            <TabPanel value={value} panel={selectedTab} index={1}>
                <MembersSettings />
            </TabPanel>
        </Box>
    )
}
export default MembersContent;