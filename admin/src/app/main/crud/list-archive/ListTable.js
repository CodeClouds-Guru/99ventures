import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import _ from '@lodash';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
// import OrdersStatus from '../order/OrdersStatus';
import { getModules} from '../store/modulesSlice';
import ListTableHead from './ListTableHead';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { resetModule } from '../store/modulesSlice';

function ListTable(props) {
  const dispatch = useDispatch();
  const {module} = useParams();
  const modules = useSelector((state)=>state.crud.modules.data);
  const searchText = useSelector((state)=>state.crud.modules.searchText);
  const fields = useSelector((state)=>state.crud.modules.fields);
  const totalRecords = useSelector((state)=>state.crud.modules.totalRecords);

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

  // useEffect(() => {
  //   console.log('Triggered 1')
  //   dispatch(getUsers()).then(() => setLoading(false));
  // }, [dispatch]);

  useEffect(()=>{
    dispatch(resetModule());
    setOrder({
      direction:'desc',
      id:'id',
    });
    setPage(0);
    
  },[module])

  const fetchModules = ()=>{
    let params = {
      search:searchText,
      page:page+1,
      show:rowsPerPage,
      sort:order.id,
      sort_order:order.direction,
      module
    }
    if (searchText.length !== 0) {
      // setData(FuseUtils.filterArrayByString(users, searchText));      
      // setPage(1);
    } else {
      // setData(users);
    }
    dispatch(getModules(params)).then(() => setLoading(false));
  }

  useEffect(() => {
    fetchModules();
  }, [searchText,page,rowsPerPage,module,order]);

  useEffect(()=>{
    setData(modules);
  },[modules])

  useEffect(() => {
    if(moduleDeleted){
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
      setSelected(data.map((n) => n.id));
      return;
    }
    setSelected([]);
    setModuleDeleted(false);
  }

  function handleDeselect() {
    setSelected([]);
    setModuleDeleted(true);
  }

  function handleClick(item) {
    props.navigate(`/app/${module}/${item.id}`);
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
  }

  function handleChangeRowsPerPage(event) {
    setPage(0);
    setRowsPerPage(event.target.value);
  }

  const processFieldValue = (value,fieldConfig)=>{
    if(fieldConfig.field_name === 'created_at'){
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

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          There are no {module}!
        </Typography>
      </motion.div>
    );
  }

  return (
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
          />

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
                    .filter(field=>field.listing===true)
                    .map((field,i)=>{
                      return <Fragment key={i}>
                        <TableCell className="p-4 md:p-16" component="th" scope="row">
                          {processFieldValue(n[field.field_name],field)}
                        </TableCell>
                      </Fragment>
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </FuseScrollbars>

      {totalRecords>0 && <TablePagination
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
        rowsPerPageOptions={[2,5,10,20]}
      />}
    </div>
  );
}

export default withRouter(ListTable);
