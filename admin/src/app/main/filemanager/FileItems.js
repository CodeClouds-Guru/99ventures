import { useEffect, useState, useRef, memo } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Checkbox, Box, Typography, IconButton, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import ItemIcon from "./ItemIcon";
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, setSelectedItem } from 'app/store/filemanager'
import './FileManager.css'

const FileItems = (props) => {
    const [ itemList, setItemList ] = useState(false);
    const dispatch = useDispatch();
    const selectedItem = useSelector(state=>state.filemanager.selectedItem)
    const listRef = useRef();
    const listBtnRef = useRef();

    useEffect(()=>{
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); 

    /**
     * Disabled dropdown by clicking outside
     */
     const handleClickOutside = (e) => {
        if(
            listRef.current.contains(e.target) ||
            listBtnRef.current.contains(e.target)
        ) {
            return;
        }
        setItemList(false);
    }

    return (
        <Box
            sx={{ backgroundColor: 'rgb(255, 255, 255)' }}
            className={`flex flex-col relative w-full sm:w-160 h-160 m-8 p-16 shadow rounded-16 cursor-pointer `}
            >
            <IconButton
                className="absolute z-20 top-0 right-0 m-6 w-32 h-32 min-h-32"
            >
                <Checkbox { ...{ inputProps: { 'aria-label': 'Checkbox demo' } } } />
            </IconButton>
                
            {/* <div className="flex flex-auto w-full items-center justify-center" onClick={()=> dispatch(toggleSidebar(true)) }> */}
            <div className="flex flex-auto w-full items-center justify-center" onClick={()=> dispatch(setSelectedItem(props.file)) }>
                <ItemIcon className="" type={props.file.mime_type} />
            </div>
            
            <div className="flex shrink flex-col justify-center text-center" >
                <Typography className="truncate text-12 font-medium">Demo</Typography>
                <div>
                    <IconButton ref={ listBtnRef } color="primary" aria-label="Filter" component="label" className="item-list-icon" onClick={()=> setItemList(!itemList)}>
                        <FuseSvgIcon className="text-32" size={24} color="action">heroicons-outline:dots-vertical</FuseSvgIcon>  
                    </IconButton>
                    
                    <Box 
                        sx={{ width: '100%', maxWidth: 120, bgcolor: 'background.paper' }} 
                        className={ itemList ? 'listBox shadow-md' : 'hidden'}
                        ref={ listRef }
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