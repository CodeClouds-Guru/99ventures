import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { useState, useEffect, } from 'react';
import { Box, Divider, Button, Switch } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import AccountNotes from './components/AccountNotes';
import { useDispatch } from 'react-redux';
import axios from 'axios'
import CustomerLoader from '../../shared-components/customLoader/Index'

const labelStyling = {
    '@media screen and (max-width: 1400px)': {
        fontSize: '1.2rem'
    },
    '@media screen and (max-width: 1199px)': {
        fontSize: '1.6rem'
    },
    '@media screen and (max-width: 768px)': {
        fontSize: '1.4rem'
    }
}

const textFieldStyle = {
    width: '100%',
    '& .muiltr-r11gs3-MuiInputBase-root-MuiInput-root': {
        minHeight: '30px',
        '& .MuiInputBase-input': {
            ...labelStyling
        }
    }
}

const iconStyle = {
    width: '20px',
    height: '20px',
    minWidth: '20px',
    minHeight: '20px',
    fontSize: '20px',
    lineHeight: 20,
    '@media screen and (max-width: 1600px)': {
        width: '18px',
        height: '18px',
        minWidth: '18px',
        minHeight: '18px',
        fontSize: '18px',
        lineHeight: 18
    },
    '@media screen and (max-width: 1400px)': {
        width: '15px',
        height: '15px',
        minWidth: '15px',
        minHeight: '15px',
        fontSize: '15px',
        lineHeight: 15
    },
    '@media screen and (max-width: 1279px)': {
        width: '20px',
        height: '20px',
        minWidth: '20px',
        minHeight: '20px',
        fontSize: '20px',
        lineHeight: 20
    }
}

const autoCompleteStyle = {
    '& .MuiAutocomplete-inputRoot': {
        minHeight: '30px',
        '& .MuiInputBase-input': {
            ...labelStyling
        }
    },
    '& .MuiFormControl-fullWidth': {
        '@media screen and (max-width: 1400px)': {
            width: '100%'
        }
    }
}

const iconLabel = {
    '@media screen and (max-width: 1400px)': {
        padding: '3px'
    },
}

const selectStyle = {
    // minWidth: '220px',
    // '@media screen and (max-width: 1400px)': {
    //     minWidth: '100%'
    // }
}

const listItemTextStyle = {
    margin: '2px 0',
    '& .MuiListItemText-primary': {
        display: 'flex',
        justifyContent: 'space-between'
    },
    '@media screen and (max-width: 1400px)': {
        '& .left-textbox': {
            paddingRight: '10px'
        }
    }
}

const chipStyle = {
    '@media screen and (max-width: 1400px)': {
        fontSize: '1.2rem',
        height: '25px',
    },
}

const AlertsContent = () => {
    const module = 'Alerts';
    const { moduleId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(true);
    const [alertsData, setAlertsdata] = useState([]);
    const [switchValues, setSwitchValues] = useState({});
    // const switchObj={}

    const getAlerts = () => {
        axios.get(jwtServiceConfig.getSingleMember + '/' + moduleId, { params: { type: 'email_alert' } })
            .then(res => {
                setLoader(false);
                if (res.data.results.data) {
                    setAlertsdata(res.data.results.data.email_alert_list)
                }
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.message }));
            })
    }

    useEffect(() => {
        getAlerts();
    }, [location]);

    const handleSwitch = (event, id) => {

    }
    if (loader) {
        return (
            <CustomerLoader />
        )
    }

    return (
        <div className="lg:w-full">
            {/* <div className="flex items-start justify-between"> */}
            <Divider textAlign="left"><h3>E-mail Alerts</h3></Divider>
            <Box className="mt-10 p-16 w-full border-2" >
                {/* <div className=" w-full items-start justify-between"> */}
                {alertsData.map(row =>
                (
                    <div className="w-4/12 flex" key={row.id}>
                        <div className="w-2/3 items-start justify-between">
                            <b>{row.name}</b>
                        </div>
                        <div className="w-1/3 items-start justify-between">
                            <Switch
                                className="mb-32"
                                checked={row.MemberEmailAlerts.length > 0}
                                onChange={(event) => handleSwitch(event, row.name)}
                            />
                        </div>
                    </div>))}
                {/* </div> */}
                {/* <Divider className="w-full my-10"></Divider> */}

            </Box>
            {/* </div> */}
        </div>
    );
}

export default AlertsContent;