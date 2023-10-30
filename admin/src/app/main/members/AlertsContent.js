import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { useState, useEffect, } from 'react';
import { Box, Divider, Button, Switch } from '@mui/material';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios'
import CustomerLoader from '../../shared-components/customLoader/Index'

const AlertsContent = () => {
    const { moduleId } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(true);
    const [alertsData, setAlertsdata] = useState([]);
    const [switchValues, setSwitchValues] = useState({});

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

    return (
        <div className="lg:w-full">
            <Divider textAlign="left"><h3>E-mail Alerts</h3></Divider>
            <Box className="mt-10 p-16 w-full border-2 rounded-2xl">
                <div className="w-full pt-10 flex flex-col">
                    {alertsData.map((row) => {
                        return (
                            <div className="w-full md:w-1/3 px-28 py-10 flex justify-between" key={row.id}>
                                <div className="w-auto">
                                    <b>{row.name}</b>
                                </div>
                                <div className="w-auto mr-32">
                                    <Switch
                                        sx={{ marginTop: '-1rem' }}
                                        checked={switchValues[row.id]}
                                        onChange={(event) => handleSwitch(event, row.id)}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex w-full justify-end">
                    <Button className="mr-20" variant="contained" color="secondary" size="large" onClick={(event) => { event.preventDefault(); updateEmailAlerts() }}>Save</Button>
                </div>
            </Box>
        </div>
    );
}

export default AlertsContent;