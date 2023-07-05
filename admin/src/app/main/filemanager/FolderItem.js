import * as React from 'react';
import { Typography, IconButton, Checkbox, Link, Menu, MenuItem, ListItemText, ListItemIcon } from '@mui/material';
import { Box } from '@mui/system';
import ItemIcon from './ItemIcon';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItemsId, setSelectedItem, setPathObject, setFolderOptions, deleteData } from 'app/store/filemanager';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AlertDialog from 'app/shared-components/AlertDialog';

/**
 * Grid & List Style
 */
const style = {
	grid: {
		box: 'sm:w-144 md:w-136 h-136 p-16 flex-col',
		icon_btn: 'absolute',
		nav_icon_adapter: 'flex-col',
		icon: 'flex-auto w-full justify-center',
		title: 'text-center',
		modify: 'text-center',
		size: 'text-center'
	},
	list: {
		box: 'sm:w-full items-center row-style p-6',
		icon_btn: '',
		nav_icon_adapter: 'flex-row items-center justify-between',
		icon: 'mr-3',
		title: 'text-left grow w-20',
		modify: 'text-left basis-1/5',
		size: 'text-left basis-1/5'
	}
}

function FolderItem(props) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const viewType = useSelector(state=> state.filemanager.viewType);
	const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
	const pathObject = useSelector(state=> state.filemanager.pathObject);
	const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
	const [ anchorEl, setAnchorEl ] = useState(null);
	const [ msg, setMsg ] = useState('');
	const [ type, setType ] = useState('');

	function handleMenuClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }

	const handleChange = (event) => {
        if(!event.target.checked && selectedItemsId.includes(props.file.id)){
            const ids = selectedItemsId.filter(el=> el !== props.file.id);
            dispatch(setSelectedItemsId(ids))
        } else {
            dispatch(
                setSelectedItemsId([...selectedItemsId, props.file.id])
            )            
        }
    }	

	const navigateTochild = ()=>{
		const path = [...pathObject, props.file.name];
		dispatch(setPathObject(path));
		return navigate(path.join('/'));
	}

	/**
     * Alert box open, close & confirm
     */
	 const onOpenAlertDialogHandle = (type) => {
		setType(type)
		if(type === 'rename')
        	setMsg(`If you rename the folder, the file / folder path will be updated inside this folder. Do you want to proceed this?`);
		else 
			setMsg(`Do you want to delete ${props.file.name}?`);

        setOpenAlertDialog(true)
        handleMenuClose();
		dispatch(setSelectedItem(null))	// To disable the sidebar
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }
  
    const onConfirmAlertDialogHandle = () => {
		if(type === 'rename')
        	dispatch(setFolderOptions({popup_mode: true, type: 'rename_folder', additional_params: {id: props.file.id}}));
		else if(type === 'delete')
			dispatch(deleteData([props.file.id]));

		setOpenAlertDialog(false);   
    }

	return (
		<>
			<Box
				sx={{ backgroundColor: 'background.paper' }}
				className={`relative flex w-full m-8 shadow rounded-16 folder--box ${style[viewType].box} ${viewType}--view--section`}
			> 
				{/* <IconButton
						className={`z-20 top-0 right-0 m-6 w-32 h-32 min-h-32 ${style[viewType].icon_btn}`}
				>
					<Checkbox 
						size="small"
						checked={ selectedItemsId.includes(props.file.id) }
						inputProps={{ 'aria-label': 'controlled' }}
						onChange={handleChange} 
					/>
				</IconButton> */}
				<Link
					className={`flex h-full w-full ${style[viewType].nav_icon_adapter}`}
					to="#"
					role="button"				
				>
					
					<div className={`flex  items-center ${style[viewType].icon}`} onClick= { navigateTochild }>
						<ItemIcon file={ props.file } />
					</div>
					<div className={`flex shrink flex-col justify-center text-left ${style[viewType].title}`}>
						<Typography className="truncate text-12 font-medium" onClick= { navigateTochild }>{ props.file.name }</Typography>	
						<div className="item-list-icon">
							<IconButton color="primary" aria-label="Filter" component="label"  onClick={ handleMenuClick }>
								<FuseSvgIcon className="text-20" size={15} color="action">heroicons-outline:dots-vertical</FuseSvgIcon>  
							</IconButton>

							<Menu
								id="actions-menu"
								anchorEl={anchorEl}
								open={Boolean(anchorEl)}
								onClose={handleMenuClose}
								>
								<MenuItem 
									onClick={ ()=>onOpenAlertDialogHandle('rename') }
								><ListItemIcon className="min-w-40">
										<FuseSvgIcon className="text-48" size={20} color="action">heroicons-outline:pencil-alt</FuseSvgIcon>
									</ListItemIcon>									
									<ListItemText primary="Rename" /> 									
								</MenuItem> 
								<MenuItem onClick={ ()=>onOpenAlertDialogHandle('delete') }>
									<ListItemIcon className="min-w-40">
										<FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
									</ListItemIcon>
									<ListItemText primary="Delete" />
								</MenuItem>
								{/* <MenuItem >
									<ListItemIcon className="min-w-40">
										<FuseSvgIcon size={20}>material-outline:file_download</FuseSvgIcon>
									</ListItemIcon>
									<ListItemText primary="Download" />
								</MenuItem>  */}
							</Menu>                     
						</div>				
					</div>
					{
						viewType === 'list' && (
							<>
								<div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].modify}`}>
									<Typography className="truncate text-12 font-medium">{ props.file.last_modified }</Typography>
								</div>
								<div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].size}`}>
									<Typography className="truncate text-12 font-medium">---</Typography>
								</div>
							</>
						)
					}				
				</Link>
			</Box>		
			{
                openAlertDialog && (
                    <AlertDialog
                        content={msg}
                        open={openAlertDialog}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }	
		</>
	);
}

export default FolderItem;
