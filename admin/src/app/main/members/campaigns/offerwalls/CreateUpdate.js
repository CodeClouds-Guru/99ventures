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
    mode: yup.string().required('Please enter Mode'),
    campaign_id_variable: yup.string().required('Please enter Campaign ID Variable'),
    campaign_name_variable: yup.string().required('Please enter Campaign Name Variable'),
    sub_id_variable: yup.string().required('Please enter Sub ID Variable'),
    reverse_variable: yup.string().required('Please enter Reverse Variable'),
    reverse_variable_value: yup.string().required('Please enter Reverse Variable Value'),
    response_ok: yup.string().required('Please enter Response OK'),
    response_fail: yup.string().required('Please enter Response Fail'),
    currency_variable: yup.string().required('Please enter Currency Variable'),
    percent: yup.number().required('Please enter Percent').typeError('Please insert only number'),
    max: yup.number().required('Please enter MAX').typeError('Please insert only number'),
});

const defaultValues = {
    premium_configuration: '',
    name: '',
    sub_id_prefix: '',
    mode: '',
    campaign_id_variable: '',
    campaign_name_variable: '',
    sub_id_variable: '',
    reverse_variable: '',
    reverse_variable_value: '',
    response_ok: '',
    response_fail: '',
    currency_variable: '',
    percent: '',
    max: '',
};

const CreateUpdate = () => {
    const module = 'offerwalls';
    const campaignId = useParams().campaignId;
    const moduleId = useParams().moduleId || 'create';
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const [logPostbackErrors, setLogPostbackErrors] = useState(false);
    const [secureSubIDs, setSecureSubIDs] = useState(false);
    const [status, setStatus] = useState(true);
    const [IPs, setIPs] = useState([]);
    const [allowFromAnyIP, setAllowFromAnyIP] = useState(false);

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
        setValue('mode', '', { shouldDirty: true, shouldValidate: false });
        setValue('campaign_id_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('campaign_name_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('sub_id_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('reverse_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('reverse_variable_value', '', { shouldDirty: true, shouldValidate: false });
        setValue('response_ok', '', { shouldDirty: true, shouldValidate: false });
        setValue('response_fail', '', { shouldDirty: true, shouldValidate: false });
        setValue('currency_variable', '', { shouldDirty: true, shouldValidate: false });
        setValue('percent', '', { shouldDirty: true, shouldValidate: false });
        setValue('max', '', { shouldDirty: true, shouldValidate: false });
        moduleId === 'create' ? '' : getSingleOfferwall();
    }, [setValue]);
    const getSingleOfferwall = () => {
        axios.get(jwtServiceConfig.getSingleOfferwall + `/${moduleId}`)
            .then((response) => {
                if (response.data.results.status && response.data.results.result) {
                    // setSingleCampaignData(response.data.results.result)
                    setValue('premium_configuration', response.data.results.result.premium_configuration, { shouldDirty: true, shouldValidate: false });
                    setValue('name', response.data.results.result.name, { shouldDirty: true, shouldValidate: false });
                    setValue('sub_id_prefix', response.data.results.result.sub_id_prefix, { shouldDirty: true, shouldValidate: false });
                    setLogPostbackErrors(logPostbackErrors === 1)
                    'logPostbackErrors' in dirtyFields ? delete dirtyFields.logPostbackErrors : '';
                    setSecureSubIDs(secureSubIDs === 1);
                    'secureSubIDs' in dirtyFields ? delete dirtyFields.secureSubIDs : '';
                    setStatus(status === 1);
                    'status' in dirtyFields ? delete dirtyFields.status : '';
                    setValue('mode', response.data.results.result.mode, { shouldDirty: true, shouldValidate: false });
                    setIPs(IPs);
                    setAllowFromAnyIP(allowFromAnyIP === 1);
                    'allowFromAnyIP' in dirtyFields ? delete dirtyFields.allowFromAnyIP : '';
                    setValue('campaign_id_variable', response.data.results.result.campaign_id_variable, { shouldDirty: true, shouldValidate: false });
                    setValue('campaign_name_variable', response.data.results.result.campaign_name_variable, { shouldDirty: true, shouldValidate: false });
                    setValue('sub_id_variable', response.data.results.result.sub_id_variable, { shouldDirty: true, shouldValidate: false });
                    setValue('reverse_variable', response.data.results.result.reverse_variable, { shouldDirty: true, shouldValidate: false });
                    setValue('reverse_variable_value', response.data.results.result.reverse_variable_value, { shouldDirty: true, shouldValidate: false });
                    setValue('response_ok', response.data.results.result.response_ok, { shouldDirty: true, shouldValidate: false });
                    setValue('response_fail', response.data.results.result.response_fail, { shouldDirty: true, shouldValidate: false });
                    setValue('currency_variable', response.data.results.result.currency_variable, { shouldDirty: true, shouldValidate: false });
                    setValue('percent', response.data.results.result.percent, { shouldDirty: true, shouldValidate: false });
                    setValue('max', response.data.results.result.max, { shouldDirty: true, shouldValidate: false });
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    const handlePostbackErrorCheckbox = (event) => {
        setLogPostbackErrors(event.target.checked);
    }
    const handleSecureSubIDs = (event) => {
        setSecureSubIDs(event.target.checked);
    }
    const handleStatus = (event) => {
        setStatus(event.target.checked);
    }
    const handleIPs = (val) => {
        setIPs(val);
    }
    const handleAllowFromAny = (event) => {
        setIPs([])
        'IPs' in dirtyFields ? delete dirtyFields.IPs : '';
        setAllowFromAnyIP(event.target.checked);
    }
    const onSubmit = ({ premium_configuration, name, sub_id_prefix, mode, campaign_id_variable, campaign_name_variable, sub_id_variable, reverse_variable, reverse_variable_value, response_ok, response_fail, currency_variable, percent, max }) => {
        setLoading(true);
        axios.post(moduleId === 'create' ? jwtServiceConfig.offerwallsSave : jwtServiceConfig.offerwallUpdate + `/${moduleId}`, {
            campaign_id: campaignId,
            premium_configuration: premium_configuration,
            name: name,
            sub_id_prefix: sub_id_prefix,
            log_postback_errors: logPostbackErrors ? 1 : 0,
            secure_sub_ids: secureSubIDs ? 1 : 0,
            status: status ? 1 : 0,
            mode: mode,
            ips: IPs,
            allow_from_any_ip: allowFromAnyIP ? 1 : 0,
            campaign_id_variable: campaign_id_variable,
            campaign_name_variable: campaign_name_variable,
            sub_id_variable: sub_id_variable,
            reverse_variable: reverse_variable,
            reverse_value: reverse_variable_value,
            response_ok: response_ok,
            response_fail: response_fail,
            currency_variable: currency_variable,
            currency_options: 'Cash',
            currency_percent: percent,
            currency_max: max
        })
            .then((response) => {
                if (response.status === 200) {
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                    navigate(`/app/campaigns/${campaignId}/offerwalls`);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            }).finally(() => {
                setLoading(false)
            })
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
                                            label="Premium Configuration"
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
                                name="logPostbackErrors"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <FormControlLabel
                                            control={<Checkbox
                                                checked={logPostbackErrors}
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
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-15">
                                        <FormGroup aria-label="position" row>
                                            <FormControlLabel
                                                {...field}
                                                control={<Switch
                                                    className="mb-24"
                                                    checked={status}
                                                    onChange={handleStatus}
                                                />}
                                                label="Status"
                                                labelPlacement="top"
                                            />
                                        </FormGroup>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="mode"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <InputLabel id="demo-select-small" >Mode*</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="demo-select-small"
                                            id="demo-select-small"
                                            label="Mode"
                                            error={!!errors.mode}
                                            required
                                        >
                                            <MenuItem value="reward_tool">Reward Tool</MenuItem>
                                            <MenuItem value="postback">Postback</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="IPs"
                                control={control}
                                render={() => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <AddMore
                                            permission={true}
                                            required={!allowFromAnyIP}
                                            data={IPs}
                                            placeholder="IPs"
                                            onChange={handleIPs}
                                            validationRegex="(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])"
                                        />
                                        <FormHelperText error>{errors?.IPs?.message}</FormHelperText>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="allowFromAnyIP"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <FormControlLabel
                                            control={<Checkbox
                                                checked={allowFromAnyIP}
                                                onChange={handleAllowFromAny}
                                                inputProps={{ 'aria-label': 'controlled' }} />}
                                            label="Allow from any IP"
                                            labelPlacement="end"
                                        />
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="campaign_id_variable"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Campaign ID Variable"
                                        type="text"
                                        error={!!errors.campaign_id_variable}
                                        helperText={errors?.campaign_id_variable?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="campaign_name_variable"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Campaign Name Variable"
                                        type="text"
                                        error={!!errors.campaign_name_variable}
                                        helperText={errors?.campaign_name_variable?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="sub_id_variable"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Sub ID Variable"
                                        type="text"
                                        error={!!errors.sub_id_variable}
                                        helperText={errors?.sub_id_variable?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="reverse_variable"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Reverse Variable"
                                        type="text"
                                        error={!!errors.reverse_variable}
                                        helperText={errors?.reverse_variable?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="reverse_variable_value"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Reverse Variable Value"
                                        type="text"
                                        error={!!errors.reverse_variable_value}
                                        helperText={errors?.reverse_variable_value?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="response_ok"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Response OK"
                                        type="text"
                                        error={!!errors.response_ok}
                                        helperText={errors?.response_ok?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="response_fail"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Response Fail"
                                        type="text"
                                        error={!!errors.response_fail}
                                        helperText={errors?.response_fail?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="currency_variable"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-1/2 mb-10 p-5">
                                        <InputLabel id="demo-select-small" >Currency Variable*</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="demo-select-small"
                                            id="demo-select-small"
                                            label="Premium Configuration"
                                            error={!!errors.currency_variable}
                                            required
                                        >
                                            <MenuItem value="cash">Cash</MenuItem>
                                            <MenuItem value="point">Point</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="percent"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Percent"
                                        type="text"
                                        error={!!errors.percent}
                                        helperText={errors?.percent?.message}
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="max"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="MAX"
                                        type="text"
                                        error={!!errors.max}
                                        helperText={errors?.max?.message}
                                        variant="outlined"
                                        required
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