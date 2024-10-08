import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Button, TextField } from '@mui/material';
import * as yup from 'yup';
import _ from '@lodash';
import axios from 'axios';
import { useEffect } from 'react';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';
import jwtService from '../../../auth/services/jwtService/jwtService';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { selectUser, setUser } from 'app/store/userSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
    firstName: yup
        .string()
        .required('Please enter your first name'),
    lastName: yup
        .string()
        .required('Please enter your last name'),
});

const defaultValues = {
    firstName: '',
    lastName: '',
    phone: '',
};

function Account() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });
    const { isValid, dirtyFields, errors } = formState;
    useEffect(() => {
        setValue('firstName', user.first_name, { shouldDirty: true, shouldValidate: false });
        setValue('lastName', user.last_name, { shouldDirty: true, shouldValidate: false });
        setValue('phone', user.phone_no, { shouldDirty: true, shouldValidate: false });
    }, [setValue]);

    const onSubmit = ({ firstName, lastName, phone }) => {
        axios.post(jwtServiceConfig.updateProfile, {
            type: 'basic_details',
            first_name: firstName,
            last_name: lastName,
            phone_no: phone
        })
            .then((response) => {
                if (response.data.status) {
                    jwtService.getProfile().then(user => dispatch(setUser(user)));
                    dispatch(showMessage({ variant: 'success', message: response.data.message }));
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <div className="w-full mx-auto sm:mx-0">
                <form
                    name="profileForm"
                    noValidate
                    className="flex flex-col justify-center w-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                className="mb-24"
                                label="First Name"
                                type="text"
                                error={!!errors.firstName}
                                helperText={errors?.firstName?.message}
                                variant="outlined"
                                required
                                fullWidth
                            />
                        )}
                    />

                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                className="mb-24"
                                label="Last Name"
                                type="text"
                                error={!!errors.lastName}
                                helperText={errors?.lastName?.message}
                                variant="outlined"
                                required
                                fullWidth
                            />
                        )}
                    />

                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                className="mb-24"
                                label="Phone"
                                type="text"
                                error={!!errors.phone}
                                helperText={errors?.phone?.message}
                                variant="outlined"
                                fullWidth
                            />
                        )}
                    />

                    <span className="flex items-center justify-center">
                        <Button
                            variant="contained"
                            color="secondary"
                            className="w-1/2 mt-24"
                            aria-label="Save"
                            disabled={_.isEmpty(dirtyFields) || !isValid}
                            type="submit"
                            size="large"
                        >
                            Save
                        </Button>
                    </span>
                </form>
            </div>
        </div>
    )
}

export default Account;