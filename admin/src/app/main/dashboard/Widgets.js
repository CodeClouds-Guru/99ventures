import { Typography, IconButton, Tooltip, ListItemText, Menu, MenuItem, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Switch from '@mui/material/Switch';
import { useState, useEffect } from 'react';

const widgetsArry = [
    {
        slug: 'login_analytics',
        title: 'Login Analytics',
        checked: true
    },
    {
        slug: 'completed_surveys',
        title: 'Completed Surveys',
        checked: false
    },
    {
        slug: 'top_performing_surveys',
        title: 'Top Performing Surveys',
        checked: false
    },
    {
        slug: 'members_chart',
        title: 'Member\'s Chart',
        checked: false
    },
    {
        slug: 'tickets_chart',
        title: 'Ticket\'s Chart',
        checked: false
    },
    {
        slug: 'top_performers',
        title: 'Top Performers',
        checked: false
    }
];

const Widgets = () => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuClick = (event) => {
        setAnchorEl(event.target);
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    }
    return (
        <>
            <Tooltip placement="right" title="Widget Configurations">
                <IconButton
                    color="primary"
                    aria-label="Filter"
                    component="label"
                    onClick={handleMenuClick}
                >
                    <FuseSvgIcon className="text-48" size={26} color="action">material-outline:settings</FuseSvgIcon>
                </IconButton>
            </Tooltip>
            <Menu
                id="actions-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{
                    '& .MuiMenu-paper': {
                        width: '300px'
                    }
                }}
            >
                {
                    widgetsArry.map(row => {
                        return(
                            <MenuItem className="border ">
                                <div className='flex items-center justify-between w-full'>
                                    <ListItemText primary={
                                        <Typography className="text-base" variant="body2">{row.title}</Typography>
                                    } />
                                    <Switch aria-label='Switch demo' size="small" checked={row.checked}/>
                                </div>
                            </MenuItem>
                        )
                    })
                }  
                <MenuItem className="flex w-full justify-between mt-10">
                    <Button variant="outlined" color="primary" size="small" onClick={handleMenuClose}>
                        Close
                    </Button>
                    <Button variant="contained" color="primary" size="small">
                        Update
                    </Button>
                </MenuItem>   
            </Menu>
        </>
    )
}

export default Widgets;