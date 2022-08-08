import React from 'react'
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

const PermissionGrid = (props) => {
    let columns = [
        {
            id: 'module',
            label: 'Module',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'list',
            label: 'List',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'add',
            label: 'Add',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'save',
            label: 'Save',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'edit',
            label: 'Edit',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'update',
            label: 'Update',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'view',
            label: 'View',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'delete',
            label: 'Delete',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'destroy',
            label: 'Destroy',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'import',
            label: 'Import',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'export',
            label: 'Export',
            minWidth: 170,
            align: 'left'
        },
        {
            id: 'navigation',
            label: 'Navigation',
            minWidth: 170,
            align: 'left'
        },
    ]
    let rows = [
        {
            moduleName: "Users",
            moduleId: "users"
        },
        {
            moduleName: "Roles",
            moduleId: "roles"
        },
        {
            moduleName: "Permissions",
            moduleId: "permissions"
        },
        {
            moduleName: "Groups",
            moduleId: "groups"
        },
        {
            moduleName: "Users",
            moduleId: "users"
        },
        {
            moduleName: "Roles",
            moduleId: "roles"
        },
        {
            moduleName: "Permissions",
            moduleId: "permissions"
        },
        {
            moduleName: "Groups",
            moduleId: "groups"
        }
    ]
    const types = ['all', 'group', 'owner']
    return (
        <div className="p-16">
            <Typography variant="subtitle1" className="mb-5">Permissions</Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .map((row) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.moduleId}>
                                            {columns.map((column, index) => {
                                                return index === 0 ?
                                                    <TableCell key={column.id} align={column.align}>
                                                        {row.moduleName}
                                                    </TableCell>
                                                    :
                                                    (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {types.map(type => {
                                                                return <span style={{display:"block"}} className="capitalize"><input type="checkbox" /> {type}</span>
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
        </div>
    )
}

export default PermissionGrid