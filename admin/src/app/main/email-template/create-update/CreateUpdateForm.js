import { useRef, useState, useEffect } from 'react';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import WYSIWYGEditor from 'app/shared-components/WYSIWYGEditor';
import { Controller, useForm } from 'react-hook-form';
import { Button, Checkbox, FormControl, FormControlLabel, TextField, Paper, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import _ from '@lodash';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { Link, useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import CreateUpdateFormHeader from './CreateUpdateFormHeader';
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs/dist/grapes.min.js'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.js'

const CreateUpdateForm = ({ input, meta }) => {
    const inputElement = useRef('subject');
    const textAreaElement = useRef('template');
    const [currentFocusedElement, setCurrentFocusedElement] = useState('');
    const moduleId = useParams().id;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [actionOptions, setActionOptions] = useState([]);
    const [variableOptions, setVariableOptions] = useState([]);
    const [allData, setAllData] = useState({
        subject: '',
        action: '',
        variable: '',
        insertedHtml: '',
    });
    const [errors, setErrors] = useState({
        subject: '',
        action: '',
        variable: '',
        insertedHtml: '',
    })
    useEffect(() => {
        getFieldData();
        grapesjs.init({
            container: '#gjs',
            height: '700px',
            width: '100%',
            plugins: ['gjs-preset-webpage'],
            storageManager: {
                id: 'gjs-',
                type: 'local',
                autosave: true,
                storeComponents: true,
                storeStyles: true,
                storeHtml: true,
                storeCss: true,
            },
            deviceManager: {
                devices:
                    [
                        {
                            id: 'desktop',
                            name: 'Desktop',
                            width: '',
                        },
                        {
                            id: 'tablet',
                            name: 'Tablet',
                            width: '768px',
                            widthMedia: '992px',
                        },
                        {
                            id: 'mobilePortrait',
                            name: 'Mobile portrait',
                            width: '320px',
                            widthMedia: '575px',
                        },
                    ]
            },
            pluginsOpts: {
                'grapesjs-preset-webpage': {
                    blocksBasicOpts: {
                        blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video'],
                        flexGrid: 1,
                    },
                    blocks: ['link-block', 'quote', 'text-basic'],
                },
            }
        })
        if (moduleId !== 'create') { getSingleEmailTemplate(moduleId) }
    }, []);
    const dynamicErrorMsg = (fieldName, value) => {
        !value ? setErrors(errors => ({
            ...errors, fieldName: value
        })) : setErrors(errors => ({
            ...errors, fieldName: `Please insert ${fieldName}`
        }))
    }
    const onSubjectChange = (event) => {
        if (event.target.value) {
            setAllData(allData => ({
                ...allData, subject: event.target.value
            }))
        }
        dynamicErrorMsg('subject', event.target.value);
    }
    const onChangeInEditor = (input) => {
        if (input) {
            setAllData(allData => ({
                ...allData, insertedHtml: input
            }));
        }
        dynamicErrorMsg('insertedHtml', input);
    }
    const handleChangeAction = (event) => {
        if (event.target.value) {
            setAllData(allData => ({
                ...allData, action: event.target.value
            }))
        }
        dynamicErrorMsg('action', event.target.value);

    }
    const handleChangeVariable = (event) => {
        setAllData(allData => ({
            ...allData, variable: event.target.value
        }))
        if (currentFocusedElement === 'template') {
            setAllData({ ...allData, insertedHtml: `${allData.insertedHtml} ${event.target.value}` })
        } else if (currentFocusedElement === 'subject') {
            setAllData({ ...allData, subject: `${allData.subject} ${event.target.value}` })
        }
    }

    const getFieldData = () => {
        axios.get(jwtServiceConfig.getEmailTemplatesFieldData)
            .then((response) => {
                if (response.data.results.status) {
                    setActionOptions(response.data.results.fields.email_actions.options);
                    setVariableOptions(response.data.results.fields.email_template_variables.options);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    // console.log('data', allData);
    const onSubmit = () => {
        // Object.values(allData).forEach((val, key) => {
        //     console.log(key, val)
        //     dynamicErrorMsg(Object.keys(allData)[key], `Please insert ${val}`);
        // })
        // return
        let end_point = moduleId === 'create' ? jwtServiceConfig.saveEmailTemplates : jwtServiceConfig.updateEmailTemplates + `/${moduleId}`;
        // console.log(end_point)
        // return
        axios.post(end_point, {
            subject: allData.subject,
            // body: allData.insertedHtml,
            body: 'Demo static body text 2',
            email_actions: allData.action
        })
            .then((response) => {
                if (response.data.results.status) {
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                    moduleId === 'create' ? navigate(`/app/email-templates/${response.data.results.id}`) : getSingleEmailTemplate(moduleId);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    const getSingleEmailTemplate = (id) => {
        axios.get(jwtServiceConfig.getSingleEmailTemplate + `/${id}`)
            .then((response) => {
                if (response.data.results.result) {
                    setAllData(allData => ({
                        ...allData,
                        action: response.data.results.result.EmailActions[0].id,
                        subject: response.data.results.result.subject,
                        insertedHtml: response.data.results.result.body,
                        variable: ''
                    }));
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    return (
        <>
            <CreateUpdateFormHeader moduleId={moduleId} />
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-64 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0">
                        <FormControl className="w-1/2 mb-24 pr-10">
                            <InputLabel id="demo-simple-select-label">Action*</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={allData.action}
                                label="Action"
                                onChange={handleChangeAction}
                            >
                                <MenuItem value="">Select an action</MenuItem>
                                {actionOptions.map((value) => {
                                    return <MenuItem key={value.id} value={value.id}>{value.action}</MenuItem>
                                })}
                            </Select>
                            <FormHelperText error variant="standard">{errors.action}</FormHelperText>
                        </FormControl>

                        <FormControl className="w-1/2 mb-24">
                            <InputLabel id="demo-simple-select-label">Variable</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={allData.variable}
                                label="Variable"
                                onChange={handleChangeVariable}
                            >
                                <MenuItem value="">Select a variable</MenuItem>
                                {variableOptions.map((value) => {
                                    return <MenuItem key={value.id} value={value.code}>{value.name}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                        <FormControl className="w-full mb-24">
                            <TextField
                                label="Subject"
                                type="text"
                                error={!!errors.subject}
                                helperText={errors?.subject?.message}
                                variant="outlined"
                                required
                                fullWidth
                                value={allData.subject}
                                onChange={onSubjectChange}
                                ref={inputElement}
                                onFocus={() => setCurrentFocusedElement('subject')}
                            />
                            <FormHelperText error variant="standard">{errors.subject}</FormHelperText>
                        </FormControl>

                        <FormControl className="w-full mb-24">
                            {/* <WYSIWYGEditor
                                ref={textAreaElement}
                                onChange={onChangeInEditor}
                                onFocus={() => setCurrentFocusedElement('template')}
                            /> */}
                            <div id="gjs" />
                            <FormHelperText error variant="standard">{errors.insertedHtml}</FormHelperText>
                        </FormControl>

                        <span className="flex items-center justify-center">
                            <Button
                                variant="contained"
                                color="secondary"
                                className="w-1/2 mt-24"
                                aria-label="Save"
                                type="submit"
                                size="large"
                                onClick={onSubmit}
                            >
                                {moduleId === 'create' ? 'Save' : 'Update'}
                            </Button>
                        </span>
                    </div>
                </Paper>
            </div>

        </>
    )
}

export default CreateUpdateForm;