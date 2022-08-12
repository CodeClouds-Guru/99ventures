import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import jwtServiceConfig from '../../auth/services/jwtService/jwtServiceConfig';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from "react-router-dom";
import jwtService from '../../auth/services/jwtService';


function CompanySiteContent() {
    const [companies, setCompanies] = useState([]);
    const [value, setValue] = useState(0);
    const navigate = useNavigate();

    const a11yProps = (index) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    const setCompanySiteId = (companyId, SiteId) => {
        jwtService.setCompanySiteId(companyId, SiteId);
        navigate("/dashboard");
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
                if (response.data.companies.length === 1 && response.data.companies[0].CompanyPortals.length === 1) {
                    setCompanySiteId(response.data.companies[0].id, response.data.companies[0].CompanyPortals[0].id);
                }
            } else {
                console.log('Error');
            }
        });
    }

    const portalBoxElement = (company) => {
        return company.CompanyPortals.map((portal, key) => {
            return <Card sx={{ maxWidth: 345, marginLeft: 1 }} key={`portal-${key}`}>
                <CardMedia
                    component="img"
                    height="140"
                    image="/material-ui-static/images/cards/cc.jpg"
                    alt="green iguana"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {portal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {portal.domain}
                    </Typography>
                </CardContent>
                <CardActions sx={{ alignItems: 'center' }}>
                    <Button variant="contained" endIcon={<SendIcon />} onClick={() => setCompanySiteId(company.id, portal.id)}>
                        Configure
                    </Button>
                </CardActions>
            </Card>
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
                    <Box sx={{ marginTop: '4rem' }} style={tabBodyCss}>
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
        <Box>
            <Box
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons={false}
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