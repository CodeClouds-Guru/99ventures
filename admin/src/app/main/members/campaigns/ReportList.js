import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import _ from '@lodash';
import { Checkbox, Table, TableBody, TableCell, TablePagination, TableRow, Typography, Paper, Input, Button, Chip, TextField, Tooltip, IconButton, FormControl, InputLabel, Select, Menu, MenuList, MenuItem, ListItemText, ListItemIcon } from '@mui/material';
import { motion } from 'framer-motion';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
// import OrdersStatus from '../order/OrdersStatus';
// import { getModules } from 'app/store/fuse/';
import ListTableHead from '../../crud/list/ListTableHead';
import moment from 'moment';
// import { resetModule } from 'app/store/modulesSlice';
import axios from "axios"
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectUser, setUser } from 'app/store/userSlice';
import Helper from 'src/app/helper';
import { DateRangePicker, DateRange } from "mui-daterange-picker";


function ReportList(props) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector(selectUser);
	const { module } = props;
	// const searchable = props.searchable ?? true;
	// const editable = props.editable ?? true;
	// const addable = props.addable ?? true;
	// const deletable = props.deletable ?? true;
	// const where = props.where ?? {};
	// const showModuleHeading = props.moduleHeading ?? '';
	// const customAddURL = props.customAddURL ?? `/app/${module}/create`;

	const [modules, setModules] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [fields, setFields] = useState(props.fields);
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
	const [txnType, setTxnType] = useState('');
	const [where, setWhere] = useState(props.where);
	const [datepickerStatus, setDatepickerStatus] = useState(false);
	const [dateRange, setDateRange] = useState({
		startDate: '',
		endDate: '',
	});
	const [actionsMenu, setActionsMenu] = useState(null);

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
        console.log(props)
        // setFields(props.fields);
        setModules(props.result);
        setTotalRecords(res.data.results.result.total)
        setLoading(false);
        setFirstCall(false);
    }

	const fetchModules1 = () => {
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
			let fields_var = res.data.results.fields;
			
			setFields(fields_var);
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

	function handleClick(item, e) {
		if (editable && !(e.target.classList.contains('listingExtraMenu') || e.target.classList.contains('MuiBackdrop-root'))) {
			handelNavigate(item)
		} else {
			e.stopPropagation();
			// return false;
		}
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
	function openActionsMenu(event) {
		setActionsMenu(event.currentTarget);
	}

	function closeActionsMenu() {
		setActionsMenu(null);
	}
	const processFieldValue = (value, fieldConfig) => {
		if (value && (fieldConfig.field_name === 'completed_at' || fieldConfig.field_name === 'completed' || fieldConfig.field_name === 'activity_date')) {
			value = Helper.parseTimeStamp(value)
		} else if (fieldConfig.field_name === 'created_at' || fieldConfig.field_name === 'updated_at') {
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
        console.log(fields);
		return fields && Object.values(fields).filter(field => field.listing === true).length + 1;
	}

	/**
	 * Customized any row value
	 */
	const customizedField = (module, n, field) => {
		if (module === 'tickets' && field.field_name === 'status') {
			return <Chip className="capitalize" label={processFieldValue(n[field.field_name], field)} color={processFieldValue(n[field.field_name], field) === 'open' ? 'warning' : processFieldValue(n[field.field_name], field) === 'closed' ? 'success' : 'primary'} />
		} else if (module === 'pages' && field.field_name === 'auth_required') {
			return <Chip className="capitalize" label={processFieldValue(n[field.field_name], field) == 1 ? 'Yes' : 'No'} color={processFieldValue(n[field.field_name], field) == 1 ? 'success' : 'primary'} />
		} else if (module === 'member-transactions' && field.field_name === 'type') {
			return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color={processFieldValue(n[field.field_name], field) === "credited" ? "success" : "error"} />
		} /*else if (module === 'member-transactions' && field.field_name === 'completed_at') {
			return Helper.parseTimeStamp(processFieldValue(n[field.field_name], field))
		}*/ else if (module === 'member-transactions' && field.field_name === 'note') {
			return processFieldValue(n[field.field_name], field) ? (
				<Tooltip title={processFieldValue(n[field.field_name], field)} placement="top-start" arrow>
					<FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:chat-alt</FuseSvgIcon>
				</Tooltip>
			) : '--'
		} else if (module === 'member-transactions' && field.field_name === 'status') {
			const status = processFieldValue(n[field.field_name], field);
			if (status === 'initiated')
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="primary" />
			else if (status === 'processing')
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="secondary" />
			else if (status === 'completed')
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="success" />
			else if (status === 'failed')
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="error" />
			else if (status === 'declined')
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="warning" />
		} else if (module === 'campaigns') {
			if (field.field_name === 'status') {
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color={processFieldValue(n[field.field_name], field) === 'active' ? 'success' : 'error'} />
			}
			if (field.field_name === 'actions') {
				return (
					<>
						<IconButton
							aria-owns={actionsMenu ? 'actionsMenu' : null}
							aria-haspopup="true"
							onClick={openActionsMenu}
							size="large"
							className="listingExtraMenu"
							sx={{ zIndex: 999 }}
						>
							<FuseSvgIcon
								className="listingExtraMenu"
							>material-outline:settings</FuseSvgIcon>
						</IconButton>
						<Menu
							id="actionsMenu"
							anchorEl={actionsMenu}
							open={Boolean(actionsMenu)}
							onClose={closeActionsMenu}
						>
							<MenuList>
								<MenuItem
									onClick={(event) => {
										event.stopPropagation();
										navigate(`/app/campaigns/${n.id}/report`)
									}}
								>
									<ListItemIcon className="min-w-40">
										<FuseSvgIcon>heroicons-outline:document-text</FuseSvgIcon>
									</ListItemIcon>
									<ListItemText primary="Report" />
								</MenuItem>
							</MenuList>
						</Menu></>
				)
			}
			return processFieldValue(n[field.field_name], field)
		} else {
			return processFieldValue(n[field.field_name], field)
		}
	}

	const dateRangeSelected = (val) => {
		setDatepickerStatus(!datepickerStatus)
		setDateRange({
			startDate: moment(val.startDate),
			endDate: moment(val.endDate)
		});
		const param = module === 'member-transactions' ? {
			completed_at: [moment(val.startDate), moment(val.endDate)]
		} : {
			created_at: [moment(val.startDate), moment(val.endDate)]
		}
		setWhere({ ...where, ...param });
	}
	const handleClearDateRange = () => {
		setDateRange({
			startDate: null,
			endDate: null
		});
		module === 'member-transactions' ? delete where.completed_at : delete where.created_at;
		setWhere({ ...where });
	}

	return (
		<div>
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
												onClick={(event) => handleClick(n, event)}
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

export default withRouter(ReportList);
