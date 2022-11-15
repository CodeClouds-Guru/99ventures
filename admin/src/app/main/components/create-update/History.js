import * as React from 'react';
import { motion } from 'framer-motion';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot} from '@mui/lab';
import { IconButton, Tooltip, Typography} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch, useSelector } from 'react-redux';
import { applyRevision } from 'app/store/components';
import { useParams } from 'react-router-dom';
import Helper from 'src/app/helper';


const History = (props) => {
    const dispatch = useDispatch();
    const { moduleId } = useParams();
    const selectRevision = useSelector(state => state.components.revisions_data);
    const selectComponentData = useSelector(state => state.components.component_data);
    const handleApplyRevision = (id) => {
        dispatch(applyRevision({
            module_id: moduleId,
            rev_component_id: id
        }))
    }

    return (
        <motion.div
			initial={{ y: 50, opacity: 0.8 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
			className="lg:p-24 md:24 sm:p-24 layout-section"
		>
            <div className="flex flex-row border-b-1 mb-10 items-center justify-between w-full">
                <div className='p-10 '>
                    <Typography className="sm:text-base lg:text-lg" variant="h6">Components Versions</Typography>                
                    <Typography variant="caption">Choose any version in your history to restore to previous edits.</Typography>
                </div>
				<div>
                    <IconButton size="small" onClick={ props.toggleSidebar }>
                        <FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
                    </IconButton>
                </div>
			</div>
            <Timeline className="p-0">
                {

                    selectComponentData && (
                        <TimelineItem
                            className="timeline-li p-10 xborder-b-2 rounded-md" sx={{ py: '10px', '&::before': {padding: 0, flex: 0}, "&:hover": {backgroundColor: 'rgb(243 244 246)'} }}
                        >
                            <TimelineSeparator>
                                <TimelineDot sx={{ backgroundColor: 'rgb(34 197 94)' }} />
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: '12px', px: 2 }} className="flex justify-between">
                                <div className="flex flex-col">
                                    <Typography variant="body1" className="sm:text-sm" component="span">
                                    Current Version 
                                    </Typography>
                                    <Typography variant="caption" className="italic" color="text.secondary" >
                                        Last Updated At: { Helper.parseTimeStamp(selectComponentData.updated_at) }
                                    </Typography>
                                </div>
                                
                            </TimelineContent>
                        </TimelineItem>
                    )
                }
                {
                    selectRevision.map((item, indx) => {
                        return (
                            <TimelineItem 
                                key={item.id} 
                                className="timeline-li p-10 rounded-md" sx={{ py: '10px', '&::before': {padding: 0, flex: 0}, "&:hover": {backgroundColor: 'rgb(243 244 246)'} }}
                            >
                                <TimelineSeparator>
                                    <TimelineDot />
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent sx={{ py: '12px', px: 2 }} className="flex justify-between">
                                    <div className="flex flex-col">
                                        <Typography variant="body1" className="sm:text-sm" component="span">
                                            Version { selectRevision.length - (indx)}
                                        </Typography>
                                        <Typography variant="caption" className="italic" color="text.secondary" >
                                           Last Updated At: { Helper.parseTimeStamp(item.updated_at) }
                                        </Typography>
                                    </div>
                                    <div className='icon-div'>
                                        <Tooltip title="Revert Changes">
                                            <IconButton size="small" onClick={ ()=> handleApplyRevision(item.id) }>
                                                <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:check</FuseSvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </TimelineContent>
                            </TimelineItem>
                        )
                    })
                }

            </Timeline>
        </motion.div>
    );
}

export default History;