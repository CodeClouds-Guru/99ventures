import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Checkbox, Box, Typography, IconButton, ListItemText, ListItemIcon, Menu, MenuItem } from '@mui/material';
import ItemIcon from "./ItemIcon";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItemsId, setSelectedItem, setlightBoxStatus } from 'app/store/filemanager'
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
// import { setSelectedItem } from 'app/store/filemanager'
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';
import { copyUrl, convertFileSizeToKB } from './helper'
import './FileManager.css';

const FileItems = (props) => {
    const dispatch = useDispatch();
    const selectedItem = useSelector(state=>state.filemanager.selectedItem);
    const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
    const selectAll = useSelector(state=> state.filemanager.selectAll);
    const [anchorEl, setAnchorEl] = useState(null);
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    const viewType = useSelector(state=> state.filemanager.viewType);


    function handleMenuClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }
  
    const onConfirmAlertDialogHandle = () => {
        console.log('sss')
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

    const openPreview = (filePath) => {
        dispatch(setlightBoxStatus({isOpen: true, src: filePath}));
        handleMenuClose();
    }
    
    const style = {
		grid: {
			box: 'sm:w-160 h-160 flex-col p-16',
			icon_btn: 'absolute',
			nav_icon_adapter: 'flex-col',
			icon: 'flex-auto w-full justify-center',
			title: 'text-center',
			modify: 'text-center',
			size: 'text-center'
		},
		list: {
			box: 'sm:w-full flex items-center flex-row row-style p-6',
			icon_btn: '',
			nav_icon_adapter: 'flex-row items-center justify-between',
			icon: 'mr-3',
			title: 'text-left grow w-20',
			modify: 'text-left basis-1/5',
			size: 'text-left basis-1/5'
		}
	}

    const copyFilePath = () => {
        handleMenuClose()
		copyUrl(props.file.file_path);
        dispatch(showMessage({ variant: 'success', message: 'URL Copied' }));
  	}

    return (
        <Box
            sx={{ backgroundColor: 'rgb(255, 255, 255)' }}
            className={`${style[viewType].box} flex relative w-full m-8 shadow rounded-16 cursor-pointer ${selectedItem && selectedItem.id === props.file.id ? 'border-2 border-gray-800' : ''} ${viewType}--view--section`}
            >
            <IconButton
                className={`z-20 top-0 right-0 m-6 w-32 h-32 min-h-32 ${style[viewType].icon_btn}`}
            >
                <Checkbox 
                    size="small"
                    checked={ selectedItemsId.includes(props.file.id) }
                    inputProps={{ 'aria-label': 'controlled' }}
                    onChange={handleChange} 
                />
            </IconButton>

            <NavLinkAdapter
				className={`flex h-full w-full ${style[viewType].nav_icon_adapter}`}
                to="#"
				role="button"
			>
                <div className={`flex items-center ${style[viewType].icon}`} onClick={()=> dispatch(setSelectedItem(props.file))}>
                    <ItemIcon file={ props.file } />
                </div>
                
                <div className={`flex shrink flex-col justify-center text-left ${style[viewType].title}`}>
                    <Typography className="pr-5 truncate text-12 font-medium" onClick={()=> dispatch(setSelectedItem(props.file))}>{ props.file.name }</Typography>
                    <div className="item-list-icon">
                        <IconButton color="primary" aria-label="Filter" component="label"  onClick={ handleMenuClick }>
                            <FuseSvgIcon className="text-32" size={20} color="action">heroicons-outline:dots-vertical</FuseSvgIcon>  
                        </IconButton>

                        <Menu
                            id="actions-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            >
                            <MenuItem onClick={()=> dispatch(setSelectedItem(props.file))}>
                                <ListItemIcon className="min-w-40">
                                    <FuseSvgIcon className="text-48" size={20} color="action">material-outline:info</FuseSvgIcon>
                                </ListItemIcon>
                                <ListItemText primary="Details" />
                            </MenuItem>
                            <MenuItem onClick={ copyFilePath }>
                                <ListItemIcon className="min-w-40">
                                    <FuseSvgIcon className="text-48" size={20} color="action">material-outline:content_copy</FuseSvgIcon>
                                </ListItemIcon>
                                <ListItemText primary="Copy" />
                            </MenuItem>
                            <MenuItem onClick={ ()=>openPreview(props.file.file_path) }>
                                <ListItemIcon className="min-w-40">
                                    <FuseSvgIcon className="text-48" size={20} color="action">material-outline:remove_red_eye</FuseSvgIcon>
                                </ListItemIcon>
                                <ListItemText primary="Preview" />
                            </MenuItem>
                            <MenuItem onClick={ ()=> setOpenAlertDialog(true) }>
                                <ListItemIcon className="min-w-40">
                                    <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                                </ListItemIcon>
                                <ListItemText primary="Delete" />
                            </MenuItem>                        
                        </Menu>                     
                    </div>
                </div>
                {
                    viewType === 'list' && (
                        <>
                            <div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].modify}`} onClick={()=> dispatch(setSelectedItem(props.file))}>
                                <Typography className="truncate text-12 font-medium">{ props.file.last_modified }</Typography>
                            </div>
                            <div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].size}`} onClick={()=> dispatch(setSelectedItem(props.file))}>
                                <Typography className="truncate text-12 font-medium">{ convertFileSizeToKB(props.file.size) } KB</Typography>
                            </div>
                        </>
                    )
                }	
            </NavLinkAdapter>
            {
                openAlertDialog && (
                    <AlertDialog
                        content="Do you delete the item(s)?"
                        open={openAlertDialog}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }
        </Box>
    )
}

export default FileItems;