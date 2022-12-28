import { useState, useEffect } from 'react';
import { Typography, FormControl, TextField, Paper, Select, InputLabel, Tooltip, IconButton, Avatar, MenuItem, Divider, TextareaAutosize, OutlinedInput, InputAdornment, FormHelperText } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { Link, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ClearIcon from '@mui/icons-material/Clear';
import UploadIcon from '@mui/icons-material/Upload';
import { styled } from '@mui/material/styles';
import moment from 'moment';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import _ from '@lodash';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const schema = yup.object().shape({
    name: yup.string().required('Please enter Name'),
    description: yup.string().required('Please enter Description'),
    affiliate_network: yup.string().matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter correct URL!'
    ).required('Please enter Affiliate Network'),
    payout_amount: yup.number().required('Please enter Payout Amount').typeError('Please insert only number'),
    track_id: yup.string().required('Please enter Track ID'),
    trigger_postback: yup.string().required('Please enter Trigger Postback'),
    postback_url: yup.string().matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter correct URL!'
    ).required('Please enter Postback URL'),
    condition_type: yup.string().required('Please enter Condition Type'),
    condition_currency: yup.string().required('Please enter Condition Currency'),
    condition_amount: yup.number().required('Please enter Condition Amount').typeError('Please insert only number'),
});

const defaultValues = {
    name: '',
    description: '',
    affiliate_network: '',
    payout_amount: '',
    trigger_postback: '',
    track_id: '',
    postback_url: '',
    condition_type: '',
    condition_currency: '',
    condition_amount: '',
};

const CreateUpdate = () => {
    const module = 'campaigns';
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState('');
    const [companyPortalId, setCompanyPortalId] = useState('');
    const [avatar, setAvatar] = useState('');
    const [countryOptions, setCountryOptions] = useState([]);
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const { isValid, dirtyFields, errors } = formState;
    useEffect(() => {
        setValue('name', '', { shouldDirty: true, shouldValidate: false });
        setValue('description', '', { shouldDirty: true, shouldValidate: false });
        setValue('affiliate_network', '', { shouldDirty: true, shouldValidate: false });
        setValue('payout_amount', '', { shouldDirty: true, shouldValidate: false });
        setValue('trigger_postback', '', { shouldDirty: true, shouldValidate: false });
        setValue('track_id', '', { shouldDirty: true, shouldValidate: false });
        setValue('postback_url', '', { shouldDirty: true, shouldValidate: false });
        // setValue('postback_url', `${defaultValues['affiliate_network']}/?%trackId%=${defaultValues['track_id']}&%payout%=${defaultValues['payout_amount']}&%status%=`, { shouldDirty: true, shouldValidate: false });
        setValue('condition_type', '', { shouldDirty: true, shouldValidate: false });
        setValue('condition_currency', '', { shouldDirty: true, shouldValidate: false });
        setValue('condition_amount', '', { shouldDirty: true, shouldValidate: false });
    }, [setValue]);

    const handleDefaultValues = (event, field_name) => {
        // console.log(event.target.value, field_name)
        field_name === 'postback_url' ?
            setValue(field_name, `${defaultValues['affiliate_network']}/?%trackId%=${defaultValues['track_id']}&%payout%=${defaultValues['payout_amount']}&%status%=`, { shouldDirty: false, shouldValidate: false })
            :
            setValue(field_name, event.target.value, { shouldDirty: true, shouldValidate: false });
    }
    const onSubmit = () => {
        console.log(defaultValues)

    }

    return (
        <>
            <div className="mt-10 ml-10">
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
                >
                    <Typography
                        className="flex items-center sm:mb-12"
                        component={Link}
                        role="button"
                        to={`/app/${module}`}
                        color="inherit"
                    >
                        <FuseSvgIcon size={20}>
                            {theme.direction === 'ltr'
                                ? 'heroicons-outline:arrow-sm-left'
                                : 'heroicons-outline:arrow-sm-right'}
                        </FuseSvgIcon>
                        <span className="flex mx-4 font-medium capitalize">Campaigns</span>
                    </Typography>
                </motion.div>
                <motion.div
                    className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16"
                    initial={{ x: -20 }}
                    animate={{ x: 0, transition: { delay: 0.3 } }}
                >
                    <Typography className="text-16 sm:text-20 truncate font-semibold">
                        Add New
                    </Typography>
                </motion.div>
            </div>
            <form
                name="campaignCreateForm"
                noValidate
                className="flex flex-col justify-center w-full mt-10"
                onSubmit={handleSubmit(onSubmit)}
            >

                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                        <div className="w-full justify-between">
                            <Divider className="pb-10" textAlign="left"><h3>General</h3></Divider>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Name"
                                        type="text"
                                        error={!!errors.name}
                                        helperText={errors?.name?.message}
                                        variant="outlined"
                                        required
                                    // onChange={(event) => handleDefaultValues(event, 'name')}

                                    />
                                )}
                            />
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Description"
                                        type="text"
                                        error={!!errors.description}
                                        helperText={errors?.description?.message}
                                        variant="outlined"
                                        required
                                        multiline
                                        rows={3}
                                    // onChange={(event) => handleDefaultValues(event, 'description')}
                                    />
                                )}
                            />
                            <Divider className="pb-10" textAlign="left"><h3>Affiliate Network/Postback</h3></Divider>
                            <Controller
                                name="affiliate_network"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Affiliate Network"
                                        type="text"
                                        error={!!errors.affiliate_network}
                                        helperText={errors?.affiliate_network?.message}
                                        variant="outlined"
                                        required
                                    // onChange={(event) => handleDefaultValues(event, 'affiliate_network')}
                                    />
                                )}
                            />
                            <Controller
                                name="payout_amount"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    $
                                                </InputAdornment>
                                            ),
                                        }}
                                        label="Payout Amount"
                                        className="w-1/2 mb-10 p-5"
                                        type="text"
                                        error={!!errors.payout_amount}
                                        helperText={errors?.payout_amount?.message}
                                        variant="outlined"
                                        required
                                    // onChange={(event) => handleDefaultValues(event, 'payout_amount')}
                                    />
                                )}
                            />
                            <Controller
                                name="trigger_postback"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <InputLabel id="demo-select-small" >Trigger Postback*</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="demo-select-small"
                                            id="demo-select-small"
                                            label="Trigger Postback"
                                            error={!!errors.trigger_postback}
                                            // helperText={errors?.trigger_postback?.message}
                                            required
                                        // onChange={(event) => handleDefaultValues(event, 'trigger_postback')}
                                        >
                                            <MenuItem value="automatic">Automatic</MenuItem>
                                            <MenuItem value="manual">Manual</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="track_id"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Track ID"
                                        type="text"
                                        error={!!errors.track_id}
                                        helperText={errors?.track_id?.message}
                                        variant="outlined"
                                        required
                                    // onChange={(event) => handleDefaultValues(event, 'track_id')}
                                    />
                                )}
                            />
                            <Controller
                                name="postback_url"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full mb-10 p-5">
                                        <TextField
                                            // className="w-full mb-10 p-5"
                                            {...field}
                                            label="Postback URL"
                                            type="text"
                                            error={!!errors.postback_url}
                                            helperText={errors?.postback_url?.message}
                                            variant="outlined"
                                            required
                                        // onChange={(event) => handleDefaultValues(event, 'postback_url')}
                                        />
                                        <FormHelperText variant="standard">%trackId%=&%payout%=&%status%=</FormHelperText>
                                    </FormControl>
                                )}
                            />
                            <Divider className="pb-10" textAlign="left"><h3>Conditions</h3></Divider>
                            <Controller
                                name="condition_type"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <InputLabel id="demo-select-small" >Condition Type*</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="demo-select-small"
                                            id="demo-select-small"
                                            label="Condition Type"
                                            error={!!errors.condition_type}
                                            // helperText={errors?.condition_type?.message}
                                            required
                                        // onChange={(event) => handleDefaultValues(event, 'condition_type')}
                                        >
                                            <MenuItem value="registration">Registration</MenuItem>
                                            <MenuItem value="earn_at_least">Earn at Least</MenuItem>
                                            <MenuItem value="withdrawn_at_least">Withdrawn at Least</MenuItem>
                                            <MenuItem value="withdrawn_count">Withdrawn Count</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="condition_currency"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <InputLabel id="demo-select-small" >Condition Currency*</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="demo-select-small"
                                            id="demo-select-small"
                                            label="Condition Currency"
                                            error={!!errors.condition_currency}
                                            // helperText={errors?.condition_currency?.message}
                                            required
                                        // onChange={(event) => handleDefaultValues(event, 'condition_currency')}
                                        >
                                            <MenuItem value="cash">Cash</MenuItem>
                                            <MenuItem value="point">Point</MenuItem>
                                            <MenuItem value="combined">Combined</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="condition_amount"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Condition Amount"
                                        type="text"
                                        error={!!errors.condition_amount}
                                        helperText={errors?.condition_amount?.message}
                                        variant="outlined"
                                        required
                                    // onChange={(event) => handleDefaultValues(event, 'condition_amount')}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex justify-center">
                            <LoadingButton
                                variant="contained"
                                color="secondary"
                                className="w-1/3 mt-16"
                                aria-label="Save"
                                disabled={_.isEmpty(dirtyFields) || !isValid}
                                type="submit"
                                size="large"
                                loading={loading}
                            >
                                Save
                            </LoadingButton>
                        </div>
                    </div>
                </Paper>
            </form>
        </>
    )
}

export default CreateUpdate;