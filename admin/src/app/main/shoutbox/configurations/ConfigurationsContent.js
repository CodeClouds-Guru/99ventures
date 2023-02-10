// import List from "../crud/list/List";
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, TextField, Button } from '@mui/material';
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
    const [singleRow, setSingleRow] = useState({ verbose: '', status: 0 });

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
    const handleData = (event) => {
        setResponseData(prevState => {
            const newState = prevState.map(obj => {
                if (event.target.name === `verbose-${obj.id}`) {
                    return { ...obj, verbose: event.target.value };
                } else if (event.target.name === `status-${obj.id}`) {
                    return { ...obj, status: event.target.checked ? 1 : 0 }
                }
                return obj;
            });
            return newState;
        });
    }
    const updateData = (target_id) => {
        const params = {};
        responseData.map((row, index) => {
            row.id === target_id ? Object.assign(params, { verbose: row.verbose, status: row.status }) : '';
        });
        axios.post(jwtServiceConfig.shoutboxConfigurationUpdate + `/${target_id}`, params)
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
                            <TableCell align="center">Verbose</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Action</TableCell>
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
                                    <TableCell align="center">
                                        <TextField
                                            value={row.verbose || ''}
                                            className="w-full mb-10 p-5 capitalize"
                                            label="Verbose"
                                            type="text"
                                            variant="outlined"
                                            name={`verbose-${row.id}`}
                                            onChange={(event) => handleData(event)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Switch
                                            className="mb-24"
                                            checked={!!row.status}
                                            name={`status-${row.id}`}
                                            onChange={(event) => handleData(event)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            className="whitespace-nowrap mx-4 w-full mb-24"
                                            variant="contained"
                                            color="secondary"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                updateData(row.id)
                                            }}
                                        >
                                            Save
                                        </Button>
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