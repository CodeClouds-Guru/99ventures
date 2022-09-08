import * as React from 'react';
import { Box, TextField, Modal, Button, Typography, Divider, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { confirmAccountPassword } from 'app/store/accountSlice';

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
    const confirmAccount = useSelector(state => state.account.confirm_account);
    const [ loading, setLoading ] = React.useState(false);
    const [ credentials, setCredentials ] = React.useState(props.credentials);
    const [ permission, setPermission ] = React.useState(false);
    const [ toggleModal, setToggleModal ] = React.useState(false);
    const [ showPopup, setShowPopup ] = React.useState('false');

    console.log('confirmAccount',   confirmAccount)

    const defaultValues = {};
    const validationFields = {};
    const fieldsIcon = {};
    credentials.map(val => {
        fieldsIcon[val.slug + '_password'] = false;
        defaultValues[val.slug] = val.value;
        Object.assign(validationFields, {
            [val.slug]: yup.string().required(`Please enter ${val.name}`)
        })
    });
    const validationSchema = yup.object().shape({ ...validationFields});

    
    React.useEffect(() => { 
        setPermission(
            (props.permission('save') || props.permission('update'))
        )
    }, [props.permission])

    const { 
        control, 
        // register,
        formState: { isValid, dirtyFields, errors }, 
        handleSubmit
    } = useForm({
        mode: 'onChange',
        defaultValues: defaultValues,
        resolver: yupResolver(validationSchema),
    });

    const formSubmit = (data) => {
        console.log('data', data);
        const params = credentials.map(cr => {
            return {
                id: cr.id,
                value: data[cr.slug]
            }
        });
        
        credentials.map((cr, indx) => {
            credentials[indx].value = data[cr.slug]
        })
        
        setLoading(true)
        axios.post('/payment-methods/update', {credentials: params})
        .then((response) => {
            setLoading(false)
            if (response.data.status) {
                setCredentials([...credentials]);
                dispatch(showMessage({ variant: 'success', message: response.data.message }))
            } else {
                dispatch(showMessage({ variant: 'error', message: response.data.message }))
            }
        })
        .catch(error => dispatch(showMessage({ variant: 'error', message: error.response.data.errors })));
    }

    const { 
        control: modalControl,
        formState: { isValid: isModalValid, dirtyFields: modalDirtyField }, 
        handleSubmit: handleModalSubmit
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            password: ''
        },
        resolver: yupResolver(modalValidationSchema),
    });

    const onModalSubmit = () => {
        console.log('Modal Submit');
        dispatch(confirmAccountPassword())
    }

    /**
     * Show / Hide Icon Variable Set
     */
    const [values, setValues] = React.useState({
        ...fieldsIcon
    });
    const handleClickShowPassword = (field) => {
        setValues({
            ...values,
            [field]: !values[field],
        });
        setShowPopup('true');
        setToggleModal(true);
        console.log(showPopup)
    };

    return (
        <>
            <Modal
                hideBackdrop
                open={toggleModal}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
                style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
            >
                <Box sx={modalStyle}>
                    <h2 id="child-modal-title mb-24">Confirm Account</h2>
                    {/* <p id="child-modal-description">
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    </p> */}
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
                                onClick={ ()=> setToggleModal(false) }
                            >Close</Button>

                            <LoadingButton
                                variant="contained"
                                color="secondary"
                                aria-label="Confirm"                        
                                loading={loading}
                                type="submit"
                                size="large"
                                disabled={ !Object.keys(modalDirtyField).length || !isModalValid}
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
                    <Typography variant="h6">{ props.gateway }</Typography>            
                    <Typography variant="body2">Please add below details</Typography>
                </div>
                <Divider style={{ marginBottom: '4rem', marginTop: '1.5rem'}}/>
                <div>Show Auth Popup { showPopup }</div>
                <form
                    name="PaypalForm"
                    noValidate  
                    className="flex flex-col justify-center w-full mt-24"
                    onSubmit={handleSubmit(formSubmit)}
                >
                    
                    {
                        credentials.map((el, indx) => {   
                            const fieldTypeVal = values[el.slug+'_password'];           
                            return (
                                <Controller
                                    key={ indx }
                                    name={ el.slug }
                                    control={control}
                                    render={({ field }) => (

                                        <FormControl sx={{ m: 1, width: 'full' }} variant="outlined">
                                            <InputLabel htmlFor={ el.slug }>{ el.name }</InputLabel>
                                            <OutlinedInput
                                                {...field}
                                                id={ el.slug }
                                                type={ fieldTypeVal ? 'text' : 'password'}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={() => handleClickShowPassword( el.slug+'_password' )}                                                        
                                                            edge="end"
                                                        >
                                                        { fieldTypeVal ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                label={ el.name }
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
                                    disabled={ !Object.keys(dirtyFields).length || !isValid}
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