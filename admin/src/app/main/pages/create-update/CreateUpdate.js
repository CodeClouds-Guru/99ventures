import { useState, useEffect } from 'react';
import { Typography, FormControl, TextField, Paper, FormHelperText, InputLabel, Button, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails, TextareaAutosize, FormGroup, FormControlLabel, Switch } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import { selectUser } from 'app/store/userSlice';

const fullscreenEnable = () => {
    var fullScrFn;
    if(document.querySelector('.gjs-mdl-dialog').requestFullscreen){
        fullScrFn = document.querySelector('.gjs-mdl-dialog').requestFullscreen();
    } else if(
        document.querySelector('.gjs-mdl-dialog').webkitRequestFullscreen ||
        typeof document.querySelector('.gjs-mdl-dialog').webkitRequestFullscreen === 'undefined'
    ){
        fullScrFn = document.querySelector('.gjs-mdl-dialog').webkitRequestFullscreen(); 
    } else if(document.querySelector('.gjs-mdl-dialog').msRequestFullscreen){
        fullScrFn = document.querySelector('.gjs-mdl-dialog').msRequestFullscreen(); 
    } else if(document.querySelector('.gjs-mdl-dialog').mozRequestFullScreen ){
        fullScrFn = document.querySelector('.gjs-mdl-dialog').mozRequestFullScreen(); 
    }

    if(fullScrFn) {
        fullScrFn.then(r => {
            console.log('Open full screen');
            document.querySelector('.gjs-mdl-dialog').classList.add('gjs-fullscreen-mode');
        })
    }
    return fullScrFn;
}

const exitfullscreenWindow = () => {
    var exitFn;
    if(document.exitFullscreen) {
        exitFn = document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
        exitFn = document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
        exitFn = document.webkitExitFullscreen();
    }
    if(exitFn) {
        exitFn.then(r => {
            console.log('exit full screen')
            document.querySelector('.gjs-mdl-dialog').classList.remove('gjs-fullscreen-mode')
        })
    }

    document.querySelector('.minimize').classList.add('hide-btn');
    document.querySelector('.maximize').classList.remove('hide-btn');
}

const CreateUpdate = () => {
    const module = 'pages';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const moduleId = useParams().moduleId;
    const storageKey = (moduleId !== 'create' && !isNaN(moduleId)) ? `gjs-pages-${moduleId}` : `gjs-pages-new`;
    const [loading, setLoading] = useState(false);
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [editor, setEditor] = useState({});
    const [errors, setErrors] = useState({});
    const [changeCount, setChangeCount] = useState(0);
    const [layoutOptions, setLayoutOptions] = useState([]);
    const [components, setComponents] = useState([]);
    const domain = `https://${user.loggedin_portal.domain}/`;
    const [expanded, setExpanded] = useState('panel1');

    const handleChangeExpand = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };
    const [allData, setAllData] = useState({
        auth_required: false,
        layout_id: 0,
        status: 'pending',
        name: '',
        slug: '',
        permalink: '',
        html: '',
        page_json: '',
        keywords: '',
        descriptions: '',
        meta_code: ''
    });

    useEffect(() => {
        const editor = grapesjs.init({
            container: '#gjs',
            allowScripts: 1,
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
            modal: {
                backdrop: false
            },
        });
        moduleId === 'create' ? getLayoutOptions(editor) : '';
        setEditor(editor);

        const pfx = editor.getConfig().stylePrefix
        const modal = editor.Modal
        const cmdm = editor.Commands
        const htmlCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone()
        const cssCodeViewer = editor.CodeManager.getViewer('CodeMirror').clone()
        const pnm = editor.Panels
        const fullscrBtn = document.createElement('button');
        fullscrBtn.setAttribute('title', 'Fullscreen')
        fullscrBtn.setAttribute('class', 'grapes-modal-editor-fullscreen maximize');
        fullscrBtn.innerHTML = '<i class="fa fa-window-maximize" aria-hidden="true"></i>';
        const minimizeBtn = document.createElement('button');
        minimizeBtn.setAttribute('title', 'Exit Fullscreen')
        minimizeBtn.setAttribute('class', 'grapes-modal-editor-fullscreen hide-btn minimize');
        minimizeBtn.innerHTML = '<i class="fa fa-window-minimize" aria-hidden="true"></i>';
        const closeBtn = document.createElement('button');
        closeBtn.setAttribute('title', 'Close')
        closeBtn.setAttribute('class', 'grapes-modal-editor-close');
        closeBtn.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>'
        const rootContainer = document.createElement('div');
        rootContainer.setAttribute('class', 'grapes-modal-editor-container');
        const editorHeader =  document.createElement('div');
        editorHeader.setAttribute('class', 'grapes-modal-editor-header');        
        editorHeader.append(fullscrBtn);
        editorHeader.append(minimizeBtn);
        editorHeader.append(closeBtn);
        const editorBody = document.createElement('div');
        editorBody.setAttribute('class', 'grapes-modal-editor-body');
        const editorFooter = document.createElement('div');
        editorFooter.setAttribute('class', 'grapes-modal-editor-footer');
        const btnEdit = document.createElement('button');
        rootContainer.append(editorHeader)

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
        });

        btnEdit.innerHTML = 'Save'
        btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import'
        btnEdit.onclick = function () {
            const html = htmlCodeViewer.editor.getValue()
            const css = cssCodeViewer.editor.getValue()
            editor.DomComponents.getWrapper().set('content', '')
            // editor.CssComposer.clear();            
            // const HTML_CSS = html.trim() + `<style>${css}</style>`
            editor.setComponents(html.trim());
            editor.setStyle(css);
            modal.close();
            if(document.fullscreenElement !== null) {
                exitfullscreenWindow();
            }
        }

        closeBtn.onclick = function () {
            modal.close();
            if(document.fullscreenElement !== null) {
                exitfullscreenWindow(); 
            }
        }
        //-- Edit Code popup Fullscreen ON|OFF
        minimizeBtn.onclick = function() {
            exitfullscreenWindow();
        }
        fullscrBtn.onclick = function() {
            fullscreenEnable().then(r => {
                minimizeBtn.classList.remove('hide-btn')
                fullscrBtn.classList.add('hide-btn');
            });

            /*const fullScrEl = document.fullscreenElement || document.webkitFullscreenElement;
            if(fullScrEl !== null && fullScrEl.classList.contains("gjs-editor-cont")){
                console.log('Closing FullScr')
                document.exitFullscreen().then(res => {
                    fullscreenEnable()
                })
            }
            else {
                if(document.querySelector('.gjs-mdl-dialog').classList.contains('gjs-fullscreen-mode')) {
                    exitfullscreenWindow() 
                } else {
                    fullscreenEnable()
                }
            }*/
            
        } 
        document.addEventListener("fullscreenchange", function(e) {
            if(document.fullscreenElement == null || document.webkitFullscreenElement == null) {
                document.querySelector('.gjs-mdl-dialog').classList.remove('gjs-fullscreen-mode');
                minimizeBtn.classList.add('hide-btn')
                fullscrBtn.classList.remove('hide-btn');
            }
            console.log('esc')
        });
        //-----

        cmdm.add('edit-code', {
            run: function (editor, sender) {
                sender && sender.set('active', 0)
                var htmlViewer = htmlCodeViewer.editor
                var cssViewer = cssCodeViewer.editor
                modal.setTitle('Edit code')
                var InnerHtml = editor.getHtml()
                var Css = editor.getCss();
                if (!htmlViewer && !cssViewer) {
                    const txtarea = editorTextAreaCreate(editorBody, 'HTML')
                    const cssarea = editorTextAreaCreate(editorBody, 'CSS')

                    editorFooter.append(btnEdit)
                    rootContainer.append(editorBody)
                    rootContainer.append(editorFooter)
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
        })

        // To enable JS in the editor
        cmdm.add('allowScripts', {
            run: function (editor) {
                editor.getConfig().allowScripts = 1;
            },
            stop: function (editor) {
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

            // Collapsed all the blocks accordian by default
            const categories = editor.BlockManager.getCategories();
            categories.each(category => {
                category.set('open', false).on('change:open', opened => {
                    opened.get('open') && categories.each(category => {
                        category !== opened && category.set('open', false)
                    })
                })
            });
            //------------ End ----------
        });

        editor.on('change:changesCount', (model) => {
            const changes = model.get('changesCount');
            if (changes) {
                setChangeCount(changeCount => changeCount + 1)
            }
        });
    }, []);

    const editorTextAreaCreate = (editorBody, title) => {
        const container = document.createElement('div')
        const childContainer = document.createElement('div')
        const titleContainer = document.createElement('div')
        const txtarea = document.createElement('textarea')

        container.setAttribute('class', 'gjs-cm-editor-c')
        // childContainer.setAttribute('id', 'gjs-cm-css')
        childContainer.setAttribute('class', 'gjs-cm-editor')
        titleContainer.setAttribute('class', 'gjs-cm-title')
        titleContainer.textContent = title
        childContainer.appendChild(titleContainer)
        childContainer.appendChild(txtarea)
        container.appendChild(childContainer)
        editorBody.appendChild(container)
        return txtarea
    }

    const loadEditorData = async (editor) => {
        if (moduleId !== 'create' && !isNaN(moduleId)) {
            getSingleRecordById(moduleId, editor);
        } else {
            const storageManager = editor.Storage;
            const data = storageManager.load();
            editor.loadProjectData(data);
            setAllData(prevData => {
                return {
                    ...prevData,
                    page_json: editor.getProjectData(),
                    html: generatedHTMLValue(editor),
                }
            })
        };
    }

    const generatedHTMLValue = (editor) => {
        let generatedHTML = '';

        if (editor.getHtml()) {
            const css = (editor.getCss()) ? `<style>${editor.getCss()}</style>` : '';
            const reg = /\<body[^>]*\>([^]*)\<\/body/m; // Removed body tag
            const htmlData = editor.getHtml().match(reg)[1];
            generatedHTML +=
                `<main>
                    ${css}
                    ${htmlData}            
                </main>`;
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
            ...allData,
            name: event.target.value,
            slug: Helper.stringToSlug(event.target.value),
            permalink: `${domain}${Helper.stringToSlug(event.target.value)}`
        }));
        dynamicErrorMsg('name', event.target.value.trim());
    }
    const createCustomComponentForEditor = (components_val, editor) => {
        components_val.map((val) => {
            editor.BlockManager.add(`block-${val.value}`, {
                label: val.value,
                category: 'Custom Component',
                attributes: {
                    class: 'fa fa-square'
                },
                content: '&nbsp;' + val.html // this nbsp added to add a blank space to add the HTML comment on the starting
            });
        })
        // Custom Component block accordian set collapsed by default
        editor.BlockManager.getCategories()._byId["Custom Component"].set("open", false)
    }
    const getLayoutOptions = (editor) => {
        axios.get(`/${module}/add`)
            .then((response) => {
                if (response.data.results) {
                    setLayoutOptions(response.data.results.fields.layouts.options);
                    setAllData({
                        ...allData,
                        layout_id: response.data.results.fields.layout_id.value
                    });
                    setComponents(response.data.results.fields.components.options);
                    createCustomComponentForEditor(response.data.results.fields.components.options, editor);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    const onSubmit = () => {
        const editorJsonBody = editor.getProjectData();
        if (!editorJsonBody.pages[0].frames[0].component.components) {
            dispatch(showMessage({ variant: 'error', message: 'Please add the value in page body' }));
            return;
        }

        if (!Object.keys(errors).length) {
            const params = {
                ...allData,
                name: allData.name.trim(),
                layout_id: allData.layout_id,
                status: allData.status,
                slug: !allData.slug ? '/' : allData.slug,
                permalink: allData.permalink,
                html: generatedHTMLValue(editor),
                page_json: editorJsonBody,
                auth_required: allData.auth_required ? 1 : 0
            }
            const endPoint = (moduleId !== 'create' && !isNaN(moduleId)) ? jwtServiceConfig.updatePages + `/${moduleId}` : jwtServiceConfig.savePages;

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

    const getSingleRecordById = (id, editor) => {
        axios.get(jwtServiceConfig.getSinglePage + `/${id}`)
            .then((response) => {
                if (response.data.results.result) {
                    setLayoutOptions(response.data.results.fields.layouts.options);
                    setComponents(response.data.results.fields.components.options);
                    const record = response.data.results.result;
                    setAllData(allData => ({
                        ...allData,
                        layout_id: record.layout_id,
                        status: record.status,
                        name: record.name,
                        slug: record.slug === '/' ? '' : record.slug,
                        permalink: record.permalink === domain ? domain : record.permalink !== domain + record.slug ? domain + record.slug : record.permalink,
                        html: record.html,
                        page_json: record.page_json,
                        keywords: record.keywords,
                        descriptions: record.descriptions,
                        meta_code: record.meta_code,
                        auth_required: !!record.auth_required,
                    }));
                    createCustomComponentForEditor(response.data.results.fields.components.options, editor);
                    editor.loadProjectData(record.page_json);

                    //-- Set to chnage state value to 0 because edior values fetched from DB and not done any changes by the user actually.
                    setChangeCount(changeCount => changeCount - 1);
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
        if (changeCount > 0) {
            setOpenAlertDialog(true);
        } else {
            navigate(`/app/${module}`);
            localStorage.removeItem(storageKey);
        }
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }

    const onConfirmAlertDialogHandle = () => {
        localStorage.removeItem(storageKey);
        setChangeCount(0);
        setOpenAlertDialog(true);
        navigate(`/app/${module}`)
    }

    const handleChangeLayout = (event) => {
        event.preventDefault();
        setAllData({
            ...allData,
            layout_id: event.target.value,
        });
        dynamicErrorMsg('layout_id', event.target.value);
    };
    const handleChangeStatus = (event) => {
        setAllData({
            ...allData,
            status: event.target.value,
        });
        dynamicErrorMsg('status', event.target.value);
    };
    const onSlugChange = (event) => {
        setAllData(allData => ({
            ...allData,
            slug: Helper.stringToSlug(event.target.value),
            permalink: `${domain}${Helper.stringToSlug(event.target.value)}`
        }));
        // dynamicErrorMsg('slug', Helper.stringToSlug(event.target.value));
    }
    const handleKeywords = (event) => {
        setAllData({
            ...allData,
            keywords: event.target.value,
        });
    };
    const handleDescriptions = (event) => {
        setAllData({
            ...allData,
            descriptions: event.target.value,
        });
    };
    const handleExternalMeta = (event) => {
        setAllData({
            ...allData,
            meta_code: event.target.value,
        });
    };
    const handleAuthRequired = (event) => {
        setAllData({
            ...allData,
            auth_required: event.target.checked,
        });
    }
    return ( 
        <>
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-2 px-16 sm:p-28 md:p-38 lg:p-52 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                        <div className="flex justify-end">
                            <FormControl className="w-2/12 mb-0 pr-10">
                                <FormGroup aria-label="position" row>
                                    <FormControlLabel
                                        value="top"
                                        control={<Switch
                                            className="mb-24"
                                            checked={allData.auth_required}
                                            onChange={handleAuthRequired}
                                        />}
                                        label="Authenticable"
                                        labelPlacement="top"
                                    />
                                </FormGroup>
                            </FormControl>
                            <FormControl className="w-2/12 mb-0 px-10">
                                <InputLabel id="demo-simple-select-label">Layout</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={allData.layout_id}
                                    label="Layout"
                                    onChange={handleChangeLayout}
                                    required
                                >
                                    <MenuItem value="0"> <em>None</em> </MenuItem>
                                    {layoutOptions.length > 0 ? layoutOptions.map((val, key) => {
                                        return (
                                            <MenuItem key={key} value={val.id}>{val.value}</MenuItem>
                                        )
                                    }) : ''
                                    }
                                </Select>
                                <FormHelperText error variant="standard">{errors.layout_id}</FormHelperText>
                            </FormControl>
                            <FormControl className="w-2/12 mb-0 px-10">
                                <InputLabel id="demo-simple-select-label" className="pl-10">Status</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={allData.status}
                                    label="Status"
                                    onChange={handleChangeStatus}
                                    required
                                >
                                    <MenuItem value=""> <em>None</em> </MenuItem>
                                    <MenuItem value="pending"> Pending</MenuItem>
                                    <MenuItem value="draft"> Draft</MenuItem>
                                    <MenuItem value="published">Published </MenuItem>
                                    <MenuItem value="archived">Archived </MenuItem>
                                </Select>
                                <FormHelperText error variant="standard">{errors.status}</FormHelperText>
                            </FormControl>
                        </div>
                        <Accordion expanded={expanded === 'panel1'} onChange={handleChangeExpand('panel1')}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Details Section</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormControl className="w-full mb-24">
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
                                <FormControl className="w-full mb-24">
                                    <TextField
                                        label="Slug"
                                        type="text"
                                        variant="outlined"
                                        value={allData.slug}
                                        onChange={onSlugChange}
                                    />
                                </FormControl>
                                <FormControl className="w-full mb-24 pl-10">
                                    <Typography component={'p'}>
                                        Permalink: &nbsp;&nbsp;
                                        <b>
                                            {allData.permalink}
                                        </b>
                                    </Typography>
                                </FormControl>

                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === 'panel2'} onChange={handleChangeExpand('panel2')}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel2a-content"
                                id="panel2a-header"
                            >
                                <Typography>Meta Tag Section</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormControl className="w-full mb-24">
                                    <TextField
                                        label="Keywords"
                                        id="fullWidth"
                                        className="mb-24"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        value={allData.keywords}
                                        onChange={handleKeywords}
                                    />
                                </FormControl>
                                <FormControl className="w-full mb-24">
                                    <TextField
                                        label="Description"
                                        id="fullWidth"
                                        className="mb-24"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        value={allData.descriptions}
                                        onChange={handleDescriptions}
                                    />
                                </FormControl>
                                <FormControl className="w-full mb-24">
                                    <pre>
                                        <code>
                                            <TextareaAutosize
                                                maxRows={10}
                                                aria-label="maximum height"
                                                placeholder="#Add your external Meta details as needed"
                                                value={allData.meta_code ? allData.meta_code : ''}
                                                style={{ minHeight: '80px', width: '100%', padding: '15px', backgroundColor: '#000', color: '#ffeeba' }}
                                                onChange={handleExternalMeta}
                                            />
                                        </code>
                                    </pre>
                                </FormControl>
                            </AccordionDetails>
                        </Accordion>
                        <FormControl className="w-full my-24">
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
            <AlertDialog
                content="Do you want to discard the changes?"
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={onCloseAlertDialogHandle}
            />
        </>
    )
}

export default CreateUpdate;