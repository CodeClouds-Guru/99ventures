import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, IconButton, Button, Tooltip, Typography, Link } from '@mui/material';
import { lighten } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { setlightBoxStatus, deleteData, setSelectedItem } from 'app/store/filemanager';
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';
import ItemIcon from './ItemIcon';
import { copyUrl, matchMimeType , downloadFile} from './helper';
import AltTag from './AltTag';
import Helper from 'src/app/helper';

const SidebarContent = (props) => {
	const dispatch = useDispatch();
	const selectedItem = useSelector(state=>state.filemanager.selectedItem)
	const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
	const [ msg, setMsg ] = useState('');

	if (!selectedItem) {
		return null;
	}

  	const copyFilePath = () => {
		copyUrl(selectedItem.file_path);
        dispatch(showMessage({ variant: 'success', message: 'URL Copied' }));
  	}

	/**
     * Alert box open, close & confirm delete
	*/
	const onOpenAlertDialogHandle = () => {
        setMsg(`Do you want to delete ${selectedItem.name}?`);
        setOpenAlertDialog(true);
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }
  
    const onConfirmAlertDialogHandle = async () => {        
        dispatch(deleteData([selectedItem.id]))
        .then(result => {
            setOpenAlertDialog(false);
			disabledSideBar()
        })        
    }

	const disabledSideBar = () => {
		dispatch(setSelectedItem(null));
	}

	return (
		<motion.div
			initial={{ y: 50, opacity: 0.8 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
			className="file-details lg:p-24 md:24 sm:p-24"
		>
			<div className="flex items-center justify-between w-full">
				<Typography variant="h5">Details</Typography>
				<IconButton size="small" onClick={ disabledSideBar }>
					<FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
				</IconButton>
			</div>

			<Box
				className="overflow-hidden w-full rounded-8 border preview h-128 sm:h-256 file-icon flex items-center justify-center my-24"
				sx={{
				backgroundColor: (theme) =>
					theme.palette.mode === 'light'
					? lighten(theme.palette.background.default, 0.4)
					: lighten(theme.palette.background.default, 0.02),
				}}
			>
				<motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
					<ItemIcon file={selectedItem} />
				</motion.div>
			</Box> 

			<Typography className="text-18 font-medium">{selectedItem.name}</Typography>

			<div className="text-16 font-medium mt-32">Information</div>
			<div className="flex flex-col mt-16 border-t border-b divide-y font-medium">
				<div className="flex items-center justify-between py-14">
					<Typography color="text.secondary">Modified At</Typography>
					<Typography>{Helper.parseTimeStamp(selectedItem.last_modified)}</Typography>
				</div>
				<div className="flex items-center justify-between py-14">
					<Typography color="text.secondary">Size</Typography>
					<Typography>{ (selectedItem.size/1024).toFixed(2) } KB</Typography>
				</div>	
				<div className="flex items-center justify-between py-14">
					<Typography color="text.secondary">Access</Typography>
					<Typography>{ selectedItem.access }</Typography>
				</div>	
				{
					selectedItem.access === 'public'  && (
						<div className="flex items-center justify-between py-8">
							<Typography color="text.secondary">Copy URL</Typography>
							<Tooltip title="Copy URL">
								<IconButton color="primary" aria-label="Filter" component="label" onClick={ copyFilePath }>
									<FuseSvgIcon className="text-48" size={20} color="action">material-outline:content_copy</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						</div>	
					)
				}

				<div className="flex w-full py-10 items-center justify-between">
					<AltTag />
				</div>
			</div>

			<div className=" gap-16 w-full mt-32 flex justify-between">
				<Button color="secondary" variant="contained" onClick={ ()=> downloadFile(selectedItem.file_path, selectedItem.name) }>Download</Button>
				{
					selectedItem.access === 'public'  && (
						<Button 
							color="primary" 
							variant="contained" 
							onClick={ ()=> {
								matchMimeType(selectedItem.mime_type) 
								? dispatch(setlightBoxStatus({isOpen: true, src: selectedItem.file_path}))
								: window.open(selectedItem.file_path, '_blank')
							}}
						>Preview</Button>
					)
				}
				<Button color="error" variant="outlined" onClick={ onOpenAlertDialogHandle }>Delete</Button>
			</div>
			{
				openAlertDialog && (
					<AlertDialog
						content={ msg }
						open={openAlertDialog}
						onConfirm={onConfirmAlertDialogHandle}
						onClose={onCloseAlertDialogHandle}
					/>
				)
			}			
		</motion.div>
	);
}

export default SidebarContent;
