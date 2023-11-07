import Notes from './components/Notes';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import PreviousTickets from './components/PreviousTickets';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { FormControl,  InputLabel, Button, Typography, Select, MenuItem, TextareaAutosize, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';


const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  }));
  
const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
      expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .05)'
        : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  }));
  
const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
  }));
  

const Rightside = (props) => {
    const [expanded, setExpanded] = useState('panel1');
    const memberDetails = props.memberDetails;
    const memberId = props.memberid;
    const [memberStatus, setMemberStatus] = useState('');
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [memberNote, setMemberNote] = useState('');
    const [tempMemberStatus, setTempMemberStatus] = useState('');

    const handleMemberStatus = (event) => {
        setTempMemberStatus(event.target.value);
        setOpenAlertDialog(true);
    };

    const handleChange = (panel) => (event, newExpanded) => {
      setExpanded(newExpanded ? panel : false);
    };

    const handleNote = (event) => {
        setMemberNote(event.target.value);
    };

    const cancelAndResetNote = () => {
        setTempMemberStatus('');
        setOpenAlertDialog(false);
        setMemberNote('');

    };

    const addNote = (note_type) => (event) => {
        event.preventDefault();
        let data_set = {
            value: tempMemberStatus,
            field_name: 'status',
            member_id: memberId,
            type: 'member_status'
        }
        if (note_type === 'save') {
            if(memberNote.trim() === '') {
                dispatch(showMessage({ variant: 'error', message: 'Fill with some note for Save' }));
                return;
            } else {
                data_set.member_notes = memberNote.trim();
            }
        }
        props.updateTicket(data_set);
        cancelAndResetNote();
    };

    useEffect(()=>{
        if(memberDetails.status){
            setMemberStatus(memberDetails.status)
        }
    }, [props]);

    return (
        <div className="flex flex-col px-7">
            <div className="flex flex-row my-0 md:my-10 justify-between w-full">
                <Typography component={'p'} className="font-bold">
                    Member details
                </Typography>
                <Typography component={'p'} className="font-bold">
                    Total Earnings: ${memberDetails.total_earnings}
                </Typography>
            </div>
            <div className="flex flex-col lg:flex-col sm:flex-row xl:flex-row flex-wrap justify-between xp-7 w-full">
                <div className="flex flex-col sm:w-1/2 lg:w-full md:w-full xl:w-1/2 justify-center sm:justify-start mb-10 sm:mb-0">
                    <div className="flex flex-row w-full mb-3">
                        <Typography variant="body1" component={'p'} className="mr-5 font-bold">
                            Username:
                        </Typography>
                        <Link target="_blank" to={`/app/members/${memberId}`}>
                            <Typography variant="body1" component={'p'}>
                                {memberDetails.username}
                            </Typography>
                        </Link>
                    </div>
                    {
                        memberDetails.deleted_at && (
                            <div className="flex flex-row w-full">
                                <Typography variant="body1" component={'p'} className="mr-5 font-bold">
                                    Status:
                                </Typography>
                                <Typography variant="body1" className="text-red-600 font-bold">Deleted</Typography>
                            </div>
                        )
                    }
                    <div className="flex flex-row w-full mb-3">
                        <Typography component={'p'} variant="body1" className="mr-5 font-bold">
                            Name:
                        </Typography>
                        <Typography variant="body1">{memberDetails.first_name + ' ' + memberDetails.last_name}</Typography>
                    </div>
                    <div className="flex flex-row w-full">
                        <Typography component={'h4'} className="mr-5 font-bold">
                            Email:
                        </Typography>
                        <Typography variant="body1">{memberDetails.email}</Typography>
                    </div>
                </div>
                {
                    !memberDetails.deleted_at && (
                        <div className="mt-12 w-full lg:w-full xl:w-1/2 sm:w-1/2 text-left sm:text-right md:text-left xl:text-right">
                            <FormControl size="small" sx={{ '& .muiltr-1in441m': {width: '90px'}}}>
                                <InputLabel id="member-status">Member Status</InputLabel>
                                <Select
                                    labelId="member-status"
                                    id="member-status"
                                    value={ memberStatus }
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
                    )
                }
            </div>
            <Divider className="my-10" />
            <div className="w-full">
                <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography>Notes ({ memberDetails.MemberNotes ? memberDetails.MemberNotes.length : 0}) </Typography>
                    </AccordionSummary>
                    <AccordionDetails className="px-2">
                        <Notes notes={memberDetails.MemberNotes}/>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                    <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                        <Typography>Other Tickets ({props.previousTickets.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="p-2">
                        <PreviousTickets previousTickets={props.previousTickets}/>
                    </AccordionDetails>
                </Accordion>
            </div>
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
                                <Button className="mx-10 px-20" variant="outlined" onClick={addNote('cancel')}>Skip & Save</Button>
                                <Button className="ml-10 px-20" variant="outlined" onClick={addNote('save')} color="success" autoFocus disabled={!memberNote.trim()}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </DialogActions>
                </div>
            </Dialog>
        </div>
    )
}

export default Rightside;