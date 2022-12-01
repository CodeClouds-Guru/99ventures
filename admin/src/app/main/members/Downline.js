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
import CommonHeader from './CommonHeader';
import axios from 'axios';
import PageHeader from './PageHeader';

const Downline = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Downline'
    const [downlineHistory, setDownlineHistory] = React.useState([]);

    const getDownlineHistory = () => {
        const params = {
            where: {
                member_id: 1
            }
        }
        axios.get('/member-referrals', { params })
        .then(res => {
            if(res.data.results.result.data) {
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
    

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <PageHeader module={module} button="downline" />
            }
            content={
                <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex " >
                    <Timeline >
                        <TimelineItem >
                            <TimelineOppositeContent
                                sx={{ m: 'auto 0' }}
                                align="right"
                                variant="body2"
                                color="text.secondary"
                                className="flex-none w-192"
                            >
                                December 2022
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineConnector sx={{ backgroundColor: '#fff'}} />                     
                                <TimelineDot color="primary">
                                    <ShareIcon />
                                </TimelineDot>
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: '12px', px: 2 }}>
                                <div className="bg-gray-200 p-16 rounded-md w-1/2">
                                    <div className='flex items-center mb-7'>
                                        <Avatar alt="Remy Sharp" src="/material-ui-static/images/avatar/1.jpg" className="mr-7" />
                                        <Typography variant="body1 font-bold" component="span">
                                            John Smith
                                        </Typography>
                                    </div>
                                    <Typography variant="caption" component="p">
                                        2022-12-01 9:30 am
                                    </Typography>
                                    <Divider className="my-5" />
                                    <Typography>Because you need strength</Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem >
                            <TimelineOppositeContent
                                sx={{ m: 'auto 0' }}
                                align="right"
                                variant="body2"
                                color="text.secondary"
                                className="flex-none w-192"
                            >
                                November 2022
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineConnector />
                                <TimelineDot color="primary">
                                    <ShareIcon />
                                </TimelineDot>
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: '12px', px: 2 }}>
                                <div className="bg-gray-200 p-16 rounded-md w-1/2">
                                    <div className='flex items-center mb-7'>
                                        <Avatar alt="Remy Sharp" src="/material-ui-static/images/avatar/1.jpg" className="mr-7" />
                                        <Typography variant="body1 font-bold" component="span">
                                            John Smith
                                        </Typography>
                                    </div>
                                    <Typography variant="caption" component="p">
                                        2022-12-01 9:30 am
                                    </Typography>
                                    <Divider className="my-5" />
                                    <Typography>Because you need strength</Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem >
                            <TimelineOppositeContent
                                sx={{ m: 'auto 0' }}
                                align="right"
                                className="flex-none w-192"
                            >
                            </TimelineOppositeContent>                     
                            <TimelineSeparator>
                                <TimelineConnector />
                                <TimelineDot color="primary">
                                    <ShareIcon />
                                </TimelineDot>
                                <TimelineConnector sx={{ backgroundColor: '#fff'}} />
                            </TimelineSeparator>                            
                            <TimelineContent sx={{ py: '12px', px: 2 }}>
                                <div className="bg-gray-200 p-16 rounded-md w-1/2">
                                    <div className='flex items-center mb-7'>
                                        <Avatar alt="Remy Sharp" src="/material-ui-static/images/avatar/1.jpg" className="mr-7" />
                                        <Typography variant="body1 font-bold" component="span">
                                            John Smith
                                        </Typography>
                                    </div>
                                    <Typography variant="caption" component="p">
                                        2022-12-01 9:30 am
                                    </Typography>
                                    <Divider className="my-5" />
                                    <Typography>Because you need strength</Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                    </Timeline>
                </Box>
            }
            rightSidebarOpen={ false }
            scroll={isMobile ? 'normal' : 'content'} 
        />
    )
}

export default Downline;