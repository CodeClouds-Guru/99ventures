import * as React from 'react';
import { Box, TextField, Select, MenuItem, InputLabel, FormControl, Button, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton } from '@mui/material';
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


const CreateEditForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { moduleId } = useParams();
    const { hasPermission } = usePermission('layouts');
    const [ loading, setLoading ] = useState(false);
    const [ components, setComponents ] = useState([]);
    const [ layoutname, setLayoutname ] = useState('');
    const [ layoutCode, setLayoutCode ] = useState([
        {
            name: 'Content',
            code: '{{content}}'
        }
    ]);

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
            const uniqueObjArray = [...new Map([...layoutCode, {name: selectedValue, code: `{{${ componentCode[0].code }}}`}].map((item) => [item["name"], item])).values()];            
            setLayoutCode(uniqueObjArray);
        }
    }

    const handleDelete = (element) => {
        const newData = layoutCode.filter(el => el.name !== element);
        setLayoutCode(newData);
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
        const params = {
            name: layoutname,
            html: layoutCode.map(el => el.code).join(' '),
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
        setLayoutCode(layoutCode => arrayMoveImmutable(layoutCode, removedIndex, addedIndex));
    };

    return (
        <Box className="p-32" >
            <form onSubmit={ formSubmit }>
                <div className='flex mb-24'>
                    <FormControl className="w-1/2">
                        <TextField
                            id="outlined-name"
                            label="Layout Name"
                            value={ layoutname }
                            onChange={ (e)=>setLayoutname(e.target.value) }
                        />
                    </FormControl>
                </div>
                <fieldset className='border mb-24'>
                    <legend className='w-1/3 ml-24'>
                        <FormControl className="w-full">
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
                    </legend>
                    <div className='p-32'>
                        <List
                            sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}                        
                            >
                                <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDrop}>
                                    {
                                        layoutCode.map((el, indx) => {
                                            return(
                                                <Draggable key={indx}>
                                                    <ListItem>
                                                        <ListItemIcon className="drag-handle">
                                                            <IconButton className="cursor-move" color="primary" aria-label="List" component="label">
                                                                <FuseSvgIcon className="text-48" size={24} color="action">material-outline:swap_vert</FuseSvgIcon>
                                                            </IconButton>
                                                        </ListItemIcon>
                                                        <ListItemText id="switch-list-label-wifi" primary={ el.name } />
                                                        {
                                                            el.name !== 'Content' && (
                                                                <IconButton color="primary" aria-label="List" component="label" onClick={() => handleDelete(el.name)}>
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
                <motion.div
                    className="flex"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                >
                    <Button
                        className="whitespace-nowrap mx-4"
                        variant="contained"
                        color="primary"
                        disabled={ true }
                    >
                        Preview
                    </Button>
                    {
                        (hasPermission('save') || hasPermission('update')) && (
                            <LoadingButton
                                variant="contained"
                                color="secondary"
                                aria-label="Register"
                                type="submit"
                                loading={loading}
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
        </Box>
    )
}

export default CreateEditForm;