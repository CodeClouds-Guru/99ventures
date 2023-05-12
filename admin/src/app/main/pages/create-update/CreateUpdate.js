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
import { customComponents, scriptBlockManager, compoentBlockManager } from '../../../grapesjs/componentPlugins'
import { customCheckboxTrait, memberTrait } from '../../../grapesjs/traitPlugins'
import { customCodeEditor } from '../../../grapesjs/editorPlugins'

const replaceSpecialCharacters = (string)=>{
    return string
        .replaceAll(/&gt;/g, '>')
        .replaceAll(/&lt;/g, '<')
        .replaceAll(/&quot;/g, '"')
        .replaceAll(/&#039;/g, "'")
        .replaceAll(/&#96;/g, '`');
}


const CreateUpdate = () => {
    const module = 'pages';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const moduleId = useParams().moduleId;
    const [storageKey, setStorageKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [editor, setEditor] = useState({});
    const [errors, setErrors] = useState({});
    const [changeCount, setChangeCount] = useState(0);
    const [layoutOptions, setLayoutOptions] = useState([]);    
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
            // autorender: false,
            container: '#gjs',
            allowScripts: 1,
            protectedCss: '',   // disabled default CSS
            height: '700px',
            width: '100%',
            style: '.txt-red{color: red}',
            plugins: ["gjs-preset-webpage", customCodeEditor, customComponents, scriptBlockManager, compoentBlockManager, customCheckboxTrait, memberTrait],
            storageManager: {
                id: 'gjs-',
                type: 'local',
                options: {
                    local: { key: storageKey }
                },
                autosave: !false,
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
                }
            },
            modal: {
                backdrop: false
            },
        });
        setEditor(editor); 

        editor.onReady(() => {    
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
        })
    }, []);

    useEffect(()=>{
        if(Object.keys(editor).length){
            getLayoutOptions(editor);                
        }
    }, [editor])

    const loadEditorData = async (editor) => {
        if (moduleId !== 'create' && !isNaN(moduleId)) {
            getSingleRecordById(moduleId, editor);
        } else {
            const storageManager = editor.Storage;
            storageManager.getStorageOptions()['key'] = 'gjs-pages-new';
            setStorageKey('gjs-pages-new')
            const data = await storageManager.load();           
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
            var htmlData = editor.getHtml().match(reg)[1];
            htmlData = replaceSpecialCharacters(htmlData);
            generatedHTML +=`${css}\n${htmlData}`;
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

    const getLayoutOptions = (editor) => {
        axios.get(`/${module}/add`)
            .then((response) => {
                if (response.data.results) {
                    setLayoutOptions(response.data.results.fields.layouts.options);
                    setAllData({
                        ...allData,
                        layout_id: response.data.results.fields.layout_id.value
                    });
                    loadEditorData(editor);
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

                    //-- Whenever all the custom async components & Blocks will be loaded, the canvas data will be set
                    const storageManager = editor.Storage;
                    storageManager.getStorageOptions()['key'] = `gjs-pages-${moduleId}`;
                    setStorageKey(`gjs-pages-${moduleId}`);
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