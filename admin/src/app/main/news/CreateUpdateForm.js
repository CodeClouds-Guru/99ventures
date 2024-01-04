import { useState, useEffect } from 'react';
import { FormControl, TextField, Stack, Select,  MenuItem, TextareaAutosize, Switch, InputLabel, Button, Typography, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs/dist/grapes.min.js'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
import 'grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.js'
import '../scripts/ScriptStyle.css';
import Helper from 'src/app/helper';
import { customCodeEditor } from '../../grapesjs/editorPlugins'
import { selectUser } from 'app/store/userSlice';

const CreateUpdateForm = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const navigate = useNavigate();
    const {moduleId} = useParams();
    const [editor, setEditor] = useState({});
    const [loader, setLoader] = useState(true)
    const [imageType, setImageType] = useState(true);
    const [loading, setLoading] = useState(false);
    const [imgUrl, setImgUrl] = useState('');
    const [imageFile, setImageFile] = useState({});
    const domain = `https://${user.loggedin_portal.domain}/news/`;
    const storageKey = (moduleId !== 'create' && !isNaN(moduleId)) ? `gjs-news-${moduleId}` : `gjs-news-new`;
    const [allData, setAllData] = useState({
        subject: '',
        slug: '',
        status: '',
        additional_header: '',
        content: '',
        content_json: '',
        image: ''
    });

    useEffect(() => {
        const editor = grapesjs.init({
            selectorManager: { escapeName: name => name },
            allowScripts: 1,
            container: '#gjs',
            fromElement: false,
            protectedCss: '',   // disabled default CSS
            height: '700px',
            width: '100%',
            style: '.txt-red{color: red}',
            plugins: ["gjs-preset-webpage", customCodeEditor],
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
    }, []);

    useEffect(()=>{
        if(Object.keys(editor).length){
            loadEditorData(editor);                
        }
    }, [editor]);


    const loadEditorData = async (editor) => {
        if (moduleId !== 'create' && !isNaN(moduleId)) {
            getSingleRecordById(moduleId, editor);
        } else {
            const storageManager = editor.Storage;
            const data = storageManager.load();
            editor.loadProjectData(data);
            setAllData({
                ...allData,
                content_json: editor.getProjectData(),
                content: generatedHTMLValue(editor)
            });
        };
    }

    const generatedHTMLValue = (editor) => {
        let generatedHTML = '';
        if (editor.getHtml()) {
            const css = (editor.getCss()) ? `<style>${editor.getCss()}</style>` : '';
            const reg = /\<body[^>]*\>([^]*)\<\/body/m; // Removed body tag
            var htmlData = editor.getHtml().match(reg)[1];
            htmlData = Helper.replaceSpecialCharacters(htmlData);
            generatedHTML +=`${css}\n${htmlData}`;
        }
        return generatedHTML;
    }

    const getSingleRecordById = () => {
        axios.get(jwtServiceConfig.news + `/edit/${moduleId}`)
            .then((response) => {
                setLoader(false)
                if (response.data.results.result) {
                    const record = response.data.results.result;
                    setAllData({...allData, ...record});                   
                    editor.loadProjectData(JSON.parse(record.content_json));

                    //-- Set to chnage state value to 0 because edior values fetched from DB and not done any changes by the user actually.
                    // setChangeCount(changeCount => changeCount - 1);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }

    const handleSwicth = () => {
        setImageType(!imageType);
        setImgUrl('');
        setImageFile({});
    }

    const handleCancel = () => {
        localStorage.removeItem(storageKey);
        navigate('/app/news');
    }

    const handleFormSubmit = () => {
        const subject = allData.subject.trim();
        if(subject === '') {
            dispatch(showMessage({ variant: 'error', message: 'Subject field is required!' }));
            return;            
        }
        if(allData.status === '') {
            dispatch(showMessage({ variant: 'error', message: 'Status is required!' }));
            return;            
        }
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('slug', allData.slug);
        formData.append('additional_header', allData.additional_header);
        formData.append('status', allData.status);
        formData.append('content', generatedHTMLValue(editor));
        formData.append('content_json', JSON.stringify(editor.getProjectData()));

        if(imageFile.name || imgUrl){
            formData.append('image_type', imageType ? 'file' : 'url')
            if(imageType)
                formData.append('image', imageFile);
            else
                formData.append('image', imgUrl);
        } else {
            formData.append('image', null);
            formData.append('image_type', null);
        }

        setLoading(true);
        const endPoint = (moduleId !== 'create' && !isNaN(moduleId)) ? jwtServiceConfig.newsUpdate + `/${moduleId}` : jwtServiceConfig.newsSave;
        axios.post(endPoint, formData)
            .then((response) => {
                setLoading(false);
                if (response.data.results.status) {
                    // setChangeCount(0);
                    localStorage.removeItem(storageKey);
                    dispatch(showMessage({ variant: 'success', message: response.data.results.data.message }));
                    navigate(`/app/news`);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                console.log(error)
                setLoading(false)
                dispatch(showMessage({ variant: 'error', message: error.response.data.message }))
            })
    }

    const handleSubject = (e) => {
        let val = e.target.value.trim();
        let slugVal = val.replace(/[^\w\s]/gi, '').replaceAll(' ', '-').toLowerCase()
        setAllData({...allData, subject: e.target.value, slug: slugVal});
    }

    const handleSlug = (e) => {
        let val = e.target.value.toLowerCase();
        let slugVal = val.replaceAll(' ', '-')
        setAllData({...allData, slug: slugVal});
    }

    const handleStatus = (e) => {
        setAllData({...allData, status: e.target.value});
    }

    const handleAdditionalHeader = (e) => {
        setAllData({...allData, additional_header: e.target.value});
    }
    return (
        <div className="flex w-full p-20">                                   
            <div className='flex flex-col w-full'>
                <div className='flex'>
                    <FormControl className="w-4/5 mb-24 pr-10">
                        <TextField
                            label="Subject"
                            type="text"
                            variant="outlined"
                            required
                            value={allData.subject}
                            onChange={handleSubject}
                        />
                    </FormControl>
                    <FormControl className="w-1/5 mb-24 pr-10">
                        <InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
                        <Select
                            labelId="demo-simple-select-standard-label"
                            id="demo-simple-select-standard"
                            value={allData.status}                            
                            label="Status"
                            onChange={handleStatus}
                        >
                            <MenuItem value=""> <em>None</em> </MenuItem>
                            <MenuItem value="pending"> Pending</MenuItem>
                            <MenuItem value="draft"> Draft</MenuItem>
                            <MenuItem value="published">Published </MenuItem>
                            <MenuItem value="archived">Archived </MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div className='flex'>
                    <FormControl className="w-4/5 mb-24 pr-10">
                        <TextField
                            label="Slug"
                            type="text"
                            variant="outlined"
                            required
                            value={allData.slug}
                            onChange={handleSlug}    
                            sx={{'& .MuiFormHelperText-contained': {margin: 0, padding: '1rem 0'}}}   
                            helperText={
                                <Typography variant="body1" component="span">{domain + allData.slug}</Typography>
                            }
                        />
                    </FormControl>
                </div>
                <div className='flex'>
                    <FormControl className="mb-24 mr-10">
                        {
                            (moduleId !== 'create' && parseInt(moduleId) && allData.image) && (
                                <div className='mt-10'>
                                    <img
                                        src={`${allData.image}?w=50&h=50&fit=crop&auto=format`}
                                        srcSet={`${allData.image}?w=50&h=50&fit=crop&auto=format&dpr=2 2x`}
                                        loading="lazy"
                                        width={200}
                                    />
                                </div>
                            )
                        }
                    </FormControl >
                    <FormControl className="w-1/3 mb-24">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>Upload Image URL</Typography>
                            <Switch className="switch" checked={imageType} onChange={ handleSwicth } name="image_type" />
                            <Typography>Upload Image File</Typography>
                        </Stack>
                        {
                            imageType ? (
                                <TextField
                                    type="file"
                                    variant="outlined"
                                    onChange={(e)=>{
                                        setImageFile(e.target.files[0]);
                                    }}
                                />
                            ) : (
                                <TextField
                                    label="Image URL"
                                    type="url"
                                    variant="outlined"
                                    onChange={(e)=> {
                                        setImgUrl(e.target.value)
                                    }}
                                />
                            )
                        }               
                        <small className='text-red-500 font-bold'>** For best result please use image in 780px*714px dimension</small>     
                    </FormControl>
                </div>
                <FormControl className="w-full mb-24">
                    <pre>
                        <code>
                            <TextareaAutosize
                                maxRows={10}
                                label="Additional Header Script"
                                aria-label="Addtional Header Script"
                                placeholder="#Add your external Meta details as needed"
                                value={allData.additional_header ?? ''}
                                style={{ minHeight: '100px', width: '100%', padding: '15px', backgroundColor: '#000', color: '#ffeeba' }}
                                onChange={handleAdditionalHeader}
                            />
                        </code>
                    </pre>
                </FormControl>
                <FormControl className="w-full mb-24">
                    <div id="gjs" />
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
                        onClick={handleFormSubmit}
                        
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
        </div>
           
    )
}

export default CreateUpdateForm;