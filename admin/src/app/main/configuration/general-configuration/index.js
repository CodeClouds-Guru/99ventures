import * as React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

import { Button, Box, Modal, Paper, MenuItem, Select, Divider, List, ListItem, ListItemButton, IconButton, ListItemText, Typography, CardContent, TextField, InputLabel, FormControl, ListItemSecondaryAction, ListItemIcon, Tooltip, FormControlLabel, Switch } from '@mui/material';
import * as yup from 'yup';
import _ from '@lodash';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { arrayMoveImmutable } from "array-move";
import { Container, Draggable } from "react-smooth-dnd";
import WYSIWYGEditor from 'app/shared-components/WYSIWYGEditor';

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
    redirect_page_id: yup
        .string()
        .required('Please choose a Redirect Page'),
    default_template_id: yup
        .string()
        .required('Please select a default layout'),
});

const replyFormDefaultValues = {
    heading: '',
    messageBody: ''
}

const replyFormSchema = yup.object().shape({
    heading: yup.string().required('Please enter the heading'),
    messageBody: yup.string().required('Please enter Message'),
});

function GeneralConfiguration(props) {
    const dispatch = useDispatch();
    const [generalReplies, setGeneralReplies] = useState([])
    const [layoutOptions, setLayoutOptions] = useState([])
    const [pageOptions, setPageOptions] = useState([])
    const [toggleModal, setToggleModal] = useState(false)
    const [permission, setPermission] = useState(false)

    const [defaultValues, setDefaultValues] = useState({
        home_page_id: 0,
        redirect_page_id: 0,
        default_template_id: 0,
        google_captcha_status: false,
        site_key: '',
        site_token: '',
    });

    const {
        control: generalFormControl,
        formState: { isValid, dirtyFields, errors },
        handleSubmit,
        setError,
        setValue
    } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const selectHomePage = (event) => {
        if (event.target.value === defaultValues.redirect_page_id) {
            dispatch(showMessage({ variant: 'error', message: 'Selected page should be different' }));
            return false;
        }
        setDefaultValues({
            ...defaultValues,
            home_page_id: event.target.value,
        });
    }
    const selectRedirectPage = (event) => {
        if (event.target.value === defaultValues.home_page_id) {
            dispatch(showMessage({ variant: 'error', message: 'Selected page should be different' }));
            return false;
        }
        setDefaultValues({
            ...defaultValues,
            redirect_page_id: event.target.value,
        });
    }
    const selectLayoutOption = (event) => {
        setDefaultValues({
            ...defaultValues,
            default_template_id: event.target.value,
        })
    }
    const handleCaptchaStatus = (event) => {
        setDefaultValues({
            ...defaultValues,
            google_captcha_status: event.target.checked
        })
    }
    const handleSiteKey = (event) => {
        setDefaultValues({
            ...defaultValues,
            site_key: event.target.value
        })
    }
    const handleSiteToken = (event) => {
        setDefaultValues({
            ...defaultValues,
            site_token: event.target.value
        })
    }

    const onDrop = ({ removedIndex, addedIndex }) => {
        setGeneralReplies(items => arrayMoveImmutable(items, removedIndex, addedIndex));
    };

    useEffect(() => {
        setPermission(
            (props.permission('save') || props.permission('update'))
        );
        fetchData();
    }, [props.permission])

    const fetchData = () => {
        axios.get(jwtServiceConfig.getGeneralConfiguration).then((response) => {
            if (response.data.results.status) {
                setPageOptions([...response.data.results.data.page_options, { id: 0, name: 'Select Page' }])
                setLayoutOptions([...response.data.results.data.layout_options, { id: 0, name: 'Select default layout' }])
                setGeneralReplies([...response.data.results.data.general_replies])
                setDefaultValues({
                    ...defaultValues,
                    home_page_id: response.data.results.data.home_page_id,
                    redirect_page_id: response.data.results.data.redirect_page_id,
                    default_template_id: response.data.results.data.default_template_id,
                    google_captcha_status: response.data.results.data.is_google_captcha_used === 1,
                })
                !response.data.results.data.google_captcha_configuration ? '' : setDefaultValues({
                    ...defaultValues,
                    site_key: response.data.results.data.google_captcha_configuration.site_key,
                    site_token: response.data.results.data.google_captcha_configuration.site_token,
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
                <Draggable key={Math.random()}>
                    <ListItem key={Math.random()}
                        secondaryAction={
                            <>
                                <IconButton key={Math.random()} edge="end" aria-label="delete" onClick={() => removeListItem(indx)}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        }
                    >
                        <ListItemIcon className="drag-handle mt-4">
                            <DragHandleIcon />
                        </ListItemIcon>
                        <ListItemText key={Math.random()}
                            primary={reply.name}
                            secondary={
                                <Typography
                                    key={Math.random()}
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                >
                                    {reply.body}
                                </Typography>
                            }
                        />
                        {/* <ListItemSecondaryAction>
                                <ListItemIcon className="drag-handle">
                                    <DragHandleIcon />
                                </ListItemIcon>
                            </ListItemSecondaryAction> */}
                    </ListItem>
                    <Divider variant="inset" component="li" className="ml-12" key={Math.random()} />
                </Draggable>
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
            redirect_page_id: defaultValues.redirect_page_id,
            selected_template_id: defaultValues.default_template_id,
            is_google_captcha_used: defaultValues.google_captcha_status ? 1 : 0,
            site_key: defaultValues.google_captcha_status ? defaultValues.site_key : '',
            site_token: defaultValues.google_captcha_status ? defaultValues.site_token : '',
            auto_response_new_data: responses
        }

        axios.post(jwtServiceConfig.saveGeneralConfiguration, params)
            .then((response) => {
                if (response.data.results.status) {
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }))
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.errors }))
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

    const onReplySubmit = ({ heading, messageBody }) => {
        setGeneralReplies([
            ...generalReplies,
            {
                name: heading,
                body: messageBody
            }
        ]);
        autoResponderFormReset({ replyFormDefaultValues });
        handleClose();
    }

    const handleClose = () => {
        setToggleModal(false);
        autoResponderFormReset({ replyFormDefaultValues });
    }

    return (
        <div>
            <Modal
                hideBackdrop
                open={toggleModal}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
                <Box sx={modalStyle}>
                    <h2 id="child-modal-title mb-24">Auto Responder</h2>
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
                            render={({ field }) => (<WYSIWYGEditor {...field} />)}
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
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-0 px-16 sm:p-36 md:p-36 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0">
                        <Typography variant="h6">General Configurations</Typography>
                        <Typography variant="body2">Please configure the below details</Typography>
                        <Divider className="mb-32 mt-10" />

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
                                    <Tooltip title="Please select 'Published' page only" placement="top">
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
                                                disabled={!permission}
                                            >
                                                {getFormattedOptions(pageOptions)}
                                            </Select>
                                        </FormControl>
                                    </Tooltip>
                                )}
                            />
                            <Controller
                                name="redirect_page_id"
                                control={generalFormControl}
                                render={({ field }) => (
                                    <Tooltip title="Please select 'Published' page only" placement="top">
                                        <FormControl fullWidth>
                                            <InputLabel id="redirect_page">Redirect Page</InputLabel>
                                            <Select
                                                {...field}
                                                labelId="redirect_page"
                                                className="mb-24"
                                                id="demo-simple-select"
                                                value={defaultValues.redirect_page_id}
                                                label="Redirect Page"
                                                onChange={selectRedirectPage}
                                                required
                                                disabled={!permission}
                                            >
                                                {getFormattedOptions(pageOptions)}
                                            </Select>
                                        </FormControl>
                                    </Tooltip>
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
                                            disabled={!permission}
                                        >
                                            {getFormattedOptions(layoutOptions)}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="google_captcha_status"
                                control={generalFormControl}
                                render={({ field }) => (
                                    <FormControlLabel
                                        className="w-4/12"
                                        sx={defaultValues.google_captcha_status ? {
                                            background: '#ffffff', marginBottom: '-18px', justifyContent: 'center',
                                        } : { marginLeft: '-1.05rem' }}
                                        {...field}
                                        control={<Switch
                                            className="mt-2"
                                            labelId="google_captcha_status"
                                            disabled={!permission}
                                            checked={defaultValues.google_captcha_status}
                                            onChange={handleCaptchaStatus}
                                        />}
                                        label="Google Captcha"
                                        labelPlacement="start"
                                    />
                                )}
                            />
                            {defaultValues.google_captcha_status &&
                                <Box className="border-2 p-24" sx={{ borderRadius: 2 }}>
                                    <Controller
                                        name="site_key"
                                        control={generalFormControl}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                className="w-1/2 pr-10"
                                                label="Site Key"
                                                variant="outlined"
                                                required={defaultValues.google_captcha_status}
                                                fullWidth
                                                onChange={handleSiteKey}
                                                value={defaultValues.site_key}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="site_token"
                                        control={generalFormControl}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2"
                                                {...field}
                                                label="Site Token"
                                                variant="outlined"
                                                required={defaultValues.google_captcha_status}
                                                fullWidth
                                                onChange={handleSiteToken}
                                                value={defaultValues.site_token}
                                            />
                                        )}
                                    />
                                </Box>
                            }
                            <Divider className="mt-20 mb-24" />
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

                            {generalReplies.length > 0 &&
                                <CardContent>
                                    <List>
                                        <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDrop}>
                                            {getReplies(generalReplies)}
                                        </Container>
                                    </List>
                                </CardContent>}

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