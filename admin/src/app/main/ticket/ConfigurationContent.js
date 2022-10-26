import List from "../crud/list/List";
import { useState, useEffect } from 'react';
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, Tooltip, Typography } from '@mui/material';
import { DateRangePicker, DateRange } from "mui-daterange-picker";
import ClearAllIcon from '@mui/icons-material/ClearAll';
import moment from 'moment';
import { position } from "stylis";
import { selectUser } from 'app/store/userSlice';
import { useDispatch, useSelector } from 'react-redux';

function ConfigurationContent() {
    const user = useSelector(selectUser);
    const unreadTicketCount = user.unread_tickets;
    const [selectedStatus, setSelectedStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(7, 'd').startOf('day'),
        endDate: moment(),
    });
    const [whereClause, setWhereClause] = useState({});
    const [listKey, setListKey] = useState(0);

    const toggle = () => setOpen(!open);

    const clearFilter = () => {
        setSelectedStatus('')
        setDateRange({
            startDate: moment().subtract(7, 'd').startOf('day'),
            endDate: moment(),
        });
    }

    const handleChange = (e) => {
        setSelectedStatus(e.target.value);
    }

    const dateRangeSelected = (val) => {
        toggle();
        setDateRange({
            startDate: moment(val.startDate),
            endDate: moment(val.endDate)
        });
    }

    const constructWhereclause = () => {
        const param = {
            created_at: [dateRange.startDate.startOf('day'), dateRange.endDate]
        }
        if (selectedStatus !== '') {
            param['status'] = selectedStatus
        }
        setWhereClause(param);
    }

    useEffect(() => {
        constructWhereclause();
        setListKey((c) => c + 1);
    }, [selectedStatus, dateRange])

    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    {unreadTicketCount > 0 ?
                        <Grid item xs={3}>
                            <Typography component={'span'}
                                initial={{ x: -20 }}
                                animate={{ x: 0, transition: { delay: 0.2 } }}
                                delay={300}
                                className="flex text-24 md:text-32 font-extrabold tracking-tight capitalize">
                                Tickets ({unreadTicketCount})
                            </Typography>
                        </Grid> : ''}
                    <Grid item xs={2}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Ticket Status</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Ticket Status"
                                value={selectedStatus}
                                onChange={handleChange}
                            >
                                <MenuItem value={''}>All</MenuItem>
                                <MenuItem value="open">Open</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={unreadTicketCount > 0 ? 5 : 8}>
                        {
                            open
                                ?
                                <DateRangePicker
                                    open={open}
                                    toggle={toggle}
                                    onChange={dateRangeSelected}
                                    className="daterangepicker-filter"
                                />
                                :
                                <div onClick={toggle}>
                                    <TextField
                                        label="Select a date range"
                                        variant="outlined"
                                        disabled
                                        defaultValue={dateRange ? `${moment(dateRange.startDate).format('YYYY/MM/DD')} - ${moment(dateRange.endDate).format('YYYY/MM/DD')}` : ''}
                                    />
                                </div>
                        }
                    </Grid>
                    <Grid item xs={2}>
                        <Tooltip title="Clear Filter(s)" placement="left">
                            <IconButton
                                color="primary"
                                aria-label="Clear Filter"
                                component="label"
                                onClick={clearFilter}
                            >
                                <ClearAllIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Box>
            {/* {JSON.stringify(whereClause)} */}
            <List
                module="tickets"
                moduleHeading='N/A'
                where={whereClause}
                key={listKey}
            />
        </div>
    );
}
export default ConfigurationContent;