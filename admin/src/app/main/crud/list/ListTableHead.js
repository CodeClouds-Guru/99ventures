import { Checkbox, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, TableCell, TableRow, TableSortLabel, Tooltip, TableHead, Dialog, DialogTitle, DialogActions, DialogContent, TextareaAutosize, Button } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/system';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { darken, lighten } from '@mui/material/styles';
import { removeModules } from '../store/modulesSlice';
import { useParams } from 'react-router-dom';
import AlertDialog from 'app/shared-components/AlertDialog';

function ListTableHead(props) {
  const { selectedOrderIds } = props;
  const numSelected = selectedOrderIds.length;

  const fields = props.fields;
  const deletable = props.deletable ?? true;
  const actionable = props.actionable ?? false;

  const [selectedOrdersMenu, setSelectedOrdersMenu] = useState(null);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [note, setNote] = useState('');

  const dispatch = useDispatch();
  const { module } = props;

  const createSortHandler = (property) => (event) => {
    if (property.sort) {
      props.onRequestSort(event, property.field_name);
    }
  };

  function openSelectedOrdersMenu(event) {
    setSelectedOrdersMenu(event.currentTarget);
  }

  function closeSelectedOrdersMenu() {
    setSelectedOrdersMenu(null);
  }

  const onCloseAlertDialogHandle = () => {
    setOpenAlertDialog(false);
  }

  const onConfirmAlertDialogHandle = () => {
    props.onMenuItemClick(selectedOrderIds);
    setOpenAlertDialog(false);
    setSelectedOrdersMenu(null);
  }

  const handleReject = (note_type) => {
    props.onWithdrawalRequestsReject(selectedOrderIds, note_type === 'skip' ? '' : note);
    setNoteDialog(false);
    setSelectedOrdersMenu(null);
  }

  // const {onSelectAllClick, order, orderBy, numSelected, rowCount} = props;

  return (
    <TableHead>
      <TableRow className="h-48 sm:h-64">
        {module === 'tickets' ? '' :
          <TableCell
            padding="none"
            className="w-40 md:w-64 text-center z-99"
            sx={{
              backgroundColor: (theme) =>
                darken(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.02 : 0.2),
            }}
          >
            {(deletable || actionable) && <Checkbox
              indeterminate={numSelected > 0 && numSelected < props.rowCount}
              checked={props.rowCount !== 0 && numSelected === props.rowCount}
              onChange={props.onSelectAllClick}
            />}
            {numSelected > 0 && (
              <Box
                className="flex items-center justify-center absolute w-64 top-0 ltr:left-0 rtl:right-0 mx-56 h-64 z-10 border-b-1"
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? lighten(theme.palette.background.default, 0.4)
                      : lighten(theme.palette.background.default, 0.02),
                }}
              >
                <IconButton
                  aria-owns={selectedOrdersMenu ? 'selectedOrdersMenu' : null}
                  aria-haspopup="true"
                  onClick={openSelectedOrdersMenu}
                  size="large"
                >
                  <FuseSvgIcon>heroicons-outline:dots-horizontal</FuseSvgIcon>
                </IconButton>
                <Menu
                  id="selectedOrdersMenu"
                  anchorEl={selectedOrdersMenu}
                  open={Boolean(selectedOrdersMenu)}
                  onClose={closeSelectedOrdersMenu}
                >
                  {deletable && <MenuList>
                    <MenuItem
                      onClick={() => {
                        // props.onMenuItemClick(selectedOrderIds);
                        // closeSelectedOrdersMenu();
                        setOpenAlertDialog(true);
                      }}
                    >
                      <ListItemIcon className="min-w-40">
                        <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
                      </ListItemIcon>
                      <ListItemText primary="Remove" />
                    </MenuItem>
                  </MenuList>}
                  {actionable && <MenuList>
                    <MenuItem
                      onClick={() => {
                        setOpenAlertDialog(true);
                      }}
                    >
                      <ListItemIcon className="min-w-40">
                        <FuseSvgIcon variant="success">heroicons-outline:check</FuseSvgIcon>
                      </ListItemIcon>
                      <ListItemText primary="Approve" />
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setNoteDialog(true);
                      }}
                    >
                      <ListItemIcon className="min-w-40">
                        <FuseSvgIcon variant="error">heroicons-outline:x</FuseSvgIcon>
                      </ListItemIcon>
                      <ListItemText primary="Reject" />
                    </MenuItem>
                  </MenuList>
                  }

                </Menu>
                <AlertDialog
                  open={openAlertDialog}
                  onConfirm={onConfirmAlertDialogHandle}
                  onClose={onCloseAlertDialogHandle}
                />
                {noteDialog &&
                  <AlertDialog
                    open={noteDialog}
                    onConfirm={() => handleReject('skip')}
                    onClose={() => setNoteDialog(false)}
                  />
                }
                {/* <Dialog open={noteDialog} onClose={(e) => { e.preventDefault(); setNoteDialog(false) }} fullWidth={true}>
                  <DialogTitle>Add Note</DialogTitle>
                  <DialogContent className="p-32 mt-10">
                    <TextareaAutosize
                      maxRows={8}
                      aria-label="maximum height"
                      placeholder="Add note"
                      style={{ width: '100%', height: '100px' }}
                      className="border"
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions className="px-32 py-20">
                    <Button className="mr-auto" variant="outlined" color="error" onClick={(e) => { e.preventDefault(); setNoteDialog(false); setNote(''); }}>Cancel</Button>
                    <Button variant="outlined" color="primary" onClick={(e) => { e.preventDefault(); handleReject('skip'); setNote(''); }}>Skip</Button>
                    <Button color="primary" variant="contained" onClick={(e) => { e.preventDefault(); handleReject('save') }} disabled={note.trim() ? false : true}>Save</Button>
                  </DialogActions>
                </Dialog> */}
              </Box>
            )}
          </TableCell>}
        {Object.values(fields).filter(field => field.listing === true).map((row) => {
          return (
            <TableCell
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? lighten(theme.palette.background.default, 0.4)
                    : lighten(theme.palette.background.default, 0.02),
              }}
              className="p-4 md:p-16"
              key={row.field_name}
              align={row.align ?? 'left'}
              padding={row.disablePadding ? 'none' : 'normal'}
              sortDirection={props.order.id === row.id ? props.order.direction : false}
            >
              {row.listing && (
                <Tooltip
                  title={row.sort ? 'Sort' : ''}
                  placement={row.align === 'right' ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={props.order.id === row.id}
                    direction={props.order.direction}
                    hideSortIcon={!row.sort}
                    onClick={createSortHandler(row)}
                    className="font-semibold"
                  >
                    {row.placeholder}
                  </TableSortLabel>
                </Tooltip>
              )}
            </TableCell>
          );
        }, this)}
      </TableRow>
    </TableHead>
  );
}

export default ListTableHead;