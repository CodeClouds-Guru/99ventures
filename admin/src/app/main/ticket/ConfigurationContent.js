import List from "../crud/list/List";
import { useState, useEffect } from 'react';
import {Grid, Box, FormControl, InputLabel, Select, MenuItem, TextField, IconButton } from '@mui/material';
import { DateRangePicker, DateRange } from "mui-daterange-picker";
import ClearAllIcon from '@mui/icons-material/ClearAll';
import moment from 'moment';
function ConfigurationContent() {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [open, setOpen] = useState(true);
    const [dateRange, setDateRange] = useState(null);
    const [whereClause, setWhereClause] = useState({})

    const toggle = () => setOpen(!open);

    const clearFilter = () => {
        setSelectedStatus('')
        setDateRange(null);
    }

    const handleChange = (e) => {
        setSelectedStatus(e.target.value);
        setWhereClause({...whereClause, status: e.target.value});
    }

    const dateRangeSelected = (val) => {
        toggle();
        setDateRange(val);
    }

    const constructWhereclause = () => {
        if(selectedStatus !== '') {

        }
    }
    
    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Ticket Status</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Age"
                                value={selectedStatus}
                                onChange={handleChange}
                            >
                            <MenuItem value={''}>All</MenuItem>
                            <MenuItem value={'closed'}>Closed</MenuItem>
                            <MenuItem value={'open'}>Open</MenuItem>
                            <MenuItem value={'pending'}>Pending</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        {
                            open 
                            ? 
                            <DateRangePicker
                                open={open}
                                toggle={toggle}
                                onChange={dateRangeSelected}
                            /> 
                            : 
                            <div onClick={toggle}>
                                <TextField 
                                    label="Select a date range" 
                                    variant="outlined"
                                    disabled
                                    defaultValue={dateRange ? `${moment(dateRange.startDate).format('YYYY/MM/DD')} - ${moment(dateRange.endDate).format('YYYY/MM/DD')}` : '' }
                                />
                            </div>
                        }
                    </Grid>
                    <Grid item xs={2}>
                    <IconButton
                        color="primary"
                        aria-label="Clear Filter"
                        component="label"
                        click={clearFilter}
                    >
                        <ClearAllIcon />
                    </IconButton>
                    </Grid>
                </Grid>
            </Box>
            <List
                module="tickets"
                where={whereClause}
                moduleHeading='N/A'
            />
        </div>
    );
}
export default ConfigurationContent;