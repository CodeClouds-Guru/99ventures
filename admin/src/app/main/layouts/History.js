import * as React from 'react';
import { motion } from 'framer-motion';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot} from '@mui/lab';
import { Box, IconButton, Button, Tooltip, Typography, Link, CircularProgress, Divider } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import './Layouts.css'

const History = () => {

    return (
        <motion.div
			initial={{ y: 50, opacity: 0.8 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
			className="lg:p-24 md:24 sm:p-24 layout-section"
		>
            <div className="flex flex-col w-full">
				<Typography className="p-10" variant="h6">Update History</Typography>
                <Divider />
				{/* <IconButton size="small">
					<FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
				</IconButton> */}
			</div>
            <Timeline>
                <TimelineItem className="timeline-li" sx={{ py: '10px', '&::before': {padding: 0, flex: 0}, "&:hover": {backgroundColor: 'rgb(243 244 246)'} }}>
                    <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }} className="flex justify-between">
                        <div className="flex flex-col">
                            <Typography variant="body1" component="span">
                                Layout Updated
                            </Typography>
                            <Typography variant="caption" className="italic" color="text.secondary" >10-11-2022</Typography>
                        </div>
                        <div className='icon-div'>
                            <Tooltip title="Apply Changes">
                                <IconButton size="small">
                                    <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:check</FuseSvgIcon>
                                </IconButton>
                            </Tooltip>
                        </div>
                    </TimelineContent>
                </TimelineItem>
                <TimelineItem className="timeline-li" sx={{ py: '10px', '&::before': {padding: 0, flex: 0}, "&:hover": {backgroundColor: 'rgb(243 244 246)'} }}>
                    <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }} className="flex justify-between">
                        <div className="flex flex-col">
                            <Typography variant="body1" component="span">
                                Layout Updated
                            </Typography>
                            <Typography variant="caption" className="italic" color="text.secondary" >10-11-2022</Typography>
                        </div>
                        <div className='icon-div'>
                            <Tooltip title="Apply Changes">
                                <IconButton size="small">
                                    <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:check</FuseSvgIcon>
                                </IconButton>
                            </Tooltip>
                        </div>
                    </TimelineContent>
                </TimelineItem>
            </Timeline>
        </motion.div>
    );
}

export default History;