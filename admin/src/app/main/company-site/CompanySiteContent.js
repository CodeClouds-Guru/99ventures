import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import jwtServiceConfig from '../../auth/services/jwtService/jwtServiceConfig';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CompanySiteContent() {
    const [companies, setCompanies] = useState([]);
    const [value, setValue] = useState(0);

    const a11yProps = (index) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    const CompaniesElement = () => {

        let compElem = companies.map((company, key) => {
            return <Tab label={company.name} {...a11yProps(key)} key={`company-${key}`} />
        })
        return compElem;
    }

    const getCompanies = () => {
        axios.get(jwtServiceConfig.companies).then((response) => {
            if (response.data.status) {
                setCompanies(response.data.companies);
                setValue(0);
            } else {
                console.log('Error');
            }
        });
    }

    const portalBoxElement = (company) => {
        return company.CompanyPortals.map((portal, key) => {
            return <Box sx={{ p: 3 }} key={`portal-${key}`}>
                <Typography>
                    <Link to={`/dashboard/${company.id}/${portal.id}`}>{portal.name}</Link>
                </Typography>
            </Box>
        })
    }

    useEffect(() => {
        getCompanies();
    }, []);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const tabBodyCss = {
        display: 'flex',

    }
    const TabPanel = (props) => {
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
                    <Box sx={{ p: 3 }} style={tabBodyCss}>
                        {portalBoxElement(companies[index])}
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

    return (
        <Box sx={{ width: '100%' }}>
            <Box
                sx={{ borderBottom: 1, borderColor: 'divider' }}
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
                    {CompaniesElement()}
                </Tabs>
            </Box>
            {
                companies.map((company, k) => {
                    return <TabPanel value={value} index={k} key={`company-${k}`} />

                })
            }
        </Box>
    );
}

export default CompanySiteContent;