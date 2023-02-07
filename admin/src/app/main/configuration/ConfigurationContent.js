import { useEffect, useState } from 'react';
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
    const { children, value, panel, index, panelIndx, ...other } = props;
    return (
        (!panel && index < 2) ? (
            <div
                role="tabpanel"
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                <Box sx={{ p: 3 }}>
                    <Typography component={'div'}>{children}</Typography>
                </Box>
            </div>
        ) : (
            <div
                role="tabpanel"
                hidden={panel !== panelIndx}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {panel === panelIndx && (
                    <Box sx={{ p: 3 }}>
                        <Typography component={'div'}>{children}</Typography>
                    </Box>
                )}
            </div>
        )
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
        name: "Downtime",
        component: DowntimeConfiguration,
        module: 'downtime'
    },
    {
        name: "IP",
        component: IpConfiguration,
        module: 'ipconfigurations'
    },
    {
        name: "Header Configuration",
        component: MetatagConfiguration,
        module: 'metatagconfigurations'
    },
    {
        name: "Payment Gateway",
        component: PaymentGateway,
        module: 'paymentconfigurations'
    }
];



function ConfigurationContent() {
    const [value, setValue] = useState(0);
    const [selectedTab, setSelectedTab] = useState('');

    const tabPanel = () => {
        let initialIndx = 0;
        return tabs.map((tab, indx) => {
            const { hasPermission } = usePermission(tab.module);
            const Component = tab.component;
            if (hasPermission('view')) {
                return (
                    <TabPanel value={value} panel={selectedTab} panelIndx={`simple-tab-${indx}`} index={++initialIndx} key={indx}>
                        <Component permission={hasPermission} />
                    </TabPanel>
                )
            }
        })
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
        setSelectedTab(event.target.id);
    };


    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} scrollButtons={false}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="visible arrows tabs example"
                    sx={{
                        [`& .${tabsClasses.scrollButtons}`]: {
                            '&.Mui-disabled': { opacity: 0.3 },
                        },
                    }}>
                    {
                        tabs.map((tab, indx) => {
                            const { hasPermission } = usePermission(tab.module);
                            return hasPermission('view') && <Tab key={indx} label={tab.name} {...a11yProps(indx)} />;
                        })
                    }
                </Tabs>
            </Box>
            {
                tabPanel()
            }
        </Box>
    );
}

export default ConfigurationContent;