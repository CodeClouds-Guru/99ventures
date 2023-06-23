import List from '../crud/list/List';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box, tabsClasses, Typography } from '@mui/material';

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

const Index = () => {
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
                    <Tab value={0} label="Survey Providers" {...a11yProps(0)} />
                    <Tab value={1} label="Completed Surveys" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} panel={selectedTab} index={0}>
                <List
                    module={'survey-providers'}
                    addable={false}
                    deletable={false}
                />
            </TabPanel>
            <TabPanel value={value} panel={selectedTab} index={1}>
                <List
                    module={'completed-surveys'}
                    addable={false}
                    deletable={false}
                    editable={false}
                />
            </TabPanel>
        </Box>
    )
}

export default Index;