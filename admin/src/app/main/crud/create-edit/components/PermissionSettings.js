import React, { useEffect, useState } from 'react'
import { Typography, Paper, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, Accordion, AccordionDetails, AccordionSummary, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import axios from "axios";
import { motion } from 'framer-motion';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useDispatch } from 'react-redux';
import AlertDialog from 'app/shared-components/AlertDialog';
import jwtService from 'src/app/auth/services/jwtService';
import { setUser } from 'app/store/userSlice';
import { resetNavigation } from 'app/store/fuse/navigationSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';

function PermissionSettings(props) {
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState(false);
    const handleChange = (panel) => (event, isExpanded) => {
        // console.log(panel, isExpanded, event)
        setExpanded(isExpanded ? panel : false);
    };
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
        getRolePermissions();
    }, [])
    const getRolePermissions = () => {
        axios.get(jwtServiceConfig.roleEdit + `/${props.roleId}`)
            .then(res => {
                console.log(res)
                // setActions((prevState) => [...prevState, ...res.data.results.actions]);
                setModules(res.data.results.new_modules);
                let rolPermissionsResp = res.data.results.role_permissions.map(rolePermission => rolePermission.slug);
                setRolePermissions(rolPermissionsResp);
            })
    }
    const handleParentChecbox = (type) => (event) => {
        // event.preventDefault();
        console.log(event, type);
    }
    const handleChildCheckbox = (type) => (event) => {
        // event.preventDefault();
        console.log(event, type);
    }
    return (
        <div className="p-16">
            <Typography variant="subtitle1" className="mb-5 pl-8">Permissions</Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {
                    Object.keys(modules).map((module, key) => {
                        // console.log(88, modules[module])
                        return (<Accordion key={`accordion-${module}-${key}`} expanded={expanded === module} onChange={handleChange(module)}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={module + '-' + key}
                                id={module + '-' + key}
                            >
                                <Typography component={'div'} sx={{ width: '33%', flexShrink: 0 }} className="pt-10 pl-5">
                                    {module}
                                </Typography>
                                <Typography component={'div'} sx={{ color: 'text.secondary' }} className="flex justify-end px-10">
                                    <FormGroup row={true}>
                                        <FormControlLabel control={
                                            <Checkbox onClick={handleParentChecbox('view')} id={`view-${module}-${key}`} />
                                        } label="View" />
                                        <FormControlLabel control={
                                            <Checkbox onClick={handleParentChecbox('update')} id={`update-${module}-${key}`} />
                                        } label="Update" />
                                        <FormControlLabel control={
                                            <Checkbox onClick={handleParentChecbox('delete')} id={`delete-${module}-${key}`} />
                                        } label="Delete" />
                                    </FormGroup>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {
                                    modules[module].map((childModule, childKey) => {
                                        // console.log(childModule.name);
                                        // return;
                                        return (
                                            <>
                                                <Typography component={'div'} row={true} className="flex justify-between px-20 py-5">
                                                    <span className="pt-10">
                                                        {childModule.name}
                                                    </span>
                                                    <FormGroup row={true} className="">
                                                        <FormControlLabel control={
                                                            <Checkbox onClick={handleChildCheckbox('view')} id={`view-${childModule.slug}-${childKey}`} />
                                                        } label="View" />
                                                        <FormControlLabel control={
                                                            <Checkbox onClick={handleChildCheckbox('update')} id={`update-${childModule.slug}-${childKey}`} />
                                                        } label="Update" />
                                                        <FormControlLabel control={
                                                            <Checkbox onClick={handleChildCheckbox('delete')} id={`delete-${childModule.slug}-${childKey}`} />
                                                        } label="Delete" />
                                                    </FormGroup>
                                                </Typography>
                                            </>
                                        )

                                    })
                                }
                            </AccordionDetails>
                        </Accordion>)
                    })
                }
            </Paper>
        </div>
    )

}
export default PermissionSettings;