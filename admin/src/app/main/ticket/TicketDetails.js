import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Leftside from './Leftside';
import Rightside from './Rightside';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import {useParams} from 'react-router-dom'
import Divider from '@mui/material/Divider';
import { updateUnreadTicketCount } from 'app/store/tickets';

const Root = styled(FusePageCarded)({
  '& .FusePageCarded-header': {},
  '& .FusePageCarded-toolbar': {},
  '& .FusePageCarded-content': {},
  '& .FusePageCarded-sidebarHeader': {},
  '& .FusePageCarded-sidebarContent': {},
});

function TicketDetails() {
    const dispatch = useDispatch();
    const {ticketId} = useParams();
    const [ticketConversations, setTicketConversations] = useState([]);
    const [memberDetails, setMemberDetails] = useState({});
    const [ticketStatus, setTicketStatus] = useState('');
    const [ticketSubject, setTicketSubject] = useState('');
    const [previousTickets, setPreviousTIckets] = useState([]);
    const [memberId, setMemberId] = useState(0);
    const [quickResponseOptions, setQuickResponseOptions] = useState([]);
    const [openedTicket, setOpendedTicket] = useState(null);

    useEffect(() => {
        getTicketDetails();
    }, []);

    const getTicketDetails = () => {
        axios.get(`${jwtServiceConfig.getSingleTicketDetails}/${ticketId}`)
            .then(response => {
                if (response.data.results.status) {
                    setTicketStatus(response.data.results.data.status);
                    setTicketSubject(response.data.results.data.subject);
                    setTicketConversations(response.data.results.data.TicketConversations);
                    setMemberDetails(response.data.results.data.Member);
                    setPreviousTIckets(response.data.results.data.previous_tickets);
                    setMemberId(response.data.results.data.member_id)
                    setQuickResponseOptions(response.data.results.data.auto_responders);
                    // setMemberStatus(response.data.results.data.Member.status);
                    // setTicketSubject(response.data.results.data.subject)
                    setOpendedTicket(response.data.results.data.opended_ticket);

                    // console.log(response.data.results.data.opended_ticket)
                    dispatch(updateUnreadTicketCount(response.data.results.data.opended_ticket))
                    if (response.data.results.data.is_read === 0) {
                        updateTicket({
                            value: 1,
                            field_name: 'is_read',
                            id: props.ticketId,
                            type: 'is_read'
                        });
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
    return (
        <Root 
            header="" 
            content={
                <div className='flex flex-col md:flex-row flex-wrap w-full'>
                    <div className="ticket-leftside">
                        <Leftside 
                            ticketConversations={ticketConversations} 
                            ticketStatus={ticketStatus} 
                            ticketSubject={ticketSubject} 
                            updateTicket={updateTicket} 
                            quickResponseOptions={quickResponseOptions} 
                            openedTicket={openedTicket}
                        />
                    </div>
                    <Divider orientation="vertical" variant="middle" flexItem className="hidden md:flex my-20" />
                    <Divider className="flex md:hidden my-10" />
                    <div className="ticket-rightside">
                        <Rightside 
                            memberid={memberId} 
                            memberDetails={memberDetails} 
                            previousTickets={previousTickets} 
                            updateTicket={updateTicket} 
                        />
                    </div>
                </div>
            } 
            scroll="content" 
        />
    );
}

export default TicketDetails;
