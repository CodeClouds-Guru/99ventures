import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { useState, useEffect, } from 'react';
import { Box, Button, Switch, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios'
import CustomerLoader from '../../shared-components/customLoader/Index'
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';


const AlertsContent = (props) => {
    const { moduleId } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(true);
    const [alertsData, setAlertsdata] = useState([]);
    const [switchValues, setSwitchValues] = useState({});
    const [shoutboxBlocked, setShoutboxBlocked] = useState(false);   

    useEffect(()=>{
        if(props.userdata.is_shoutbox_blocked !== undefined) {
            setShoutboxBlocked(props.userdata.is_shoutbox_blocked);
        }
    }, [props]);

    const getEmailAlerts = () => {
        axios.get(jwtServiceConfig.getSingleMember + '/' + moduleId, { params: { type: 'email_alert' } })
            .then(res => {
                setLoader(false);
                if (res.data.results.data) {
                    setAlertsdata(res.data.results.data.email_alert_list);
                    res.data.results.data.email_alert_list.map(row => {
                        switchValues[row.id] = !!row.MemberEmailAlerts.length > 0;
                    })
                }
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.message }));
            })
    }

    useEffect(() => {
        getEmailAlerts();
    }, [location]);

    const handleSwitch = (event, id) => {
        setSwitchValues({ ...switchValues, [id]: event.target.checked })
    }

    if (loader) {
        return (
            <CustomerLoader />
        )
    }

    const updateEmailAlerts = () => {
        let email_alerts_arr = [];
        Object.keys(switchValues).map(val => {
            switchValues[val] ? email_alerts_arr.push(val) : '';
        })

        axios.post(jwtServiceConfig.memberUpdate + '/' + moduleId, {
            type: 'email_alerts',
            email_alerts: email_alerts_arr
        })
            .then(res => {
                if (res.data.results.message) {
                    dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                    getEmailAlerts();
                }
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
            });
    }
    

    const shoutboxSettings = () => {
        axios.post(jwtServiceConfig.memberUpdate + '/' + moduleId, {
            is_shoutbox_blocked: shoutboxBlocked,
            type: 'email_alerts',
        })
        .then(res => {
            if (res.data.results.message) {
                props.getmember();
                dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
            }
        })
        .catch(errors => {
            dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
        });
    }

    return (
        <div className="lg:w-full flex flex-wrap">
            <Box className="mt-10 p-16 w-full md:w-1/3 border-2 rounded-2xl mr-10">
                <List
                    sx={{ width: '100%' }}
                    subheader={<ListSubheader>Email Alerts Settings</ListSubheader>}
                >
                    {
                        alertsData.map((row) => {
                            return (
                                <ListItem key={row.id}>
                                    <ListItemIcon sx={{minWidth: '35px'}}>
                                        <FuseSvgIcon className="text-48" size={20} color="action">material-outline:double_arrow</FuseSvgIcon>
                                    </ListItemIcon>
                                    <ListItemText id={`switch-list-label-${row.name}`} primary={row.name} />                                   
                                    <Switch
                                        edge="end"
                                        checked={switchValues[row.id]}
                                        onChange={(event) => handleSwitch(event, row.id)}
                                        inputProps={{
                                            'aria-labelledby': `switch-list-label-${row.name}`,
                                        }}
                                    />
                                </ListItem>
                            )
                        })
                    }
                </List>
                <div className="flex w-full justify-end">
                    <Button className="mr-20" variant="contained" color="secondary" size="large" onClick={(event) => { event.preventDefault(); updateEmailAlerts() }}>Update</Button>
                </div>
            </Box>
            <Box className="mt-10 p-16 w-full md:w-1/3 border-2 rounded-2xl">
                <List
                    sx={{ width: '100%', minHeight: '326px' }}
                    subheader={<ListSubheader>Shoutbox Settings</ListSubheader>}
                >
                    <ListItem>
                        <ListItemIcon sx={{minWidth: '35px'}}>
                            <FuseSvgIcon className="text-48" size={20} color="action">material-outline:double_arrow</FuseSvgIcon>
                        </ListItemIcon>
                        <ListItemText id={`switch-list-label-shoutbox-blocked`} primary="Block Shoutbox" />                                   
                        <Switch
                            edge="end"
                            checked={Boolean(shoutboxBlocked)}
                            onChange={()=>setShoutboxBlocked(!shoutboxBlocked)}
                            inputProps={{
                                'aria-labelledby': `switch-list-label-shoutbox-blocked`,
                            }}
                        />
                    </ListItem>
                </List>
                <div className="flex w-full justify-end">
                    <Button className="mr-20" variant="contained" color="secondary" size="large" onClick={shoutboxSettings}>Update</Button>
                </div>
            </Box>
        </div>
    );
}

export default AlertsContent;