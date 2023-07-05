import * as React from 'react';
import { Box, TextField, Modal, Button, Typography, Divider, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, Switch, Avatar } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { confirmAccountPassword } from 'app/store/accountSlice';
import { selectUser } from 'app/store/userSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const modalValidationSchema = yup.object().shape({
    password: yup.string().required(`Please enter password`)
});


const PaymentCredentials = (props) => {
    const dispatch = useDispatch();
    const confirmAccountStatus = useSelector(state => state.account.confirm_account);
    const user = useSelector(selectUser);
    const [loading, setLoading] = React.useState(false);
    // const [credentials, setCredentials] = React.useState(props.details.credentials);
    const [details, setDetials] = React.useState(props.details);
    const [permission, setPermission] = React.useState(false);
    const [toggleModal, setToggleModal] = React.useState(false);
    const [logo, setLogo] = React.useState('');
    const [status, setStatus] = React.useState(false);
    /**
     * Default Value object creation and validation object creation
     */
    const defaultValues = {};
    const validationFields = {};
    details.credentials.map(val => {
        defaultValues[val.slug] = val.value;
        Object.assign(validationFields, {
            [val.slug]: yup.string().required(`Please enter ${val.name}`)
        })
    });
    const validationSchema = yup.object().shape({ ...validationFields });

    /**
     * Props changed event listener
     */
    React.useEffect(() => {
        setStatus(props.details.status === 1)
        if (props.permission) {
            setPermission(
                (props.permission('save') || props.permission('update'))
            )
        }

        if (props.details.credentials) {
            props.details.credentials.map(val => {
                setValue(val.slug, val.value, { shouldDirty: false, shouldValidate: true });
            });
        }
    }, [props]);

    const {
        control,
        formState: { isValid, dirtyFields, errors },
        handleSubmit,
        setValue
    } = useForm({
        mode: 'onChange',
        defaultValues: defaultValues,
        resolver: yupResolver(validationSchema),
    });

    const formSubmit = (data) => {
        let form_data = new FormData();
        const params = details.credentials.map(cr => {
            return {
                id: cr.id,
                value: data[cr.slug]
            }
        });

        details.credentials.map((cr, indx) => {
            details.credentials[indx].value = data[cr.slug]
        });
        form_data.append('credentials', JSON.stringify(params));
        form_data.append('id', props.details.id);
        form_data.append('logo', logo);
        form_data.append('status', status ? 1 : 0);

        setLoading(true)
        axios.post(jwtServiceConfig.savePaymentMethodConfiguration, form_data)
            .then((response) => {
                setLoading(false)
                if (response.data.results.status) {
                    // setCredentials(credentials);
                    setDetials(props.details)
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }))
                    props.retrieveGateways();
                    document.querySelector('.gateway_logo').value = '';
                    setLogo('');
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                }
            })
            .catch(error => {
                setLoading(false);
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            }
            );
    }

    const {
        control: modalControl,
        formState: { isValid: isModalValid, dirtyFields: modalDirtyField },
        handleSubmit: handleModalSubmit,
        reset: modalFormReset
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            password: ''
        },
        resolver: yupResolver(modalValidationSchema),
    });

    /**
     * Dispatched Action to verify Account Password
     */
    const onModalSubmit = (data) => {
        dispatch(confirmAccountPassword(data));
    }

    /**
     * Show / Hide Password Icon Variable Set
     * @param confirmAccountStatus [true|false]
     */
    const [showPassword, setShowPassword] = React.useState(confirmAccountStatus);

    const handleClickShowPassword = () => {
        setShowPassword(true);
        // If not confirmed account password, show Modal.
        if (!confirmAccountStatus) {
            setToggleModal(true);
        }
    };

    /**
     * Account status changed listener
     */
    React.useEffect(() => {
        if (confirmAccountStatus === true) {
            setToggleModal(false);
        }
    }, [confirmAccountStatus]);

    const handleModalClose = () => {
        setToggleModal(false);
        setShowPassword(false);
        modalFormReset({ password: '' })
    }
    const handleStatus = (event) => {
        setStatus(event.target.checked);
    }
    const selectedFile = (event) => {
        event.target.files.length > 0 ? setLogo(event.target.files[0]) : '';
    }
    return (
        <>
            <Modal
                hideBackdrop
                open={toggleModal}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
                <Box sx={modalStyle}>
                    <h2 id="child-modal-title">Hey, {user.first_name}!</h2>
                    <p id="child-modal-description">
                        Please confirm your account password
                    </p>
                    <form
                        name="AutoresponderForm"
                        noValidate
                        className="flex flex-col justify-center w-full mt-32"
                        onSubmit={handleModalSubmit(onModalSubmit)}
                    >
                        <Controller
                            name="password"
                            control={modalControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="password"
                                    className="mb-24"
                                    label="Password"
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />


                        <div className='flex justify-between'>
                            <Button
                                variant="contained"
                                component="label"
                                className=""
                                color="primary"
                                onClick={handleModalClose}
                            >Close</Button>

                            <LoadingButton
                                variant="contained"
                                color="secondary"
                                aria-label="Confirm"
                                loading={loading}
                                type="submit"
                                size="large"
                                disabled={!Object.keys(modalDirtyField).length || !isModalValid}
                            >
                                Confirm
                            </LoadingButton>

                        </div>
                    </form>
                </Box>
            </Modal>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                }}
            >
                <div>
                    <Typography variant="h6">{props.gateway}</Typography>
                    <Typography variant="body2">Please add below details</Typography>
                </div>
                <Divider style={{ marginBottom: '4rem', marginTop: '1.5rem' }} />

                <form
                    name="PaypalForm"
                    noValidate
                    className="flex flex-col justify-center w-full mt-24"
                    onSubmit={handleSubmit(formSubmit)}
                >
                    <div className="flex w-full mb-20 justify-center items-center">
                        <div className="flex w-1/2 justify-end pr-36">
                            <Avatar
                                sx={{
                                    backgroundColor: 'background.paper',
                                    color: 'text.secondary',
                                    height: 100,
                                    width: 100
                                }}
                                className="avatar text-50 font-bold edit-hover"
                                src={props.details.logo}
                                alt="Avatar"
                            >
                            </Avatar>
                        </div>
                        <div className="flex-col justify-center w-1/2 my-20 pl-36">
                            <div className="pb-36">
                                <input
                                    accept="image/*"
                                    id={details.id}
                                    type="file"
                                    className="gateway_logo"
                                    onChange={(event) => selectedFile(event)}
                                    name={details.logo}
                                    disabled={
                                        (!permission) ? true : ((details.credentials[0].auth && !confirmAccountStatus) ? true : false)
                                    }
                                />
                            </div>
                            <div className>
                                Status <Switch
                                    className="mb-0"
                                    checked={status}
                                    onChange={(event) => { event.preventDefault(); handleStatus(event) }}
                                    disabled={
                                        (!permission) ? true : ((details.credentials[0].auth && !confirmAccountStatus) ? true : false)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    {
                        details.credentials.map((el, indx) => {
                            return (
                                <Controller
                                    key={indx}
                                    name={el.slug}
                                    control={control}
                                    render={({ field }) => (

                                        <FormControl sx={{ m: 1, width: 'full' }} variant="outlined">
                                            <InputLabel htmlFor={el.slug}>{el.name}</InputLabel>
                                            <OutlinedInput
                                                {...field}
                                                id={el.slug}
                                                type="text"
                                                endAdornment={
                                                    (el.value && el.auth) ?
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowPassword}
                                                                edge="end"
                                                            >
                                                                {!showPassword ? <VisibilityOff /> : ''}
                                                            </IconButton>
                                                        </InputAdornment>
                                                        : ''
                                                }
                                                label={el.name}
                                                disabled={
                                                    (!permission) ? true : ((el.value && el.auth && !confirmAccountStatus) ? true : false)
                                                }

                                            />
                                        </FormControl>
                                    )}
                                />
                            )
                        })
                    }

                    {
                        permission ?
                            <div className='flex justify-end'>
                                <LoadingButton
                                    variant="contained"
                                    color="secondary"
                                    aria-label="Save"
                                    loading={loading}
                                    type="submit"
                                    size="large"
                                    disabled={
                                        (!confirmAccountStatus || !isValid) &&
                                        (Object.keys(dirtyFields).length != details.credentials.length) // If no. of dirtyfields & total no. of fields count check
                                    }
                                >
                                    Save
                                </LoadingButton>

                            </div>
                            : ''
                    }
                </form>
            </Box>
        </>
    );
}

export default PaymentCredentials