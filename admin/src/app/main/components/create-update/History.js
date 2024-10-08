import * as React from 'react';
import { motion } from 'framer-motion';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot} from '@mui/lab';
import { IconButton, Tooltip, Typography} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch, useSelector } from 'react-redux';
import { applyRevision } from 'app/store/components';
import { useParams } from 'react-router-dom';
import Helper from 'src/app/helper';
import AlertDialog from 'app/shared-components/AlertDialog';

const History = (props) => {
    const dispatch = useDispatch();
    const { moduleId } = useParams();
    const [ openAlertDialog, setOpenAlertDialog ] = React.useState(false);
    const [ revisionId, setRevisionId ] = React.useState(0);
    const selectRevision = useSelector(state => state.components.revisions_data);
    const selectComponentData = useSelector(state => state.components.component_data);
    
    const handleShowConfirmPopup = (id) => {
        setOpenAlertDialog(true);
        setRevisionId(id);
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
        setRevisionId(0);
    }
    
    const onConfirmAlertDialogHandle = () => {
        dispatch(applyRevision({
            module_id: moduleId,
            rev_component_id: revisionId
        }));
        onCloseAlertDialogHandle();
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
                    <IconButton size="small" onClick={ ()=>props.toggleSidebar(false) }>
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
                                    <Typography variant="h6" className="sm:text-sm" component="span">
                                        Current Version 
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" className="sm:text-sm italic" component="span">
                                        Component Name: { selectComponentData.name }
                                    </Typography>
                                    <Typography variant="caption" className="italic" color="text.secondary" >
                                        Last Updated At: { Helper.parseTimeStamp(selectComponentData.created_at) }
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
                                <TimelineContent sx={{ py: '12px', px: 2 }} className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <Typography variant="h6" className="sm:text-sm" component="span">
                                            Version { selectRevision.length - (indx)}
                                        </Typography>
                                        <Typography variant="body2" className="sm:text-sm italic" color="text.secondary" component="span">
                                            Component Name: { item.name }
                                        </Typography>
                                        <Typography variant="caption" className="italic" color="text.secondary" >
                                            {
                                                (selectRevision.length - 1 === indx) ? `Created At: ${ Helper.parseTimeStamp(item.created_at) }` : `Last Updated At: ${ Helper.parseTimeStamp(item.updated_at) }`
                                            }
                                        </Typography>
                                    </div>
                                    <div className='icon-div'>
                                        <Tooltip title="Revert Changes">
                                            <IconButton size="small" onClick={ ()=> handleShowConfirmPopup(item.id) }>
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
            <AlertDialog
                content="Please Note that this event will swap the current layout with the selected revision. If you want to revert back this change you have to swap again with the same version number."
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={onCloseAlertDialogHandle}
            />
        </motion.div>
    );
}

export default History;