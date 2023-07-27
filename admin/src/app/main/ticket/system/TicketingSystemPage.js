import { useState, useEffect, useRef } from 'react';
import {
    FormControl, Paper, InputLabel, Button, Typography, Select, MenuItem, TextareaAutosize, Divider, IconButton, Stack, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, ImageList, ImageListItem
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';
// import { motion } from 'framer-motion';
// import LoadingButton from '@mui/lab/LoadingButton';
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
import WYSIWYGEditor from 'app/shared-components/WYSIWYGEditor';
import parse from 'html-react-parser';
import { EditorState, convertFromHTML, ContentState } from 'draft-js';
import AlertDialog from 'app/shared-components/AlertDialog';

function TicketingSystemPage(props) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const inputFileRef = useRef(null);
    const wysiwygEditorRef = useRef();
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
    const [ticketSubject, setTicketSubject] = useState('');
    const [openedTicket, setOpendedTicket] = useState(null);
    const [openMsgDelAlert, setMsgDelAlert] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    // const [actionType, setActionType] = useState('');

    const stateUser = useSelector(state => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        getTicketDetails();
    }, []);

    // Update the Open Ticker count badge for side navbar
    useEffect(() => {
        if(openedTicket !== null && stateUser.unread_tickets !== openedTicket){
            console.log(openedTicket)
            let updatedNotReadonlyUser = { ...stateUser, unread_tickets: openedTicket}
            dispatch(setUser(updatedNotReadonlyUser))
        }
    }, [openedTicket]);

    const onAttachmentButtonClick = () => {
        inputFileRef.current.click();
    };
    const handleFiles = (e) => {
        setInputFiles([]);
        const { files } = e.target;
        if (files && Object.keys(files).length <= 4) {
            var allowed_files = [];
            Object.values(files).map((val, key) => {
                if (val.size <= 2048000) {
                    var parts = val.name.split(".");
                    const file_type = parts[parts.length - 1];
                    ['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG', 'PNG', 'GIF'].includes(file_type)
                        ? allowed_files.push(val) : dispatch(showMessage({
                            variant: 'error', message
                                : `File type ${file_type} is not allowed for ${val.name}`
                        }));
                } else {
                    dispatch(showMessage({
                        variant: 'error', message: `File size allowed upto 2MB`
                    }))
                }
                e.target.value = '';
            })
            setInputFiles(allowed_files.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        } else {
            e.target.value = '';
            dispatch(showMessage({ variant: 'error', message: 'Allowed upto 4 files at a time.' }));
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
        // let updatedNotReadonlyUser = { ...stateUser, unread_tickets: (event.target.value !== 'open' ? stateUser.unread_tickets - 1 : stateUser.unread_tickets + 1) }
        // dispatch(setUser(updatedNotReadonlyUser))
    };
    const handleChangeQuickResponse = (event) => {
        setQuickResponse(event.target.value);
        setChatField(event.target.value);
        setEditorValue(event.target.value)
    };
    // console.log(chatField)
    const handleMemberStatus = (event) => {
        setTempMemberStatus(event.target.value);
        setOpenAlertDialog(true);
    };
    const handleNote = (event) => {
        setMemberNote(event.target.value);
    }
    const handleChatField = (event) => {
        // console.log(event)
        setChatField(event);
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
        
        chatField ? data_set.append('value', chatField) : '';
        // `Thanks,
        //     ${user.alias_name} - More Surveys Support Team`
        if (Object.keys(inputFiles).length > 0) {
            for (const key of Object.keys(inputFiles)) {
                data_set.append('attachments', inputFiles[key])
            }
        }
        data_set.append('type', 'ticket_chat');

        /*if("ticket_chat_update" === actionType) {
            data_set.append('type', actionType);
            data_set.append('ticket_conversation_id', conversationId);
        } else {
            data_set.append('type', 'ticket_chat');
        }*/

        updateTicket(data_set);
        setInputFiles({});
        setChatField('');
        setQuickResponse('');
        setEditorValue('');
    }
    const handleOpenPreview = (file) => {
        dispatch(setlightBoxStatus({ isOpen: true, src: file }));
    }
    const getTicketDetails = () => {
        axios.get(`${jwtServiceConfig.getSingleTicketDetails}/${props.ticketId}`)
            .then(response => {
                if (response.data.results.status) {
                    setTicketStatus(response.data.results.data.status);
                    setTicketConversations(response.data.results.data.TicketConversations);
                    setMemberDetails(response.data.results.data.Member);
                    setMemberId(response.data.results.data.member_id)
                    setMemberStatus(response.data.results.data.Member.status);
                    setPreviousTIckets(response.data.results.data.previous_tickets);
                    setQuickResponseOptions(response.data.results.data.auto_responders);
                    setTicketSubject(response.data.results.data.subject)
                    setOpendedTicket(response.data.results.data.opended_ticket);

                    if (response.data.results.data.is_read === 0) {
                        updateTicket({
                            value: 1,
                            field_name: 'is_read',
                            id: props.ticketId,
                            type: 'is_read'
                        })
                        //     if (stateUser.unread_tickets > 0) {
                        //         let updatedNotReadonlyUser = { ...stateUser, unread_tickets: (stateUser.unread_tickets - 1) }
                        //         dispatch(setUser(updatedNotReadonlyUser))
                        //     }
                    }
                    setTimeout(() => {
                        let main_chat = document.getElementById('main_chat');
                        main_chat.scrollTop = main_chat.scrollHeight;
                    }, 500)
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
                // setActionType('');
            }).catch(error => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
            })
    }

    const setEditorValue = (value) => {
        wysiwygEditorRef.current.props.onEditorStateChange(EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(value))))
    }

    // Conversation Edit feature
    /*const handleEditMessage = (id, message) => {
        setEditorValue(message);
        setActionType('ticket_chat_update');
        setConversationId(id);
    }*/

    // Conversation Delete feature
    const handleDeleteMsgAlert = (id) => {
        setMsgDelAlert(true);
        setConversationId(id);
    }

    const onCloseAlertDialogHandle = () => {
        setMsgDelAlert(false);
        setConversationId(null);
    }

    const onConfirmAlertDialogHandle = () => {
        updateTicket({
            type: 'ticket_chat_delete',
            ticket_conversation_id: conversationId
        })
        setMsgDelAlert(false);
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
                        <div style={{ width: '600px', maxWidth: '100%' }}>
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
                                    style={{ height: '130px' }}
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
                    <div className="md:flex w-full h-full mx-auto sm:mx-0" style={{ height: '82rem', overflow: 'auto' }}>
                        <div className="h-full w-full md:w-8/12 border-2 rounded-l-2xl mb-10 md:mb-0">
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
                                        (Sub:&nbsp; <b>{ticketSubject}</b> )
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
                            <div className="flex-row w-full px-10" style={{ minHeight: '13.7rem', overflowY: 'scroll', overflowX: 'hidden', height: '30rem', }} id="main_chat">
                                {ticketConversations.map((val, key) => {
                                    return (
                                        <div key={key} className="w-full flex" style={val.user_id ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }}>
                                            <div className="w-full flex flex-col justify-around py-10 pl-10 pr-28 mt-10 rounded-8 relative" style={val.user_id ? { background: '#111827', color: '#FFFFFF', float: 'right', marginBottom: '1rem', marginLeft: '1rem' } : { background: '#dcdcdc', marginRight: '1rem' }}>
                                                <div className="flex flex-row justify-between pb-8">
                                                    {
                                                        Object.keys(val).length > 0 && (
                                                            val.Member ? (
                                                                <Link target="_blank" to={`/app/members/${val.Member.id}`}>
                                                                    <Typography className="font-bold italic" component="p" variant="caption">{val.Member.username}</Typography>
                                                                </Link>
                                                            ) : (
                                                                <Typography sx={{color: '#4f46e5', textDecoration: 'underline'}} component="p" className="font-bold italic" variant="caption">${val.User.alias_name} - More Surveys Support Team</Typography>
                                                            )
                                                        )
                                                    }
                                                    <div className="flex justify-end pl-5" style={{ fontSize: '10px' }}> <i> {Helper.parseTimeStamp(val.created_at)}</i> </div>
                                                </div>
                                                <div className='break-all xl:text-15 lg:text-12 md:text-11 sm:text-10'>
                                                    {parse(val.message)}
                                                </div>
                                                {val.TicketAttachments.length > 0 ?
                                                    <ImageList sx={{ width: '100%', height: 'auto', direction: 'rtl' }} cols={4}>
                                                        {val.TicketAttachments.map((item, key) => (
                                                            <ImageListItem key={key} style={{ paddingLeft: '2px', paddingRight: '2px', justifyContent: 'flex-end', flexDirection: 'inherit' }}>
                                                                <div style={{ height: '120px', overflow: 'hidden', width: '100%', marginBottom: '4px' }}>
                                                                    <img
                                                                        src={`${item.file_name}?w=164&h=150&fit=crop&auto=format`} ß
                                                                        srcSet={`${item.file_name}?w=164&h=150&fit=crop&auto=format&dpr=2 2x`}
                                                                        alt={`File ${key + 1}`}
                                                                        loading="lazy"
                                                                        className="cursor-pointer rounded-6"
                                                                        style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }}
                                                                        onClick={(e) => { e.preventDefault(); handleOpenPreview(item.file_name) }}
                                                                    />
                                                                </div>
                                                            </ImageListItem>
                                                        ))}
                                                    </ImageList>
                                                    : ''

                                                }
                                                {
                                                    val.user_id && (
                                                        <div className='text-right conversation--btn absolute right-3 bottom-4'>
                                                            {/* <Tooltip title="Edit" placement="bottom">
                                                                <IconButton size="small" aria-label="fingerprint" color="secondary" onClick={()=> handleEditMessage(val.id, val.message)}>
                                                                    <FuseSvgIcon className="text-48 text-gray-50" size={18} color="action">heroicons-outline:pencil-alt</FuseSvgIcon>
                                                                </IconButton>
                                                            </Tooltip> */}
                                                            <Tooltip title="Delete" placement="left">
                                                                <IconButton size="small" aria-label="fingerprint" color="secondary" onClick={()=>handleDeleteMsgAlert(val.id)}>
                                                                    <FuseSvgIcon className="text-48 text-red-500" size={16} color="action">heroicons-outline:trash</FuseSvgIcon>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </div>
                                                    )
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
                                {/* <TextareaAutosize className="w-full border-1"
                                    aria-label="empty textarea"
                                    placeholder=""
                                    minRows={4}
                                    sx={{ background: '#dcdcdc' }}
                                    value={chatField}
                                    onChange={handleChatField}
                                /> */}
                                <WYSIWYGEditor
                                    className="w-full h-auto border-1"
                                    onChange={handleChatField}
                                    value={chatField}
                                    ref={wysiwygEditorRef}
                                />
                                <div className="flex flex-row justify-between h-auto w-full px-10">
                                    <div className="flex flex-col justify-start" style={{ marginLeft: '-1rem', width: '70%' }}>
                                        <b className="m-0 p-0">
                                            Files({Object.keys(inputFiles).length})
                                        </b>
                                        <Stack direction="row" spacing={1} sx={{ overflowY: 'scroll', overflowX: 'hidden', height: '6rem' }}>
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
                                        {/* <ImageList sx={{ width: 500, xheight: 450 }} cols={5} rowHeight={100}>
                                            {Object.values(inputFiles).map((val, key) => (
                                                <ImageListItem key={key}>
                                                    <div>
                                                        <IconButton aria-label="fingerprint" color="secondary">
                                                            <FuseSvgIcon className="text-48" size={20} color="secondary">material-outline:close</FuseSvgIcon>
                                                        </IconButton>
                                                    </div>
                                                    <img
                                                        src={val.preview}
                                                        srcSet={val.preview}                                                    
                                                        loading="lazy"
                                                    />
                                                </ImageListItem>
                                            ))}
                                        </ImageList> */}
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
                                            <Tooltip title="Attach upto 4 files (Max Filesize 2MB each)" placement="left">
                                                <IconButton aria-label="fingerprint" color="secondary" onClick={onAttachmentButtonClick}>
                                                    <FuseSvgIcon className="text-48" size={20} color="secondary">feather:paperclip</FuseSvgIcon>
                                                </IconButton>
                                            </Tooltip>
                                            <Button variant="contained" color="secondary" endIcon={<SendIcon />} onClick={sendChatMessage()} disabled={Object.keys(inputFiles).length === 0 && chatField.length === 0} >
                                                Send
                                            </Button>
                                            <Button variant="contained" color="primary" onClick={() => { navigate(`/app/tickets`); }} >
                                                Back
                                            </Button>
                                        </Stack>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-full w-full md:w-4/12 border-2 rounded-r-2xl">
                            <div className="flex flex-row  p-0 m-0 pl-5 pr-5 mt-10 mb-5 justify-between">
                                <Typography component={'h2'}>
                                    <b>Member details</b>
                                </Typography>
                                <div className="flex">
                                    <Typography component={'h4'} className="pr-10">
                                        <b>Total Earnings: ${memberDetails.total_earnings}</b>
                                    </Typography>

                                </div>
                            </div>
                            <div className="sm:flex flex-row justify-between p-0 m-0 pb-10">
                                <div className="flex flex-col w-1/2 justify-center sm:justify-start mb-10 sm:mb-0">
                                    <div className="flex justify-center sm:justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Username:</b>
                                            </Typography>
                                            <Link target="_blank" to={`/app/members/${memberId}`}>
                                                {memberDetails.username}
                                            </Link>
                                        </div>
                                    </div>
                                    {
                                        memberDetails.deleted_at && (
                                            <div className="flex justify-center sm:justify-start">
                                                <div className="flex pl-10">
                                                    <Typography component={'h5'} className="pr-5">
                                                        <b>Status:</b>
                                                    </Typography>
                                                    <Typography variant="body1" className="text-red-600 font-bold">Deleted</Typography>
                                                </div>
                                            </div>
                                        )
                                    }
                                    <div className="flex justify-center sm:justify-start">
                                        <div className="flex pl-10">
                                            <Typography component={'h4'} className="pr-5">
                                                <b>Name:</b>
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
                                {
                                    !memberDetails.deleted_at && (
                                        <div className="flex flex-col w-1/2 justify-center sm:justify-end">
                                            <div className="flex justify-center sm:justify-end">
                                                <FormControl sx={{ m: 1, minWidth: 100, marginBottom: '3rem' }} size="small">
                                                    <InputLabel id="demo-select-small">Status</InputLabel>
                                                    <Select
                                                        labelId="demo-select-small"
                                                        id="demo-select-small"
                                                        value={memberStatus}
                                                        label="Status"
                                                        onChange={handleMemberStatus}
                                                    >
                                                        <MenuItem value="member">Member</MenuItem>
                                                        <MenuItem value="validating">Validating</MenuItem>
                                                        <MenuItem value="suspended">Suspended</MenuItem>
                                                        <MenuItem value="deleted">Deleted</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                            <Divider />
                            {'MemberNotes' in memberDetails ?
                                <div className="flex flex-col justify-start p-0 m-0 px-4" style={{ height: '30rem' }}>
                                    <div className="flex flex-row justify-start p-0 m-0 px-4 my-5">
                                        <Typography component={'h2'}>
                                            <b>Notes ({memberDetails.MemberNotes.length})</b>
                                        </Typography>
                                    </div>
                                    <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '30rem' }} className="px-4">
                                        {memberDetails.MemberNotes.map((val, key) => {
                                            return (
                                                <div key={key} className="w-auto flex flex-col justify-items-center p-10 px-10 mt-10 rounded-8" style={{ background: '#dcdcdc' }}>
                                                    <div className="flex flex-row justify-between">
                                                        <span style={{ fontSize: '12px' }}>
                                                            <i><b>{`${val.User ? val.User.alias_name : 'Application Firewall'}`}
                                                                <span style={{ fontSize: '8px' }}> - More Surveys Support Team</span></b></i>
                                                        </span>

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
                                <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '34rem' }} className="px-4">
                                    {previousTickets.map((val, key) => {
                                        return (
                                            <div key={key} className="w-auto flex flex-col justify-start p-5 px-10 pb-8 mt-10 rounded-8" style={{ background: '#dcdcdc', cursor: 'pointer' }} onClick={() => { navigate(`/app/tickets/${val.id}`); }}>
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
            {
                openMsgDelAlert && (
                    <AlertDialog
                        content="Do you want to delete this message?"
                        open={openMsgDelAlert}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }
        </div>
    )
}

export default TicketingSystemPage;