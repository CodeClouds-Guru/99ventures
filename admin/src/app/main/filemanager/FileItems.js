import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Checkbox, Box, Typography, IconButton, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import ItemIcon from "./ItemIcon";
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'app/store/filemanager'
import './FileManager.css'

const FileItems = (props) => {
    const [ itemList, setItemList ] = useState(false);
    const dispatch = useDispatch();
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
    const sideBar = useSelector(state=>state.filemanager.show_sidebar)

    return (
        <Box
            sx={{ backgroundColor: 'rgb(255, 255, 255)' }}
            className={`flex flex-col relative w-full sm:w-160 h-160 m-8 p-16 shadow rounded-16 cursor-pointer `}
            >
            <IconButton
                className="absolute z-20 top-0 right-0 m-6 w-32 h-32 min-h-32"
            >
                <Checkbox { ...label } />
            </IconButton>
                
            <div className="flex flex-auto w-full items-center justify-center" onClick={()=> dispatch(toggleSidebar(true)) }>
                <ItemIcon className="" type={props.type} />
            </div>
            
            <div className="flex shrink flex-col justify-center text-center" >
                <Typography className="truncate text-12 font-medium">Demo</Typography>
                <div>
                    <IconButton color="primary" aria-label="Filter" component="label" className="item-list-icon" onClick={()=> setItemList(!itemList)}>
                        <FuseSvgIcon className="text-32" size={24} color="action">heroicons-outline:dots-vertical</FuseSvgIcon>  
                    </IconButton>
                    
                    <Box 
                        sx={{ width: '100%', maxWidth: 120, bgcolor: 'background.paper' }} 
                        className={ itemList ? 'listBox shadow-md' : 'hidden'}
                        >
                        <nav aria-label="main">
                            <List>
                                <ListItem disablePadding>
                                    <ListItemButton>                        
                                        <ListItemText primary="Copy" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton>                       
                                        <ListItemText primary="Preview" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton>                       
                                        <ListItemText primary="Delete" />
                                    </ListItemButton>
                                </ListItem>
                                
                            </List>
                        </nav>
                    </Box>
                </div>
            </div>                
        </Box>
    )
}

export default FileItems;