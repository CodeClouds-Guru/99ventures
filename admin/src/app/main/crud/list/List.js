import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import _ from '@lodash';
import { Checkbox, Table, TableBody, TableCell, TablePagination, TableRow, Typography, Paper, Input, Button, Chip, TextField, Tooltip, IconButton, FormControl, InputLabel, Select, Menu, MenuList, MenuItem, ListItemText, ListItemIcon, Popover, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
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
import { DateRangePicker, DateRange } from "mui-daterange-picker";
import VirtualIncentivesBalance from 'app/shared-components/VirtualIncentivesBalance';
import AlertDialog from 'app/shared-components/AlertDialog';
import LoadingButton from '@mui/lab/LoadingButton';

function List(props) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector(selectUser);

	const { module } = props;
	const searchable = props.searchable ?? true;
	const editable = props.editable ?? true;
	const addable = props.addable ?? true;
	const deletable = props.deletable ?? true;
	const actionable = props.actionable ?? false;
	// const where = props.where ?? {};
	const showModuleHeading = props.moduleHeading ?? true;
	const customAddURL = props.customAddURL ?? `/app/${module}/create`;
	const queryParams = props.params ?? {};
	const copyScriptId = module === 'scripts';

	const [modules, setModules] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [searchKeywords, setSearchKeywords] = useState('');
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
	const [moduleActioned, setModuleActioned] = useState(false);
	const [firstCall, setFirstCall] = useState(true);
	const [txnType, setTxnType] = useState('');
	const [withdrawalRequestStatus, setWithdrawalRequestStatus] = useState('');
	const [where, setWhere] = useState(props.where);
	const [datepickerStatus, setDatepickerStatus] = useState(false);
	const [dateRange, setDateRange] = useState({
		startDate: '',
		endDate: '',
	});
	const [actionsMenu, setActionsMenu] = useState(null);
	const [vimodal, setVimodal] = useState(false);
	const [programsList, setProgramList] = useState([]);
	const [descPopoverAnchorEl, setDescPopoverAnchorEl] = useState(null);
	const [openRevertAlertDialog, setOpenRevertAlertDialog] = useState(false);
	const [tid, setTid] = useState(0)
	const [memberID, setMemberID] = useState(0)
	const stateUser = useSelector(state => state.user);

	const [listConfigDialog, setListConfigDialog] = useState(false);
	const [displayColumnArray, setDisplayColumnArray] = useState(['id', 'PaymentMethod.name', 'status', 'Member.status', 'Member.username', 'amount_with_currency']);

	const display_column_object = {
		'id': 'ID',
		'payment_email': 'Email',
		'Member.username': 'Username',
		'PaymentMethod.name': 'Method',
		'Member.status': 'Account',
		'amount_with_currency': 'Cash',
		'status': 'Status',
		'created_at': 'Date',
	}

	const handlePopoverOpen = (event) => {
		event.stopPropagation();
		setDescPopoverAnchorEl(event.currentTarget);
	};

	const descPopoverHandleClose = () => {
		setDescPopoverAnchorEl(null);
	};

	const descPopoverOpen = Boolean(descPopoverAnchorEl);
	// const descPopoverId = descPopoverOpen ? `simple-popover-${n.id}` : undefined;

	const resetModulesListConfig = () => {
		setSearchText('');
		setSearchKeywords('');
		setOrder({
			direction: 'desc',
			id: 'id',
		});
		setPage(0);
		setRowsPerPage(100);
		setFirstCall(true);
	}

	const fetchModules = () => {
		let params = {
			search: searchText,
			page: page + 1,
			show: rowsPerPage,
			module,
			where,
			...queryParams
		}
		if (module === 'withdrawal-requests') {
			var ordered_fields = displayColumnArray.sort((a, b) =>
				Object.keys(display_column_object).indexOf(a) - Object.keys(display_column_object).indexOf(b)
			)
			params.fields = ordered_fields
		}
		/* order is added if it's not the very first call os API listing */
		if (!firstCall) {
			params.sort = order.id
			params.sort_order = order.direction
		}
		let endpoint = module === 'completed-surveys' ? `/survey-providers?action=completed-surveys` : `/${module}`;
		axios.get(endpoint, { params }).then(res => {
			setListConfigDialog(false);
			let fields_var = res.data.results.fields;
			module === 'campaigns' || module === 'member-transactions' ? fields_var.actions = {
				db_name: "actions",
				field_name: "actions",
				listing: true,
				placeholder: "Actions",
				required: false,
				searchable: false,
				show_in_form: false,
				sort: false,
				type: "text",
				value: "",
				width: "50"
			} : '';
			setFields(fields_var);
			setModules(res.data.results.result.data);
			setTotalRecords(res.data.results.result.total)
			setLoading(false);
			setApplyLoading(false);
			setExportLoading(false);
			setFirstCall(false);
			module === 'tickets' ? ticketsReadCount(res.data.results.result.data) : '';
			if (res.data.results.programs) {
				setProgramList(res.data.results.programs)
			}
		}).catch(error => {
			setListConfigDialog(false);
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
	}, [searchText, page, rowsPerPage, order.id, order.direction, where, props.params, props.module]);

	/**
	 * Unmounted the sate value
	 */
	useEffect(() => {
		return () => {
			resetModulesListConfig();
		}
	}, [module]);

	// useEffect(() => {
	// 	resetModulesListConfig();
	// 	setFirstCall(true);
	// }, [module]);

	useEffect(() => {
		setData(modules);
	}, [modules])

	useEffect(() => {
		if (module === 'withdrawal-requests') { setWithdrawalRequestStatus('pending') }
	}, [])

	useEffect(() => {
		if (moduleActioned) {
			fetchModules();
		}
	}, [moduleActioned]);

	const debounceFn = useCallback(_.debounce((val) => {
		setPage(0);
		setSearchText(val);
	}, 1000), []);

	const handleSearchtext = (ev) => {
		setFirstCall(true);
		setSearchKeywords(ev.target.value);
		debounceFn(ev.target.value);
	}


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
				return (module === 'pages' && (n.slug === '500' || n.slug === '404') || (module === 'withdrawal-requests' && n.status !== 'pending')) ? null : n.id
			}));
			return;
		}
		setSelected([]);
		setModuleActioned(false);
	}

	async function handleDeselect(selectedIds) {
		// let url = `${module}/delete`;
		// let params = { data: { modelIds: selectedIds } };
		// if (module === 'withdrawal-requests') {
		// 	url = `${module}/update`;
		// 	params = { data: { model_ids: selectedIds, action_type: 'approved' } }
		// }
		try {
			module === 'withdrawal-requests' ? await axios.post(`${module}/update`, { model_ids: selectedIds, action_type: 'approved' }).then((res) => {
				props.getWithdrawalCount();
				let updateWithdrawalRequestCount = { ...stateUser, pending_withrawal_request: res.data.results.pending_withrawal_request }
				dispatch(setUser(updateWithdrawalRequestCount))
				dispatch(showMessage({ variant: 'success', message: 'Action executed successfully' }))
			}).catch(e => {
				console.error(e)
				dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to approve' }))
			}) : await axios.delete(`${module}/delete`, { data: { model_ids: selectedIds } }).then((res) => {
				dispatch(showMessage({ variant: 'success', message: 'Action executed successfully' }))
			}).catch(e => {
				console.error(e)
				dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to delete' }))
			});
			setSelected([]);
			if (module !== 'withdrawal-requests') { setModuleActioned(true); }
		} catch (error) {
			console.log(error);
		}
	}

	async function handleWithdrawalRequestsReject(selectedIds, note) {
		try {
			await axios.post(`${module}/update`, { model_ids: selectedIds, action_type: 'rejected', note: note }).then((res) => {
				props.getWithdrawalCount();
				let updateWithdrawalRequestCount = { ...stateUser, pending_withrawal_request: res.data.results.pending_withrawal_request }
				dispatch(setUser(updateWithdrawalRequestCount))
				dispatch(showMessage({ variant: 'success', message: 'Action executed successfully' }))
			}).catch(e => {
				console.error(e)
				dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to reject' }))
			});
			setSelected([]);
			setModuleActioned(true);
		} catch (error) {
			console.log(error);
		}
	}

	function revertMemberTransaction() {
		axios.post(`${module}/update/${tid}`, { member_id: memberID, type: 'revert' }).then((res) => {
			setOpenRevertAlertDialog(false)
			setTid(0);
			setMemberID(0)
			closeActionsMenu()
			fetchModules();
			dispatch(showMessage({ variant: 'success', message: 'Action executed successfully' }))
		}).catch(e => {
			console.error(e)
			dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to revert' }))
		});
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
			// } else if(module === 'pages') {
			// 	props.navigate(`/app/paymentconfigurations/${item.id}`);
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
		setModuleActioned(false);
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
	function openActionsMenu(event) {
		setActionsMenu(event.currentTarget);
	}

	function closeActionsMenu() {
		setActionsMenu(null);
	}
	const processFieldValue = (value, fieldConfig) => {
		if (value && (fieldConfig.field_name === 'completed_at' || fieldConfig.field_name === 'completed' || fieldConfig.field_name === 'activity_date')) {
			value = Helper.parseTimeStamp(value)
		} else if ((fieldConfig.field_name === 'created_at' || fieldConfig.field_name === 'updated_at' || fieldConfig.field_name === 'requested_on') && value) {
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
	const customizedField = (module, n, field) => {
		if (module === 'tickets') {
			if (field.field_name === 'status') {
				return <Chip className="capitalize" label={processFieldValue(n[field.field_name], field)} color={processFieldValue(n[field.field_name], field) === 'open' ? 'warning' : processFieldValue(n[field.field_name], field) === 'closed' ? 'success' : 'primary'} />
			}
			if (field.field_name === 'username') {
				return <a onClick={(e) => e.stopPropagation()} target="_blank" href={`/app/members/${n.member_id}`}>{n['username']}</a>
			}
			return processFieldValue(n[field.field_name], field)
		} else if (module === 'pages' && field.field_name === 'auth_required') {
			return <Chip className="capitalize" label={processFieldValue(n[field.field_name], field) == 1 ? 'Yes' : 'No'} color={processFieldValue(n[field.field_name], field) == 1 ? 'success' : 'primary'} />
		} else if (module === 'member-transactions' && field.field_name === 'type') {
			return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color={processFieldValue(n[field.field_name], field) === "credited" ? "success" : "withdraw" ? "error" : "warning"} />
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
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="error" />
			else if (status === 'reverted')
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="warning" />
		} else if (module === 'withdrawal-requests') {
			const status = processFieldValue(n[field.field_name], field);
			if (field.field_name === 'Member.status') {
				if (status === 'member')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="success" />
				else if (status === 'suspended')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="primary" />
				else if (status === 'validating')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="warning" />
				else if (status === 'deleted')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="error" />
			}
			if (field.field_name === 'status') {
				if (status === 'pending')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="secondary" />
				else if (status === 'approved')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="success" />
				else if (status === 'rejected')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="error" />
				else if (status === 'expired')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="warning" />
				else if (status === 'completed')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="success" />
				else if (status === 'declined')
					return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color="error" />
			}
			if (field.field_name === 'Member.admin_status') {
				if (status === 'verified')
					return <Chip component="span" label={processFieldValue(n[field.field_name], field)} className="capitalize" color="success" size="small" />
				else if (status === 'pending')
					return <Chip component="span" label={processFieldValue(n[field.field_name], field)} className="capitalize" color="warning" size="small" />
				else if (status === 'not_verified')
					return <Chip component="span" label={processFieldValue(n[field.field_name], field).split('_').join(' ')} className="capitalize" color="error" size="small" />
			}
			if (field.field_name === 'Member.username') {
				return <a onClick={(e) => e.stopPropagation()} target="_blank" href={`/app/members/${n.Member.id}`}>{n['Member.username']}</a>
			}
			return processFieldValue(n[field.field_name], field)
		} else if (module === 'campaigns' || module === 'member-transactions') {
			if (module === 'campaigns' && field.field_name === 'status') {
				return <Chip label={processFieldValue(n[field.field_name], field)} className="capitalize" size="small" color={processFieldValue(n[field.field_name], field) === 'active' ? 'success' : 'error'} />
			}
			if (field.field_name === 'actions' && n.type === 'credited' && (n.status === 'initiated' || n.status === 'processing')) {
				return (
					<>
						<IconButton
							aria-owns={actionsMenu ? `actionsMenu_${n.id}` : null}
							aria-haspopup="true"
							onClick={openActionsMenu}
							size="large"
							className="listingExtraMenu"
							sx={{ zIndex: 999 }}
							id={`actionsMenu_${n.id}`}
						>
							<FuseSvgIcon
								sx={{ pointerEvents: 'none' }}
								className="listingExtraMenu"
							>material-outline:settings</FuseSvgIcon>
						</IconButton>
						<Menu
							id={`actionsMenu_${n.id}`}
							anchorEl={actionsMenu}
							open={Boolean(actionsMenu && actionsMenu.id === `actionsMenu_${n.id}`)}
							onClose={closeActionsMenu}
						>
							<MenuList>
								{module === 'campaigns' && <MenuItem
									onClick={(event) => {
										event.stopPropagation();
										navigate(`/app/campaigns/${n.id}/report`)
									}}
								>
									<ListItemIcon className="min-w-40">
										<FuseSvgIcon>heroicons-outline:document-text</FuseSvgIcon>
									</ListItemIcon>
									<ListItemText primary="Report" />
								</MenuItem>}
								{module === 'member-transactions' &&
									<MenuItem
										onClick={(event) => {
											event.stopPropagation();
											setOpenRevertAlertDialog(true);
											setTid(n.id); setMemberID(n.Member.id);
										}}
									>
										<ListItemIcon className="min-w-40">
											<FuseSvgIcon>heroicons-outline:receipt-refund</FuseSvgIcon>
										</ListItemIcon>
										<ListItemText primary="Revert" />
									</MenuItem>}
							</MenuList>
						</Menu>
					</>
				)
			}
			return processFieldValue(n[field.field_name], field)
		} else if (copyScriptId && field.field_name === 'code') {
			return (
				<Tooltip title={`Copy ` + processFieldValue(n[field.field_name], field)} placement="right">
					<span className="flex cursor-pointer" style={{
						width
							: 'fit-content'
					}} onClick={(e) => { e.stopPropagation(); Helper.copyTextToClipboard(processFieldValue(n[field.field_name], field)); dispatch(showMessage({ variant: 'success', message: processFieldValue(n[field.field_name], field) + ' Copied' })); }}>
						{processFieldValue(n[field.field_name], field)}
						<FuseSvgIcon className="text-48 pt-2 pl-2" size={18} color="action">material-solid:content_copy</FuseSvgIcon>
					</span>
				</Tooltip>
			)
		}
		// else if (module === 'scripts' && field.field_name === 'description') {

		// 	return (
		// 		<div className="flex">
		// 			<Popover
		// 				anchorOrigin={{ vertical: 'center', horizontal: 'center', }}
		// 				transformOrigin={{ vertical: 'center', horizontal: 'center', }}
		// 				id={`simple-popover-${n.id}`}
		// 				open={descPopoverOpen}
		// 				anchorEl={descPopoverAnchorEl}
		// 				onClose={descPopoverHandleClose}
		// 			>
		// 				{n[field.field_name]}
		// 			</Popover>
		// 			{n[field.field_name].substring(0, 50)}
		// 			<Typography
		// 				aria-owns={open ? `mouse-over-popover-${n.id}` : undefined}
		// 				aria-haspopup="true"
		// 				aria-describedby={`simple-popover-${n.id}`}
		// 				onClick={(e) => { handlePopoverOpen(e) }}
		// 			>
		// 				<FuseSvgIcon className="text-48" size={24} color="action">heroicons-solid:information-circle</FuseSvgIcon>
		// 			</Typography>
		// 		</div>)
		// } 
		else {
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
			completed_at: [moment(val.startDate), moment(val.endDate).add(1, 'day')]
		} : module === 'withdrawal-requests' ? {
			created_at: {
				scripted_99_between: [moment(val.startDate), moment(val.endDate).add(1, 'day')]
			}
		} : {
			created_at: [moment(val.startDate), moment(val.endDate).add(1, 'day')]
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

	/**
	 * To show a icon by which admin can open a modal and see the balance of all Virtual Incentives program's price.
	 */
	const virtualIncentiveInfo = () => {
		return (
			<Tooltip title="Program List" placement="top-start" arrow>
				<IconButton
					aria-owns=""
					aria-haspopup="true"
					onClick={() => setVimodal(true)}
					size="small"
					className="listingExtraMenu"
					sx={{ zIndex: 999 }}
					id=""
				>
					<FuseSvgIcon className="text-48" size={24} color="action">material-outline:info</FuseSvgIcon>
				</IconButton>
			</Tooltip>
		)
	}
	const handleConfigurColumn = (e) => {
		e.target.checked ? setDisplayColumnArray(prev => [...prev, e.target.value]) : setDisplayColumnArray(prev => prev.filter(item => item !== e.target.value))
	}
	const modifyList = () => {
		setApplyLoading(true)
		fetchModules();
	}
	const exportAll = () => {
		setExportLoading(true);
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
			all: 1,
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
	return (
		<div>

			{/* Withdrawal Requests table Configure dialog */}
			{/* Start */}
			<Dialog
				open={listConfigDialog}
				onClose={() => { setListConfigDialog(false) }}
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
					<LoadingButton loading={exportLoading} variant="contained" color="primary" onClick={(e) => { e.preventDefault(); exportAll() }}>Export to CSV</LoadingButton>
				</DialogActions>
			</Dialog>
			{/* End */}
			{openRevertAlertDialog &&
				<AlertDialog
					open={openRevertAlertDialog}
					onConfirm={revertMemberTransaction}
					onClose={() => setOpenRevertAlertDialog(false)}
				/>}
			{/* // header */}

			{
				(showModuleHeading || searchable || addable) && (
					<div className='w-full flex py-32 px-24 md:px-32'>
						{
							showModuleHeading && (
								<Typography
									component={motion.span}
									initial={{ x: -20 }}
									animate={{ x: 0, transition: { delay: 0.2 } }}
									delay={300}
									className="w-2/3 lg:w-1/3 font-extrabold tracking-tight capitalize"
									variant="h5"
								>
									{module !== 'offer-walls' ? module.split('-').join(' ') : 'Offerwalls'}
									{(!_.isEmpty(programsList)) ? virtualIncentiveInfo() : ''}
								</Typography>
							)
						}
						<div className="flex items-center justify-end space-x-8 w-full lg:w-2/3 ml-auto">
							{module === 'withdrawal-requests' &&
								<Tooltip title="Configure" placement="top">
									<Button
										className="p-0 m-0"
										variant="contained"
										color="secondary"
										onClick={(e) => { e.preventDefault(); setListConfigDialog(true) }}
									>
										<FuseSvgIcon>heroicons-outline:cog</FuseSvgIcon>
									</Button>
								</Tooltip>}
							{
								(module === 'withdrawal-requests' || (module === 'member-transactions' && location.pathname.includes('history'))) && (
									<>
										{
											datepickerStatus && (
												<div className="date-range-wrapper member-txn-list">
													<DateRangePicker
														wrapperClassName="filter-daterange-picker"
														open={datepickerStatus}
														toggle={() => setDatepickerStatus(!datepickerStatus)}
														onChange={dateRangeSelected}
													/>
												</div>
											)
										}
										<Paper
											component={motion.div}
											initial={{ y: -20, opacity: 0 }}
											animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
											className="flex items-center justify-around w-5/12 space-x-8 px-16 rounded-full border-1 shadow-0 cursor-pointer"
											sx={{ '& .MuiBox-root.muiltr-79elbk': { top: '110px', right: '15%' } }}
											onClick={() => setDatepickerStatus(!datepickerStatus)}
										>
											<FuseSvgIcon className="text-48 cursor-pointer flex justify-start" size={24} color="disabled">feather:calendar</FuseSvgIcon>
											<Input
												label="Select daterange"
												className="datepicker--input cursor-pointer"
												placeholder="Select daterange"
												disabled
												disableUnderline
												size="small"
												value={
													dateRange && dateRange.startDate
														? `${moment(dateRange.startDate).format('YYYY/MM/DD')} - ${moment(dateRange.endDate).format('YYYY/MM/DD')}`
														: ''
												}
											/>
											{(dateRange && dateRange.startDate) && <FuseSvgIcon className="cursor-pointer text-48" size={24} color="action" onClick={handleClearDateRange}>material-outline:close</FuseSvgIcon>}
										</Paper>
										{(module === 'member-transactions' && location.pathname.includes('history')) &&
											<FormControl sx={{ minWidth: 120 }} size="small">
												<InputLabel id="demo-simple-select-label">Type</InputLabel>
												<Select
													labelId="demo-simple-select-label"
													id="demo-simple-select"
													value={txnType}
													label="Type"
													className="rounded-full"
													sx={{ lineHeight: '17px' }}
													onChange={
														(e) => {
															setTxnType(e.target.value);
															if (e.target.value) {
																setWhere({ ...where, type: e.target.value });
															} else {
																setWhere(props.where);
															}
														}
													}
												>
													<MenuItem value=""><em>--Select--</em></MenuItem>
													<MenuItem value="credited">Credited</MenuItem>
													<MenuItem value="withdraw">Withdraw</MenuItem>
													<MenuItem value="reversal">Reversal</MenuItem>
												</Select>
											</FormControl>}
										{module === 'withdrawal-requests' &&
											<FormControl sx={{ minWidth: 120 }} size="small">
												<InputLabel id="demo-simple-select-label">Status</InputLabel>
												<Select
													labelId="demo-simple-select-label"
													id="demo-simple-select"
													value={withdrawalRequestStatus}
													label="Status"
													className="rounded-full"
													sx={{ lineHeight: '17px' }}
													onChange={
														(e) => {
															setWithdrawalRequestStatus(e.target.value);
															if (e.target.value) {
																setWhere({ ...where, status: e.target.value });
															} else {
																let { status, ...rest } = where
																setWhere({ ...rest });
															}
														}
													}
												>
													<MenuItem value=""><em>--Select--</em></MenuItem>
													<MenuItem value="approved">Approved</MenuItem>
													<MenuItem value="pending">Pending</MenuItem>
													<MenuItem value="rejected">Rejected</MenuItem>
													<MenuItem value="expired">Expired</MenuItem>
													<MenuItem value="completed">Completed</MenuItem>
													<MenuItem value="declined">Declined</MenuItem>
												</Select>
											</FormControl>}
									</>
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
									placeholder={`Search ${module !== 'offer-walls' ? module.split('-').join(' ') : 'offerwalls'}`}
									className="flex flex-1"
									disableUnderline
									fullWidth
									value={searchKeywords}
									inputProps={{
										'aria-label': `Search ${module}`,
									}}
									onChange={handleSearchtext}
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
				)
			}


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
							onWithdrawalRequestsReject={handleWithdrawalRequestsReject}
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
											>
												<TableCell className="w-40 md:w-64 text-center" padding="none">
													{((module === 'pages' && (n.slug === '500' || n.slug === '404')) || (module === 'withdrawal-requests' && n.status !== 'pending')) ? '' : (isDeletable(n) || actionable) && <Checkbox
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
						rowsPerPageOptions={[10, 20, 50, 100]}
					/>}

				</FuseScrollbars>
			</div>

			{/* To show the info modal for virtual incentive */}
			{
				vimodal && <VirtualIncentivesBalance programs={programsList} status={vimodal} setVimodal={(e) => setVimodal(e)} />
			}
		</div>
	);
}

export default withRouter(List);
