import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import jwtServiceConfig from '../../auth/services/jwtService/jwtServiceConfig';
import axios from 'axios';

function CompanySiteContent() {
    const [isCompanies, setCompanies] = useState([]);
    useEffect(() => {
        axios.get(jwtServiceConfig.companies).then((response) => {
            if (response.data.status) {
                setCompanies(response.data.companies);
            } else {
                reject(response.data.error);
            }
        });
    }, []);
    const [value, setValue] = useState(0);
    console.log(isCompanies);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                maxWidth: { xs: '100%' },
                bgcolor: 'background.paper',
            }}
        >
            <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons
                aria-label="visible arrows tabs example"
                sx={{
                    [`& .${tabsClasses.scrollButtons}`]: {
                        '&.Mui-disabled': { opacity: 0.3 },
                    },
                }}
            >
                <Tab label="Item One" />
                <Tab label="Item Two" />
                <Tab label="Item Three" />
                <Tab label="Item Four" />
                <Tab label="Item Five" />
                <Tab label="Item Six" />
                <Tab label="Item Seven" />
            </Tabs>
        </Box>
    );
}

export default CompanySiteContent;