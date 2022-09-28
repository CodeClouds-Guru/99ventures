import { useState } from 'react';
import { motion } from 'framer-motion';
import { lighten } from '@mui/material/styles';
import { Checkbox, Box, FormGroup, FormControlLabel, IconButton, Paper, Input, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Tooltip from '@mui/material/Tooltip';

const baseStyle = {
    marginBottom: '1rem',
    borderTop: '3px solid #77777763',
    borderBottom: '3px solid #ddd',
    padding: '10px 0',
}

const Header = () => {
    const [ filter, toggleFilter ] = useState(false);
    const [ viewType, setViewType ] = useState('grid')

    return (
        <div style={ baseStyle } className="flex flex-col sm:flex-row w-full sm:w-auto items-center space-y-16 sm:space-y-0 sm:space-x-16 justify-between">                     
            <FormGroup className="flex" variant="outlined">
                <FormControlLabel control={<Checkbox defaultChecked />} label="Select All" />
            </FormGroup>
            <div className='flex justify-between'>
                <Tooltip title="Delete">
                    <FuseSvgIcon className="text-48 mr-10" size={30} color="action">heroicons-outline:trash</FuseSvgIcon>
                </Tooltip>
                <Tooltip title="Copy">
                    <FuseSvgIcon className="text-48 mr-10" size={30} color="action">material-outline:content_copy</FuseSvgIcon>
                </Tooltip>
                <Tooltip title="Download">
                    <FuseSvgIcon className="text-48 mr-10" size={30} color="action">material-outline:file_download</FuseSvgIcon>
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
                    <IconButton color="primary" aria-label="Filter" component="label" onClick={ ()=> toggleFilter(filter=> !filter)}>
                        <FuseSvgIcon className="text-48" size={30} color="action">heroicons-outline:filter</FuseSvgIcon>
                    </IconButton>
                </Tooltip>
                <Box 
                    sx={{ width: '100%', maxWidth: 170, bgcolor: 'background.paper' }} 
                    className={  filter ? 'filter-list-box shadow-md' : 'hidden' }
                    >
                    <nav aria-label="main">
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton>                        
                                    <ListItemText primary="Newest First" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>                       
                                    <ListItemText primary="Oldest First" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>                       
                                    <ListItemText primary="Asc Filename" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>                       
                                    <ListItemText primary="Desc Filename" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </nav>
                </Box>
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
    )
}

export default Header