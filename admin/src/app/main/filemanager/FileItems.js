import { useEffect, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Checkbox, Box, Typography, IconButton, List, ListItem, ListItemText, ListItemIcon, ListItemButton, Menu, MenuItem } from '@mui/material';
import ItemIcon from "./ItemIcon";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItem } from 'app/store/filemanager'
import AlertDialog from 'app/shared-components/AlertDialog';
import './FileManager.css'

const FileItems = (props) => {
    const dispatch = useDispatch();
    const selectedItem = useSelector(state=>state.filemanager.selectedItem);
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

    return (
        <Box
            sx={{ backgroundColor: 'rgb(255, 255, 255)' }}
            className={`flex flex-col relative w-full sm:w-160 h-160 m-8 p-16 shadow rounded-16 cursor-pointer file--box`}
            >
            <IconButton
                className="absolute z-20 top-0 right-0 m-6 w-32 h-32 min-h-32"
            >
                <Checkbox checked={ selectAll } { ...{ inputProps: { 'aria-label': 'Checkbox demo' } } } />
            </IconButton>                
            
            <div className="flex flex-auto w-full items-center justify-center" onClick={()=> dispatch(setSelectedItem(props.file)) }>
                <ItemIcon className="" type={props.file.mime_type} />
            </div>
            
            <div className="flex shrink flex-col justify-center text-center" >
                <Typography className="truncate text-12 font-medium">Demo</Typography>
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
                        <MenuItem >
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