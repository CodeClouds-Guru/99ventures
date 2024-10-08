import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import axios from "axios";
import { motion } from 'framer-motion';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useDispatch } from 'react-redux';
import AlertDialog from 'app/shared-components/AlertDialog';
import jwtService from 'src/app/auth/services/jwtService';
import { setUser } from 'app/store/userSlice';
import { resetNavigation } from 'app/store/fuse/navigationSlice';

const PermissionGrid = (props) => {
    const dispatch = useDispatch();
    const [actions, setActions] = useState([{
        slug: 'module',
        name: 'Module',
        minWidth: 170,
        align: 'left'
    },]);
    const [modules, setModules] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [openAlertDialog, setOpenAlertDialog] = useState(false);

    useEffect(() => {
        axios.get(`/roles/edit/${props.roleId}`).then(res => {
            setActions((prevState) => [...prevState, ...res.data.results.actions]);
            setModules(res.data.results.modules);
            let rolPermissionsResp = res.data.results.role_permissions.map(rolePermission => rolePermission.slug);
            setRolePermissions(rolPermissionsResp);
        })
    }, []);

    const types = ['all', 'group', 'owner'];
    const checkboxOnChange = (e) => {
        if (e.target.checked) {
            setRolePermissions(prevState => [...prevState, e.target.value]);
        } else {
            setRolePermissions(prevState => {
                return prevState.filter(el => el !== e.target.value);
            });
        }
    }
    const applyPermissionsHandler = () => {
        setOpenAlertDialog(true);
    }
    const onConfirmAlertDialogHandle = () => {
        axios.post(`/roles/update/${props.roleId}`, { requestType: 'apply-permission', role_permissions: rolePermissions })
            .then(res => {
                dispatch(showMessage({ variant: 'success', message: 'Permissions applied successfully.' }));
                jwtService.getProfile()
                    .then(user => {
                        dispatch(resetNavigation());
                        dispatch(setUser(user));
                    })
                setOpenAlertDialog(false);
            }).catch(err => {
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
                setOpenAlertDialog(false);
            })
    }
    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }

    return (
        <div className="p-16">
            <AlertDialog
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={onCloseAlertDialogHandle}
            />
            <Typography variant="subtitle1" className="mb-5">Permissions</Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {actions.map((action) => (
                                    <TableCell
                                        key={action.slug}
                                        align={action.align ?? 'left'}
                                        style={{ minWidth: action.minWidth ?? '170' }}
                                    >
                                        {action.name}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {modules
                                .map((row) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.slug}>
                                            {actions.map((action, index) => {
                                                let tableCellKey = `${row.slug}-${action.slug}`;
                                                return index === 0 ?
                                                    <TableCell key={tableCellKey} align={action.align}>
                                                        {row.name}
                                                    </TableCell>
                                                    :
                                                    (
                                                        <TableCell key={tableCellKey} align={action.align}>
                                                            {types.map(type => {
                                                                let name = `${type}-${row.slug}-${action.slug}`;
                                                                let checked = rolePermissions.includes(name);
                                                                return <span style={{ display: "block" }} className="capitalize" key={name}>
                                                                    <input type="checkbox" id={name} checked={checked} value={name} onChange={checkboxOnChange} /> {type}
                                                                </span>
                                                            })}
                                                        </TableCell>
                                                    );
                                            }
                                            )}
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <motion.div
                className="flex mt-16"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
            >
                <Button
                    className="whitespace-nowrap mx-4 mt-5"
                    variant="contained"
                    color="secondary"
                    onClick={applyPermissionsHandler}
                >
                    Apply Permissions to Role
                </Button>
            </motion.div>
        </div>
    )
}

export default PermissionGrid