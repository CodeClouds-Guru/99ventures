import * as React from 'react';
import { Box, TextField, Typography, Divider } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import axios from 'axios';

const PaymentCredentials = (props) => {
    const dispatch = useDispatch();
    const [ loading, setLoading ] = React.useState(false);
    const [ credentials, setCredentials ] = React.useState(props.credentials);
    // const credentials = props.credentials;

    const defaultValues = {};
    let validationFields = {};

    credentials.map(val => {
        defaultValues[val.slug] = val.value;
        Object.assign(validationFields, {
            [val.slug]: yup.string().required(`Please enter ${val.name}`)
        })
    });

    const validationSchema = yup.object().shape({ ...validationFields});

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

    // console.log(errors)
    // console.log(dirtyFields)

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

    return (
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
            <form
                name="PaypalForm"
                noValidate  
                className="flex flex-col justify-center w-full mt-24"
                onSubmit={handleSubmit(formSubmit)}
            >
                {
                    credentials.map((el, indx) => {                        
                        return (
                            <Controller
                                key={ indx }
                                name={ el.slug }
                                control={control}
                                render={({ field }) => (
                                    <TextField 
                                        {...field}
                                        fullWidth 
                                        label={ el.name }
                                        id="fullWidth" 
                                        className="mb-24"
                                        required
                                    />
                                )}
                            />
                        )                        
                    })
                }
                

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
            </form>
        </Box>
    );
}

export default PaymentCredentials