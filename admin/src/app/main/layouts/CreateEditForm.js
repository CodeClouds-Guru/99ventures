import * as React from 'react';
import { Box, TextField, Select, MenuItem, InputLabel, FormControl, Button, IconButton, Typography, TextareaAutosize, Tooltip } from '@mui/material';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import LoadingButton from '@mui/lab/LoadingButton';
import { usePermission } from '@fuse/hooks';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useParams, useNavigate } from 'react-router-dom';
import AlertDialog from 'app/shared-components/AlertDialog';
import { getLayout, setRevisionData } from 'app/store/layout'
import BodyPart from './BodyPart';
import DialogBox from './Dialogbox';


const iconPositionStyle = {
    position: 'absolute',
    right: '-8px',
    top: '-12px',
    width: '35px',
    height: '35px',
    background: '#eee',
    borderRadius: '50%'
}

const CreateEditForm = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { moduleId } = useParams();
    const { hasPermission } = usePermission('layouts');
    const selectRevisionCount = useSelector(state => state.layout.revisions_count);
    const selectLayout = useSelector(state => state.layout.layout_data);
    const [loading, setLoading] = useState(false);
    const [components, setComponents] = useState([]);
    const [layoutname, setLayoutname] = useState('');
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [records, setRecords] = useState({});
    const [changeStatus, setChangeStatus] = useState({ name_changed: false, header_changed: false, body_changed: false });
    const [popupStatus, setPopupStatus] = useState(false);
    const [editor, setEditor] = useState('');
    const [msg, setMsg] = useState('');
    const [alertType, setAlertType] = useState('');
    const [fullScreen, setFullScreen] = useState(false);
    const [dialogFor, setDialogFor] = useState('');
    const [layoutCode, setLayoutCode] = useState({
        header: {
            value: ''
        },
        body: {
            value: '<body>\n{{content}}\n</body>'
        }
    });

    useEffect(() => {
        getComponents();
        dispatch(setRevisionData([]));
        if (moduleId !== 'create' && !isNaN(moduleId)) {
            dispatch(getLayout({ module_id: moduleId }));
        }
    }, []);


    useEffect(() => {
        if (Object.keys(selectLayout).length && moduleId !== 'create' && !isNaN(moduleId)) {
            setRecords(selectLayout);
            setLayoutname(selectLayout.name);
            setLayoutCode(selectLayout.layout_json);
        }
    }, [selectLayout])

    /**
     * Components API
     */
    const getComponents = () => {
        axios.post(jwtServiceConfig.layoutsAdd)
            .then(res => {
                if (res.data.results.status === true) {
                    if (res.data.results.components) {
                        setComponents(res.data.results.components)
                    }
                }
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
            })
    }

    const handleSelectComponent = (e) => {
        const selectedValue = e.target.value;
        let htmlData = '';
        if(editor.includes('<body>') || editor.includes('</body>')) {
            let content = editor;
            if(editor.includes('<body>')){
                content = content.replace('<body>', '')
            }
            if(editor.includes('</body>')){
                content = content.replace('</body>', '')
            }
            htmlData = `<body>${content}{{${selectedValue}}}\n</body>`
        } else {
            htmlData = `<body>\n${editor}\n{{${selectedValue}}}\n</body>`
        }

        setEditor(htmlData);
    }

    /**
     * Save / Update layout
     */
    const formSubmit = (e) => {
        e.preventDefault();
        props.toggleSidebar(false);
        if (!layoutname.trim()) {
            dispatch(showMessage({ variant: 'error', message: 'Please enter layout name!' }));
            return;
        }

        // if(Object.values(changeStatus).includes(true) && (moduleId !== 'create' && !isNaN(moduleId))) {
        /**
         * Confirmation popup will only show when header / body has been changed
         */
        if ((changeStatus.header_changed === true || changeStatus.body_changed === true) && (moduleId !== 'create' && !isNaN(moduleId))) {
            setOpenAlertDialog(true);
            setMsg('Do you want to update the changes?');
            setAlertType('save_layout');
        } else {
            handleLayoutSubmit();
        }

    }

    const handleLayoutSubmit = () => {
        if(!layoutCode.body.value.includes('{{content}}')){
            dispatch(showMessage({ variant: 'error', message: 'Sorry! Unable to save the data. {{content}} is missing.' }));
            return;
        }

        const htmlCode = '<html>\n' +
            '<head>\n' +
            '<title>${page_title}</title>\n' +
            '<meta charset="UTF-8">\n' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
            '<meta name="description" content="${page_descriptions ? page_descriptions : layout_descriptions}">\n' +
            '<meta name="keywords" content="${page_keywords ? page_keywords : layout_keywords}">\n' +
            '${page_meta_code}\n\n' +
            layoutCode.header.value +
            '\n\n<!-- Additional Script Start-->\n'+
            '${additional_header_script}\n'+
            '<!-- Additional Script End -->\n'+
            '</head>\n' + layoutCode.body.value + '\n' +
            '</html>';

        const params = {
            name: layoutname.trim(),
            html: htmlCode,
            layout_json: layoutCode
        };
        const url = (moduleId !== 'create' && !isNaN(moduleId)) ? jwtServiceConfig.updateLayouts + '/' + moduleId : jwtServiceConfig.layoutsSave;
        setLoading(true);
        axios.post(url, params)
            .then(res => {
                if (res.data.results.status === true) {
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
    /*const onDrop = ({ removedIndex, addedIndex }) => {
        setLayoutCode({
            ...layoutCode,
            body: {
                value: arrayMoveImmutable(layoutCode.body.value, removedIndex, addedIndex)
            }
        });
    };*/

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
        setMsg('');
        setAlertType('');
    }

    /**
     * Confirm Alert Dialog.
     * It will redirect user to list page.
     * At the same time need to clear the auto save value from local storage.
     * ChangeCount value set to 0.
     */
    const onConfirmAlertDialogHandle = () => {
        if(alertType === 'save_layout')
            handleLayoutSubmit();
        else if(alertType === 'save_body')
            saveEditorValue();
    }

    const handleSetLayoutName = (e) => {
        setLayoutname(e.target.value);

        if ((moduleId !== 'create' && !isNaN(moduleId) && records.name !== e.target.value) || (moduleId === 'create' && e.target.value.trim())) {
            setChangeStatus({ ...changeStatus, name_changed: true });
        } else {
            setChangeStatus({ ...changeStatus, name_changed: false });
        }
    }

    const handleHeader = (e) => {
        setLayoutCode({
            ...layoutCode,
            header: {
                value: e.target.value
            }
        });
        if ((records.layout_json && records.layout_json.header.value !== e.target.value) || (moduleId === 'create' && e.target.value)) {
            setChangeStatus({ ...changeStatus, header_changed: true });
        } else {
            setChangeStatus({ ...changeStatus, header_changed: false });
        }
    }

    /**
     * Reset the layout
     */
    const handleResetLayout = () => {
        setLayoutname(records.name);
        setLayoutCode(records.layout_json);
        setChangeStatus({ name_changed: false, header_changed: false, body_changed: false });
    }

    /**
     * To determine whether the layout body has been modified or not
     */
    useEffect(() => {
        if (Object.keys(records).length && JSON.stringify(records.layout_json.body) !== JSON.stringify(layoutCode.body)) {
            setChangeStatus({ ...changeStatus, body_changed: true });
        } else {
            setChangeStatus({ ...changeStatus, body_changed: false });
        }

    }, [layoutCode.body, records]);

    const handleOpenDialog = () =>{
        setPopupStatus(true);
        setEditor(layoutCode.body.value);
        setDialogFor('edit_mode')
    }

    const handleFullScreen = (mode) => {
        if(mode === true){
            setFullScreen(true);
            setPopupStatus(true);
            setDialogFor('view_mode');
        } else {
            handleClose();
        }        
    }

    const handleClose =() => {
        setPopupStatus(false);
        setDialogFor('');
        setFullScreen(false);
    }

    const handleConfirmSave = () => {
        setMsg('Do you want to save the changes?');
        setAlertType('save_body');
        setOpenAlertDialog(true);
    }

    const saveEditorValue = () => {
        let content = editor;
        
        if(content){
            if(editor.includes('<body>') || editor.includes('</body>')){
                if(editor.includes('<body>')){
                    content = editor.replace('<body>', '').trim();
                }
                if(editor.includes('</body>')){
                    content = content.replace('</body>', '').trim();
                }
            }
            content = `<body>\n${content}\n</body>`;
        } else {
            content = '<body>\n{{content}}\n</body>';
        }
        setLayoutCode({
            ...layoutCode,
            body: {
                value: content
            }
        });
        setPopupStatus(false);
        onCloseAlertDialogHandle();
    }

    const viewFullscreen = () => {
        return (
            <div className='p-16'>
                <BodyPart fullScreen={fullScreen} handleOpenDialog={handleOpenDialog} handleFullScreen={handleFullScreen} body={layoutCode.body.value} />
            </div>
        )
    }

    const editFullscreen = () => {
        return (
            <div className='w-full'>
                <FormControl className="mb-10" sx={{minWidth: 350 }} size="small">
                    <InputLabel id="select-component-label">Select Component</InputLabel>
                    <Select
                        name="components"
                        labelId="select-component-label"
                        id="select-component"
                        label="Select Component"
                        onChange={handleSelectComponent}
                        defaultValue=""
                    >
                        <MenuItem value="">Select</MenuItem>
                        {
                            components.map(el => <MenuItem key={el.code} value={el.code} data-name={el.name}>{el.name}</MenuItem>)
                        }

                    </Select>
                </FormControl>
                <div className='relative'>                            
                    {
                        fullScreen ? (
                            <Tooltip title="Exit Fullscreen" placement="top-start">
                                <IconButton 
                                    style={iconPositionStyle}
                                    color="primary" aria-label="Edit" component="span" onClick={()=>setFullScreen(false)}>
                                    <FuseSvgIcon className="text-48" size={18} color="action">material-outline:fullscreen_exit</FuseSvgIcon>
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Fullscreen View" placement="top-start">
                                <IconButton 
                                    style={iconPositionStyle}
                                    color="primary" aria-label="Edit" component="span" onClick={()=>setFullScreen(true)}>
                                    <FuseSvgIcon className="text-48" size={18} color="action">material-outline:fullscreen</FuseSvgIcon>
                                </IconButton>
                            </Tooltip>
                        )
                    }
                    <pre>
                        <code>
                            <TextareaAutosize
                                maxRows={10}
                                aria-label="maximum height"
                                placeholder="#Add your HTML content here"
                                value={ editor }
                                className={ fullScreen === false ? 'custom-code-editor' : 'custom-code-editor-fullscreen' }
                                onChange={ (e)=> setEditor(e.target.value)}
                            />
                        </code>
                    </pre>
                    <small>Note: Do not remove <strong>{'{{content}}'}</strong>.</small>
                </div>
            </div>
        )
    }

    return (
        <Box className="p-24" >
            <form onSubmit={formSubmit}>
                <div className='flex mb-24 justify-between'>
                    <FormControl className="w-1/2">
                        <TextField
                            id="outlined-name"
                            label="Layout Name"
                            value={layoutname}
                            onChange={handleSetLayoutName}
                        />
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
                <fieldset className='border mb-24 p-24'>
                    <legend className='ml-24 px-10'>
                        <Typography variant="h6">Layout</Typography>
                    </legend>
                    <fieldset className='border mb-10'>
                        <legend className='ml-24 px-10'>
                            <Typography variant="subtitle1">Header</Typography>
                        </legend>
                        <div className='p-24'>
                            <pre>
                                <code>
                                    <TextareaAutosize
                                        maxRows={10}
                                        aria-label="maximum height"
                                        placeholder="#Add your external style and script here, e.g., <link rel='stylesheet' href='/style.css' />"
                                        value={layoutCode.header.value}
                                        className="custom-code-editor"
                                        onChange={handleHeader}
                                    />
                                </code>
                            </pre>
                        </div>
                    </fieldset>
                    <fieldset className='border'>
                        <legend className='ml-24  px-10'>
                            <Typography variant="subtitle1">Body</Typography>
                        </legend>
                        <div className='p-24'>
                            <BodyPart fullScreen={fullScreen} handleOpenDialog={handleOpenDialog} handleFullScreen={handleFullScreen} body={layoutCode.body.value}/>                            
                        </div>
                    </fieldset>
                </fieldset>
                <motion.div
                    className="flex"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                >
                    {
                        (moduleId !== 'create' && !isNaN(moduleId)) && (
                            <Button
                                className="whitespace-nowrap mx-4"
                                variant="contained"
                                color="primary"
                                onClick={handleResetLayout}
                                disabled={Object.values(changeStatus).includes(true) ? false : true}
                            >
                                Reset
                            </Button>
                        )
                    }

                    {
                        (hasPermission('save') || hasPermission('update')) && (
                            <LoadingButton
                                variant="contained"
                                color="secondary"
                                aria-label="Register"
                                type="submit"
                                loading={loading}
                                disabled={Object.values(changeStatus).includes(true) ? false : true}
                            >
                                {moduleId === 'create' ? 'Save' : 'Update'}
                            </LoadingButton>
                        )
                    }

                    <Button
                        className="whitespace-nowrap mx-4"
                        variant="contained"
                        color="error"
                        onClick={() => {
                            navigate(`/app/layouts`)
                        }}
                    >
                        Cancel
                    </Button>

                </motion.div>
            </form>
            {
                openAlertDialog && (
                    <AlertDialog
                        content={ msg }
                        open={openAlertDialog}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }

            <DialogBox 
                fullScreen={fullScreen} 
                popupStatus={popupStatus} 
                handleClose={handleClose} 
                content={
                    dialogFor === 'edit_mode' ? editFullscreen() : viewFullscreen()
                }
                action={
                    <>
                        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                        {
                            dialogFor === 'edit_mode' && (
                                <Button 
                                    color="primary"
                                    variant="contained"
                                    onClick={ handleConfirmSave }
                                    disabled={ editor.trim() === '' ? true : false}
                                >Save</Button>
                            )
                        }                        
                    </>
                }
            />
        </Box>
    )
}

export default CreateEditForm;