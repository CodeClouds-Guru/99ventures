import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import axios from 'axios';
import Sitemap from './Sitemap';
import Others from './Others';

const getChild = (slug, propsData) => {
    // if (slug === 'sitemap.xml')
    //     return <Sitemap {...propsData} />
    // else
    return <Others {...propsData} />
}
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function SeoConfiguration(props) {
    const [value, setValue] = React.useState(0);
    const [staticContents, setStaticContents] = React.useState([]);
    const dispatch = useDispatch();
    const [permission, setPermission] = React.useState(false)

    React.useEffect(() => {
        setPermission(
            (props.permission('save') || props.permission('update'))
        );
    }, [props.permission]);

    React.useEffect(() => {
        fetchData();
    }, []);

    const updateContent = (data) => {
        axios.post(`${jwtServiceConfig.updateSeoConguration}/${data.id}`, data).then((resp) => {
            if (resp.data.results.status) {
                dispatch(showMessage({ variant: 'success', message: resp.data.results.message }))
                fetchData();
            }
        }).catch(error => {
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
        })
    }

    const fetchData = () => {
        axios.get(jwtServiceConfig.getSeoConguration)
            .then((response) => {
                if (response.data.results.status) {
                    setStaticContents([...response.data.results.data]);
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box className="seo-configuration-sec"
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 'auto' }}
        >
            <Tabs
                className="seo-configuration-tab"
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: 'divider' }}
            >
                {staticContents.map((item, index) => (
                    <Tab label={item.name} {...a11yProps(index)} />
                ))}
            </Tabs>
            {staticContents.map((item, index) => (
                <TabPanel value={value} index={index} className="w-full seo-tab-pannel">
                    {getChild(item.slug, { data: item, updateContent })}
                </TabPanel>
            ))}
        </Box>
    );
}