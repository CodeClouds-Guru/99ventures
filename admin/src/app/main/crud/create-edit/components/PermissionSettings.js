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
        console.log(panel, isExpanded, event)
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
    return (
        <div className="p-16">
            <Typography variant="subtitle1" className="mb-5">Permissions</Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {
                    Object.keys(modules).map((module, key) => {
                        return (<Accordion key={`accordion-${module}-${key}`} expanded={expanded === module} onChange={handleChange(module)}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={module + '-' + key}
                                id={module + '-' + key}
                            >
                                <Typography component={'div'} sx={{ width: '33%', flexShrink: 0 }}>
                                    {module}
                                </Typography>
                                <Typography component={'div'} sx={{ color: 'text.secondary' }}>
                                    <FormGroup row>
                                        <FormControlLabel id={`view-${module}-${key}`} control={<Checkbox />} label="View" />
                                        {/* </FormGroup>
                                    <FormGroup> */}
                                        <FormControlLabel id={`update-${module}-${key}`} control={<Checkbox />} label="Update" />
                                    </FormGroup>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
                                    Aliquam eget maximus est, id dignissim quam.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>)
                    })
                }
            </Paper>
        </div>
    )

}
export default PermissionSettings;