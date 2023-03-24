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
            {/* <div className="flex items-start justify-between"> */}
            <Divider textAlign="left"><h3>E-mail Alerts</h3></Divider>
            <Box className="mt-10 p-16 w-full border-2 border-r-2" >
                {/* <div className=" w-full items-start justify-between"> */}
                {alertsData.map((row) => {
                    return (<div className="w-4/12 flex" key={row.id}>
                        <div className="w-2/3 items-start justify-between">
                            <b>{row.name}</b>
                        </div>
                        <div className="w-1/3 items-start justify-between">
                            <Switch
                                className="mb-32"
                                checked={switchValues[row.id]}
                                onChange={(event) => handleSwitch(event, row.id)}
                                inputProps={{ 'aria-label': 'controlled' }}

                            />
                        </div>
                    </div>)
                })}
                {/* </div> */}
                {/* <Divider className="w-full my-10"></Divider> */}
                <div className="flex w-full justify-end">
                    <Button variant="contained" color="secondary" size="large" onClick={(event) => { event.preventDefault(); updateEmailAlerts() }}>Save</Button>
                </div>
            </Box>
            {/* </div> */}
        </div>
    );
}

export default AlertsContent;