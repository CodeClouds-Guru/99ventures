import { useEffect, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Checkbox, Box, Typography, IconButton, ListItemText, ListItemIcon, Menu, MenuItem } from '@mui/material';
import ItemIcon from "./ItemIcon";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItemsId, setSelectedItem, setlightBoxStatus } from 'app/store/filemanager'
// import { setSelectedItem } from 'app/store/filemanager'
import AlertDialog from 'app/shared-components/AlertDialog';
import './FileManager.css';

const FileItems = (props) => {
    const dispatch = useDispatch();
    const selectedItem = useSelector(state=>state.filemanager.selectedItem);
    const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
    const selectAll = useSelector(state=> state.filemanager.selectAll);
    const [anchorEl, setAnchorEl] = useState(null);
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    
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

    const openPreview = () => {
        dispatch(setlightBoxStatus({isOpen: true, src: '//placekitten.com/1500/500'}));
        handleMenuClose();
    }
    return (
        <Box
            sx={{ backgroundColor: 'rgb(255, 255, 255)' }}
            className={`flex flex-col relative w-full sm:w-160 h-160 m-8 p-16 shadow rounded-16 cursor-pointer file--box ${selectedItem && selectedItem.id === props.file.id ? 'border-2 border-gray-800' : ''}`}
            >
            <IconButton
                className="absolute z-20 top-0 right-0 m-6 w-32 h-32 min-h-32"
            >
                <Checkbox 
                    checked={ selectedItemsId.includes(props.file.id) }
                    inputProps={{ 'aria-label': 'controlled' }}
                    onChange={handleChange} 
                />
            </IconButton>                
            
            <div className="flex flex-auto w-full items-center justify-center" onClick={()=> dispatch(setSelectedItem(props.file)) }>
                <ItemIcon className="" type={props.file.mime_type} />
            </div>
            
            <div className="flex shrink flex-col justify-center text-center" >
                <Typography className="truncate text-12 font-medium" onClick={()=> dispatch(setSelectedItem(props.file)) }>{ props.file.name }</Typography>
                <div>
                    <IconButton color="primary" aria-label="Filter" component="label" className="item-list-icon" onClick={ handleMenuClick }>
                        <FuseSvgIcon className="text-32" size={24} color="action">heroicons-outline:dots-vertical</FuseSvgIcon>  
                    </IconButton>

                    <Menu
                        id="actions-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        >
                        <MenuItem>
                            <ListItemIcon className="min-w-40">
                                <FuseSvgIcon className="text-48" size={24} color="action">material-outline:content_copy</FuseSvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Copy" />
                        </MenuItem>
                        <MenuItem onClick={ openPreview }>
                            <ListItemIcon className="min-w-40">
                                <FuseSvgIcon className="text-48" size={24} color="action">material-outline:remove_red_eye</FuseSvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Preview" />
                        </MenuItem>
                        <MenuItem onClick={ ()=> setOpenAlertDialog(true) }>
                            <ListItemIcon className="min-w-40">
                                <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
                            </ListItemIcon>
                            <ListItemText primary="Delete" />
                        </MenuItem>                        
                    </Menu>                     
                </div>
            </div>        
            <AlertDialog
                content="Do you delete the item(s)?"
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={onCloseAlertDialogHandle}
            />
        </Box>
    )
}

export default FileItems;