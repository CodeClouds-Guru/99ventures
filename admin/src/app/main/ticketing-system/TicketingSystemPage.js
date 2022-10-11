import { useState, useEffect } from 'react';
import { FormControl, TextField, Paper, FormHelperText, Switch, InputLabel, Button, Typography, Select, MenuItem, TextareaAutosize, Divider, IconButton, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import AlertDialog from 'app/shared-components/AlertDialog';

function TicketingSystemPage() {
    const [ticketStatus, setTicketStatus] = useState('');
    const [quickResponse, setQuickResponses] = useState('');
    const [memberStatus, setMemberStatus] = useState('');

    const handleChangeTicketStatus = (event) => {
        setTicketStatus(event.target.value);
    };
    const handleChangeQuickResponse = (event) => {
        setQuickResponses(event.target.value);
    };
    const handleMemberStatus = (event) => {
        setMemberStatus(event.target.value);
    };

    return (
        <div className="flex flex-row flex-1 w-full items-center justify-between space-y-0 p-10">
            <div className="flex flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 w-full h-full">
                <Paper className="flex h-full md:items-center md:justify-center w-full  p-10 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="flex w-full h-full mx-auto sm:mx-0 ticketing-system">
                        <div className="h-full w-1/2 border-2">
                            <div className="flex flex-row justify-end p-0 m-0">
                                <FormControl sx={{ m: 1, minWidth: 130 }} size="small">
                                    <InputLabel id="demo-select-small">Ticket Status</InputLabel>
                                    <Select
                                        labelId="demo-select-small"
                                        id="demo-select-small"
                                        value={ticketStatus}
                                        label="Ticket Status"
                                        onChange={handleChangeTicketStatus}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="opened">Opened</MenuItem>
                                        <MenuItem value="closed">Closed</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="flex-row w-full px-10" style={{ background: '#efeded', minHeight: '22rem' }}>
                                <div className="w-auto flex flex-col justify-items-start p-5" style={{ background: '#dcdcdc' }}>
                                    <div className="flex flex-row justify-between">
                                        <b>Milly Hopkins</b>
                                        <div className="flex justify-end">25th Sep 2022</div>
                                    </div>
                                    <div>
                                        <p>
                                            Hi, I faced issued regarding this.
                                        </p>
                                    </div>
                                </div>
                                <div className="w-auto flex flex-col justify-items-end p-5 mt-10" style={{ background: '#dcdcdc' }}>
                                    <div className="flex flex-row justify-between">
                                        <b>John Doe</b>
                                        <div className="flex justify-end">25th Sep 2022</div>
                                    </div>
                                    <div>
                                        <p>
                                            Hi, Milly we looking on this and keep you posted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-row h-auto w-full px-10">
                                <FormControl variant="standard" className="w-full mt-0 mb-5" >
                                    <InputLabel id="demo-simple-select-standard-label">Select quick response</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={quickResponse}
                                        label="Quick response"
                                        onChange={handleChangeQuickResponse}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value="will check">Will check</MenuItem>
                                        <MenuItem value="got it">Got it</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextareaAutosize className="w-full border-1"
                                    aria-label="empty textarea"
                                    placeholder=""
                                    minRows={6}
                                    sx={{ background: '#dcdcdc' }}
                                />
                                <div className="flex flex-row justify-between h-auto w-full px-10">
                                    <div className="flex flex-col justify-start">
                                        attached file
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <Stack direction="row" spacing={1}>
                                            <IconButton aria-label="fingerprint" color="secondary">
                                                <FuseSvgIcon className="text-48" size={20} color="secondary">feather:paperclip</FuseSvgIcon>
                                            </IconButton>
                                            <Button variant="contained" color="secondary" endIcon={<SendIcon />}>
                                                Send
                                            </Button>
                                        </Stack>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-full w-1/2 border-2">
                            <div className="flex flex-row justify-start p-0 m-0 pl-5 mt-5">
                                <Typography component={'h2'}>
                                    <b>Member details</b>
                                </Typography>
                            </div>
                            <div className="flex flex-row justify-between p-0 m-0 pb-10">
                                <div className="flex flex-col w-1/2 justify-start">
                                    <div className="flex justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Username:</b>
                                            </Typography>
                                            milly101
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Full name:</b>
                                            </Typography>
                                            Milly Hopkins
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Email:</b>
                                            </Typography>
                                            millyhopkins@gmail.com
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col w-1/2 justify-end">
                                    <div className="flex justify-end">
                                        <FormControl sx={{ m: 1, minWidth: 130 }} size="small">
                                            <InputLabel id="demo-select-small">Status</InputLabel>
                                            <Select
                                                labelId="demo-select-small"
                                                id="demo-select-small"
                                                value={memberStatus}
                                                label="Status"
                                                onChange={handleMemberStatus}
                                            >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="not verified">Not Verified</MenuItem>
                                                <MenuItem value="verified">Verified</MenuItem>
                                                <MenuItem value="blacklisted">Blacklisted</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="flex flex-row justify-end pr-20">
                                        <div className="flex">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Total Earnings:</b>
                                            </Typography>
                                            56 USD
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            <div className="flex flex-col justify-start p-0 m-0">
                                <div className="flex flex-row justify-start p-0 m-0 pl-5 mt-5">
                                    <Typography component={'h2'}>
                                        <b>Notes</b>
                                    </Typography>
                                </div>
                                <div className="w-auto flex flex-col justify-items-center p-5 mt-10" style={{ background: '#dcdcdc' }}>
                                    <div className="flex flex-row justify-between">
                                        <b>John Doe</b>
                                        <div className="flex justify-end">11th Sep 2022</div>
                                    </div>
                                    <div>
                                        <p>
                                            Hi, we looking on this and keep you posted.
                                        </p>
                                    </div>
                                </div>
                                <div className="w-auto flex flex-col justify-start p-5 mt-10" style={{ background: '#dcdcdc' }}>
                                    <div className="flex flex-row justify-between">
                                        <b>John Doe</b>
                                        <div className="flex justify-end">11th Sep 2022</div>
                                    </div>
                                    <div>
                                        <p>
                                            Hi, we looking on this and keep you posted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            <div className="flex flex-col justify-start p-0 m-0">
                                <div className="flex flex-row justify-start p-0 m-0 pl-5 mt-5">
                                    <Typography component={'h2'}>
                                        <b>Previous Tickets</b>
                                    </Typography>
                                </div>
                                <div className="w-auto flex flex-col justify-start p-5 mt-10" style={{ background: '#dcdcdc' }}>
                                    <div className="flex flex-row justify-end">11th Sep 2022</div>
                                    <div>
                                        <p>
                                            Hi, we looking on this and keep you posted.
                                        </p>
                                    </div>
                                </div>
                                <div className="w-auto flex flex-col justify-start p-5 mt-10" style={{ background: '#dcdcdc' }}>
                                    <div className="flex flex-row justify-end">12th Sep 2022</div>
                                    <div>
                                        <p>
                                            Hi, we looking on this and keep you posted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Paper>
            </div>
        </div>
    )
}

export default TicketingSystemPage;