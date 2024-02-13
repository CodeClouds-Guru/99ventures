import { useRef, useState, useEffect } from 'react';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Button, FormControl, TextField, Paper, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import _ from '@lodash';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import CreateEditHeader from '../../crud/create-edit/CreateEditHeader';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AlertDialog from 'app/shared-components/AlertDialog';
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs/dist/grapes.min.js'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.js'
import '../EmailTemplate.css'
import '../../scripts/ScriptStyle.css'
import grapesjspresetnewsletter from 'grapesjs-preset-newsletter';
import { newsletterEditor } from '../../../grapesjs/newsletterPlugin'

const CreateUpdateForm = ({ input, meta }) => {
    const module = 'email-templates';
    const inputElement = useRef('subject');
    const dropDownBtnRef = useRef();
    const dropDownListRef = useRef();
    // const textAreaElement = useRef('template');
    // const [currentFocusedElement, setCurrentFocusedElement] = useState('');
    const moduleId = useParams().id;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [actionOptions, setActionOptions] = useState([]);
    const [variableOptions, setVariableOptions] = useState([]);
    const [editor, setEditor] = useState({});
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [changeCount, setChangeCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false)
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
            plugins: [grapesjspresetnewsletter, newsletterEditor],
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

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); 


    /**
     * Disabled variable dropdown by clicking outside
     */
    const handleClickOutside = (e) => {
        if(
            inputElement.current.contains(e.target) || 
            dropDownBtnRef.current.contains(e.target) || 
            dropDownListRef.current.contains(e.target)
        ) {
            return;
        }
        setShowDropdown(false);
    }

    /**
     * Set select option in Rich Text Editor
     */
    useEffect(()=>{
        if(variableOptions.length) {           
            let selectHTML = `<select class="gjs-field"><option value="">- Select -</option>`
            variableOptions.map(op => {
                selectHTML += `<option value="${op.code}">${op.name}</option>`
            })
            selectHTML += `</select>`;
            editor.RichTextEditor.add('custom-vars', {
                icon: selectHTML,                    
                event: 'change',    // Bind the 'result' on 'change' listener
                result: (rte, action) => rte.insertHTML(action.btn.firstChild.value),
                // Reset the select on change
                update: (rte, action) => { action.btn.firstChild.value = "";}
            })
        }
    }, [variableOptions])

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
            const css = (editor.getCss()) ? `<style>${editor.getCss()}</style>` : '';            
            generatedHTML += 
            `<html>
                <head>
                    <title>${allData.name}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${css}
                </head>
                ${editor.getHtml()}            
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

    const handleChangeAction = (event) => {
        setAllData(allData => ({
            ...allData, action: event.target.value
        }))
        dynamicErrorMsg('action', event.target.value, 'Please select action');

    }
    
    const handleChangeVariable = (value) => {
        setAllData(allData => ({
            ...allData, variable: value
        }))
        // if (currentFocusedElement === 'template') {
        //   }  setAllData({ ...allData, insertedHtml: `${allData.insertedHtml} ${event.target.value}` })
        //if (currentFocusedElement === 'subject') {
            setAllData({ ...allData, subject: `${allData.subject} ${value}` })
        //}
        setShowDropdown(!showDropdown)
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
        if(!editorJsonBody.pages[0].frames[0].component.components){
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
                    setActionOptions(actionOptions => [{id: result.EmailActions[0].id, action: result.EmailActions[0].action}, ...actionOptions]);
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
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-40 md:p-36 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0">
                        <FormControl className="w-1/2 mb-24 pr-10">
                            <InputLabel id="demo-simple-select-label">Action*</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={+allData.action}
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

                        <FormControl className="w-full mb-24 input--group">
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
                                onFocus={() => setShowDropdown(false)}
                            />
                            <div className="input-group-append">
                                <button ref={ dropDownBtnRef } className="btn btn-outline-primary dropdown-toggle MuiButton-root MuiButton-contained MuiButton-containedError MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButtonBase-root whitespace-nowrap muiltr-13n15ve-MuiButtonBase-root-MuiButton-root" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick={()=> setShowDropdown(!showDropdown)}>Select Variable <KeyboardArrowDownIcon className="ml-5" /></button>
                                <div ref={ dropDownListRef } className="dropdown-menu" style={{ display: showDropdown ? 'block' : 'none' }}>
                                    {
                                        variableOptions.map(value => {
                                            return <a 
                                                key={value.id} 
                                                className="dropdown-item" 
                                                href="#"
                                                onClick={ 
                                                    (e)=> {
                                                        e.preventDefault();
                                                        handleChangeVariable(value.code)
                                                    }
                                                }
                                            >{value.name}</a>
                                        })
                                    }
                                </div>
                            </div>
                            <FormHelperText error variant="standard">{errors.subject}</FormHelperText>
                        </FormControl>

                        <FormControl className="w-full mb-24">                           
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