import { useState, useEffect, useRef } from 'react';
import {
    FormControl, Paper, InputLabel, Button, Typography, Select, MenuItem, TextareaAutosize, Divider, IconButton, Stack, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, ImageList, ImageListItem
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from 'app/store/userSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import { Link, useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import Helper from 'src/app/helper';
import { setlightBoxStatus } from 'app/store/filemanager';
import ImagePreview from '../../filemanager/ImagePreview';
import { setUser } from "app/store/userSlice";

function TicketingSystemPage(props) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const inputFileRef = useRef(null);
    const user = useSelector(selectUser);
    const [inputFiles, setInputFiles] = useState([]);
    const [ticketStatus, setTicketStatus] = useState('');
    const [quickResponseOptions, setQuickResponseOptions] = useState([]);
    const [quickResponse, setQuickResponse] = useState('');
    const [chatField, setChatField] = useState('');
    const [memberStatus, setMemberStatus] = useState('');
    const [tempMemberStatus, setTempMemberStatus] = useState('');
    const [ticketConversations, setTicketConversations] = useState([]);
    const [memberDetails, setMemberDetails] = useState({});
    const [memberId, setMemberId] = useState(0);
    const [previousTickets, setPreviousTIckets] = useState([]);
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [memberNote, setMemberNote] = useState('');

    const stateUser = useSelector(state => state.user);

    useEffect(() => {
        getTicketDetails();
    }, []);
    const onAttachmentButtonClick = () => {
        inputFileRef.current.click();
    };
    const handleFiles = (e) => {
        setInputFiles([]);
        const { files } = e.target;
        if (files && Object.keys(files).length <= 5) {
            var allowed_files = [];
            Object.values(files).map((val, key) => {
                var parts = val.name.split(".");
                const file_type = parts[parts.length - 1];
                ['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG', 'PNG', 'GIF'].includes(file_type)
                    ? allowed_files.push(val) : dispatch(showMessage({
                        variant: 'error', message
                            : `File type ${file_type} is not allowed for ${val.name}`
                    }));
            })
            // setInputFiles(allowed_files);
            setInputFiles(allowed_files.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        } else {
            dispatch(showMessage({ variant: 'error', message: 'Allowed upto 5 files at a time.' }));
        }
    };
    const handleChangeTicketStatus = (event) => {
        // setTicketStatus(event.target.value);
        updateTicket({
            value: event.target.value,
            field_name: 'status',
            id: props.ticketId,
            type: 'ticket_status'
        });
    };
    const handleChangeQuickResponse = (event) => {
        setQuickResponse(event.target.value);
        setChatField(event.target.value);
    };
    const handleMemberStatus = (event) => {
        setTempMemberStatus(event.target.value);
        setOpenAlertDialog(true);
    };
    const handleNote = (event) => {
        setMemberNote(event.target.value);
    }
    const handleChatField = (event) => {
        setChatField(event.target.value);
    }
    const cancelAndResetNote = () => {
        setTempMemberStatus('');
        setOpenAlertDialog(false);
        setMemberNote('');

    }
    const addNote = (note_type) => (event) => {
        event.preventDefault();
        let data_set = {
            value: tempMemberStatus,
            field_name: 'status',
            member_id: memberId,
            type: 'member_status'
        }
        if (note_type === 'save') {
            memberNote.trim() ?
                data_set.member_notes = memberNote.trim() : dispatch(showMessage({ variant: 'error', message: 'Fill with some note for Save' }));
        }
        updateTicket(data_set);
        cancelAndResetNote();
    }
    const sendChatMessage = () => (event) => {
        let data_set = new FormData();
        data_set.append('field_name', 'message');
        data_set.append('id', props.ticketId);
        data_set.append('user_id', user.id);
        // data_set.append('member_id', memberId);
        data_set.append('type', 'ticket_chat');
        chatField.trim() ? data_set.append('value', chatField) : '';
        if (Object.keys(inputFiles).length > 0) {
            for (const key of Object.keys(inputFiles)) {
                data_set.append('attachments', inputFiles[key])
            }
        }
        updateTicket(data_set);
        setInputFiles({});
        setChatField('');
        setQuickResponse('');
    }
    const handleOpenPreview = (file) => {
        console.log(file);
        dispatch(setlightBoxStatus({ isOpen: true, src: file }));
    }
    const getTicketDetails = () => {
        axios.get(`${jwtServiceConfig.getSingleTickketDetails}/${props.ticketId}`)
            .then(response => {
                if (response.data.results.status) {
                    setTicketStatus(response.data.results.data.status);
                    setTicketConversations(response.data.results.data.TicketConversations);
                    setMemberDetails(response.data.results.data.Member);
                    setMemberId(response.data.results.data.member_id)
                    setMemberStatus(response.data.results.data.Member.status);
                    setPreviousTIckets(response.data.results.data.previous_tickets);
                    setQuickResponseOptions(response.data.results.data.auto_responders);
                    if (response.data.results.data.is_read === 0) {
                        updateTicket({
                            value: 1,
                            field_name: 'is_read',
                            id: props.ticketId,
                            type: 'is_read'
                        })
                        if (stateUser.unread_tickets > 0) {
                            let updatedNotReadonlyUser = { ...stateUser, unread_tickets: (stateUser.unread_tickets - 1) }
                            dispatch(setUser(updatedNotReadonlyUser))
                        }
                    }
                }
            }).catch(err => {
                console.error(err)
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
            })
    }
    const updateTicket = (data_set) => {
        axios.post(`${jwtServiceConfig.ticketUpdate}`, data_set)
            .then(response => {
                if (response.data.results.status) {
                    getTicketDetails();
                    data_set.type === 'is_read' ? '' : dispatch(showMessage({ variant: 'success', message: data_set instanceof FormData ? 'Message sent' : response.data.results.message }));
                } else {
                    data_set.type === 'is_read' ? '' : dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                }
            }).catch(error => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
            })
    }
    return (
        <div className="flex flex-row flex-1 w-full items-center justify-between space-y-0 p-0">
            <div className="flex flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 w-full h-full">
                <Paper className="flex h-full md:items-center md:justify-center w-full  p-5 rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <ImagePreview />
                    <Dialog
                        open={openAlertDialog}
                        onClose={() => { setOpenAlertDialog(false) }}
                        disableEscapeKeyDown
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <div style={{width: '600px', maxWidth: '100%'}}>
                            <DialogTitle id="alert-dialog-title">
                                Add Note
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">

                                </DialogContentText>
                                <TextareaAutosize className="w-full border-1"
                                    aria-label="empty textarea"
                                    placeholder=""
                                    minRows={3}
                                    onChange={handleNote}
                                    value={memberNote}
                                    style={{height: '130px'}}
                                />
                            </DialogContent>
                            <DialogActions>
                                <div className="flex justify-between px-20 w-full">
                                    <div>
                                    <Button className="mr-10 px-20" variant="outlined" onClick={cancelAndResetNote} color="error">Cancel</Button>
                                    </div>
                                    <div>
                                    <Button className="mx-10 px-20" variant="outlined" onClick={addNote('cancel')}>Skip</Button>
                                    <Button className="ml-10 px-20" variant="outlined" onClick={addNote('save')} color="success" autoFocus disabled={!memberNote.trim()}>
                                        Save
                                    </Button>
                                    </div>
                                </div>
                            </DialogActions>
                        </div>
                    </Dialog>
                    <div className="md:flex w-full h-full mx-auto sm:mx-0" /*style={{ height: '49.8rem' }}*/>
                        <div className="h-full w-full md:w-1/2 border-2 rounded-l-2xl mb-10 md:mb-0">
                            <div className="flex flex-row justify-center sm:justify-between p-0 m-0">
                                <div className="flex flex-col justify-center sm:justify-start p-0 m-16">
                                    <Typography
                                        className="flex items-center"
                                        component={Link}
                                        role="button"
                                        to={`/app/tickets`}
                                        color="inherit"
                                    >
                                        <FuseSvgIcon size={20}>
                                            {theme.direction === 'ltr'
                                                ? 'heroicons-outline:arrow-sm-left'
                                                : 'heroicons-outline:arrow-sm-right'}
                                        </FuseSvgIcon>
                                        <span className="flex mx-4 font-medium capitalize">Tickets</span>
                                    </Typography>
                                </div>
                                <div className="flex flex-col justify-center sm:justify-end p-0 m-0 pt-5">
                                    <FormControl sx={{ m: 1, minWidth: 130 }} size="small">
                                        <InputLabel id="demo-select-small">Ticket Status</InputLabel>
                                        <Select
                                            labelId="demo-select-small"
                                            id="demo-select-small"
                                            value={ticketStatus}
                                            label="Ticket Status"
                                            onChange={handleChangeTicketStatus}
                                        >
                                            <MenuItem value="open">Open</MenuItem>
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="closed">Closed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                             <div className="flex-row w-full px-10" style={{ minHeight: '13.7rem', overflowY: 'scroll', overflowX: 'hidden', height: '39.5rem', }}>
                                {ticketConversations.map((val, key) => {
                                    return (
                                        <div key={key} className="w-full flex" style={val.user_id ? { justifyContent: 'flex-end'} : { justifyContent: 'flex-start' }}>
                                        <div  className="w-auto flex flex-col justify-around p-10 mt-10 rounded-8" style={val.user_id ? { background: '#dcdcdc', float: 'right', marginBottom: '1rem' } : { background: '#dcdcdc' }}>
                                            <div className="flex flex-row justify-between pb-8">
                                                <span style={{ fontSize: '12px' }}>
                                                    <i> <b>{val.Member ? val.Member.first_name + ' ' + val.Member.last_name : val.User.first_name + ' ' + val.User.last_name}</b></i>
                                                </span>
                                                <div className="flex justify-end pl-5" style={{ fontSize: '10px' }}> <i> {Helper.parseTimeStamp(val.created_at)}</i> </div>
                                            </div>
                                            <div style={{maxWidth: '265px'}}>
                                                <p>
                                                    {val.message}
                                                </p>
                                            </div>
                                            {val.TicketAttachments.length > 0 ?
                                                <ImageList sx={{ width: '100%', height: 'auto'}} cols={val.TicketAttachments.length == 1 ? 1 : (val.TicketAttachments.length > 1 ? 2 : 1)} /*rowHeight={212}*/>
                                                    {val.TicketAttachments.map((item, key) => (
                                                        <ImageListItem key={key} style={{paddingLeft: '2px', paddingRight: '2px'}}>
                                                            <div style={{height: '100px', overflow: 'hidden', width: '160px', marginBottom: '4px'}}>
                                                            <img
                                                                src={`${item.file_name}?w=164&h=150&fit=crop&auto=format`}ß
                                                                srcSet={`${item.file_name}?w=164&h=150&fit=crop&auto=format&dpr=2 2x`}
                                                                alt={`File ${key + 1}`}
                                                                loading="lazy"
                                                                className="cursor-pointer rounded-6"
                                                                style={{objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%'}}
                                                                onClick={(e) => { e.preventDefault(); handleOpenPreview(item.file_name) }}
                                                            />
                                                            </div>
                                                        </ImageListItem>
                                                    ))}
                                                </ImageList>
                                                : ''
                                               
                                            }
                                        </div>
                                    </div>
                                    )
                                })
                                }
                            </div>
                            <Divider />
                            <div className="flex-row h-auto w-full px-10">
                                <FormControl className="w-full my-5" size="small">
                                    <InputLabel id="demo-select-small">Quick Response</InputLabel>
                                    <Select
                                        labelId="demo-select-small"
                                        id="demo-select-small"
                                        value={quickResponse}
                                        label="Quick response"
                                        onChange={handleChangeQuickResponse}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {quickResponseOptions.map((val, key) => {
                                            return (
                                                <MenuItem key={key} value={val.body}>{val.name}</MenuItem>
                                            )
                                        })
                                        }
                                    </Select>
                                </FormControl>
                                <TextareaAutosize className="w-full border-1"
                                    aria-label="empty textarea"
                                    placeholder=""
                                    minRows={4}
                                    sx={{ background: '#dcdcdc' }}
                                    value={chatField}
                                    onChange={handleChatField}
                                />
                                <div className="flex flex-row justify-between h-auto w-full px-10">
                                    <div className="flex flex-col justify-start" style={{ marginLeft: '-1rem', width: '70%' }}>
                                        <b className="m-0 p-0">
                                            Files({Object.keys(inputFiles).length})
                                        </b>
                                        <Stack direction="row" spacing={1} sx={{ overflowY: 'scroll', overflowX: 'hidden', height: '6.1rem' }}>
                                            <ul className="ml-10" style={{ listStyleType: 'disc' }}>
                                                {
                                                    Object.values(inputFiles).map((val, key) => {
                                                        return (
                                                            <li key={key}> - {val.name}</li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </Stack>
                                    </div>
                                    <div className="flex flex-col justify-end pb-8">
                                        <Stack direction="row" spacing={1}>
                                            <input
                                                style={{ display: "none" }}
                                                ref={inputFileRef}
                                                onChange={handleFiles}
                                                type="file"
                                                multiple
                                                accept="image/jpg, image/jpeg, image/png, image/gif, image/JPG, image/JPEG, image/PNG, image/GIF"
                                            />
                                            <Tooltip title="Attach upto 5 files" placement="left">
                                                <IconButton aria-label="fingerprint" color="secondary" onClick={onAttachmentButtonClick}>
                                                    <FuseSvgIcon className="text-48" size={20} color="secondary">feather:paperclip</FuseSvgIcon>
                                                </IconButton>
                                            </Tooltip>
                                            <Button variant="contained" color="secondary" endIcon={<SendIcon />} onClick={sendChatMessage()} disabled={Object.keys(inputFiles).length === 0 && chatField.trim().length === 0} >
                                                Send
                                            </Button>
                                        </Stack>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-full w-full md:w-1/2 border-2 rounded-r-2xl">
                            <div className="flex flex-row justify-center sm:justify-start p-0 m-0 pl-5 mt-10 mb-5">
                                <Typography component={'h2'}>
                                    <b>Member details</b>
                                </Typography>
                            </div>
                            <div className="sm:flex flex-row justify-between p-0 m-0 pb-10">
                                <div className="flex flex-col w-full sm:w-1/2 justify-center sm:justify-start mb-10 sm:mb-0">
                                    <div className="flex justify-center sm:justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Username:</b>
                                            </Typography>
                                            {memberDetails.username}
                                        </div>
                                    </div>
                                    <div className="flex justify-center sm:justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Full name:</b>
                                            </Typography>
                                            {memberDetails.first_name + ' ' + memberDetails.last_name}
                                        </div>
                                    </div>
                                    <div className="flex justify-center sm:justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Email:</b>
                                            </Typography>
                                            {memberDetails.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col w-full sm:w-1/2 justify-center sm:justify-end">
                                    <div className="flex justify-center sm:justify-end">
                                        <FormControl sx={{ m: 1, minWidth: 130 }} size="small">
                                            <InputLabel id="demo-select-small">Status</InputLabel>
                                            <Select
                                                labelId="demo-select-small"
                                                id="demo-select-small"
                                                value={memberStatus}
                                                label="Status"
                                                onChange={handleMemberStatus}
                                            >
                                                <MenuItem value="verified">Verified</MenuItem>
                                                <MenuItem value="validating">Validating</MenuItem>
                                                <MenuItem value="suspended">Suspended</MenuItem>
                                                <MenuItem value="deleted">Deleted</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="flex flex-row justify-center sm:justify-end pr-20">
                                        <div className="flex">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Total Earnings:</b>
                                            </Typography>
                                            {memberDetails.total_earnings} USD
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            {'MemberNotes' in memberDetails ?
                                <div className="flex flex-col justify-start p-0 m-0 px-4">
                                    <div className="flex flex-row justify-start p-0 m-0 px-4 my-5">
                                        <Typography component={'h2'}>
                                            <b>Notes ({memberDetails.MemberNotes.length})</b>
                                        </Typography>
                                    </div>
                                    <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '31.5rem' }} className="px-4">
                                        {memberDetails.MemberNotes.map((val, key) => {
                                            return (
                                                <div key={key} className="w-auto flex flex-col justify-items-center p-10 px-10 mt-10 rounded-8" style={{ background: '#dcdcdc' }}>
                                                    <div className="flex flex-row justify-between">
                                                        <span style={{ fontSize: '12px' }}>
                                                            <i>
                                                                <b>{val.Member.first_name + ' ' + val.Member.last_name}</b></i></span>
                                                        <div className="flex justify-end pl-5" style={{ fontSize: '10px' }}>{Helper.parseTimeStamp(val.created_at)}</div>
                                                    </div>
                                                    <div>
                                                        <p>
                                                            {val.note}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                        }
                                    </div>
                                </div>
                                : ''
                            }
                            <Divider />
                            <div className="flex flex-col justify-start p-0 m-0 mt-16 mb-10 px-4" >
                                <div className="flex flex-row justify-start p-0 m-0 px-4 mb-5">
                                    <Typography component={'h2'}>
                                        <b>Other Tickets ({previousTickets.length})</b>
                                    </Typography>
                                </div>
                                <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '15.25rem' }} className="px-4">
                                    {previousTickets.map((val, key) => {
                                        return (
                                            <div key={key} className="w-auto flex flex-col justify-start p-5 px-10 pb-8 mt-10 rounded-8" style={{ background: '#dcdcdc' }}>
                                                <div className="flex flex-row justify-end" style={{ fontSize: '10px' }}>
                                                    {Helper.parseTimeStamp(val.created_at)}
                                                </div>
                                                <div>
                                                    <p>
                                                        {val.subject}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                    }
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