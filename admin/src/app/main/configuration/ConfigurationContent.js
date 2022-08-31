import { useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import EmailConfiguration from './email-configuration/EmailConfiguration';
import GeneralConfiguration from './general-configuration';
import IpConfiguration from './ip-configuration/IpConfiguration';
import DowntimeConfiguration from './downtime-configuration/DowntimeConfiguration';
import PaymentGateway from './payment-gateway';

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

function ConfigurationContent() {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} scrollButtons={false}
                    aria-label="visible arrows tabs example"
                    sx={{
                        [`& .${tabsClasses.scrollButtons}`]: {
                            '&.Mui-disabled': { opacity: 0.3 },
                        },
                    }}>
                    <Tab label="General" {...a11yProps(0)} />
                    <Tab label="Email" {...a11yProps(1)} />
                    <Tab label="IP" {...a11yProps(2)} />
                    <Tab label="Downtime" {...a11yProps(3)} />
                    <Tab label="Payment Gateway" {...a11yProps(4)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <GeneralConfiguration />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <EmailConfiguration />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <IpConfiguration />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <DowntimeConfiguration />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <PaymentGateway />
            </TabPanel>
        </Box>
    );
}

export default ConfigurationContent;