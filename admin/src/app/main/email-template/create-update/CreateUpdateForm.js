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
import CreateEditHeader from '../../crud/create-edit/CreateEditHeader';
import AlertDialog from 'app/shared-components/AlertDialog';
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs/dist/grapes.min.js'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.js'

const CreateUpdateForm = ({ input, meta }) => {
    const module = 'email-templates';
    const inputElement = useRef('subject');
    // const textAreaElement = useRef('template');
    const [currentFocusedElement, setCurrentFocusedElement] = useState('');
    const moduleId = useParams().id;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [actionOptions, setActionOptions] = useState([]);
    const [variableOptions, setVariableOptions] = useState([]);
    const [editor, setEditor] = useState({});
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [changeCount, setChangeCount] = useState(0);
    const storageKey = (moduleId !== 'create' && !isNaN(moduleId)) ? `gjs-email-${moduleId}` : `gjs-email-new`;
    const [allData, setAllData] = useState({
        subject: '',
        action: '',
        variable: '',
        insertedHtml: '',
    });
    /*const [errors, setErrors] = useState({
        subject: '',
        action: '',
        insertedHtml: '',
        bodyJson: ''
    })*/
    const [errors, setErrors] = useState({})


    useEffect(() => {
        getFieldData();
        const editor = grapesjs.init({
            container: '#gjs',
            height: '700px',
            width: '100%',
            plugins: ['gjs-preset-webpage'],
            storageManager: {
                options: {
                    local: { key: storageKey }
                },
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
        });
        setEditor(editor);

        editor.onReady(() => {
            loadEditorData(editor);
        });
        editor.on('change:changesCount', (model) => {
            const changes = model.get('changesCount');
            if (changes) {
                setChangeCount(changeCount => changeCount +1)
            }
        });

        // if (moduleId !== 'create') { getSingleEmailTemplate(moduleId) }
    }, []);

    const loadEditorData = async(editor) => {        
        if (moduleId !== 'create' && !isNaN(moduleId)) { 
            getSingleEmailTemplate(moduleId, editor);
        } else {
            const storageManager = editor.Storage;
            const data = storageManager.load();
            editor.loadProjectData(data);
            setAllData({
                ...allData, 
                bodyJson: editor.getProjectData(),
                insertedHtml: generatedHTMLValue(editor)
            });
        };
    }

    const generatedHTMLValue = (editor) =>{
        let generatedHTML = '';

        if(editor.getHtml()) {
            generatedHTML += 
            `<html>`;
                if(editor.getCss()){
                    generatedHTML += `<head><style>${editor.getCss()}</style></head>`;
                }
                generatedHTML += `${editor.getHtml()}
            </html>`;
        }
        return generatedHTML;
    }
    
    const dynamicErrorMsg = (field, value, msg) => {
        if(value){
            delete errors[field];
            setErrors(errors);
        } else {
            setErrors(errors => ({
                ...errors, [field]: msg
            }))
        }
    }

    const onSubjectChange = (event) => {
        setAllData(allData => ({
            ...allData, 
            subject: event.target.value
        }))
        dynamicErrorMsg('subject', event.target.value, 'Please insert subject');
    }

    /*const onChangeInEditor = (input) => {
        if (input) {
            setAllData(allData => ({
                ...allData, insertedHtml: input
            }));
        }
        dynamicErrorMsg('insertedHtml', input);
    }*/

    const handleChangeAction = (event) => {
        setAllData(allData => ({
            ...allData, action: event.target.value
        }))
        dynamicErrorMsg('action', event.target.value, 'Please select action');

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
    
    const onSubmit = () => {
        let end_point = moduleId === 'create' ? jwtServiceConfig.saveEmailTemplates : jwtServiceConfig.updateEmailTemplates + `/${moduleId}`;       
        const editorJsonBody = editor.getProjectData();
        if(editorJsonBody.styles.length < 1){
            dispatch(showMessage({ variant: 'error', message: 'Please add the value in the email body' }));
            return;
        };
        const params = {
            subject: allData.subject,
            body: generatedHTMLValue(editor),
            body_json: editorJsonBody,
            email_actions: allData.action
        };
        axios.post(end_point, params)
        .then((response) => {
            if (response.data.results.status) {
                // After successfully saved the changes, need to remove the local storage value and change state to 0.
                // New Localstorage value will be set after that.
                setChangeCount(0);
                localStorage.removeItem(storageKey);

                setAllData({
                    ...allData,
                    ...params
                });

                dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                if(moduleId === 'create') navigate(`/app/${module}/${response.data.results.id}`) ;
            } else {
                dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
            }
        })
        .catch((error) => {
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
        })
    }

    const getSingleEmailTemplate = (id, editor) => {
        axios.get(jwtServiceConfig.getSingleEmailTemplate + `/${id}`)
            .then((response) => {
                if (response.data.results.result) {
                    const result = response.data.results.result;
                    setAllData(allData => ({
                        ...allData,
                        action: result.EmailActions[0].id,
                        subject: result.subject,
                        insertedHtml: result.body,
                        variable: ''
                    }));
                    editor.loadProjectData(result.body_json);

                    //-- Set to chnage state value to 0 because edior values fetched from DB and not done any changes by the user actually.
                    setChangeCount(changeCount=> changeCount-1);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }

    /**
     * Cancel and go back to list page
     * If editor changes have been made then show the alert dialog.
     * Else, clear the existing local storage value and rediect to list page.
     */
     const handleCancel = () => {
        if(changeCount > 0) {
            setOpenAlertDialog(true);
        } else {
            navigate(`/app/${module}`);
            localStorage.removeItem(storageKey);
        }
    }

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
        localStorage.removeItem(storageKey);
        setChangeCount(0);
        setOpenAlertDialog(true);
        navigate(`/app/${module}`)
    }

    /**
     * Form disabled check
     */
    const checkDisabled = () => {
       return ( Object.values(errors).length || !allData.subject || !allData.action ) ? true : false
    }

    return (
        <>
            <CreateEditHeader module={module} moduleId={moduleId} />
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

                        <span className="flex items-center">
                            <Button
                                variant="contained"
                                color="secondary"
                                className=""
                                aria-label="Save"
                                type="submit"
                                size="large"
                                onClick={onSubmit}
                                disabled={ checkDisabled() } 
                            >
                                {moduleId === 'create' ? 'Save' : 'Update'}
                            </Button>
                            <Button
                                className="whitespace-nowrap mx-4"
                                variant="contained"
                                color="error"
                                onClick={ handleCancel }
                            >
                                Cancel
                            </Button>
                        </span>
                    </div>
                </Paper>
            </div>
            <AlertDialog
                content="Do you want to discard the changes?"
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={onCloseAlertDialogHandle}
            />
        </>
    )
}

export default CreateUpdateForm;