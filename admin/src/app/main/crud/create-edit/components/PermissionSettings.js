import React, { useEffect, useState } from 'react'
import { Typography, Paper, Button, Accordion, AccordionDetails, AccordionSummary, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
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
import { indexOf } from 'lodash';

function PermissionSettings(props) {
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState(true);
    const handleAccordionClick = (panel) => (event, isExpanded) => {
        // console.log(panel, isExpanded, event)
        setExpanded(isExpanded ? panel : false);
    };
    const [modules, setModules] = useState({});
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [checkCount, setCheckCount] = useState({});
    useEffect(() => {
        getRolePermissions();
    }, [])
    console.log('checkCount', checkCount)
    const getRolePermissions = () => {
        axios.get(jwtServiceConfig.roleEdit + `/${props.roleId}`)
            .then(res => {
                setModules(res.data.results.new_modules);
                syncParentChildCheckbox();
                Object.keys(res.data.results.new_modules).map((module, key) => {
                    setCheckCount(checkCount => ({ ...checkCount, ...{ [module]: { view: 0, update: 0, delete: 0 } } }))
                })
            })
    }
    const handleParentChecbox = (type, parent_module) => (event) => {
        event.stopPropagation();
        // Object.keys(modules).map((module, key) => {
        modules[parent_module].map((child_module, child_key) => {
            if (event.target.checked) {
                child_module.action.push(type);
            } else {
                if (child_module.action.includes(type)) {
                    child_module.action.splice(child_module.action.indexOf(type), 1)
                }
            }
        })
        // })
        setModules(modules => ({
            ...modules, ...modules
        }));
        syncParentChildCheckbox();
    }
    const handleChildCheckbox = (type, childModule) => (event) => {
        event.stopPropagation();
        Object.keys(modules).map((module, key) => {
            modules[module].map((child_module, child_key) => {
                if (child_module.slug === childModule.slug) {
                    if (event.target.checked) {
                        child_module.action.push(type);
                    } else {
                        child_module.action.splice(child_module.action.indexOf(type), 1)
                    }
                }
            })
        })
        setModules(modules => ({
            ...modules, ...modules
        }));
        syncParentChildCheckbox();
    }
    const syncParentChildCheckbox = () => {
        Object.keys(modules).map((module, key) => {
            setCheckCount(checkCount => ({ ...checkCount, ...{ [module]: { view: 0, update: 0, delete: 0 } } }));
            let [view_count, update_count, delete_count] = [0, 0, 0];
            modules[module].map((childModule, childKey) => {
                if (childModule.action.includes('view')) {
                    view_count++;
                }
                if (childModule.action.includes('update')) {
                    update_count++;
                }
                if (childModule.action.includes('delete')) {
                    delete_count++;
                }
            })
            setCheckCount(checkCount => ({ ...checkCount, ...{ [module]: { view: view_count, update: update_count, delete: delete_count } } }));
        })
    }
    const onConfirmAlertDialogHandle = () => {
        // console.log({ requestType: 'apply-permission', role_permissions: modules });
        // return
        axios.post(`${jwtServiceConfig.roleUpdate}/${props.roleId}`, { requestType: 'apply-permission', role_permissions: modules })
            .then(res => {
                dispatch(showMessage({ variant: 'success', message: 'Permissions applied successfully.' }));
                jwtService.getProfile()
                    .then(user => {
                        dispatch(resetNavigation());
                        dispatch(setUser(user));
                    })
                setOpenAlertDialog(false);
                getRolePermissions();
            }).catch(err => {
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
                setOpenAlertDialog(false);
            })
    }

    return (
        <div className="p-16">
            <AlertDialog
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={() => { setOpenAlertDialog(false); }}
            />
            <Typography variant="subtitle1" className="mb-5 pl-8">Permissions</Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {
                    Object.keys(modules).map((module, key) => {
                        return (
                            <Accordion key={`accordion-${module}-${key}`} expanded={expanded === module} onChange={handleAccordionClick(module)}>
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
                                                <Checkbox onClick={handleParentChecbox('view', module)} id={`view-${module}-${key}`}
                                                    checked={Object.keys(modules[module]).length === checkCount[module].view}
                                                />
                                            } label="View"
                                            />
                                            <FormControlLabel control={
                                                <Checkbox onClick={handleParentChecbox('update', module)} id={`update-${module}-${key}`}
                                                    checked={Object.keys(modules[module]).length === checkCount[module].update}
                                                />
                                            } label="Update" />
                                            <FormControlLabel control={
                                                <Checkbox onClick={handleParentChecbox('delete', module)} id={`delete-${module}-${key}`}
                                                    checked={Object.keys(modules[module]).length === checkCount[module].delete}
                                                />
                                            } label="Delete" />
                                        </FormGroup>
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {
                                        modules[module].map((childModule, childKey) => {
                                            return (
                                                <Typography key={`accordion-${childModule}-${childKey}`} component={'div'} row={true} className="flex justify-between px-20 py-5">
                                                    <span className="pt-10">
                                                        {childModule.name}
                                                    </span>
                                                    <FormGroup row={true} className="">
                                                        <FormControlLabel control={
                                                            <Checkbox onClick={handleChildCheckbox('view', childModule)} id={`view-${childModule.slug}-${childKey}`}
                                                                checked={childModule.action.includes('view')}
                                                            />
                                                        } label="View" />
                                                        <FormControlLabel control={
                                                            <Checkbox onClick={handleChildCheckbox('update', childModule)} id={`update-${childModule.slug}-${childKey}`}
                                                                checked={childModule.action.includes('update')}
                                                            />
                                                        } label="Update" />
                                                        <FormControlLabel control={
                                                            <Checkbox onClick={handleChildCheckbox('delete', childModule)} id={`delete-${childModule.slug}-${childKey}`}
                                                                checked={childModule.action.includes('delete')}
                                                            />
                                                        } label="Delete" />
                                                    </FormGroup>
                                                </Typography>
                                            )
                                        })
                                    }
                                </AccordionDetails>
                            </Accordion>)
                    })
                }
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
                    onClick={() => { setOpenAlertDialog(true); }}
                >
                    Apply Permissions to Role
                </Button>
            </motion.div>
        </div>
    )

}
export default PermissionSettings;