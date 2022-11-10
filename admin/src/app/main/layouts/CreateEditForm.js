import * as React from 'react';
import { Box, TextField, Select, MenuItem, InputLabel, FormControl, Button, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Typography, TextareaAutosize, Tooltip } from '@mui/material';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import LoadingButton from '@mui/lab/LoadingButton';
import { usePermission } from '@fuse/hooks';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useParams, useNavigate } from 'react-router-dom';
import {arrayMoveImmutable} from "array-move";
import { Container, Draggable } from "react-smooth-dnd";
import AlertDialog from 'app/shared-components/AlertDialog';


const CreateEditForm = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { moduleId } = useParams();
    const { hasPermission } = usePermission('layouts');
    const [ loading, setLoading ] = useState(false);
    const [ components, setComponents ] = useState([]);
    const [ layoutname, setLayoutname ] = useState('');    
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    const [ records, setRecords ] = useState({});
    const [ changeStatus, setChangeStatus ] = useState({name_changed: false, header_changes: false, body_changed: false});
    const [ layoutCode, setLayoutCode ] = useState({
        header: {
            value: ''
        },
        body: {
            value: [{
                name: 'Content',
                code: '{{content}}'
            }]
        }
    });

    useEffect(()=>{
        getComponents();
        getData();
    }, []);
    
    /**
     * Components API
     */
    const getComponents = () => {
        axios.post(jwtServiceConfig.layoutsAdd)
        .then(res => {
            if(res.data.results.status === true){
                if(res.data.results.components) {
                    setComponents(res.data.results.components)
                }
            }            
        })
        .catch(errors => {
            console.log(errors);
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
        })
    }

    /**
     * get Layout data
     */
    const getData = () => {
        axios.post(jwtServiceConfig.getSingleLayout + '/' + moduleId)
        .then(res => {
            if(res.data.results.result){
                const result = res.data.results.result;
                setRecords(result);
                setLayoutname(result.name);
                setLayoutCode(result.layout_json);
            } 
        })
        .catch(errors => {
            console.log(errors);
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
        })
    }

    const handleSelectComponent = (e) => {
        const selectedValue = e.target.value;
        if(selectedValue){
            const componentCode = components.filter(el=> el.name === selectedValue);
            const uniqueObjArray = [...new Map([...layoutCode.body.value, {name: selectedValue, code: `{{${ componentCode[0].code }}}`}].map((item) => [item["name"], item])).values()];            
            setLayoutCode({
                ...layoutCode,
                body: {
                    value: uniqueObjArray
                }
            });
        }
    }

    const handleDelete = (element) => {
        const newData = layoutCode.body.value.filter(el => el.name !== element);
        setLayoutCode({
            ...layoutCode,
            body: {
                value: newData
            }
        });
    }

    /**
     * Save / Update layout
     */
    const formSubmit = (e) => {
        e.preventDefault();
        if(!layoutname) {
            dispatch(showMessage({ variant: 'error', message: 'Please enter layout name!' }));
            return;
        }

        if(Object.values(changeStatus).includes(true) && (moduleId !== 'create' && !isNaN(moduleId))) {
            setOpenAlertDialog(true);
        } else {
            handleLayoutSubmit();
        }
        
    }

    const handleLayoutSubmit = () => {
        const htmlCode = `<html>
            <head>
                <title>{{ page_title}}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${layoutCode.header.value}
            </head>
            <body>${layoutCode.body.value.map(el => el.code).join(' ')}</body>
        </html>`;

        const params = {
            name: layoutname,
            html: htmlCode,
            layout_json: layoutCode
        };

        const url = (moduleId !== 'create' && !isNaN(moduleId)) ? jwtServiceConfig.updateLayouts + '/' + moduleId : jwtServiceConfig.layoutsSave ;

        setLoading(true);
        axios.post(url, params)
        .then(res => {
            if(res.data.results.status === true){
                dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                navigate(`/app/layouts`);
            }
        })
        .catch(errors => {
            console.log(errors);
            dispatch(showMessage({ variant: 'error', message: errors.response.data.message }));
        })
        .finally(() => {
            setLoading(false)
        });
    }

    /**
     * Drag & Drop components
     */
    const onDrop = ({ removedIndex, addedIndex }) => {
        setLayoutCode({
            ...layoutCode,
            body: {
                value: arrayMoveImmutable(layoutCode.body.value, removedIndex, addedIndex)
            }
        });
    };

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }

    /**
     * Confirm Alert Dialog.
     * It will redirect user to list page.
     * At the same time need to clear the auto save value from local storage.
     * ChangeCount value set to 0.
     */
    const onConfirmAlertDialogHandle = () => {
        handleLayoutSubmit();
    }

    const handleSetLayoutName = (e) => {
        setLayoutname(e.target.value);
        if(records.name !== e.target.value) {
            setChangeStatus({...changeStatus, name_changed: true});
        } else {
            setChangeStatus({...changeStatus, name_changed: false});
        }
    }

    const handleHeader = (e) => {
        setLayoutCode({
            ...layoutCode,
            header: {
                value: e.target.value
            }
        });
        if(records.layout_json.header.value !== e.target.value) {
            setChangeStatus({...changeStatus, header_changes: true});
        } else {
            setChangeStatus({...changeStatus, header_changes: false});
        }
    }

    /**
     * Reset the layout
     */
    const handleResetLayout = () => {
        setLayoutname(records.name);
        setLayoutCode(records.layout_json);
        setChangeStatus({name_changed: false, header_changes: false, body_changed: false});
    }

    /**
     * To determine whether the layout body has been modified or not
     */
    useEffect(()=>{
        if(Object.keys(records).length && JSON.stringify(records.layout_json.body) !== JSON.stringify(layoutCode.body)) {
            setChangeStatus({...changeStatus, body_changed: true});
        } else {
            setChangeStatus({...changeStatus, body_changed: false});
        }

    }, [layoutCode.body, records]);
 

    return (
        <Box className="p-32" >
            <form onSubmit={ formSubmit }>
                <div className='flex mb-24 justify-between'>
                    <FormControl className="w-1/2">
                        <TextField
                            id="outlined-name"
                            label="Layout Name"
                            value={ layoutname }
                            onChange={ handleSetLayoutName }
                        />
                    </FormControl>
                    <div>
                        {
                            !props.sidebarStatus ? (
                                <Tooltip title="Show History">
                                    <IconButton size="small" color="primary" aria-label="History" component="label" onClick={ props.showSidebar}>
                                        <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:cog</FuseSvgIcon>
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Close History">
                                    <IconButton size="small" color="primary" aria-label="Close History" component="label" onClick={ props.showSidebar}>
                                        <FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                    </div>
                </div>
                <fieldset className='border mb-24 p-32'>
                    <legend className='ml-24 px-10'>
                        <Typography variant="h6">Layout</Typography>
                    </legend>
                    <fieldset className='border mb-10'>
                        <legend className='ml-24 px-10'>
                            <Typography variant="subtitle1">Header</Typography>
                        </legend>
                        <div className='p-32'>
                            <pre>
                                <code>
                                    <TextareaAutosize
                                        maxRows={ 10 }
                                        aria-label="maximum height"
                                        placeholder="#Add your external style and script here, e.g., <link rel='stylesheet' href='/style.css' />"
                                        defaultValue={ layoutCode.header.value }
                                        style={{minHeight: '80px', width: '100%', padding: '15px', backgroundColor: '#000', color: '#ffeeba' }}
                                        onChange={ handleHeader }
                                    />
                                </code>
                            </pre>
                        </div>
                    </fieldset>
                    <fieldset className='border'>
                        <legend className='ml-24  px-10'>
                            <Typography variant="subtitle1">Body</Typography>
                        </legend>
                        <div className='p-32'>
                            <FormControl sx={{ m: 1, minWidth: 350 }} size="small">
                                <InputLabel id="select-component-label">Select Component</InputLabel>
                                <Select
                                    name="components"
                                    labelId="select-component-label"
                                    id="select-component"
                                    label="Select Component"
                                    onChange={ handleSelectComponent }
                                    defaultValue=""
                                    >
                                        <MenuItem value="">Select</MenuItem>
                                        {
                                            components.map(el => <MenuItem key={el.code} value={el.name} data-name={el.name}>{ el.name }</MenuItem>)
                                        }
                                    
                                </Select>
                            </FormControl>
                            <List
                                sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}                        
                                >
                                    <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDrop}>
                                        {
                                            layoutCode.body.value.map((el, indx) => {
                                                return(
                                                    <Draggable key={indx}>
                                                        <ListItem>
                                                            <ListItemIcon className="drag-handle">
                                                                <IconButton size="small" className="cursor-move" color="primary" aria-label="List" component="label">
                                                                    <FuseSvgIcon className="text-48" size={24} color="action">material-outline:swap_vert</FuseSvgIcon>
                                                                </IconButton>
                                                            </ListItemIcon>
                                                            <ListItemText id="switch-list-label-wifi" primary={ el.name } />
                                                            {
                                                                el.name !== 'Content' && (
                                                                    <IconButton size="small" color="primary" aria-label="List" component="label" onClick={() => handleDelete(el.name)}>
                                                                        <FuseSvgIcon  className="text-48" size={24} color="action">heroicons-outline:trash</FuseSvgIcon>
                                                                    </IconButton>
                                                                )
                                                            }                                                    
                                                        </ListItem>
                                                        <Divider variant="inset" component="li" className="ml-12" />
                                                    </Draggable> 
                                                )
                                            })
                                        }
                                    </Container>
                            </List>
                        </div>
                    </fieldset>
                </fieldset>
                <motion.div
                    className="flex"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                >
                    {
                        (moduleId !== 'create' && !isNaN(moduleId)) && (
                            <Button
                                className="whitespace-nowrap mx-4"
                                variant="contained"
                                color="primary"
                                onClick={ handleResetLayout }
                                disabled={ Object.values(changeStatus).includes(true) ? false : true }
                            >
                                Reset
                            </Button>
                        )
                    }
                    
                    {
                        (hasPermission('save') || hasPermission('update')) && (
                            <LoadingButton
                                variant="contained"
                                color="secondary"
                                aria-label="Register"
                                type="submit"
                                loading={loading}
                                disabled={ Object.values(changeStatus).includes(true) ? false : true }
                            >
                                {moduleId === 'create' ? 'Save' : 'Update'}
                            </LoadingButton>
                        )
                    }
                    
                    <Button
                        className="whitespace-nowrap mx-4"
                        variant="contained"
                        color="error"
                        onClick={() => navigate(`/app/layouts`)}
                    >
                        Cancel
                    </Button>
                    
                </motion.div>
            </form>
            <AlertDialog
                content="Do you want to update the changes?"
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={onCloseAlertDialogHandle}
            />
        </Box>
    )
}

export default CreateEditForm;