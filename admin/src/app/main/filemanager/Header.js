import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, IconButton, Paper, Input, ListItemText, Menu, MenuItem} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CreateFolder from './CreateFolder';
import AlertDialog from 'app/shared-components/AlertDialog';
import SelectAll from './SelectAll';
import { useSelector, useDispatch } from 'react-redux';
import { setViewType, deleteData } from '../../store/filemanager'

const baseStyle = {
    borderTop: '3px solid #77777763',
    borderBottom: '3px solid #ddd',
    padding: '5px 0',
}

const Header = () => {
    const dispatch = useDispatch();
    const viewType = useSelector(state=> state.filemanager.viewType);
    const selectedItem = useSelector(state=>state.filemanager.selectedItem);
    const selectedItemIdArry = useSelector(state=> state.filemanager.selectedItemsId);
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [ msg, setMsg ] = useState('');
    
    /**
     * Alert box open, close & confirm delete
	*/
	const onOpenAlertDialogHandle = () => {
        var message = '';
        if(selectedItemIdArry.length > 1)
            message = `Do you want to delete ${selectedItemIdArry.length} item(s)?`;
        else if(selectedItemIdArry.length == 1)
            message = `Do you want to delete this item?`;
        else if(selectedItem)
            message = `Do you want to delete ${selectedItem.name}?`;

        setMsg(message);
        setOpenAlertDialog(true);
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }
  
    const onConfirmAlertDialogHandle = async () => {
        var params = [];
        if(selectedItemIdArry.length)
            params = selectedItemIdArry;
        else if(selectedItem)
            params = [selectedItem.id]

        dispatch(deleteData(params))
        .then(result => {
            setOpenAlertDialog(false);
        })        
    }

    // useEffect(() => {
    //     if ( anchorEl) {
    //       setAnchorEl(null);
    //     }
    // }, [anchorEl]);

    function handleMenuClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }

    return (
        <>
            <div style={ baseStyle } className="flex flex-col sm:flex-row w-full sm:w-auto items-center space-y-16 sm:space-y-0 sm:space-x-16 justify-between">                     
                <SelectAll />
                <div className='flex justify-between'>
                    {
                        (selectedItemIdArry.length || selectedItem) ? (
                            <Tooltip title="Delete">
                                <IconButton color="primary" aria-label="Filter" component="label" onClick={ onOpenAlertDialogHandle }>
                                    <FuseSvgIcon className="text-48" size={26} color="action">heroicons-outline:trash</FuseSvgIcon>
                                </IconButton>
                            </Tooltip>
                        ) : ''
                    }
                    
                    <CreateFolder />
                    <Tooltip title="Download">
                        <IconButton color="primary" aria-label="Filter" component="label" >
                            <FuseSvgIcon className="text-48" size={26} color="action">material-outline:file_download</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                </div>
                
                <div className="flex " variant="outlined">
                    <Paper
                        component={motion.div}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
                        className="flex items-center w-full sm:max-w-320 space-x-8 px-16 rounded-full border-1 shadow-0"
                    >
                        <FuseSvgIcon color="disabled">heroicons-solid:search</FuseSvgIcon>
                        <Input
                            placeholder={`Search `}
                            className="flex flex-1"
                            disableUnderline
                            fullWidth
                            
                            inputProps={{
                                'aria-label': `Search `,
                            }}                                
                        />
                    </Paper>
                </div>
                <div className='flex'>                
                    <Tooltip title="Filter">
                        <IconButton color="primary" aria-label="Filter" component="label" onClick={ handleMenuClick } >
                            <FuseSvgIcon className="text-48" size={26} color="action">heroicons-outline:filter</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>                    

                    <Menu
                        id="actions-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        >
                        <MenuItem>
                            <ListItemText primary="Newest First" />
                        </MenuItem>
                        <MenuItem >
                            <ListItemText primary="Oldest First" />
                        </MenuItem>
                        <MenuItem>
                            <ListItemText primary="Asc Filename" />
                        </MenuItem>
                        <MenuItem >
                            <ListItemText primary="Desc Filename" />
                        </MenuItem>
                    </Menu> 
                </div>
                <div className='flex view--type'>
                    <Tooltip title="Grid">
                        <IconButton color="primary" aria-label="Filter" component="label" onClick={()=> dispatch(setViewType('grid'))} className={ viewType === 'grid' ? 'active' : '' }>
                            <FuseSvgIcon className="text-48" size={26} color="action">material-outline:grid_view</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="List">
                        <IconButton color="primary" aria-label="Filter" component="label" onClick={()=> dispatch(setViewType('list'))} className={ viewType === 'list' ? 'active' : ''}>
                            <FuseSvgIcon className="text-48" size={26} color="action">material-outline:format_list_bulleted</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                </div>            
            </div>
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
    )
}

export default Header