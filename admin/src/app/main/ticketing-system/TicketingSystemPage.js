import { useState, useEffect } from 'react';
import { FormControl, TextField, Paper, FormHelperText, Switch, InputLabel, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import AlertDialog from 'app/shared-components/AlertDialog';

function TicketingSystemPage() {
    return (
        <div className="flex flex-col flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-32 px-24 md:px-32">
            <div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0">
                <div className="flex items-center max-w-full">
                    <div
                        className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16"
                        initial={{ x: -20 }}
                        animate={{ x: 0, transition: { delay: 0.3 } }}
                    >
                        <Typography className="text-16 sm:text-20 truncate font-semibold">
                            Ticketing System
                        </Typography>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-64 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="flex mx-auto sm:mx-0 ticketing-system">
                        <div className="w-1/2">
                            <div>aa</div>
                        </div>
                        <div className="w-1/2">
                            bb
                        </div>
                    </div>
                </Paper>
            </div>
        </div>
    )
}

export default TicketingSystemPage;