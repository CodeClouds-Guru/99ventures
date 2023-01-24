import { useState, useEffect } from 'react';
import { FormControl, TextField, Paper, FormHelperText, Switch, InputLabel, Button, Tooltip, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import AlertDialog from 'app/shared-components/AlertDialog';
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs/dist/grapes.min.js'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.js'
import '../../scripts/ScriptStyle.css';
import Helper from 'src/app/helper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { getComponentData, setRevisionData } from 'app/store/components'

const CreateUpdate = (props) => {
    const moduleId = useParams().moduleId;
    const module = 'components';
    const storageKey = (moduleId !== 'create' && !isNaN(moduleId)) ? `gjs-component-${moduleId}` : `gjs-component-new`;
    const [loading, setLoading] = useState(false);
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const selectComponentData = useSelector(state => state.components.component_data);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [editor, setEditor] = useState({});
    const [errors, setErrors] = useState({});
    const [changeCount, setChangeCount] = useState(0);
    const [msg, setMsg] = useState('');
    const [alertFor, setAlertFor] = useState('');
    const selectRevisionCount = useSelector(state => state.components.revisions_count);
    const [allData, setAllData] = useState({
        name: '',
        html: '',
        component_json: ''
    });


    useEffect(() => {
        dispatch(setRevisionData([]));
        const editor = grapesjs.init({
            allowScripts: 1,
            container: '#gjs',
            fromElement: false,
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
            }
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
                modal.open({ attributes: { class: 'custom-code-editor' } })
                htmlViewer.refresh()
                cssViewer.refresh()
            }
        });

        // To enable JS in the editor
        cmdm.add('allowScripts', {
            run: function(editor) {
              editor.getConfig().allowScripts = 1;
            },
            stop: function(editor) {
              editor.getConfig().allowScripts = 0;
            },
        });

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
                setChangeCount(changeCount => changeCount + 1)
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

    const loadEditorData = async (editor) => {
        if (moduleId !== 'create' && !isNaN(moduleId)) {
            getSingleRecordById(moduleId, editor);
        } else {
            const storageManager = editor.Storage;
            const data = storageManager.load();
            editor.loadProjectData(data);
            setAllData({
                ...allData,
                component_json: editor.getProjectData(),
                html: generatedHTMLValue(editor)
            });
        };
    }

    const getSingleRecordById = (id, editor) => {
        dispatch(getComponentData({ module_id: id }))
    }

    useEffect(() => {
        if (Object.keys(editor).length && Object.keys(selectComponentData).length && moduleId !== 'create' && !isNaN(moduleId)) {
            setAllData(allData => ({
                ...allData,
                name: selectComponentData.name,
                html: selectComponentData.html,
                component_json: selectComponentData.component_json
            }));
            editor.loadProjectData(selectComponentData.component_json);

            //-- Set to chnage state value to 0 because edior values fetched from DB and not done any changes by the user actually.
            setChangeCount(changeCount => changeCount - 1);
        }
    }, [selectComponentData]);

    const generatedHTMLValue = (editor) => {
        let generatedHTML = '';

        if (editor.getHtml()) {
            const css = (editor.getCss()) ? `<style>${editor.getCss()}</style>` : '';
            const reg = /\<body[^>]*\>([^]*)\<\/body/m; // Removed body tag
            const htmlData = editor.getHtml().match(reg)[1];
            generatedHTML += `${css}\n${htmlData}`;
        }
        if((moduleId !== 'create' && !isNaN(moduleId))){
            generatedHTML = generatedHTML.replace(/<\!--.*?-->/g, "");   // To remove HTML Comment tag
        }
        return generatedHTML;
    }

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
        dynamicErrorMsg('name', event.target.value.trim());
    }

    const onSubmit = () => {
        props.toggleSidebar(false);
        const editorJsonBody = editor.getProjectData();
        if (!editorJsonBody.pages[0].frames[0].component.components) {
            dispatch(showMessage({ variant: 'error', message: 'Please add the value in the editor' }));
            return;
        }
        /**
         * Confirmation popup will only show when editor body has been changed & updating time
         */
        if (changeCount > 0 && (moduleId !== 'create' && !isNaN(moduleId))) {
            setAlertFor('update');
            setMsg('Do you want to update the changes?');
            setOpenAlertDialog(true);
        } else {
            handleFormSubmit();
        }
    }

    const addCommentWrapper = (components, componentName) => {
        return [
            {tagName: 'NULL', type: 'comment', content: ` Start ${componentName} comment `},
            ...components,
            {tagName: 'NULL', type: 'comment', content: ` End ${componentName} comment `}
        ]
    }

    const handleFormSubmit = () => {
        if (!Object.keys(errors).length) {
            const editorJsonBody = editor.getProjectData();
            const componentName = allData.name.trim();
                       
            // to add the comment in html 
            const components = editorJsonBody.pages[0].frames[0].component.components;
            if(moduleId === 'create'){
                editorJsonBody.pages[0].frames[0].component.components = addCommentWrapper(components, componentName);
            } else {
                // If the comment has been removed by the user manually or not, we filter all the comment tags here,
                // because comment tags will be added again at the top and end of the content.
                const filterComponents = components.filter(cmp => cmp.type !== 'comment');
                editorJsonBody.pages[0].frames[0].component.components = addCommentWrapper(filterComponents, componentName);
            }
            //--------

            const params = {
                ...allData,
                html: `<!-- Start ${componentName} comment -->\n ${generatedHTMLValue(editor)}\n <!-- End ${componentName} comment -->`,
                component_json: editorJsonBody,
                name: componentName
            }
            const endPoint = (moduleId !== 'create' && !isNaN(moduleId)) ? jwtServiceConfig.updateComponents + `/${moduleId}` : jwtServiceConfig.saveComponents;

            setLoading(true);
            axios.post(endPoint, params)
                .then((response) => {
                    setLoading(false);
                    if (response.data.results.status) {
                        setChangeCount(0);
                        localStorage.removeItem(storageKey);

                        setAllData({
                            ...allData,
                            ...params
                        });
                        dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                        navigate(`/app/${module}`);
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

    /**
     * Cancel and go back to list page
     * If editor changes have been made then show the alert dialog.
     * Else, clear the existing local storage value and rediect to list pagw.
     */
    const handleCancel = () => {
        if (changeCount > 0) {
            setAlertFor('cancel');
            setMsg('Do you want to discard the changes?');
            setOpenAlertDialog(true);
        } else {
            navigate(`/app/${module}`);
            localStorage.removeItem(storageKey);
        }
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
        setAlertFor('');
    }

    /**
     * Confirm Alert Dialog.
     * If the alert box related to the Cancel
        * It will redirect user to list page.
        * At the same time need to clear the auto save value from local storage.
        * ChangeCount value set to 0.
     *
     * If the alert box related to the Update
        * Submit the form
     */
    const onConfirmAlertDialogHandle = () => {
        if (alertFor === 'cancel') {
            localStorage.removeItem(storageKey);
            setChangeCount(0);
            setOpenAlertDialog(true);
            navigate(`/app/${module}`);
        } else if (alertFor === 'update') {
            handleFormSubmit();
        }
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                        <div className='flex justify-between'>
                            <FormControl className="w-1/2 mb-24">
                                <TextField
                                    label="Name"
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
                            {
                                (selectRevisionCount > 0) && (
                                    <div>
                                        <Tooltip title="Show History">
                                            <IconButton size="small" color="primary" aria-label="History" component="label" onClick={() => props.toggleSidebar(true)}>
                                                <FuseSvgIcon className="text-48" size={24} color="action">feather:git-branch</FuseSvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                )
                            }
                        </div>
                        <FormControl className="w-full mb-24">
                            <div id="gjs" />
                            <FormHelperText error variant="standard">{errors.html}</FormHelperText>
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
                                disabled={(Object.values(errors).length || !allData.name || (changeCount < 1 && selectComponentData.name === allData.name)) ? true : false}
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
            <AlertDialog
                content={msg}
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={onCloseAlertDialogHandle}
            />
        </>
    )
}

export default CreateUpdate;