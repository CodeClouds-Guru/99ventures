import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import _ from '@lodash';
import { Checkbox, Table, TableBody, TableCell, TablePagination, TableRow, Typography, Paper, Input, Button, Chip, Tooltip, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
// import OrdersStatus from '../order/OrdersStatus';
import { getModules } from '../store/modulesSlice';
import ListTableHead from './ListTableHead';
import moment from 'moment';
import { resetModule } from '../store/modulesSlice';
import axios from "axios"
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectUser, setUser } from 'app/store/userSlice';
import Helper from 'src/app/helper';


function List(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { module } = props;
  const searchable = props.searchable ?? true;
  const editable = props.editable ?? true;
  const addable = props.addable ?? true;
  const deletable = props.deletable ?? true;
  // const where = props.where ?? {};
  const showModuleHeading = props.moduleHeading ?? '';
  const customAddURL = props.customAddURL ?? `/app/${module}/create`;

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
  const [filterStatus, setFilterStatus] = useState('');
  const [where, setWhere] = useState(props.where);

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
      module,
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
      module === 'tickets' ? ticketsReadCount(res.data.results.result.data) : '';
    }).catch(error => {
      let message = 'Something went wrong!'
      if (error && error.response.data && error.response.data.errors) {
        message = error.response.data.errors
      }
      dispatch(showMessage({ variant: 'error', message }));
      navigate('/dashboard');
    })
  }

  const ticketsReadCount = (values) => {
    let unread = 0;
    let user_obj = {};
    Object.keys(user).forEach((val, key) => {
      user_obj[val] = user[val];
    })
    Object.values(values).forEach((val, key) => {
      val.is_read === 0 ? unread++ : '';
    });
    user_obj.unread_tickets = unread;
    // dispatch(setUser(user_obj));
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
        return module === 'pages' && (n.slug === '500' || n.slug === '404') ? null : n.id
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

  /**
   * Customized any row value
   */
  const customizedField = (module, n, field) =>{
    if(module === 'tickets' && field.field_name === 'status') {
      return <Chip className="capitalize" label={processFieldValue(n[field.field_name], field)} color={processFieldValue(n[field.field_name], field) === 'open' ? 'warning' : processFieldValue(n[field.field_name], field) === 'closed' ? 'success' : 'primary'} />
    } else if(module === 'pages' && field.field_name === 'auth_required') {
      return <Chip className="capitalize" label={processFieldValue(n[field.field_name], field) == 1 ? 'Yes' : 'No'} color={processFieldValue(n[field.field_name], field) == 1 ? 'success' : 'primary'} />
    } else if(module === 'member-transactions' && field.field_name === 'type') {
      return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color={processFieldValue(n[field.field_name], field) === "credited" ? "success" : "error" } />
    } else if(module === 'member-transactions' && field.field_name === 'completed_at') {
      return Helper.parseTimeStamp(processFieldValue(n[field.field_name], field))
    } else if(module === 'member-transactions' && field.field_name === 'note') {
      return processFieldValue(n[field.field_name], field) ? (
        <Tooltip title={ processFieldValue(n[field.field_name], field) } placement="top-start" arrow>
            <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:chat-alt</FuseSvgIcon>
        </Tooltip>
      ) : '--'
    } else if(module === 'member-transactions' && field.field_name === 'status') {
      const status = processFieldValue(n[field.field_name], field);
      if(status === 'initiated')
        return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="primary" />
      else if(status === 'processing')
        return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="secondary" />
      else if(status === 'completed')
        return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="success" />
      else if(status === 'failed')
        return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="error" />
      else if(status === 'declined')
        return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="warning" />
    } else {
      return processFieldValue(n[field.field_name], field)
    }
  }

  return (
    <div>
      {/* // header */}
      <div className="flex flex-col sm:flex-row flex-1 w-full space-y-8 sm:space-y-0 items-center justify-between py-32 px-24 md:px-32">
        {showModuleHeading === '' ? <Typography
          component={motion.span}
          initial={{ x: -20 }}
          animate={{ x: 0, transition: { delay: 0.2 } }}
          delay={300}
          className="flex text-24 md:text-32 font-extrabold tracking-tight capitalize"
        >
          {module.split('-').join(' ')}
        </Typography> : <></>}

        <div className="flex flex-1 items-center justify-end space-x-8 w-full sm:w-auto">
          {
            (module === 'member-transactions' && location.pathname.includes('history')) && (
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel id="demo-simple-select-label">Status</InputLabel>
                <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={ filterStatus }
                label="Status"
                className="rounded-full"
                sx={{ lineHeight: '17px'}}
                onChange={ 
                  (e)=> {
                    setFilterStatus(e.target.value);
                    if(e.target.value){
                      setWhere({...where, type: e.target.value});
                    } else {
                      setWhere(props.where);
                    }
                  }
                }
                >
                  <MenuItem value="">
                      <em>--Select--</em>
                  </MenuItem>
                  <MenuItem value="credited">Credited</MenuItem>
                  <MenuItem value="withdraw">Withdraw</MenuItem>
                </Select>
              </FormControl>
            )
          }            

          {searchable && <Paper
            component={motion.div}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
            className="flex items-center w-full sm:max-w-256 space-x-8 px-16 rounded-full border-1 shadow-0"
          >
            <FuseSvgIcon color="disabled">heroicons-solid:search</FuseSvgIcon>

            <Input
              placeholder={`Search ${module.split('-').join(' ')}`}
              className="flex flex-1"
              disableUnderline
              fullWidth
              value={searchText}
              inputProps={{
                'aria-label': `Search ${module}`,
              }}
              onChange={(ev) => { setFirstCall(true); setSearchText(ev.target.value) }}
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
      </div>

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
                      >{module === 'tickets' ? '' :
                        <TableCell className="w-40 md:w-64 text-center" padding="none">
                          {(module === 'pages' && (n.slug === '500' || n.slug === '404')) ? '' : isDeletable(n) && <Checkbox
                            checked={isSelected}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => handleCheck(event, n.id)}
                          />}
                        </TableCell>}
                        {Object.values(fields)
                          .filter(field => field.listing === true)
                          .map((field, i) => {
                            return <Fragment key={i}>
                              <TableCell className="p-4 md:p-16" component="th" scope="row">
                                {
                                  customizedField(module, n, field)
                                }
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

export default withRouter(List);
