import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Box, IconButton, Button, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ItemIcon from './ItemIcon';
import { setSelectedItem } from 'app/store/filemanager';
import { lighten } from '@mui/material/styles';
import AlertDialog from 'app/shared-components/AlertDialog';
import { useState } from 'react';
import AltTag from './AltTag';
import { setlightBoxStatus } from 'app/store/filemanager';

const SidebarContent = (props) => {
	const dispatch = useDispatch();
	const selectedItem = useSelector(state=>state.filemanager.selectedItem)
	const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
	
	if (!selectedItem) {
		return null;
	}

  	const copyUrl = () => {
		const el = document.createElement('input');
		el.value = window.location.href;
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
  	}

	const onConfirmAlertDialogHandle = () => {
        console.log('sss')
    }

	const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }

	return (
		<motion.div
			initial={{ y: 50, opacity: 0.8 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
			className="file-details lg:p-24 md:24 sm:p-24"
		>
			<div className="flex items-center justify-between w-full">
				<Typography variant="h5">Details</Typography>
				<IconButton className="" size="large" onClick={() => dispatch(setSelectedItem(null))}>
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
					<ItemIcon className="" type={selectedItem.mime_type} />
				</motion.div>
			</Box> 

			<Typography className="text-18 font-medium">{selectedItem.name}</Typography>

			<div className="text-16 font-medium mt-32">Information</div>
			<div className="flex flex-col mt-16 border-t border-b divide-y font-medium">			
				{/* <div className="flex items-center justify-between py-14">
					<Typography color="text.secondary">Created At</Typography>
					<Typography></Typography>
				</div> */}
				<div className="flex items-center justify-between py-14">
					<Typography color="text.secondary">Modified At</Typography>
					<Typography></Typography>
				</div>
				<div className="flex items-center justify-between py-14">
					<Typography color="text.secondary">Size</Typography>
					<Typography>{selectedItem.size}</Typography>
				</div>	
				<div className="flex items-center justify-between py-8">
					<Typography color="text.secondary">Copy URL</Typography>
					<Tooltip title="Copy URL">
						<IconButton color="primary" aria-label="Filter" component="label" onClick={ copyUrl }>
							<FuseSvgIcon className="text-48" size={20} color="action">material-outline:content_copy</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</div>		
				<div className="flex w-full py-10 items-center justify-between">
					<AltTag />
				</div>
			</div>

			<div className=" gap-16 w-full mt-32 flex justify-between">
				<Button className="" color="secondary" variant="contained">Download</Button>
				<Button className="" color="primary" variant="contained" onClick={ ()=> dispatch(setlightBoxStatus({isOpen: true, src: '//placekitten.com/1500/500'})) }>Preview</Button>
				<Button className="" color="error" variant="outlined" onClick={ ()=>setOpenAlertDialog(true) }>Delete</Button>
			</div>
			{
				openAlertDialog && (
					<AlertDialog
						content="Do you delete this item?"
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
