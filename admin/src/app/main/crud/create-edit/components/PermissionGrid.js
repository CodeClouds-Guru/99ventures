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
            slug: 'module',
            name: 'Module',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'list',
            name: 'List',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'add',
            name: 'Add',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'save',
            name: 'Save',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'edit',
            name: 'Edit',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'update',
            name: 'Update',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'view',
            name: 'View',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'delete',
            name: 'Delete',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'destroy',
            name: 'Destroy',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'import',
            name: 'Import',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'export',
            name: 'Export',
            minWidth: 170,
            align: 'left'
        },
        {
            slug: 'navigation',
            name: 'Navigation',
            minWidth: 170,
            align: 'left'
        },
    ]
    let rows = [
        {
            name: "Users",
            slug: "users"
        },
        {
            name: "Roles",
            slug: "roles"
        },
        {
            name: "Permissions",
            slug: "permissions"
        },
        {
            name: "Groups",
            slug: "groups"
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
                                        key={column.slug}
                                        align={column.align ?? 'left'}
                                        style={{ minWidth: column.minWidth ?? '170' }}
                                    >
                                        {column.name}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .map((row) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.slug}>
                                            {columns.map((column, index) => {
                                                return index === 0 ?
                                                    <TableCell key={column.slug} align={column.align}>
                                                        {row.name}
                                                    </TableCell>
                                                    :
                                                    (
                                                        <TableCell key={column.slug} align={column.align}>
                                                            {types.map(type => {
                                                                let name =`${type}-${row.slug}-${column.slug}`;
                                                                return <span style={{display:"block"}} className="capitalize" key={name}>
                                                                    <input type="checkbox" id={name} value={name} onChange={(e)=>console.log(e.target.value,e.target.checked)}  /> {type}
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
        </div>
    )
}

export default PermissionGrid