import { useState, useEffect } from 'react';
import { FormControl, TextField, Paper, FormHelperText, Switch, InputLabel, Button} from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import CreateEditHeader from '../../crud/create-edit/CreateEditHeader';
import AlertDialog from 'app/shared-components/AlertDialog';
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs/dist/grapes.min.js'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.js'
import '../ScriptStyle.css' 

const CreateUpdateForm = () => {
    const moduleId = useParams().id;
    const module = 'scripts';
    const storageKey = (moduleId !== 'create' && !isNaN(moduleId)) ? `gjs-script-${moduleId}` : `gjs-script-new`;
    const [ loading, setLoading ] = useState(false);
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const navigate = useNavigate();    
    const dispatch = useDispatch();    
    const [editor, setEditor] = useState({});
    const [errors, setErrors] = useState({});
    const [changeCount, setChangeCount] = useState(0);
    const [allData, setAllData] = useState({
        name: '',        
        script_html: '',
        script_json: '',
        status: true
    });

    const handleChange = (e) => {
        setAllData({...allData, status: e.target.checked});
    };

    useEffect(() => {
        const editor = grapesjs.init({
            container: '#gjs',
            protectedCss: '',   // disabled default CSS
            height: '700px',
            width: '100%',
            style: '.txt-red{color: red}',
            plugins: ["gjs-preset-webpage"],
            storageManager: {
                id: 'gjs-',
                type: 'local',
                options: {
                    local: { key: storageKey }
                },
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
            },
        });        
        setEditor(editor);

        const pfx = editor.getConfig().stylePrefix
        const modal = editor.Modal
        const cmdm = editor.Commands
        const htmlCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone()
        const cssCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone()
        const pnm = editor.Panels
        const rootContainer = document.createElement('div')
        const btnEdit = document.createElement('button')
        const codeViewerOpt = {
            readOnly: 0,
            theme: 'hopscotch',
            autoBeautify: true,
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            styleActiveLine: true,
            smartIndent: true,
            indentWithTabs: true
        }       

        htmlCodeViewer.set({
            codeName: 'htmlmixed',
            ...codeViewerOpt
        })

        cssCodeViewer.set({
            codeName: 'css',
            ...codeViewerOpt
        })

        btnEdit.innerHTML = 'Save'
        btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import'
        btnEdit.onclick = function () {
            const html = htmlCodeViewer.editor.getValue()
            const css = cssCodeViewer.editor.getValue()
            editor.DomComponents.getWrapper().set('content', '')
            // editor.CssComposer.clear();            
            // const HTML_CSS = html.trim() + `<style>${css}</style>`
            editor.setComponents(html.trim());
            editor.setStyle(css)
            modal.close()
        }
        
        cmdm.add('edit-code', {
            run: function (editor, sender) {
                sender && sender.set('active', 0)
                var htmlViewer = htmlCodeViewer.editor
                var cssViewer = cssCodeViewer.editor
                modal.setTitle('Edit code')
                var InnerHtml = editor.getHtml()                
                var Css = editor.getCss();
                if (!htmlViewer && !cssViewer) {
                    const txtarea = editorTextAreaCreate(rootContainer, 'HTML')
                    const cssarea = editorTextAreaCreate(rootContainer, 'CSS')

                    rootContainer.append(btnEdit)
                    htmlCodeViewer.init(txtarea)
                    cssCodeViewer.init(cssarea)
                    htmlViewer = htmlCodeViewer.editor
                    cssViewer = cssCodeViewer.editor              
                }
                modal.setContent('')
                modal.setContent(rootContainer)                
                htmlCodeViewer.setContent(InnerHtml)                
                cssCodeViewer.setContent(Css)
                modal.open({attributes: { class: 'custom-code-editor' }})
                htmlViewer.refresh()
                cssViewer.refresh()
            }
        })

        // Removed default read-only code editor btn from toolbar
        pnm.removeButton("options", 'export-template');

        pnm.addButton('options',
            [
                {
                    id: 'edit',
                    className: 'fa fa-code',
                    command: 'edit-code',
                    attributes: {
                        title: 'Edit Code'
                    }
                }
            ]
        );

        editor.onReady(() => {
            loadEditorData(editor);
        });

        editor.on('change:changesCount', (model) => {
            const changes = model.get('changesCount');
            if (changes) {
                setChangeCount(changeCount => changeCount +1)
            }
        });
    }, []);

    const editorTextAreaCreate = (rootContainer, title) => {
        const container = document.createElement('div')
        const childContainer = document.createElement('div')
        const titleContainer = document.createElement('div')
        const txtarea = document.createElement('textarea')
        
        container.setAttribute('class', 'gjs-cm-editor-c')
        childContainer.setAttribute('id', 'gjs-cm-css')
        childContainer.setAttribute('class', 'gjs-cm-editor')
        titleContainer.setAttribute('id', 'gjs-cm-title')
        titleContainer.textContent = title
        childContainer.appendChild(titleContainer)
        childContainer.appendChild(txtarea)
        container.appendChild(childContainer)
        rootContainer.appendChild(container)
        return txtarea
    }

    
    // useEffect(() => {
    //     console.log(changeCount)
    //     if(changeCount > 0)
    //         window.addEventListener("beforeunload", handleUnload);
    //     return () => {
    //       window.removeEventListener("beforeunload", handleUnload);
    //     };
    //   }, [changeCount]);
    
    //   const handleUnload = (e) => {
    //     const message = "Hello";
    //    (e || window.event).returnValue = message; //Gecko + IE
    //     return message;
    //   };
    

    const loadEditorData = async(editor) => {        
        if (moduleId !== 'create' && !isNaN(moduleId)) { 
            getSingleRecordById(moduleId, editor);
        } else {
            const storageManager = editor.Storage;
            const data = storageManager.load();
            editor.loadProjectData(data);
            setAllData({
                ...allData, 
                script_json: editor.getProjectData(),
                script_html: generatedHTMLValue(editor)
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

    const dynamicErrorMsg = (field, value) => {
        if(value){
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
        const editorJsonBody = editor.getProjectData();
        if(editorJsonBody.styles.length < 1){
            dispatch(showMessage({ variant: 'error', message: 'Please add the value in script body' }));
            return;
        }

        if(!Object.keys(errors).length){
            const params = {
                ...allData,
                script_html: generatedHTMLValue(editor),
                script_json: editorJsonBody,
                status: allData.status
            }
            const endPoint = (moduleId !== 'create' && !isNaN(moduleId)) ? jwtServiceConfig.updateScriptsData + `/${moduleId}` : jwtServiceConfig.saveScriptsData;            

            setLoading(true);
            axios.post(endPoint, params)
            .then((response) => {
                setLoading(false);
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
                    if(moduleId === 'create') {
                        navigate(`/app/scripts/${response.data.results.result.id}`);
                    }
                    // else
                    //     getSingleRecordById(moduleId, editor);
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

    const getSingleRecordById = (id, editor) => {
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
                editor.loadProjectData(record.script_json);

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
     * Else, clear the existing local storage value and rediect to list pagw.
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

    return (
        <>
            { module === 'tickets' ? '' : <CreateEditHeader module={module} moduleId={moduleId} />}
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-64 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
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
                                onChange={ onNameChange }
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
                            <div id="gjs" />
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
                                disabled={ ( Object.values(errors).length || !allData.name) ? true : false } 
                            >
                                {moduleId === 'create' ? 'Save' : 'Update'}
                            </LoadingButton>
                            <Button
                                className="whitespace-nowrap mx-4"
                                variant="contained"
                                color="error"
                                onClick={ handleCancel }
                            >
                                Cancel
                            </Button>
                        </motion.div>
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