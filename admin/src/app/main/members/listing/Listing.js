import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import { Checkbox, Table, TableBody, TableCell, TablePagination, TableRow, Typography, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip, FormControlLabel, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
import ListHead from './ListHead';
import moment from 'moment';
import axios from "axios"
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link, useNavigate } from 'react-router-dom';
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectUser, setUser } from 'app/store/userSlice';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';


const initialColumns = ['username', 'id', 'status', 'admin_status', 'IpLogs.ip', 'email', 'created_at'];

function Listing(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const module = "members";
    const customAddURL = `/app/${module}/create`;

    const [modules, setModules] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [fields, setFields] = useState({});
    const [totalRecords, setTotalRecords] = useState(0);

    const [loading, setLoading] = useState(true);
    const [applyLoading, setApplyLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [data, setData] = useState(modules);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [order, setOrder] = useState({
        direction: 'desc',
        id: 'id',
    });
    const [moduleDeleted, setModuleDeleted] = useState(false);
    const [firstCall, setFirstCall] = useState(true);
    const [memberStatus, setMemberStatus] = useState([]);
    const [where, setWhere] = useState({});
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [filterActive, setFilterActive] = useState(false);
    const [filters, setFilters] = useState([{ column: 'username', match: 'substring', search: '' }]);
    // const [filters, setFilters] = useState([{ column: 'address_1', match: 'substring', search: '' }]);
    const [applyBtnSts, setApplyBtnSts] = useState(true);
    const [addBtnSts, setAddBtnSts] = useState(true);
    const [listConfigDialog, setListConfigDialog] = useState(false);
    const [displayColumnArray, setDisplayColumnArray] = useState(initialColumns);
    const [columnArray, setColumnArray] = useState(initialColumns);
    const [loadingStatus, setLoadingStatus] = useState(false);

    const display_column_object = {
        "id": "ID",
        "username": "Username",
        "first_name": "First name",
        "last_name": "Last Name",
        "created_at": "Join date",
        "last_active_on": "Last active date",
        "MemberReferral.referral_email": "Referral",
        "email": "Registration email ",
        "MemberPaymentInformations.value": "Payment emails",
        "IpLogs.ip": "Current IP",
        "IpLogs.geo_location": "Geo location",
        "IpLogs.isp": "Geo ISP",
        "IpLogs.browser": "Browser",
        "IpLogs.browser_language": "Browser Language",
        "status": "Status",
        "MembershipTier.name": "Membership level",
        "address": "Address",
        "phone_no": "Telephone",
        "MemberEmailAlerts.slug": "Email marketing opt in",
        "MemberTransactions.balance": "Current Balance",
        "MemberTransactions.amount": "Total Earnings",
        "WithdrawalRequests.amount": "Withdrawal - total paid",
        "WithdrawalRequests.created_at": "Withdrawal - last cash out (date)",
        "admin_status": "Verified/unverified",
        "country_id":"Country",
    }
    const column_object = {
        'address_1': 'Billing Street Address',
        '$IpLogs.browser$': 'Browser',
        'email': 'Email',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        '$IpLogs.isp$': 'ISP',
        '$IpLogs.geo_location$': 'Geo Location',
        'id': 'ID',
        '$IpLogs.ip$': 'IP Address',
        '$IpLogs.ip$': 'IP Log',
        '$MemberPaymentInformations.value$': 'Payment Email',
        '$MemberReferral.referral_email$': 'Referrer',
        'phone_no': 'Phone',
        'username': 'Username',
    }
    const match_object = {
        'substring': 'LIKE',
        'eq': 'EXACT',
        'ne': 'NOT EXACT',
        'startsWith': 'STARTS WITH',
        'endsWith': 'ENDS WITH',
        'gt': '>',
        'gte': '>=',
        'lt': '<',
        'lte': '<=',
    }
    const resetModulesListConfig = () => {
        setSearchText('');
        setOrder({
            direction: 'desc',
            id: 'id',
        });
        setPage(0);
        setRowsPerPage(100);
        setFirstCall(true);
    }

    const fetchModules = () => {
        setLoadingStatus(true);
        setColumnArray(displayColumnArray)
        var ordered_fields = displayColumnArray.sort((a, b) =>
            Object.keys(display_column_object).indexOf(a) - Object.keys(display_column_object).indexOf(b)
        )
        let params = {
            search: searchText,
            page: page + 1,
            show: rowsPerPage,
            module: module,
            where,
            fields: ordered_fields
        }
        /* order is added if it's not the very first call os API listing */
        if (!firstCall) {
            params.sort = order.id
            params.sort_order = order.direction
        }
        params.sort = ('sort' in params && params.sort !== 'id') ? params.sort : 'Member.id'

        axios.get(`/${module}`, { params }).then(res => {
            setListConfigDialog(false);
            setFields(res.data.results.fields);
            setModules(res.data.results.result.data);
            setTotalRecords(res.data.results.result.total)
            setLoading(false);
            setApplyLoading(false);
            setExportLoading(false);
            setFirstCall(false);
            setLoadingStatus(false);
        }).catch(error => {
            setListConfigDialog(false);
            let message = 'Something went wrong!'
            if (error && error.response.data && error.response.data.errors) {
                message = error.response.data.errors
            }
            dispatch(showMessage({ variant: 'error', message }));
        })
    }

    const handleConfigurColumn = (e) => {
        e.target.checked ? setDisplayColumnArray(prev => [...prev, e.target.value]) : setDisplayColumnArray(prev => prev.filter(item => item !== e.target.value))
    }

    const exportAll = () => {
        setExportLoading(true);
        if (columnArray.sort() !== displayColumnArray.sort()) {
            setDisplayColumnArray(columnArray)
        }
        var ordered_fields = displayColumnArray.sort((a, b) =>
            Object.keys(display_column_object).indexOf(a) - Object.keys(display_column_object).indexOf(b)
        )
        let params = {
            search: searchText,
            page: page + 1,
            show: rowsPerPage,
            module: module,
            where,
            ids: [],
            fields: ordered_fields
        }
        axios.get(`/${module}/export`, { params }).then(res => {
            setExportLoading(false);
            if (res.data.results.status) {
                dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                setListConfigDialog(false)
            }
        }).catch(error => {
            setExportLoading(false);
            let message = 'Something went wrong!'
            if (error && error.response.data && error.response.data.errors) {
                message = error.response.data.errors
            }
            dispatch(showMessage({ variant: 'error', message }));
        })
    }

    useEffect(() => {
        fetchModules();
    }, [searchText, page, rowsPerPage, order.id, order.direction, where]);

    useEffect(() => {
        resetModulesListConfig();
        setFirstCall(true);
    }, [module]);

    useEffect(() => {
        setData(modules);
    }, [modules])

    useEffect(() => {
        if (moduleDeleted) {
            fetchModules();
        }
    }, [moduleDeleted]);

    useEffect(() => {
        const filterResult = filters.some(el => el.column === '' || el.match === '');
        if (!filterResult)
            setAddBtnSts(false);
        else
            setAddBtnSts(true);

        if (memberStatus.length || !filterResult)
            setApplyBtnSts(false);
        else
            setApplyBtnSts(true);
    }, [filters, memberStatus]);

    function handleRequestSort(event, property) {
        const id = property;
        let direction = 'desc';

        if (order.id === property && order.direction === 'desc') {
            direction = 'asc';
        }

        setOrder({
            direction,
            id,
        });
    }

    function handleSelectAllClick(event) {
        if (event.target.checked) {
            setSelected(data.map((n) => {
                return n.id
            }));
            return;
        }
        setSelected([]);
        setModuleDeleted(false);
    }

    async function handleDeselect(selectedIds) {
        try {
            await axios.delete(`${module}/delete`, { data: { model_ids: selectedIds } }).then(res => {
                if (res.data.results.status) {
                    setLoading(true)
                    setSelected([]);
                    setModuleDeleted(true);
                    dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    async function exportSelected(selectedIds) {
        try {
            await axios.get(`${module}/export`, {
                params: {
                    ids: selectedIds,
                    all: 0
                }
            }).then(res => {
                if (res.data.results.message) {
                    setSelected([]);
                    dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                }
            })
        } catch (error) {
            console.log(error);
        }
    }
    async function handleMultirowStatus(selectedIds, memberStatus, statusNote) {
        try {
            await axios.post(`${module}/update`, {
                value: memberStatus,
                field_name: "status",
                member_id: selectedIds,
                type: "member_status",
                member_notes: statusNote.trim()
            }).then(res => {
                if (res.data.results.message) {
                    setSelected([]);
                    fetchModules();
                    dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                }
            })
        } catch (error) {
            console.log(error);
        }
    }
    function handleClick(item) {
        handelNavigate(item);
    }

    function handelNavigate(item) {
        navigate(`/app/${module}/${item.id}`);
    }

    function handleCheck(event, id) {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
        setModuleDeleted(false);
    }

    function handleChangePage(event, value) {
        setLoading(true)
        setPage(value);
        setFirstCall(true);
    }

    function handleChangeRowsPerPage(event) {
        setPage(0);
        setRowsPerPage(event.target.value);
        setFirstCall(true);
    }

    const processFieldValue = (value, fieldConfig) => {
        if (value && (fieldConfig.field_name === 'created_at' || fieldConfig.field_name === 'updated_at')) {
            value = moment(value).format('DD-MMM-YYYY')
        }
        return value;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <FuseLoading />
            </div>
        );
    }

    const colSpan = (fields) => {
        return Object.values(fields).filter(field => field.listing === true).length + 1;
    }

    const customizedRowValue = (n, field) => {
        const status = processFieldValue(n[field.field_name], field);
        if (field.field_name === 'status') {
            if (status === 'member')
                return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="success" />
            else if (status === 'suspended')
                return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="primary" />
            else if (status === 'validating')
                return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="warning" />
            else if (status === 'deleted')
                return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="error" />
        } else if (field.field_name === 'admin_status') {
            if (status === 'verified')
                return <Chip component="span" label={processFieldValue(n[field.field_name], field)} className="capitalize" color="success" size="small" />
            else if (status === 'pending')
                return <Chip component="span" label={processFieldValue(n[field.field_name], field)} className="capitalize" color="warning" size="small" />
            else if (status === 'not_verified')
                return <Chip component="span" label={processFieldValue(n[field.field_name], field).split('_').join(' ')} className="capitalize" color="error" size="small" />
        } else {
            return status
        }
    }

    const handleChangeStatus = (e) => {
        setMemberStatus(e.target.value);
        // if (e.target.value) {
        //     setWhere({ status: e.target.value });
        // } else {
        //     setWhere({});
        // }
    }
    const removeFilterRow = (key) => {
        filters.splice(key, 1);
        setFilters([...filters]);
    }
    const addFilterRow = () => {
        // All the values will be blank while adding new row.
        setFilters(filters.concat({ column: '', match: '', search: '' }))
    }
    const cancelFilter = () => {
        setOpenAlertDialog(false);
        setFilterActive(false);
        setFilters([{ column: 'username', match: 'substring', search: '' }]);
        setMemberStatus([]);
        setWhere({});
        setPage(0);
    }
    const handleChangeFilter = (event, key, field) => {
        filters[key][field] = event.target.value.trim();
        setFilters([...filters]);
    }
    const handleApplyFilters = () => {
        const where = { status: memberStatus };
        const filterResult = filters.some(el => el.column === '' || el.match === '');
        if (!filterResult) {
            where.filters = filters
        }
        setWhere(where);
        setFilterActive(true);
        setOpenAlertDialog(false);
        setPage(0);
    }
    const modifyList = () => {
        setApplyLoading(true)
        fetchModules();
    }

    const handleCloseFieldsPopup = () => {
        setListConfigDialog(false);
        if (columnArray.sort() !== displayColumnArray.sort()) {
            setDisplayColumnArray(columnArray)
        }
    }

    return (
        <div>
            {/* // header */}
            <div className="flex flex-col sm:flex-row flex-1 w-full space-y-8 sm:space-y-0 items-center justify-between pb-32 px-24 md:px-32">
                <Typography
                    component={motion.span}
                    initial={{ x: -20 }}
                    animate={{ x: 0, transition: { delay: 0.2 } }}
                    delay={300}
                    className="flex font-extrabold tracking-tight capitalize"
                    variant="h5"
                >
                    Members
                </Typography>

                <div className="flex items-center justify-end space-x-8 xl:w-2/3 sm:w-auto">
                    <Tooltip title="Configure" placement="top">
                        <Button
                            className="p-0 m-0"
                            variant="contained"
                            color="secondary"
                            onClick={(e) => { e.preventDefault(); setListConfigDialog(true) }}
                        >
                            <FuseSvgIcon>heroicons-outline:cog</FuseSvgIcon>
                        </Button>
                    </Tooltip>
                    <Button variant="outlined" startIcon={<SearchIcon />} onClick={() => setOpenAlertDialog(true)}>
                        Search
                    </Button>
                    <Dialog
                        open={listConfigDialog}
                        onClose={handleCloseFieldsPopup}
                        disableEscapeKeyDown
                        aria-labelledby="scroll-dialog-title"
                        aria-describedby="scroll-dialog-description"
                        fullWidth
                        maxWidth="md"
                    >
                        <DialogTitle id="scroll-dialog-title">Select Fields</DialogTitle>
                        <DialogContent>
                            <div className="flex flex-wrap w-full justify-between my-10">
                                {Object.keys(display_column_object).map((val, index) => {
                                    return (
                                        <FormControlLabel className="w-3/12" key={index} control={<Checkbox checked={displayColumnArray.includes(val)} value={val} onClick={(e) => { handleConfigurColumn(e); }} />} label={display_column_object[val]} />
                                    )
                                })
                                }
                            </div>
                        </DialogContent>
                        <DialogActions className="mx-16 mb-16">
                            <LoadingButton loading={applyLoading} variant="contained" color="secondary" onClick={(e) => { e.preventDefault(); modifyList() }}>Modify List</LoadingButton>
                            <LoadingButton loading={exportLoading} variant="contained" color="primary" disabled={applyBtnSts} onClick={(e) => { e.preventDefault(); exportAll() }}>Export to CSV</LoadingButton>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={openAlertDialog}
                        onClose={() => { setOpenAlertDialog(false) }}
                        disableEscapeKeyDown
                        aria-labelledby="scroll-dialog-title"
                        aria-describedby="scroll-dialog-description"
                        fullWidth
                        maxWidth="md"
                    >
                        <DialogTitle id="scroll-dialog-title">Filter</DialogTitle>
                        <DialogContent>
                            {Object.values(filters).map((val, key) => {
                                return (
                                    <div key={key} className="flex w-full justify-between my-10">
                                        <FormControl className="w-4/12" size="large">
                                            <InputLabel id="demo-simple-select-label">Column</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={val.column}
                                                label="Column"
                                                onChange={(event) => handleChangeFilter(event, key, 'column')}
                                            >
                                                {
                                                    Object.keys(column_object).map(key => (
                                                        <MenuItem disabled={filters.some(el => el.column === key)} key={key} value={key}>{column_object[key]}</MenuItem>
                                                    )
                                                    )
                                                }
                                            </Select>
                                        </FormControl>
                                        <FormControl className="w-3/12 px-5" size="large">
                                            <InputLabel id="demo-simple-select-label">Match</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={val.match}
                                                label="Match"
                                                onChange={(event) => handleChangeFilter(event, key, 'match')}
                                            >
                                                {
                                                    Object.keys(match_object).map(key => <MenuItem key={key} value={key}>{match_object[key]}</MenuItem>)
                                                }
                                            </Select>
                                        </FormControl>
                                        <FormControl className="w-4/12" size="large">
                                            <TextField
                                                type="text"
                                                label="Search"
                                                value={val.search}
                                                variant="outlined"
                                                onChange={(event) => handleChangeFilter(event, key, 'search')}
                                            />
                                        </FormControl>
                                        <div className="w-1/12 pl-5">
                                            {filters.length > 1 && key !== 0
                                                ?
                                                <Tooltip title="Clear conditions" placement="right">
                                                    <ClearIcon sx={{ float: 'right' }} className="cursor-pointer" variant="contained" color="error" onClick={() => removeFilterRow(key)} />
                                                </Tooltip>
                                                : ''
                                            }
                                        </div>
                                    </div>
                                )
                            })
                            }
                            {
                                !addBtnSts ? (
                                    <Tooltip title="Add conditions" placement="right">
                                        <Button className="pr-5" variant="outlined" sx={{ float: 'right' }} color="secondary" startIcon={<AddIcon />} onClick={addFilterRow}>
                                        </Button>
                                    </Tooltip>
                                ) : (
                                    <Button disabled={addBtnSts} className="pr-5" variant="outlined" sx={{ float: 'right' }} color="secondary" startIcon={<AddIcon />}></Button>
                                )
                            }

                            <FormControl className="w-full mt-16" size="large">
                                <InputLabel id="demo-simple-select-label">Status</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={memberStatus}
                                    label="Status"
                                    onChange={handleChangeStatus}
                                    multiple
                                >
                                    <MenuItem value="member">Member</MenuItem>
                                    <MenuItem value="suspended">Suspended</MenuItem>
                                    <MenuItem value="validating">Validating</MenuItem>
                                    <MenuItem value="deleted">Deleted</MenuItem>
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions className="mx-16 mb-16">
                            <Button variant="outlined" color="error" onClick={cancelFilter}>Cancel</Button>
                            <Button variant="contained" color="primary" disabled={applyBtnSts} onClick={handleApplyFilters}>Apply Filters</Button>
                        </DialogActions>
                    </Dialog>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                    >
                        <Button
                            className=""
                            component={Link}
                            to={customAddURL}
                            variant="contained"
                            color="secondary"
                            startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
                        >
                            Add
                        </Button>
                    </motion.div>
                </div>
            </div>
            {!filterActive ? '' :
                <div className="flex">
                    <Stack direction="row" sx={{ overflowX: 'auto', maxWidth: '82%' }} spacing={1} className="flex w-10/12 my-16 justify-center">
                        {filters.filter(el => el.column !== '' && el.match !== '').map((val, key) => {
                            return <Chip key={key} label={column_object[val.column] + ' ' + match_object[val.match] + ' ' + (val.search ? val.search : "''")} size="small" color="primary" />
                        })
                        }
                        {memberStatus.length > 0 && <Chip className="capitalize" label={'Status IN ' + memberStatus.join(', ')} size="small" color="primary" />}
                    </Stack>
                    <div className="w-2/12">
                        <Tooltip title="Clear filters" placement="top">
                            <Button sx={{ float: 'right' }} className="mt-12 mr-20" variant="outlined" size="small" color="error" onClick={cancelFilter}>
                                X
                            </Button>
                        </Tooltip>
                    </div>
                </div>}
            {/* // body */}
            <div className="w-full flex flex-col min-h-full">
                {loadingStatus && <LinearProgress />}
                <FuseScrollbars className="grow overflow-x-auto">
                    <Table stickyHeader className="min-w-xl" aria-labelledby="tableTitle">
                        <ListHead
                            selectedOrderIds={selected}
                            order={order}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={data.length}
                            onMenuItemClick={handleDeselect}
                            onChangeMultirowStatus={handleMultirowStatus}
                            exportSelected={exportSelected}
                            {...props}
                            fields={fields}
                        />
                        {data.length === 0 ? <TableBody>
                            <TableRow>
                                <TableCell colSpan={colSpan(fields)}>
                                    <Typography color="text.secondary" variant="h5" className="text-center">
                                        There are no {module}!
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableBody> :
                            <TableBody>
                                {
                                    data.map((n) => {
                                        const isSelected = selected.indexOf(n.id) !== -1;
                                        return (
                                            <TableRow
                                                className="h-72 cursor-pointer"
                                                hover
                                                role="checkbox"
                                                aria-checked={isSelected}
                                                tabIndex={-1}
                                                key={n.id}
                                                selected={isSelected}
                                                onClick={(event) => handleClick(n)}
                                            >
                                                <TableCell className="w-40 md:w-64 text-center" padding="none">
                                                    {
                                                        n.is_deleted ? (
                                                            <Tooltip title="Member Deleted" placement="left">
                                                                <IconButton color="primary" aria-label="Filter" component="span" >
                                                                    <FuseSvgIcon className="text-48 text-red-600" size={24} color="action">material-outline:error</FuseSvgIcon>
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : (
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onClick={(event) => event.stopPropagation()}
                                                                onChange={(event) => handleCheck(event, n.id)}
                                                            />
                                                        )
                                                    }
                                                </TableCell>
                                                {Object.values(fields)
                                                    .filter(field => field.listing === true)
                                                    .map((field, i) => {
                                                        return <TableCell key={i} className="p-4 md:p-16" component="th" scope="row">{customizedRowValue(n, field)}</TableCell>
                                                    })
                                                }
                                            </TableRow>
                                        );
                                    })
                                }
                            </TableBody>}
                    </Table>
                </FuseScrollbars>
                {totalRecords > 0 && <TablePagination
                    className="shrink-0 border-t-1"
                    component="div"
                    count={totalRecords}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                />}
            </div>
        </div>
    );
}

export default withRouter(Listing);
