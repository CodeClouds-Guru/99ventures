import axios from "axios";
import Switch from '@mui/material/Switch';
import { useState, useEffect } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import LoadingButton from '@mui/lab/LoadingButton';
import { Typography, IconButton, Tooltip, ListItemText, Menu, MenuItem, Button } from '@mui/material';


const Widgets = (props) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [selectedWidgets, setSelectedWidgets] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const handleMenuClick = (event) => {
        setAnchorEl(event.target);
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    }
    
    useEffect(()=>{
        if(props.all_widgets && props.all_widgets.length){
            widgetsConfiguration();
        }
    }, [props]);

    const widgetsConfiguration = () => {
        const allWidgets = props.all_widgets.map(row => {
            return {
                id: row.id,
                name: row.name,
                checked: props.selected_widgets.includes(row.id)
            }
        });
        setWidgets(allWidgets);
    }

    const updateSwitch = (id) => {
        const allWidgets = widgets.map(row => {
            return {
                ...row,
                checked: id === row.id ? !row.checked : row.checked
            }
        });
        setWidgets(allWidgets);
    }

    const updateWidget = () => {
        const selectedWidgetIds = widgets.filter(row => row.checked === true).map(el=> el.id);

        const payload = {
            "widget_ids": selectedWidgetIds
        }
        axios.post('/update-widget-preference', payload)
        .then((res) => {
            if(res.status === 200){
                props.updateSelectedWidgets(selectedWidgetIds);
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Something went wrong!' }))
        });
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
                    <FuseSvgIcon className="text-48" size={22} color="action">material-outline:settings</FuseSvgIcon>
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
                    widgets.map(row => {
                        return(
                            <MenuItem key={row.id} className="border ">
                                <div className='flex items-center justify-between w-full'>
                                    <ListItemText primary={
                                        <Typography className="text-base" variant="body2">{row.name}</Typography>
                                    } />
                                    <Switch aria-label={row.name} size="small" onChange={()=>updateSwitch(row.id)} checked={row.checked} />
                                </div>
                            </MenuItem>
                        )
                    })
                }
                <MenuItem className="flex w-full justify-between mt-10">
                    <Button variant="outlined" color="primary" size="small" onClick={handleMenuClose}>
                        Close
                    </Button>
                    <LoadingButton loading={loading} variant="contained" color="primary" size="small" onClick={updateWidget}>
                        Update
                    </LoadingButton>
                </MenuItem>   
            </Menu>
        </>
    )
}

export default Widgets;