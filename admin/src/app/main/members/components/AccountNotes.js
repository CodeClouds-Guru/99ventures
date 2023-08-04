import { Typography, List, ListItem, ListItemText, IconButton, Stack } from '@mui/material';
import AlertDialog from 'app/shared-components/AlertDialog';
import { Delete as DeleteIcon } from '@mui/icons-material';
import Helper from 'src/app/helper';
import * as React from 'react';
import axios from 'axios';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';

const listStyle = {
    height: '350px',
    '@media screen and (max-width: 1600px)': {
        height: '280px'
    },
    '@media screen and (max-width: 1400px)': {
        height: '250px'
    },
}

const AccountNotes = (props) => {
    const { accountNotes, memberNoteDeleted } = props;
    const [dialogStatus, setDialogStatus] = React.useState(false);
    const [selectedNoteId, setSelectedNoteId] = React.useState(0);
    const dispatch = useDispatch();
    const deleteButtonClicked = (noteId) => {
        setSelectedNoteId(noteId);
        setDialogStatus(true);
    }

    const onConfirmAlertDialogHandle = () => {
        var variant = 'success';
        var message = 'Oops! something went wrong';
        axios.post(jwtServiceConfig.deleteMemberNotes, {
            module: 'member_notes',
            ids: [selectedNoteId]
        }).then(resp => {
            variant = resp.data.results.status ? 'success' : 'error'
            message = resp.data.results.message
        }).catch(e => {
            console.error(e)
        }).finally(() => {
            dispatch(showMessage({ variant, message }));
            onCloseAlertDialogHandle();
        })
        memberNoteDeleted();
    }

    const onCloseAlertDialogHandle = () => {
        setSelectedNoteId(0);
        setDialogStatus(false);
    }

    const notesList = () => {
        return accountNotes.map(note => {
            return (
                <ListItem disablePadding key={note.id}>
                    <ListItemText className="bg-gray-300 p-10 rounded" primary={
                        <>
                            <>
                                <div className='flex justify-between mb-2'>
                                    <Stack direction="row">
                                        <Typography variant="caption" className="text-xs italic font-bold">
                                            {!note.User ? 'Declined from browser' : note.User.alias_name} - More Surveys Support Team
                                        </Typography>
                                        {
                                            !props.memberDeleted && (
                                                <IconButton
                                                    aria-label="Delete Note"
                                                    size="small"
                                                    onClick={() => deleteButtonClicked(note.id)}
                                                    sx={{ marginLeft: '0px', marginTop: '-6px' }}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="inherit" />
                                                </IconButton>
                                            )
                                        }                                        
                                    </Stack>

                                    <Typography variant="caption" className="text-xs italic">{Helper.parseTimeStamp(note.created_at)}</Typography>
                                </div>
                                <Typography variant="body2" className="md:text-lg lg:text-sm xl:text-base">{note.note}</Typography>
                            </>
                            {
                                dialogStatus && (
                                    <AlertDialog
                                        content="Do you really want to delete this note?"
                                        open={dialogStatus}
                                        onConfirm={onConfirmAlertDialogHandle}
                                        onClose={onCloseAlertDialogHandle}
                                    />
                                )
                            }
                        </>
                    } />
                </ListItem>
            )
        })
    }

    return (
        <List sx={listStyle} className="mt-5 p-0 notes-list overflow-auto">
            {notesList()}
        </List>
    )
}

export default React.memo(AccountNotes);