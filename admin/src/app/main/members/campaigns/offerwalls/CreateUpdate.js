import { useState, useEffect } from 'react';
import { Typography, FormControl, TextField, Paper, Select, InputLabel, MenuItem, Divider, InputAdornment, FormHelperText, FormControlLabel, FormGroup, Switch, Tooltip, Checkbox } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { Link, useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import _ from '@lodash';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import Helper from 'src/app/helper';
import AddMore from 'app/shared-components/AddMore';


const schema = yup.object().shape({
    premium_configuration: yup.string().required('Please enter Premium Configuration'),
    name: yup.string().required('Please enter Name'),
    sub_id_prefix: yup.string().required('Please enter Sub ID Prefix'),
    status: yup.string().required('Please enter Status'),
    mode: yup.string().required('Please enter Mode'),
    campaign_id_variable: yup.string().required('Please enter Campaign ID Variable'),
    campaign_name_variable: yup.string().required('Please enter Campaign Name Variable'),
    sub_id_variable: yup.string().required('Please enter Sub ID Variable'),
    reverse_variable_1: yup.string().required('Please enter Reverse Variable 1'),
    reverse_variable_2: yup.string().required('Please enter Reverse Variable 2'),
    currency_variable: yup.string().required('Please enter Currency Variable'),
    percent: yup.string().required('Please enter Percent'),
    max: yup.string().required('Please enter Max'),
});

const defaultValues = {
    premium_configuration: '',
    name: '',
    sub_id_prefix: '',
    status: '',
    mode: '',
    campaign_id_variable: '',
    campaign_name_variable: '',
    sub_id_variable: '',
    reverse_variable_1: '',
    reverse_variable_2: '',
    currency_variable: '',
    percent: 100,
    max: 0,
};

const CreateUpdate = () => {
    const module = 'offerwalls';
    const moduleId = useParams().moduleId || 'create';
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const [postbackErrorCheckbox, setPostbackErrorCheckbox] = useState(false);
    let [secureSubIDs, setSecureSubIDs] = useState(false);
    let [ips, setIps] = useState([]);
    let [allowFromAny, setAllowFromAny] = useState(false);

    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const { isValid, dirtyFields, errors } = formState;
    useEffect(() => {
        setValue('premium_configuration', '', { shouldDirty: true, shouldValidate: false });
        setValue('name', '', { shouldDirty: true, shouldValidate: false });
        setValue('sub_id_prefix', '', { shouldDirty: true, shouldValidate: false });
        setValue('status', '', { shouldDirty: true, shouldValidate: false });
        setValue('mode', '', { shouldDirty: true, shouldValidate: false });
        setValue('campaign_id_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('campaign_name_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('sub_id_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('reverse_variable_1', '', { shouldDirty: true, shouldValidate: false });
        setValue('reverse_variable_2', '', { shouldDirty: true, shouldValidate: false });
        setValue('currency_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('percent', '', { shouldDirty: true, shouldValidate: false });
        setValue('max', '', { shouldDirty: true, shouldValidate: false });
        moduleId === 'create' ? '' : getSingleOfferwall();
    }, [setValue]);

    const getSingleOfferwall = () => {

    }
    const handlePostbackErrorCheckbox = (event) => {
        setPostbackErrorCheckbox(event.target.checked);
    }
    const handleSecureSubIDs = (event) => {
        setSecureSubIDs(event.target.checked);
    }
    const handleIPs = (val) => {
        setIps(val);
    }
    const handleAllowFromAny = (event) => {
        setAllowFromAny(event.target.checked);
    }
    const onSubmit = () => {

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
                name="OfferwallCreateUpdateForm"
                noValidate
                className="flex flex-col justify-center w-full mt-10"
                onSubmit={handleSubmit(onSubmit)}
            >

                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                        <div className="w-full justify-between">
                            <Divider className="pb-10" textAlign="left"><h3>General</h3></Divider>
                            <Controller
                                name="premium_configuration"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <InputLabel id="demo-select-small" >Premium Configuration*</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="demo-select-small"
                                            id="demo-select-small"
                                            label="Trigger Postback"
                                            error={!!errors.premium_configuration}
                                            required
                                        >
                                            <MenuItem value="custom">Custom</MenuItem>
                                            <MenuItem value="premium">Premium</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
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
                                    />
                                )}
                            />
                            <Controller
                                name="sub_id_prefix"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Sub ID Prefix"
                                        type="text"
                                        error={!!errors.sub_id_prefix}
                                        helperText={errors?.sub_id_prefix?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="postbackErrorCheckbox"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <FormControlLabel
                                            value="end"
                                            control={<Checkbox
                                                checked={postbackErrorCheckbox}
                                                onChange={handlePostbackErrorCheckbox}
                                                inputProps={{ 'aria-label': 'controlled' }} />}
                                            label="Do not log Postback errors if the Sub ID does not contain the prefix. This is to block your other websites from showing in the error log."
                                            labelPlacement="end"
                                        />
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="secureSubIDs"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <FormControlLabel
                                            value="end"
                                            control={<Checkbox
                                                checked={secureSubIDs}
                                                onChange={handleSecureSubIDs}
                                                inputProps={{ 'aria-label': 'controlled' }} />}
                                            label="Secure Sub IDs"
                                            labelPlacement="end"
                                        />
                                    </FormControl>
                                )}
                            />
                            <Divider className="pb-10" textAlign="left"><h3>Postback</h3></Divider>

                        </div>
                    </div>
                </Paper>
            </form>
        </>
    )
}

export default CreateUpdate;