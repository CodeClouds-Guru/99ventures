import { Box, Avatar, Stack, Divider, IconButton, Typography, TextField, Link, Autocomplete, Chip, Dialog, DialogTitle, DialogActions, DialogContent, Button, List, ListItem, ListItemIcon, ListItemText,  TextareaAutosize, Tooltip } from '@mui/material';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import ShareIcon from '@mui/icons-material/Share';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import HotelIcon from '@mui/icons-material/Hotel';
import RepeatIcon from '@mui/icons-material/Repeat';
import CommonHeader from './CommonHeader';

const Downline = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Downline'
    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <CommonHeader module={module} />
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