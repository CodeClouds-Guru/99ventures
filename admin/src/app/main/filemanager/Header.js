import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { lighten } from '@mui/material/styles';
import { Checkbox, Box, FormGroup, Tooltip, FormControlLabel, ListItemIcon, IconButton, Paper, Input, List, ListItem, ListItemText, ListItemButton, Menu, MenuItem} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CreateFolder from './CreateFolder';
import AlertDialog from 'app/shared-components/AlertDialog';

const baseStyle = {
    marginBottom: '1rem',
    borderTop: '3px solid #77777763',
    borderBottom: '3px solid #ddd',
    padding: '5px 0',
}

const Header = () => {
    const [ filter, toggleFilter ] = useState(false);
    const [ viewType, setViewType ] = useState('grid');
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    // const listRef = useRef();
    // const listBtnRef = useRef();

    // useEffect(()=>{
        // Bind the event listener
        // document.addEventListener("mousedown", handleClickOutside);
        // return () => {
        //     // Unbind the event listener on clean up
        //     document.removeEventListener("mousedown", handleClickOutside);
        // };
    // }, []);

    /**
     * Disabled dropdown by clicking outside
     */
    //  const handleClickOutside = (e) => {
    //     if(
    //         listRef.current.contains(e.target) ||
    //         listBtnRef.current.contains(e.target)
    //     ) {
    //         return;
    //     }
    //     toggleFilter(false);
    // }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }
  
    const onConfirmAlertDialogHandle = () => {
        console.log('sss')
    }
    const [anchorEl, setAnchorEl] = useState(null);
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
                <FormGroup className="flex" variant="outlined">
                    <FormControlLabel control={<Checkbox defaultChecked />} label="Select All" />
                </FormGroup>
                <div className='flex justify-between'>
                    <Tooltip title="Delete">
                        <IconButton color="primary" aria-label="Filter" component="label" onClick={ ()=> setOpenAlertDialog(true) }>
                            <FuseSvgIcon className="text-48" size={30} color="action">heroicons-outline:trash</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                    <CreateFolder />
                    <Tooltip title="Download">
                        <IconButton color="primary" aria-label="Filter" component="label" >
                            <FuseSvgIcon className="text-48" size={30} color="action">material-outline:file_download</FuseSvgIcon>
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
                <div className='flex max-w-200 w-200 relative'>                
                    <Tooltip title="Filter">
                        <IconButton color="primary" aria-label="Filter" component="label" onClick={ handleMenuClick } >
                            <FuseSvgIcon className="text-48" size={30} color="action">heroicons-outline:filter</FuseSvgIcon>
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
                        <IconButton color="primary" aria-label="Filter" component="label" className={ viewType === 'grid' ? 'active' : '' }>
                            <FuseSvgIcon className="text-48" size={30} color="action">material-outline:grid_view</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="List">
                        <IconButton color="primary" aria-label="Filter" component="label" className={ viewType === 'list' ? 'active' : ''}>
                            <FuseSvgIcon className="text-48" size={30} color="action">material-outline:format_list_bulleted</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                </div>            
            </div>
            
        <AlertDialog
            content="Do you delete the item(s)?"
            open={openAlertDialog}
            onConfirm={onConfirmAlertDialogHandle}
            onClose={onCloseAlertDialogHandle}
        />
        </>
    )
}

export default Header