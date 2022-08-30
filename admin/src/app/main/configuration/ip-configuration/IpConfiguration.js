import { Button, Paper, Card, CardContent, CardHeader } from '@mui/material';
import _ from '@lodash';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import AddMore from 'app/shared-components/AddMore';
import axios from 'axios';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';

function IpConfiguration() {
    let [ips, setIps] = useState([]);
    let [isps, setIsps] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchData();
    }, [])

    const submit = (e) => {
        e.preventDefault();
        axios.post(jwtServiceConfig.saveIpConfiguration, {
            ips,
            isps,
        }).then(res => {
            const variant = res.data.status ? 'success' : 'error';
            dispatch(showMessage({ variant, message: res.data.message }))
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Something went wrong' }))
        });
    }

    const onIpChangeFromChild = (val) => {
        setIps(val);
    }

    const onIspChangeFromChild = (val) => {
        setIsps(val);
    }

    const fetchData = () => {
        axios.get(jwtServiceConfig.getIpConfiguration).then(res => {
            if (res.data.status) {
                setIps(res.data.ip_list)
                setIsps(res.data.isp_list)
            } else {
                dispatch(showMessage({ variant: 'error', message: res.data.message }))
            }
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
                            <CardHeader title="Denied IP List" />
                            <CardContent>
                                <AddMore
                                    data={ips}
                                    placeholder="Enter IP"
                                    onChange={onIpChangeFromChild}
                                />
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardHeader title="Denied ISP List" />
                            <CardContent>
                                <AddMore
                                    data={isps}
                                    placeholder="Enter ISP"
                                    onChange={onIspChangeFromChild}
                                />
                            </CardContent>
                        </Card>

                        <span className="flex items-center justify-center">
                            <Button
                                variant="contained"
                                color="secondary"
                                className="w-1/2 mt-24"
                                aria-label="Save"
                                size="large"
                                onClick={submit}
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

export default IpConfiguration;