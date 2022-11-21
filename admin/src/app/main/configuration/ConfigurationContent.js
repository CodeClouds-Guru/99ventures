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
import PaymentGateway from './payment-gateway/PaymentGateway';
import MetatagConfiguration from './metatags-configuration/MetatagConfiguration';
import { usePermission } from '@fuse/hooks';

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

const tabs = [
    {
        name: "General",
        component: GeneralConfiguration,
        module: 'generalconfigurations'
    },
    {
        name: "Email",
        component: EmailConfiguration,
        module: 'emailconfigurations'
    },
    {
        name: "IP",
        component: IpConfiguration,
        module: 'ipconfigurations'
    },
    {
        name: "Downtime",
        component: DowntimeConfiguration,
        module: 'downtime'
    },
    {
        name: "Payment Gateway",
        component: PaymentGateway,
        module: 'paymentconfigurations'
    },
    {
        name: "Header Configuration",
        component: MetatagConfiguration,
        module: 'metatagconfigurations'
    },
];


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
                    {
                        tabs.map((tab, indx) => {
                            const { hasPermission } = usePermission(tab.module);                            
                            return hasPermission('view') ? <Tab key={ indx } label={ tab.name } {...a11yProps(tab.indx)} /> : '';
                        })
                    }
                </Tabs>
            </Box>
            {
                tabs.map((tab, indx) => {
                    const Component = tab.component;
                    const { hasPermission } = usePermission(tab.module); 
                    return hasPermission('view') ? 
                        <TabPanel value={value} index={ indx } key={ indx }>
                            <Component permission={ hasPermission } />
                        </TabPanel>
                    : '';
                })
            }
        </Box>
    );
}

export default ConfigurationContent;