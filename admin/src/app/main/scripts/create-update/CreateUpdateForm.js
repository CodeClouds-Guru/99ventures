import { useState, useEffect, useRef } from 'react';
import { FormControl, TextField, Paper, FormHelperText, Switch, InputLabel, Button, TextareaAutosize } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import CreateEditHeader from '../../crud/create-edit/CreateEditHeader';
import AlertDialog from 'app/shared-components/AlertDialog';
// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import FroalaEditorComponent from 'react-froala-wysiwyg';
// Import all Froala Editor plugins;
import 'froala-editor/js/plugins.pkgd.min.js';


const CreateUpdateForm = () => {
    const moduleId = useParams().id;
    const module = 'scripts';
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errors, setErrors] = useState({});
    const [fullScreen, setFullScreen] = useState(false);
    const [allData, setAllData] = useState({
        name: '',
        script_html: '',
        script_json: {},
        status: true
    });

    useEffect(()=>{
        if (moduleId !== 'create' && !isNaN(moduleId)) {
            getSingleRecordById(moduleId);
        }        
    }, []);

    const handleChange = (e) => {
        setAllData({ ...allData, status: e.target.checked });
    };
    
    const dynamicErrorMsg = (field, value) => {
        if (value) {
            delete errors[field];
            setErrors(errors);
        } else {
            setErrors(errors => ({
                ...errors, [field]: `Please insert ${field}`
            }))
        }
    }

    const onNameChange = (event) => {
        setAllData(allData => ({
            ...allData, name: event.target.value
        }));
        dynamicErrorMsg('name', event.target.value);
    }

    const onSubmit = () => {
        if ( allData.script_html == "") {
            dispatch(showMessage({ variant: 'error', message: 'Please add the value in script body' }));
            return;
        }
        if (!Object.keys(errors).length) {
            const params = {
                ...allData
            }
            const endPoint = (moduleId !== 'create' && !isNaN(moduleId)) ? jwtServiceConfig.updateScriptsData + `/${moduleId}` : jwtServiceConfig.saveScriptsData;

            setLoading(true);
            axios.post(endPoint, params)
                .then((response) => {
                    setLoading(false);
                    if (response.data.results.status) {
                        setAllData({
                            ...allData,
                            ...params
                        });
                        dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                        if (moduleId === 'create') {
                            navigate(`/app/scripts/${response.data.results.result.id}`);
                        }
                        
                    } else {
                        dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                    }
                })
                .catch((error) => {
                    setLoading(false)
                    dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
                })
        }
    }

    const getSingleRecordById = (id) => {
        axios.get(jwtServiceConfig.getSingleScriptData + `/${id}`)
            .then((response) => {
                if (response.data.results.result) {
                    const record = response.data.results.result;
                    setAllData(allData => ({
                        ...allData,
                        name: record.name,
                        script_html: record.script_html,
                        script_json: record.script_json,
                        status: Boolean(record.status)
                    }));
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                console.log(error);
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }

    const handleCancel = () => {
        navigate(`/app/${module}`);
    }

    const handleModelChange = (e) =>{
        setAllData(allData => ({
            ...allData, script_html: e.target.value
        }));
    }
    return (
        <>
            <CreateEditHeader module={module} moduleId={moduleId} />
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full page">
                <Paper className="h-full sm:h-auto md:flex md:items-centerx md:justify-center w-full md:h-full md:w-full py-8 px-16  sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                        <FormControl className="w-1/2 mb-24 pr-24">
                            <TextField
                                label="Script Name"
                                type="text"
                                error={!!errors.name}
                                helperText={errors?.name?.message}
                                variant="outlined"
                                required
                                value={allData.name}
                                onChange={onNameChange}
                            />
                            <FormHelperText error variant="standard">{errors.name}</FormHelperText>
                        </FormControl>
                        <FormControl className="w-1/2 mb-24">
                            <InputLabel shrink htmlFor="status-switch">
                                Insets
                            </InputLabel>
                            <Switch
                                size="large"
                                id="status-switch"
                                checked={allData.status}
                                onChange={handleChange}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        </FormControl>
                        <FormControl className="w-full mb-24">
                            {/* <FroalaEditorComponent config={{attribution: false, heightMin: 300,}} tag='textarea' onModelChange={handleModelChange} model={ allData.script_html }/> */}

                            <pre>
                                <code>
                                    <textarea
                                        maxRows={10}
                                        aria-label="maximum height"
                                        placeholder=""
                                        value={ allData.script_html }
                                        className="custom-code-editor scripts-editor"
                                        onChange={handleModelChange}                                        
                                    ></textarea>
                                </code>
                            </pre>
                            <FormHelperText error variant="standard">{errors.script_html}</FormHelperText>
                        </FormControl>


                        <motion.div
                            className="flex"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                        >
                            <LoadingButton
                                variant="contained"
                                color="secondary"
                                aria-label="Register"
                                type="submit"
                                loading={loading}
                                onClick={onSubmit}
                                disabled={(Object.values(errors).length || !allData.name) ? true : false}
                            >
                                {moduleId === 'create' ? 'Save' : 'Update'}
                            </LoadingButton>
                            <Button
                                className="whitespace-nowrap mx-4"
                                variant="contained"
                                color="error"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </motion.div>
                    </div>
                </Paper>
            </div>
            
        </>
    )
}

export default CreateUpdateForm;