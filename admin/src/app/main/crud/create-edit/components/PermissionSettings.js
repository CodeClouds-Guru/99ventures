import React, { useEffect, useState } from 'react'
import { Typography, Paper, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
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
                // setModules(res.data.results.modules);
                // let rolPermissionsResp = res.data.results.role_permissions.map(rolePermission => rolePermission.slug);
                // setRolePermissions(rolPermissionsResp);
            })
    }
    return (
        <div className="p-16">
            <Typography variant="subtitle1" className="mb-5">Permissions</Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            General settings
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>I am an accordion</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
                            Aliquam eget maximus est, id dignissim quam.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                    >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>Users</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            You are currently not an owner
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Donec placerat, lectus sed mattis semper, neque lectus feugiat lectus,
                            varius pulvinar diam eros in elit. Pellentesque convallis laoreet
                            laoreet.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3bh-content"
                        id="panel3bh-header"
                    >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            Advanced settings
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            Filtering has been entirely disabled for whole web server
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit
                            amet egestas eros, vitae egestas augue. Duis vel est augue.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel4bh-content"
                        id="panel4bh-header"
                    >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>Personal data</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer sit
                            amet egestas eros, vitae egestas augue. Duis vel est augue.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Paper>
        </div>
    )

}
export default PermissionSettings;