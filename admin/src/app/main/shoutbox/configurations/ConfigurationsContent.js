// import List from "../crud/list/List";
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch } from '@mui/material';
import { motion } from 'framer-motion';
import jwtServiceConfig from "src/app/auth/services/jwtService/jwtServiceConfig";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';

function ConfigurationsContent() {
    const module = "shoutbox-configurations";
    const dispatch = useDispatch();
    const [responseData, setResponseData] = useState({});
    useEffect(() => {
        getShoutboxCongurations();
    }, [module]);
    const getShoutboxCongurations = () => {
        axios.get(jwtServiceConfig.shoutboxConfigurations)
            .then((response) => {
                if (response.status === 200) {
                    setResponseData(response.data.results.result.data);
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    const updateStatus = (event, id) => {
        axios.post(jwtServiceConfig.shoutboxConfigurationUpdate + `/${id}`, {
            status: event.target.checked ? 1 : 0
        })
            .then((response) => {
                if (response.status === 200) {
                    getShoutboxCongurations();
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }

    return (
        <div>
            <motion.div
                className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16 mb-10"
                initial={{ x: -20 }}
                animate={{ x: 0, transition: { delay: 0.3 } }}
            >
                <Typography className="text-24 md:text-32 font-extrabold tracking-tight capitalize">
                    {module.split('-').join(' ')}
                </Typography>
            </motion.div>
            <TableContainer component={Paper} className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                {Object.keys(responseData).length > 0 && <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Event</TableCell>
                            <TableCell align="right">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {responseData.map((row) => {
                            return (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell>{row.event_name}</TableCell>
                                    <TableCell align="right">
                                        <Switch
                                            className="mb-24"
                                            checked={!!row.status}
                                            onChange={(event) => updateStatus(event, row.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>}
            </TableContainer>
        </div>
    );
}
export default ConfigurationsContent;