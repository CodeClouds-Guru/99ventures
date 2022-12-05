import { Box, Avatar, Divider, Typography } from '@mui/material';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import * as React from 'react';
import {
    Timeline, 
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineOppositeContent,
    TimelineDot
} from '@mui/lab';
import ShareIcon from '@mui/icons-material/Share';
import axios from 'axios';
import PageHeader from './PageHeader';
import Helper from 'src/app/helper';
import { Link } from 'react-router-dom';

const Downline = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Downline'
    const [downlineHistory, setDownlineHistory] = React.useState([]);

    const getDownlineHistory = () => {
        const params = {
            where: {
                member_id: 1
            },
            sort: 'activity_date',
            sort_order: 'desc'
        }
        axios.get('/member-referrals', { params })
        .then(res => {
            if(res.data.results.result.data) {
                console.log(res.data.results.result.data)
                setDownlineHistory(res.data.results.result.data);
            }
        })
        .catch(error => {
            console.log(error)
            dispatch(showMessage({ variant: 'error', message: error.message}));
        })
    }

    React.useEffect(()=>{
        getDownlineHistory();
    }, []);
    
    const memberAvtar = (member) => {
        return member.avatar ? member.avatar : `https://ui-avatars.com/api/?name=${ member.first_name}+${ member.last_name}`
    }

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <PageHeader module={module} button="downline" />
            }
            content={
                <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex " >
                    <Timeline >
                        {
                            downlineHistory.map((history, indx) => {
                                return history.data.map((item, itemIndx) => {
                                    return (
                                        <TimelineItem key={indx}>                                            
                                            <TimelineOppositeContent
                                                sx={{ m: 'auto 0' }}
                                                align="right"
                                                variant="body2"
                                                color="text.secondary"
                                                className="flex-none w-192"
                                            >
                                                { itemIndx < 1 && history.date_group }
                                            </TimelineOppositeContent>                                            
                                                
                                            <TimelineSeparator>
                                                <TimelineConnector sx={ (indx < 1 && itemIndx < 1) && { backgroundColor: '#fff'}} />                     
                                                <TimelineDot color="primary">
                                                    <ShareIcon />
                                                </TimelineDot>
                                                <TimelineConnector sx={ (downlineHistory.length < 2 || (history.data.length-1 === itemIndx && indx !=0)) ? { backgroundColor: '#fff'} : {}} />
                                            </TimelineSeparator>
                                            <TimelineContent sx={{ py: '12px', px: 2 }}>
                                                <div className="bg-gray-200 p-16 rounded-md w-1/2">
                                                    <div className='flex items-center mb-7'>                                                        
                                                        {
                                                            item.Member && (
                                                                <>
                                                                    <Avatar 
                                                                        alt="Remy Sharp" 
                                                                        src={ memberAvtar(item.Member) } 
                                                                        className="mr-7" 
                                                                    />
                                                                    <Link to={ `/app/members/${item.Member.id}`} style={{ textDecoration: 'none', color: '#1e293b'}}>
                                                                        <Typography variant="body1 font-bold" component="span">
                                                                            { item.Member.first_name +' '+ item.Member.last_name }
                                                                        </Typography>
                                                                    </Link>
                                                                </>
                                                            )
                                                        }        
                                                        <Typography variant="caption" component="p" className="ml-auto">
                                                            {Helper.parseTimeStamp(item.created_at)}
                                                        </Typography>                                                
                                                    </div>
                                                    
                                                    <Divider className="my-5" />
                                                    <Typography variant="caption">Status: </Typography>
                                                </div>
                                            </TimelineContent>
                                        </TimelineItem>
    
                                    )
                                })                                
                            })
                        }
                       
                    </Timeline>
                </Box>
            }
            rightSidebarOpen={ false }
            scroll={isMobile ? 'normal' : 'content'} 
        />
    )
}

export default Downline;