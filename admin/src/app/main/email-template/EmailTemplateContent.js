import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import _ from '@lodash';
import { Checkbox, Table, TableBody, TableCell, TablePagination, TableRow, Typography, Paper, Input, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
// import OrdersStatus from '../order/OrdersStatus';
// import { getModules } from '../store/modulesSlice';
import ListTableHead from '../crud/list/ListTableHead';
import moment from 'moment';
// import { resetModule } from '../store/modulesSlice';
import axios from "axios"
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectUser } from 'app/store/userSlice';

function EmailTemplateContent(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const module = 'email-templates';
    const searchable = false;
    const editable = props.editable ?? true;
    const addable = props.addable ?? true;
    const deletable = props.deletable ?? true;
    const where = props.where ?? {};
    const customAddURL = props.customAddURL ?? `/app/${module}/create`;

    const [EmailTemplates, setEmailTemplates] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [fields, setFields] = useState({});
    const [totalRecords, setTotalRecords] = useState(0);

    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [data, setData] = useState(EmailTemplates);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState({
        direction: 'desc',
        id: 'id',
    });
    const [EmailTemplatesDeleted, setEmailTemplatesDeleted] = useState(false);

    const resetEmailTemplatesConfig = () => {
        setSearchText('');
        setOrder({
            direction: 'desc',
            id: 'id',
        });
        setPage(0);
        setRowsPerPage(10);
    }

    const getEmailTemplates = () => {
        let params = {
            search: searchText,
            page: page + 1,
            show: rowsPerPage,
            sort: order.id,
            sort_order: order.direction,
            module,
            where
        }

        axios.get(`/${module}/list`, { params }).then(res => {
            setFields(res.data.results.fields);
            setEmailTemplates(res.data.results.result.data);
            setTotalRecords(res.data.results.result.total)
            setLoading(false);
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
        getEmailTemplates();
    }, [searchText, page, rowsPerPage, order]);

    useEffect(() => {
        resetEmailTemplatesConfig();
    }, [module]);

    useEffect(() => {
        setData(EmailTemplates);
    }, [EmailTemplates])

    useEffect(() => {
        if (EmailTemplatesDeleted) {
            getEmailTemplates();
        }
    }, [EmailTemplatesDeleted]);



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
            setSelected(data.map((n) => n.id));
            return;
        }
        setSelected([]);
        setEmailTemplatesDeleted(false);
    }

    async function handleDeselect(selectedIds) {
        try {
            await axios.delete(`${module}/delete`, { data: { modelIds: selectedIds } });
            setSelected([]);
            setEmailTemplatesDeleted(true);
        } catch (error) {
            console.log(error);
        }
    }

    function handleClick(item) {
        editable ? handelNavigate(item) : '';
    }

    function handelNavigate(item) {
        if (module === 'users' && item.id == user.id) {
            dispatch(showMessage({ variant: 'warning', message: 'You are not allowed to edit this user' }));
            return '';
        } else {
            props.navigate(`/app/${module}/${item.id}`);
        }
    }

    function isDeletable(item) {
        if ((module === 'users' && item.id == user.id) || !deletable) {
            return false;
        } else {
            return true;
        }
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
        setEmailTemplatesDeleted(false);
    }

    function handleChangePage(event, value) {
        setPage(value);
    }

    function handleChangeRowsPerPage(event) {
        setPage(0);
        setRowsPerPage(event.target.value);
    }

    const processFieldValue = (value, fieldConfig) => {
        if (fieldConfig.field_name === 'created_at') {
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

    return (
        <div>
            {/* // header */}
            {/* <div className="flex flex-col sm:flex-row flex-1 w-full space-y-8 sm:space-y-0 items-center justify-between py-32 px-24 md:px-32">
                <Typography
                    component={motion.span}
                    initial={{ x: -20 }}
                    animate={{ x: 0, transition: { delay: 0.2 } }}
                    delay={300}
                    className="flex text-24 md:text-32 font-extrabold tracking-tight capitalize"
                >
                    {module}
                </Typography>

                <div className="flex flex-1 items-center justify-end space-x-8 w-full sm:w-auto">
                    {searchable && <Paper
                        component={motion.div}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
                        className="flex items-center w-full sm:max-w-256 space-x-8 px-16 rounded-full border-1 shadow-0"
                    >
                        <FuseSvgIcon color="disabled">heroicons-solid:search</FuseSvgIcon>

                        <Input
                            placeholder={`Search ${module}`}
                            className="flex flex-1"
                            disableUnderline
                            fullWidth
                            value={searchText}
                            inputProps={{
                                'aria-label': `Search ${module}`,
                            }}
                            onChange={(ev) => setSearchText(ev.target.value)}
                        />
                    </Paper>}
                    {addable && <motion.div
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
                    </motion.div>}
                </div>
            </div> */}

            {/* // body */}
            <div className="w-full flex flex-col min-h-full">
                <FuseScrollbars className="grow overflow-x-auto">

                    <Table stickyHeader className="min-w-xl" aria-labelledby="tableTitle">
                        <ListTableHead
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
                                                    {isDeletable(n) && <Checkbox
                                                        checked={isSelected}
                                                        onClick={(event) => event.stopPropagation()}
                                                        onChange={(event) => handleCheck(event, n.id)}
                                                    />}
                                                </TableCell>
                                                {Object.values(fields)
                                                    .filter(field => field.listing === true)
                                                    .map((field, i) => {
                                                        return <Fragment key={i}>
                                                            <TableCell className="p-4 md:p-16" component="th" scope="row">
                                                                {processFieldValue(n[field.field_name], field)}
                                                            </TableCell>
                                                        </Fragment>
                                                    })}
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

export default EmailTemplateContent;
