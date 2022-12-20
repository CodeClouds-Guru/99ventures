import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import { Checkbox, Table, TableBody, TableCell, TablePagination, TableRow, Typography, Paper, Input, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
import ListHead from './ListHead';
import moment from 'moment';
import axios from "axios"
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectUser, setUser } from 'app/store/userSlice';

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
    const [selected, setSelected] = useState([]);
    const [data, setData] = useState(modules);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState({
        direction: 'desc',
        id: 'id',
    });
    const [moduleDeleted, setModuleDeleted] = useState(false);
    const [firstCall, setFirstCall] = useState(true);
    const [memberStatus, setMemberStatus] = useState('');
    const [where, setWhere] = useState({});

    const resetModulesListConfig = () => {
        setSearchText('');
        setOrder({
            direction: 'desc',
            id: 'id',
        });
        setPage(0);
        setRowsPerPage(10);
        setFirstCall(true);
    }

    const fetchModules = () => {
        let params = {
            search: searchText,
            page: page + 1,
            show: rowsPerPage,
            module: module,
            where
        }
        /* order is added if it's not the very first call os API listing */
        if (!firstCall) {
            params.sort = order.id
            params.sort_order = order.direction
        }

        axios.get(`/${module}`, { params }).then(res => {
            setFields(res.data.results.fields);
            setModules(res.data.results.result.data);
            setTotalRecords(res.data.results.result.total)
            setLoading(false);
            setFirstCall(false);
        }).catch(error => {
            let message = 'Something went wrong!'
            if (error && error.response.data && error.response.data.errors) {
                message = error.response.data.errors
            }
            dispatch(showMessage({ variant: 'error', message }));
            navigate('/dashboard');
        })
    }

    useEffect(() => {
        fetchModules();
    }, [searchText, page, rowsPerPage, order, where]);

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
            await axios.delete(`${module}/delete`, { data: { modelIds: selectedIds } });
            setSelected([]);
            setModuleDeleted(true);
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
        if (field.field_name === 'status') {
            const status = processFieldValue(n[field.field_name], field);
            if (status === 'member')
                return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="success" />
            else if (status === 'suspended')
                return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="primary" />
            else if (status === 'validating')
                return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="warning" />
            else if (status === 'deleted')
                return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="error" />
        } else {
            return processFieldValue(n[field.field_name], field)
        }
    }

    const handleChangeStatus = (e) => {
        setMemberStatus(e.target.value);
        if (e.target.value) {
            setWhere({ status: e.target.value });
        } else {
            setWhere({});
        }
    }

    return (
        <div>
            {/* // header */}
            <div className="flex flex-col sm:flex-row flex-1 w-full space-y-8 sm:space-y-0 items-center justify-between py-32 px-24 md:px-32">
                <Typography
                    component={motion.span}
                    initial={{ x: -20 }}
                    animate={{ x: 0, transition: { delay: 0.2 } }}
                    delay={300}
                    className="flex text-24 md:text-32 font-extrabold tracking-tight capitalize"
                >
                    Members
                </Typography>

                <div className="flex items-center justify-end space-x-8 xl:w-2/3 sm:w-auto">
                    <FormControl sx={{ minWidth: 120 }} size="small">
                        <InputLabel id="demo-simple-select-label">Status</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={memberStatus}
                            label="Status"
                            onChange={handleChangeStatus}
                        >
                            <MenuItem value="">
                                <em>--Select--</em>
                            </MenuItem>
                            <MenuItem value="member">Member</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                            <MenuItem value="validating">Validating</MenuItem>
                            <MenuItem value="deleted">Deleted</MenuItem>
                        </Select>
                    </FormControl>
                    <Paper
                        component={motion.div}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
                        className="flex items-center w-full sm:max-w-256 space-x-8 px-16 border-1 rounded shadow-0"
                    >
                        <FuseSvgIcon color="disabled">heroicons-solid:search</FuseSvgIcon>

                        <Input
                            placeholder="Search members"
                            className="flex flex-1"
                            disableUnderline
                            fullWidth
                            value={searchText}
                            inputProps={{
                                'aria-label': 'Search members',
                            }}
                            onChange={(ev) => { setFirstCall(true); setSearchText(ev.target.value) }}
                        />
                    </Paper>
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
            {/* <Stack direction="row" spacing={1} className="my-16 justify-center">
                <Chip label="Member" color="success" size="small" />
                <Chip label="Suspended" size="small" color="primary" />
                <Chip label="Validating" size="small" color="warning" />
                <Chip label="Deleted" size="small" color="error" />
            </Stack> */}

            {/* // body */}
            <div className="w-full flex flex-col min-h-full">
                <FuseScrollbars className="grow overflow-x-auto">
                    <Table stickyHeader className="min-w-xl" aria-labelledby="tableTitle">
                        <ListHead
                            selectedOrderIds={selected}
                            order={order}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={data.length}
                            onMenuItemClick={handleDeselect}
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
                                {data
                                    .map((n) => {
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
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onClick={(event) => event.stopPropagation()}
                                                        onChange={(event) => handleCheck(event, n.id)}
                                                    />
                                                </TableCell>
                                                {Object.values(fields)
                                                    .filter(field => field.listing === true)
                                                    .map((field, i) => {
                                                        return <TableCell key={i} className="p-4 md:p-16" component="th" scope="row">{customizedRowValue(n, field)}</TableCell>
                                                    })
                                                }
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>}
                    </Table>

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
                        rowsPerPageOptions={[2, 5, 10, 20]}
                    />}
                </FuseScrollbars>
            </div>
        </div>
    );
}

export default withRouter(Listing);
