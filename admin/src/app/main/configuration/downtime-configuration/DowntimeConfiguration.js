import { Button, Checkbox, FormControl, FormControlLabel, TextField, Paper, Card, CardContent, CardHeader, Typography } from '@mui/material';
import _ from '@lodash';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';
import AddMore from 'app/shared-components/AddMore';

function DowntimeConfiguration(props) {
    const dispatch = useDispatch();
    const [allowedIPs, setAllowedIPs] = useState([])
    const [message, setMessage] = useState("")
    const [shutdown, setShutdown] = useState(false)
    const [permission, setPermission] = useState(false)

    useEffect(() => {
        setPermission(
            (props.permission('save') || props.permission('update'))
        );
        getDowntime();
    }, [props.permission]);

    const onIpChangeFromChild = (val) => {
        setAllowedIPs(val);
    }
    const onMessageChange = (event) => {
        setMessage(event.target.value);
    }
    const onShutdownCheck = (event) => {
        setShutdown(event.target.checked);
    }

    const getDowntime = () => {
        axios.get(jwtServiceConfig.getDowntimeConfiguration).then(res => {
            if (res.data.results.status) {
                setAllowedIPs(res.data.results.data.ip_list)
                setMessage(res.data.results.data.downtime_text.downtime_message)
                setShutdown(res.data.results.data.downtime_text.status === 2)    // status 2 is checked
            } else {
                dispatch(showMessage({ variant: 'error', message: res.data.errors }))
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Something went wrong' }))
        });
    }

    const onSubmit = (e) => {
        e.preventDefault();
        axios.post(jwtServiceConfig.saveDowntimeConfiguration, {
            new_ip_list: allowedIPs,
            updated_downtime_text: message,
            shutdown_checked: shutdown,
        }).then(res => {
            const variant = res.data.results.status ? 'success' : 'error';
            dispatch(showMessage({ variant, message: res.data.results.message }))
            getDowntime() ? res.data.results.status : null
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Something went wrong' }))
        });
    }

    const addMyIP = () => {
        fetch('https://geolocation-db.com/json/')
            .then(resp => {
                resp.json().then((data) => {
                    if (data.IPv4.trim().length > 0 && !allowedIPs.includes(data.IPv4)) {
                        setAllowedIPs([...allowedIPs, data.IPv4])
                    }
                })
            }).catch((e) => {
                console.error(e)
                dispatch(showMessage({ variant: 'error', message: 'Unable to get your IP, Please check if you are behind any firewall' }))
            });

    }

    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-36 md:p-36 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full mx-auto sm:mx-0">
                    <div className="flex flex-col justify-center w-full">
                        <Card variant="outlined" className="mb-20">
                            {
                                permission ?
                                    <CardHeader
                                        title="Allowed IP List"
                                        action={
                                            <Button size="small" variant="outlined" onClick={addMyIP}>Add Mine</Button>
                                        }
                                    />
                                    : ''
                            }

                            <CardContent>
                                <AddMore
                                    permission={permission}
                                    data={allowedIPs}
                                    placeholder="Enter allowed IP(s)"
                                    onChange={onIpChangeFromChild}
                                    insertType="ip"
                                    validationRegex="(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])"
                                />
                            </CardContent>
                        </Card>

                        <TextField
                            className="mb-24"
                            label="Message"
                            type="text"
                            variant="outlined"
                            fullWidth
                            multiline
                            minRows={3}
                            value={message}
                            onChange={onMessageChange}
                            disabled={!permission}
                        />

                        <FormControl className="items-center">
                            <FormControlLabel
                                control={
                                    <Checkbox checked={shutdown} onChange={onShutdownCheck} />
                                }
                                label={<Typography variant="body2" color="red">
                                    <b> SHUTDOWN</b>- warning. Clicking this will take your website offline unless your IP is added above. Your admin panel will still be accessible.
                                </Typography>}
                            />
                        </FormControl>

                        {
                            permission ?
                                <span className="flex items-center justify-center">
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        className="w-1/2 mt-24"
                                        aria-label="Save"
                                        onClick={onSubmit}
                                        size="large"
                                    >
                                        Save
                                    </Button>
                                </span>
                                : ''
                        }
                    </div>
                </div>
            </Paper>
        </div>
    )
}

export default DowntimeConfiguration;