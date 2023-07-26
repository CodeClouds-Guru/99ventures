import List from "../crud/list/List";
import { useState, useEffect } from 'react';
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, Tooltip, Typography } from '@mui/material';
import { DateRangePicker, DateRange } from "mui-daterange-picker";
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { position } from "stylis";
import moment from 'moment';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon'
import { selectUser } from 'app/store/userSlice';
import { useDispatch, useSelector } from 'react-redux';

function ConfigurationContent() {
    const user = useSelector(selectUser);
    const unreadTicketCount = user.unread_tickets;
    const [selectedStatus, setSelectedStatus] = useState('open');
    const [open, setOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(7, 'd').startOf('day'),
        endDate: moment(),        
    });
    const [whereClause, setWhereClause] = useState({});
    const [listKey, setListKey] = useState(0);

    const toggle = () => setOpen(!open);

    const clearFilter = () => {
        setSelectedStatus('open')
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
            created_at: [
                moment(dateRange.startDate.startOf('day')).format("YYYY-MM-DD HH:mm:ss"), 
                moment(dateRange.endDate.endOf('day')).format("YYYY-MM-DD HH:mm:ss")
            ]
        }
        
        if (selectedStatus !== '' && selectedStatus !== 'all') {
            param['status'] = selectedStatus
        }
        setWhereClause(param);
    }

    useEffect(() => {
        constructWhereclause();
        setListKey((c) => c + 1);
    }, [selectedStatus, dateRange])

    return (
        <>            
            {/* {JSON.stringify(whereClause)} */}
            <div className='w-full items-center justify-between flex py-32 px-24 md:px-32 flex-wrap ticket-list'>
                <div className="w-1/3">
                    <Typography component={'span'}
                        initial={{ x: -20 }}
                        animate={{ x: 0, transition: { delay: 0.2 } }}
                        delay={300}
                        className="flex font-extrabold tracking-tight capitalize"
                        variant="h5"
                    >
                        Tickets {unreadTicketCount ? `(${unreadTicketCount})` : ''}
                    </Typography>
                </div>
                <div className="flex items-center justify-end space-x-8 w-full w-2/3 ml-auto relativex">
                    <FormControl className="xl:w-1/5 md:w-1/3 sm:w-1/3">
                        <InputLabel id="demo-simple-select-label">Ticket Status</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Ticket Status"
                            value={selectedStatus}
                            onChange={handleChange}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="open">Open</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="closed">Closed</MenuItem>
                        </Select>
                    </FormControl>
                            
                    <div className="xl:w-1/3 lg:w-1/2 md:w-1/2 sm:w-2/3 flex items-center justify-between ">
                        <TextField
                            label="Select a date range"
                            onClick={toggle}
                            variant="outlined"
                            readOnly={true}
                            value={dateRange ? `${moment(dateRange.startDate).format('YYYY/MM/DD')} - ${moment(dateRange.endDate).format('YYYY/MM/DD')}` : ''}
                            className="mr-10 w-full"
                        />
                        
                        <Tooltip title="Clear Filter(s)" placement="left">
                            <IconButton
                                color="primary"
                                aria-label="Clear Filter"
                                component="label"
                                onClick={clearFilter}
                            >
                                <FuseSvgIcon className="text-48" size={24} color="action">material-outline:sync</FuseSvgIcon>
                            </IconButton>
                        </Tooltip>
                    </div>
                    {
                        open && (
                            <DateRangePicker
                                open={open}
                                toggle={toggle}
                                onChange={dateRangeSelected}
                                className="daterangepicker-filter"
                                initialDateRange={{
                                    startDate: dateRange.startDate.toDate(),
                                    endDate: dateRange.endDate.toDate(),
                                }}
                            />
                        )
                    }
                </div>
            </div>
            <List
                module="tickets"
                moduleHeading={false}
                where={whereClause}
                key={listKey}
                addable={false}
            />
        </>
    );
}
export default ConfigurationContent;