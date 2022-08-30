import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Button, Checkbox, FormControl, FormControlLabel, TextField, Paper, FormHelperText, TextareaAutosize, Card, CardContent, CardHeader, Typography } from '@mui/material';
import * as yup from 'yup';
import _ from '@lodash';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';
import AddMore from 'app/shared-components/AddMore';

function DowntimeConfiguration() {
    const dispatch = useDispatch();
    const [allowedIPs, setAllowedIPs] = useState([])
    const [message, setMessage] = useState([])
    const [shutdown, setShutdown] = useState(false)

    useEffect(() => {
        getDowntime();
    }, [])
    const onIpChangeFromChild = (val) => {
        setAllowedIPs(val);
    }
    const onMessageChange = (val) => {
        setMessage(val);
    }
    const onShutdownCheck = (event) => {
        setShutdown(event.target.checked);
    }

    const getDowntime = () => {
        axios.get('ip-downtime-settings').then(res => {
            if (res.data.status) {
                // setAllowedIPs(res.data.data.ip_list)
                setMessage(res.data.data.downtime_text.downtime_message)
                setShutdown(res.data.data.downtime_text.status === 1)
            } else {
                dispatch(showMessage({ variant: 'error', message: res.data.message }))
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Something went wrong' }))
        });
    }

    const onSubmit = (e) => {
        e.preventDefault();
        axios.post('ip-downtime-update', {
            new_ip_list: allowedIPs,
            updated_downtime_text: message,
            shutdown_checked: shutdown,
        }).then(res => {
            console.log(res)
            return
            const variant = res.data.status ? 'success' : 'error';
            dispatch(showMessage({ variant, message: res.data.message }))
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Something went wrong' }))
        });
    }
    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-64 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full mx-auto sm:mx-0">
                    <div className="flex flex-col justify-center w-full">
                        <Card variant="outlined" className="mb-20">
                            <CardHeader title="Allowed IP List" />
                            <CardContent>
                                <AddMore
                                    data={allowedIPs}
                                    placeholder="Enter allowed IP(s)"
                                    onChange={onIpChangeFromChild}
                                    insertType="ip"
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
                            defaultValue={message}
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
                    </div>
                </div>
            </Paper>
        </div>
    )
}

export default DowntimeConfiguration;