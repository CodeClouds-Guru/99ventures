import Helper from 'src/app/helper';
import parse from 'html-react-parser';
import AutoReply from './components/Autoreply';
import { useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import { selectUser } from 'app/store/userSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import LoadingButton from '@mui/lab/LoadingButton';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ImagePreview from '../filemanager/ImagePreview';
import { setlightBoxStatus } from 'app/store/filemanager';
import AlertDialog from 'app/shared-components/AlertDialog';
import { updateUnreadTicketCount } from 'app/store/tickets';
import WYSIWYGEditor from 'app/shared-components/WYSIWYGEditor';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { EditorState, convertFromHTML, ContentState } from 'draft-js';
import { FormControl, InputLabel, Button, Typography, Select, MenuItem, IconButton, Stack, Tooltip, ImageList, ImageListItem } from '@mui/material';
import {stateFromHTML} from 'draft-js-import-html';

const Leftside = (props) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const {ticketId} = useParams();
    const navigate = useNavigate();
    const wysiwygEditorRef = useRef();
    const inputFileRef = useRef(null);
    const user = useSelector(selectUser);
    const [chatField, setChatField] = useState('');
    const [inputFiles, setInputFiles] = useState([]);
    const [btnloading, setBtnLoading] = useState(false);
    const [ticketStatus, setTicketStatus] = useState('');
    const [quickResponse, setQuickResponse] = useState('not_clear');
    const [openMsgDelAlert, setMsgDelAlert] = useState(false);
    const [conversationId, setConversationId] = useState(null);

    const handleChangeTicketStatus = (event) => {
        setTicketStatus(event.target.value);
        props.updateTicket({
            value: event.target.value,
            field_name: 'status',
            id: ticketId,
            type: 'ticket_status'
        });
    };
    const handleChatField = (event) => {
        event = event.replace('<br/>', '').replaceAll('<p></p>', '<p>&nbsp;</p>');
        setChatField(event);
    }
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
    const onAttachmentButtonClick = () => {
        inputFileRef.current.click();
    };
    const sendChatMessage = () => (event) => {
        let data_set = new FormData();
        data_set.append('field_name', 'message');
        data_set.append('id', ticketId);
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
        setBtnLoading(true);
        props.updateTicket(data_set);
        setInputFiles([]);
        setChatField('');
        setQuickResponse('clear');
        setEditorValue('');
    }

    const handleOpenPreview = (file) => {
        dispatch(setlightBoxStatus({ isOpen: true, src: file }));
    }

    useEffect(()=>{
        setTicketStatus(props.ticketStatus);
        setBtnLoading(false);
    }, [props]);

    const handleChangeQuickResponse = (value) => {
        value = chatField +'<br/>'+value
        // setQuickResponse(value);
        setChatField(value);
        setEditorValue(value)
    };

    const setEditorValue = (value) => {
        value = value.replace('<br/>', '').replaceAll('<p></p>', '<p>&nbsp;</p>');
        wysiwygEditorRef.current.props.onEditorStateChange(EditorState.createWithContent(stateFromHTML(value)));
        // wysiwygEditorRef.current.props.onEditorStateChange(EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(value))))
    }

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
        props.updateTicket({
            type: 'ticket_chat_delete',
            ticket_conversation_id: conversationId
        })
        setMsgDelAlert(false);
    }

    return (
        <div className="w-full flex flex-row flex-wrap">
            <div className="flex flex-row justify-between sm:justify-between p-0 m-0 w-full shadow-md items-center">
                <div className="p-0 m-16 flex items-center flex-wrap">
                    <Typography
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
                    </Typography>
                    <Typography className="text-sm sm:text-base md:text-md lg:text-lg" variant="body2">Tickets</Typography>
                    <Typography className="text-sm sm:text-base md:text-md lg:text-lg" variant="body2">
                        (Sub: <b>{props.ticketSubject}</b> )
                    </Typography>
                </div>
                <div className="p-0 m-0 pt-5 ticket-status-dropdown">
                    <FormControl sx={{ m: 1, minWidth: 130 }} size="small">
                        <InputLabel id="ticket-status">Ticket Status</InputLabel>
                        <Select
                            labelId="ticket-status"
                            id="ticket-status"
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

            <div className="flex-row w-full px-10" style={{ minHeight: '13.7rem', overflowY: 'scroll', overflowX: 'hidden', height: '38rem', }} id="main_chat">
                {
                    props.ticketConversations.map((val, key) => {
                        return (
                            <div key={key} className="w-full flex" style={val.user_id ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }}>
                                <div className="w-full flex flex-col justify-around py-5 pl-10 pr-28 mb-5 xmt-5 rounded-8 relative" style={val.user_id ? { background: '#111827', color: '#FFFFFF', float: 'right', marginLeft: '1rem' } : { background: '#dcdcdc', marginRight: '1rem' }}>
                                    <div className="flex flex-row justify-between pb-8">
                                        {
                                            Object.keys(val).length > 0 && (
                                                val.Member ? (
                                                    <Link target="_blank" to={`/app/members/${val.Member.id}`}>
                                                        <Typography sx={{fontSize: '0.9rem'}} className="font-bold italic" component="p" variant="caption">{val.Member.username}</Typography>
                                                    </Link>
                                                ) : (
                                                    <Typography sx={{color: '#4f46e5', textDecoration: 'underline', fontSize: '0.9rem'}} component="p" className="font-bold italic" variant="caption">${val.User.alias_name} - More Surveys Support Team</Typography>
                                                )
                                            )
                                        }
                                        <div className="flex justify-end pl-5" style={{ fontSize: '10px' }}> <i> {Helper.parseTimeStamp(val.created_at)}</i> </div>
                                    </div>
                                    <div className='break-words xl:text-15 lg:text-12 md:text-11 sm:text-10 text-sm'>
                                        {parse(val.message)}
                                    </div>
                                    {val.TicketAttachments.length > 0 ?
                                        <ImageList sx={{ width: '100%', height: 'auto', direction: 'rtl' }} cols={4}>
                                            {val.TicketAttachments.map((item, key) => (
                                                <ImageListItem key={key} style={{ paddingLeft: '2px', paddingRight: '2px', justifyContent: 'flex-end', flexDirection: 'inherit', justifyContent: 'start' }}>
                                                    <div style={{ height: '70px', overflow: 'hidden', width: 'auto', marginBottom: '4px' }}>
                                                        <img
                                                            src={`${item.file_name}?w=164&h=150&fit=crop&auto=format`}
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
            <div className='px-10 pt-10 ticket-conversation'>
                <WYSIWYGEditor
                    className="w-full h-auto border-1"
                    onChange={handleChatField}
                    value={chatField}
                    ref={wysiwygEditorRef}
                    toolbarCustomButtons={[
                        <AutoReply 
                            dropdownoptions={props.quickResponseOptions} 
                            handleChangeQuickResponse={handleChangeQuickResponse} 
                            quickResponseval={quickResponse}
                        />
                    ]}
                />
                <div className="flex flex-row justify-between h-auto w-full items-center mt-10">
                    <div className="flex flex-col justify-start w-1/2 sm:w-2/3 break-all">
                        <b className="m-0 p-0">
                            Files({Object.keys(inputFiles).length})
                        </b>
                        {
                            Object.keys(inputFiles).length ? (
                                <Stack direction="row" spacing={1} sx={{ overflowY: 'scroll', overflowX: 'hidden' }}>
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
                            ) : ''
                        }
                        
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
                    <div className="flex flex-row items-center justify-end w-1/2 sm:w-1/3">
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
                        <Button variant="contained" color="primary" onClick={() => { navigate(`/app/tickets`); }} className="mx-10">
                            Back
                        </Button>
                        <LoadingButton loading={btnloading} variant="contained" color="secondary" endIcon={<SendIcon />} onClick={sendChatMessage()} disabled={inputFiles.length === 0 && chatField.length === 0} >                            
                            <Typography variant="body2" className="hidden sm:flex">Send</Typography>
                        </LoadingButton>
                    </div>
                </div>
            </div>
            <ImagePreview/>   
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

export default Leftside;