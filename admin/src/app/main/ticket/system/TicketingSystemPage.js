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

function TicketingSystemPage(props) {
    const dispatch = useDispatch();
    const [ticketStatus, setTicketStatus] = useState('');
    const [quickResponse, setQuickResponses] = useState('');
    const [memberStatus, setMemberStatus] = useState('');
    const [ticketConversations, setTicketConversations] = useState([]);
    const [memberDetails, setMemberDetails] = useState({});
    const [previousTickets, setPreviousTIckets] = useState([]);
    useEffect(() => {
        getTicketDetails();
    }, [])
    const handleChangeTicketStatus = (event) => {
        setTicketStatus(event.target.value);
    };
    const handleChangeQuickResponse = (event) => {
        setQuickResponses(event.target.value);
    };
    const handleMemberStatus = (event) => {
        setMemberStatus(event.target.value);
    };
    const getTicketDetails = () => {
        axios.get(`${jwtServiceConfig.getSingleTickketDetails}/${props.ticketId}`)
            .then(response => {
                if (response.data.results.status) {
                    console.log(response.data.results.data);
                    setTicketStatus(response.data.results.data.status);
                    setTicketConversations(response.data.results.data.TicketConversations);
                    setMemberDetails(response.data.results.data.Member);
                    setMemberStatus(response.data.results.data.Member.status);
                    setPreviousTIckets(response.data.results.data.previous_tickets);
                }
            }).catch(err => {
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
            })
    }
    return (
        <div className="flex flex-row flex-1 w-full items-center justify-between space-y-0 p-10">
            <div className="flex flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 w-full h-full">
                <Paper className="flex h-full md:items-center md:justify-center w-full  p-10 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="flex w-full h-full mx-auto sm:mx-0">
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
                                        <MenuItem value="1">Opened</MenuItem>
                                        <MenuItem value="2">Pending</MenuItem>
                                        <MenuItem value="0">Closed</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="flex-row w-full px-10" style={{ minHeight: '13.7rem', overflow: 'scroll', height: '13rem', }}>
                                {ticketConversations.map((val, key) => {
                                    // console.log(val, key);
                                    return (
                                        <>
                                            <div key={key} className="w-10/12 flex flex-col justify-around p-5 mt-10" style={val.user_id ? { background: '#dcdcdc', float: 'right', marginBottom: '1rem' } : { background: '#dcdcdc' }}>
                                                <div className="flex flex-row justify-between">
                                                    <b>Milly Hopkins</b>
                                                    <div className="flex justify-end">25th Sep 2022</div>
                                                </div>
                                                <div>
                                                    <p>
                                                        {val.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )
                                })
                                }
                            </div>
                            <Divider />
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
                                            {memberDetails.first_name + ' ' + memberDetails.last_name}
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Email:</b>
                                            </Typography>
                                            {memberDetails.email}
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
                                                <MenuItem value="verified">Verified</MenuItem>
                                                <MenuItem value="validating">Validating</MenuItem>
                                                <MenuItem value="suspended">Suspended</MenuItem>
                                                <MenuItem value="deleted">Deleted</MenuItem>
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
                                <div className="flex flex-row justify-start p-0 m-0 pl-5 my-5">
                                    <Typography component={'h2'}>
                                        <b>Notes (4)</b>
                                    </Typography>
                                </div>
                                <div style={{ overflow: 'scroll', height: '12.25rem' }}>
                                    <div className="w-auto flex flex-col justify-items-center p-10 px-10 mt-10" style={{ background: '#dcdcdc' }}>
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
                                    <div className="w-auto flex flex-col justify-start p-5 px-10 mt-10" style={{ background: '#dcdcdc' }}>
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
                                    <div className="w-auto flex flex-col justify-start p-5 px-10 mt-10" style={{ background: '#dcdcdc' }}>
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
                                    <div className="w-auto flex flex-col justify-start p-5 px-10 mt-10" style={{ background: '#dcdcdc' }}>
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
                            </div>
                            <Divider />
                            <div className="flex flex-col justify-start p-0 m-0 mt-5" >
                                <div className="flex flex-row justify-start p-0 m-0 pl-5 mb-5">
                                    <Typography component={'h2'}>
                                        <b>Previous Tickets (4)</b>
                                    </Typography>
                                </div>
                                <div style={{ overflow: 'scroll', height: '12.25rem' }}>
                                    <div className="w-auto flex flex-col justify-start p-5 px-10 mt-10" style={{ background: '#dcdcdc' }}>
                                        <div className="flex flex-row justify-end">11th Sep 2022</div>
                                        <div>
                                            <p>
                                                Hi, we looking on this and keep you posted.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-auto flex flex-col justify-start p-5 px-10 mt-10" style={{ background: '#dcdcdc' }}>
                                        <div className="flex flex-row justify-end">11th Sep 2022</div>
                                        <div>
                                            <p>
                                                Hi, we looking on this and keep you posted.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-auto flex flex-col justify-start p-5 px-10 mt-10" style={{ background: '#dcdcdc' }}>
                                        <div className="flex flex-row justify-end">11th Sep 2022</div>
                                        <div>
                                            <p>
                                                Hi, we looking on this and keep you posted.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-auto flex flex-col justify-start p-5 px-10 mt-10" style={{ background: '#dcdcdc' }}>
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
                    </div>
                </Paper>
            </div>
        </div>
    )
}

export default TicketingSystemPage;