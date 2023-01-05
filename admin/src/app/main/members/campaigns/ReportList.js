import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import { Table, TableBody, TableCell, TablePagination, TableRow, Typography, Chip } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
import ListTableHead from '../../crud/list/ListTableHead';
import Helper from 'src/app/helper';


function ReportList(props) {
	const [modules, setModules] = useState([]);
	const [fields, setFields] = useState({});
	const [totalRecords, setTotalRecords] = useState(0);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState([]);
	const [data, setData] = useState(modules);
	const order = Object.keys(props.order).length ? props.order : {direction: 'desc', id: 'id'};
	const page = props.page;
	const rowsPerPage = props.rowsPerPage;

    const fetchModules = () => {
		if(props.result.result){
			setFields(props.result.fields);
			setModules(props.result.result.data);
			setTotalRecords(props.result.result.total)
			setLoading(false);
		}
    }

	useEffect(() => {
		fetchModules();
	}, [props.result]);

	useEffect(() => {
		setData(modules);
	}, [modules]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<FuseLoading />
			</div>
		);
	}

	const colSpan = (fields) => {
		return fields && Object.values(fields).filter(field => field.listing === true).length + 1;
	}

	/**
	 * Customized any row value
	 */
	const customizedField = (n, field) => {
		if(field.field_name === 'created_at')
			return Helper.parseTimeStamp(n[field.field_name]);
		else
			return n[field.field_name];
	}

	const rowIndicator = (campaign_status) => {
		if(campaign_status === 0)
			return <Chip label="" color="error" />
		else if(campaign_status === 1)
			return <Chip label="" color="success" />
		else if(campaign_status === 2)
			return <Chip label="" color="warning" />
		else if(campaign_status === 3)
			return <Chip label="" color="primary" />		 
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
							onSelectAllClick=""
							onRequestSort={props.handleRequestSort}
							rowCount={data.length}
							onMenuItemClick=""							
							fields={fields}
							module=""
							deletable=""
						/>
						{data.length === 0 ? <TableBody>
							<TableRow>
								<TableCell colSpan={colSpan(fields)}>
									<Typography color="text.secondary" variant="h5" className="text-center">
										There are no records!
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
												className="h-72"
												hover
												role="checkbox"
												aria-checked={isSelected}
												tabIndex={-1}
												key={n.id}
												selected={isSelected}
											>
												<TableCell className="w-40 md:w-64 text-center" padding="none">													
													{
														rowIndicator(n.campaign_status)
													}
												</TableCell>												

												{Object.values(fields)
													.filter(field => field.listing === true)
													.map((field, i) => {
														return <Fragment key={i}>
															<TableCell className="p-4 md:p-16" component="th" scope="row">
																{
																	customizedField(n, field)
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
						onPageChange={props.handleChangePage}
						onRowsPerPageChange={props.handleChangeRowsPerPage}
						rowsPerPageOptions={[2, 5, 10, 20]}
					/>}

				</FuseScrollbars>
			</div> 
		</div>
	);
}

export default ReportList;
