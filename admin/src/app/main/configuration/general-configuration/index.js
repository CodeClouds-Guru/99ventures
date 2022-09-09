import * as React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import {Button, Box, Modal, Paper, MenuItem, Select, Divider, List, ListItem, ListItemButton, IconButton, ListItemText, Typography, CardContent, TextField, InputLabel, FormControl } from '@mui/material';
import * as yup from 'yup';
import _ from '@lodash';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const schema = yup.object().shape({
    home_page_id: yup
        .string()
        .required('Please choose a Home Page'),
    default_template_id: yup
        .string()
        .required('Please select a default layout'),
});
  
const replyFormDefaultValues = {
    heading: '',
    messageBody: ''
}

const replyFormSchema =  yup.object().shape({
    heading: yup.string().required('Please enter the heading'),
    messageBody: yup.string().required('Please enter Message'),
});

function GeneralConfiguration(props) {
    const dispatch = useDispatch();
    const [captchaOptions, setCaptchaOptions] = useState([])
    const [generalReplies, setGeneralReplies] = useState([])
    const [layoutOptions, setLayoutOptions] = useState([])
    const [pageOptions, setPageOptions] = useState([])
    const [toggleModal, setToggleModal] = useState(false)
    const [permission, setPermission] = useState(false)
    
    const [defaultValues, setDefaultValues] = useState({
        home_page_id: 0,
        default_template_id: 0,
        default_captcha_option_id: 0
    });

    const { 
        control: generalFormControl, 
        formState: {isValid, dirtyFields, errors}, 
        handleSubmit, 
        setError, 
        setValue 
    } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });
    
    const selectHomePage = (event) => {
        setDefaultValues({
            ...defaultValues,
            home_page_id: event.target.value,
        });
    }
    const selectLayoutOption = (event) => {
            setDefaultValues({
                ...defaultValues,
                default_template_id: event.target.value,
            })
    }
    const selectCaptchaOption = (event) => {
            setDefaultValues({
                ...defaultValues,
                default_captcha_option_id: event.target.value
            })
    }

    useEffect(() => { 
        setPermission(
            (props.permission('save') || props.permission('update'))
        );
        fetchData();
    }, [props.permission])

    const fetchData = () => {
        axios.get(jwtServiceConfig.getGeneralConfiguration).then((response) => {
            if (response.data.status) {
                setCaptchaOptions([...response.data.captcha_options, {id: 0, name: 'Select Captcha Option'}])
                setPageOptions([...response.data.page_options, {id: 0, name: 'Select Home Page'}])
                setLayoutOptions([...response.data.layout_options, {id: 0, name: 'Select default layout'}])
                setGeneralReplies([...response.data.general_replies])
                setDefaultValues({
                    ...defaultValues,
                    home_page_id: response.data.home_page_id,
                    default_template_id: response.data.default_template_id,
                    default_captcha_option_id: response.data.default_captcha_option_id
                })
            } else {
                console.log('Error');
            }
        });
    }

    const getFormattedOptions = (options) => {
        return options.map(option => <MenuItem key={Math.random()} value={option.id}>{option.name ?? ''}</MenuItem>)
    }
    
    const getReplies = (replies) => {
        return replies.map((reply, indx) => {
            return (
                <React.Fragment key={ Math.random() }>
                    <ListItem key={ Math.random() }  
                        secondaryAction= {
                            <IconButton key={ Math.random() } edge="end" aria-label="delete" onClick={()=> removeListItem(indx)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText key={ Math.random() } 
                            primary={reply.name}
                            secondary={ 
                                <Typography
                                    key={ Math.random() }
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                >
                                    {reply.body}
                                </Typography>
                            }
                        />
                    </ListItem>
                    <Divider variant="inset" component="li" className="ml-12" key={ Math.random() }/>
                </React.Fragment>
            )
        })
    }

    /*const subString = (string) => {
        if(string.length > 100) {
            string = string.subString(0, 100) + '...';
        }
        return string;
    }*/

    const removeListItem = (itemKey) => {
        generalReplies.splice(itemKey, 1);
        setGeneralReplies([...generalReplies]);
    }
    
    /**
     * General Config data post
     */
    const onSubmit = () => {
        const responses = [];
        generalReplies.map(rp => {
            responses.push({
                name: rp.name,
                body: rp.body
            });
        });
        const params = {
            selected_page_id: defaultValues.home_page_id,
            selected_template_id: defaultValues.default_template_id,
            selected_captcha_id: defaultValues.default_captcha_option_id,
            auto_response_new_data: responses
        }
        
        axios.post(jwtServiceConfig.saveGeneralConfiguration, params)
        .then((response) => {
            if (response.data.status) {
                dispatch(showMessage({ variant: 'success', message: response.data.message }))
            } else {
                dispatch(showMessage({ variant: 'error', message: response.data.message }))
            }
        })
        .catch(error => dispatch(showMessage({ variant: 'error', message: error.response.data.errors })));
    }

    
    /**
     * Modal Form validation 
     */  
    const { 
        control: replyControl, 
        formState: { isValid: isRPFValid, dirtyFields: dirtyRPFFields }, 
        handleSubmit: handleReplySubmit,
        reset: autoResponderFormReset
    } = useForm({
        mode: 'onChange',
        defaultValues: replyFormDefaultValues,
        resolver: yupResolver(replyFormSchema),
    });  
    
    const onReplySubmit = ({heading, messageBody}) => {
        setGeneralReplies([
            ...generalReplies,
            {
                name: heading,
                body: messageBody
            }
        ]);        
        autoResponderFormReset({replyFormDefaultValues});
    }

    const handleClose = () => {
        setToggleModal(false);
        autoResponderFormReset({replyFormDefaultValues});
    }

    return (
        <div>
            <Modal
                hideBackdrop
                open={toggleModal}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
                style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
            >
                <Box sx={modalStyle}>
                    <h2 id="child-modal-title mb-24">Auto Responder</h2>
                    {/* <p id="child-modal-description">
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    </p> */}
                    <form
                        name="AutoresponderForm"
                        noValidate  
                        className="flex flex-col justify-center w-full mt-32"
                        onSubmit={handleReplySubmit(onReplySubmit)}
                    >
                        <Controller
                            name="heading"
                            control={replyControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Heading"                            
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />
                        
                        <Controller
                            name="messageBody"
                            control={replyControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id="outlined-multiline-static"
                                    label="Message Body"
                                    className="mb-24"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    required
                                />
                            )}
                        />
                        <div className='flex justify-between'>
                            <Button 
                                variant="contained"
                                component="label"
                                className=""
                                color="primary" 
                                onClick={handleClose}
                            >Close</Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                className=""
                                aria-label="Add"
                                disabled={_.isEmpty(dirtyRPFFields) || !isRPFValid}
                                type="submit"
                                size="large"
                                >
                                Add
                            </Button>
                        </div>
                    </form>
                </Box>
            </Modal>
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-64 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0">
                        <h3>General Configurations</h3>
                        <form
                            name="GeneralConfigurationForm"
                            noValidate  
                            className="flex flex-col justify-center w-full mt-32"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Controller
                                name="home_page_id"
                                control={generalFormControl}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel id="home_page">Homepage</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="home_page"
                                            className="mb-24"
                                            id="demo-simple-select"
                                            value={defaultValues.home_page_id}
                                            label="Homepage"
                                            onChange={selectHomePage}
                                            required
                                            disabled={ !permission }
                                        >
                                            {getFormattedOptions(pageOptions)}
                                        </Select>
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="default_template_id"
                                control={generalFormControl}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel id="default_template">Default Template</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="default_template"
                                            className="mb-24"
                                            id="demo-simple-select"
                                            value={defaultValues.default_template_id}
                                            label="Default Template"
                                            onChange={selectLayoutOption}                                            
                                            disabled={ !permission }
                                        >
                                            {getFormattedOptions(layoutOptions)}
                                        </Select>
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="default_captcha_option_id"
                                control={generalFormControl}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel id="captcha_option">Captcha</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="captcha_option"
                                            className="mb-24"
                                            id="demo-simple-select"
                                            value={defaultValues.default_captcha_option_id}
                                            label="Captcha"
                                            onChange={selectCaptchaOption}
                                            disabled={ !permission }
                                            >
                                            {getFormattedOptions(captchaOptions)}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <Divider className="mb-24"/>
                            <h3>
                                Replies
                                <Button
                                    variant="contained"
                                    component="label"
                                    className="ml-12"
                                    color="primary"
                                    onClick={() => setToggleModal(true)}
                                >
                                    Add
                                </Button>
                            </h3>

                            <CardContent>
                                <List>
                                    {getReplies(generalReplies)}
                                </List>
                            </CardContent>

                            {
                                (permission) ? 
                                    <div className='flex items-center justify-center'> 
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            className="w-1/2 mt-24"
                                            aria-label="Register"
                                            type="submit"
                                            size="large"
                                        >
                                            Save
                                        </Button>
                                    </div> 
                                : ''
                            }                            
                        </form>
                    </div>
                </Paper>
            </div>
        </div>
    )
}

export default GeneralConfiguration;