import * as React from 'react';
import { Box, TextField, InputAdornment, Accordion, AccordionDetails, AccordionSummary, Typography, FormControlLabel, Checkbox } from '@mui/material';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import { usePermission } from '@fuse/hooks';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import types from './Types.js';
import * as yup from 'yup';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';



const schema = yup.object().shape({
    max_file_size: yup
        .string()
        .required('Please enter max file size'),
    max_no_of_uploads: yup
        .string()
        .required('Please enter max no. of file uploads'),
});

const defaultValues = {
    max_file_size: "",
    max_no_of_uploads: ""
}

const FormField = () => {
    const dispatch = useDispatch();
    const { hasPermission } = usePermission('settings');
    const [expanded, setExpanded] = useState(false);
    const [fileTypes, setFileTypes] = useState({});
    const [loading, setLoading] =  useState(false);
    const [records, setRecords] = useState([]);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const {
        control,
        formState: { isValid, dirtyFields, errors },
        handleSubmit,
        setError,
        setValue
    } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    /**
     * Checkbox checked / unchecked 
     */
    const handleCheck = (e) => {
        const index = fileTypes[e.target.name].findIndex(el => el.mime_type === e.target.value);
        if(!e.target.checked && index >=0) {
            fileTypes[e.target.name][index].checked = false
        } else {            
            fileTypes[e.target.name][index].checked = true
        }
        setFileTypes({...fileTypes});
    }   

    useEffect(()=>{
        setValue('max_file_size', '', { shouldDirty: true, shouldValidate: false });
        setValue('max_no_of_uploads', '', { shouldDirty: true, shouldValidate: false });
        fetchData();
    }, []);

    /**
     * Get Settings Data from API
     */
    const fetchData = () => {
        axios.get(jwtServiceConfig.settingsRead).then((response) => {
            if (response.data.results.status) {
                const result = response.data.results.data.config_data;
                setRecords(result);
                const configIndx = result.findIndex(el => el.settings_key === 'file_manager_configuration');
                const fileSizeIndx = result.findIndex(el => el.settings_key === 'max_file_size');
                const uploadIndx = result.findIndex(el => el.settings_key === 'max_no_of_uploads');
                
                if(result[fileSizeIndx].settings_value){
                    setValue('max_file_size', result[fileSizeIndx].settings_value, { shouldDirty: true, shouldValidate: true });
                }
                if(result[uploadIndx].settings_value){
                    setValue('max_no_of_uploads', result[uploadIndx].settings_value, { shouldDirty: true, shouldValidate: true });
                }

                const filesData = {};
                Object.keys(types).map((item, key) => {
                    filesData[item] = []
                    types[item].map(el => {
                        filesData[item].push({
                            ...el,
                            checked: (result[configIndx]['settings_value'] && result[configIndx]['settings_value'][item].includes(el.mime_type)) ? true : false
                        })
                    })

                });
                setFileTypes(filesData);
            } else {
                console.log('Error');
            }
        });
    }

    /**
     * Update Settings Record
     */
    const formSubmit = (data) => {
        const params = [];
        const typeData = {};

        Object.keys(fileTypes).map(key => {
            typeData[key] = [];
            fileTypes[key].map(el => (el.checked) && typeData[key].push(el.mime_type))
        });

        records.map(v => {
            if(v.settings_key === 'file_manager_configuration'){
                params.push({
                    id: v.id,
                    key: v.settings_key,
                    value: typeData
                });
            } else {
                params.push({
                    id: v.id,
                    key: v.settings_key,
                    value: data[v.settings_key]
                });
            }
        });        

        // console.log(params); return;

        setLoading(true);
        axios.post(jwtServiceConfig.settingsUpdate, { config_data: params })
            .then((response) => {
                if (response.data.results.status) {
                    setLoading(false);                    
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }))
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                }
            })
            .catch(error => dispatch(showMessage({ variant: 'error', message: error.response.data.errors })));
    }

    return (
        <Box className="p-32" >
            <form style={{ display: 'flex', flexWrap: 'wrap' }} onSubmit={ handleSubmit(formSubmit) }>
                <div className='w-full flex mb-20'>
                    <Controller
                        name="max_file_size"
                        control={ control }
                        render={({ field }) => (
                            <TextField
                                {...field}
                                type="tel"
                                label="Max File Size"
                                id="outlined-start-adornment"
                                sx={{ width: '100%'}}
                                className="mr-10"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">MB</InputAdornment>,
                                }}
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                      event.preventDefault();
                                    }
                                }}
                            />
                        )}
                    />
                    <Controller
                        name="max_no_of_uploads"
                        control={ control }
                        render={({ field }) => (
                            <TextField 
                                {...field}
                                type="tel"
                                label="Max no. of uploads"
                                id="outlined-start-adornment"
                                sx={{ width: '100%'}}  
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                      event.preventDefault();
                                    }
                                }}              
                            />
                        )}
                    />
                </div>

                <div className='w-full mb-20'>
                    <Typography variant="subtitle1">Select File Types</Typography>
                    {
                        Object.keys(types).map((item, indx) => {
                            return (
                                <Accordion key={indx} expanded={expanded === 'panel' + indx} onChange={handleChange('panel' + indx)}>
                                    <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                    >
                                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                                            { item.toUpperCase() }
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {
                                            types[item].map((v, i) => {
                                                return (
                                                    <FormControlLabel 
                                                        key={i} 
                                                        control={
                                                            <Checkbox 
                                                                checked={ 
                                                                    Object.keys(fileTypes).length && fileTypes[item][i].checked ? true : false
                                                                } 
                                                                name={item} 
                                                                onChange={handleCheck} 
                                                                value={ v.mime_type } 
                                                            />
                                                        } 
                                                        label={v.ext} 
                                                    />
                                                )
                                            })
                                        }
                                    </AccordionDetails>
                                </Accordion>
                            )
                        })
                    }
                </div>
                {
                    // (hasPermission('save') || hasPermission('update')) && (
                        <motion.div
                            className="flex"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                            >
                            <LoadingButton
                                className="whitespace-nowrap mx-4 mt-5"
                                variant="contained"
                                color="secondary"
                                type="submit"
                                disabled={ !Object.keys(dirtyFields).length || !isValid}
                                loading={ loading }
                            >
                                Update
                            </LoadingButton>
                            
                        </motion.div>
                    // )
                }
                
            </form>
        </Box>
    )
}

export default FormField