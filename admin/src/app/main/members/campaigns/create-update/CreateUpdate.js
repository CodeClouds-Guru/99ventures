import { useState, useEffect } from 'react';
import { Typography, FormControl, TextField, Paper, Select, InputLabel, MenuItem, Divider, InputAdornment, FormHelperText, FormControlLabel, FormGroup, Switch, Tooltip } from '@mui/material';
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
    postback_url: yup.string().required('Please enter Postback URL'),
    condition_type: yup.string().required('Please enter Condition Type'),
    // condition_currency: yup.string().required('Please enter Condition Currency'),
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
    // condition_currency: '',
    condition_amount: '',
    status: '',
};

const CreateUpdate = () => {
    const module = 'campaigns';
    const moduleId = useParams().moduleId || 'create';
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const [status, setStatus] = useState(true)
    const [singleCampaignData, setSingleCampaignData] = useState({})

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
        // setValue('condition_currency', '', { shouldDirty: true, shouldValidate: false });
        setValue('condition_amount', '', { shouldDirty: true, shouldValidate: false });
        setValue('status', '', { shouldDirty: true, shouldValidate: false });
        moduleId === 'create' ? '' : getSingleCampaign();
    }, [setValue]);

    const handleDefaultValues = (event, field_name) => {
        // console.log(event.target.value, field_name)
        field_name === 'postback_url' ?
            setValue(field_name, `${defaultValues['affiliate_network']}/?%trackId%=${defaultValues['track_id']}&%payout%=${defaultValues['payout_amount']}&%status%=`, { shouldDirty: false, shouldValidate: false })
            :
            setValue(field_name, event.target.value, { shouldDirty: true, shouldValidate: false });
    }
    const handleStatus = (event) => {
        dirtyFields.status = true
        setStatus(event.target.checked)
    }
    const clickToCopy = (text) => {
        Helper.copyTextToClipboard(text).then(res => {
            dispatch(showMessage({ variant: 'success', message: 'Copied' }));
        }).catch((error) => {
            dispatch(showMessage({ variant: 'error', message: error }))
        })
    }
    const getSingleCampaign = () => {
        axios.get(jwtServiceConfig.getSingleCampaign + `/${moduleId}`)
            .then((response) => {
                if (response.data.results.status && response.data.results.result) {
                    setSingleCampaignData(response.data.results.result)
                    setValue('name', response.data.results.result.name, { shouldDirty: false, shouldValidate: true });
                    setValue('description', response.data.results.result.description, { shouldDirty: false, shouldValidate: true });
                    setValue('affiliate_network', response.data.results.result.affiliate_network, { shouldDirty: false, shouldValidate: true });
                    setValue('payout_amount', response.data.results.result.payout_amount, { shouldDirty: false, shouldValidate: true });
                    setValue('trigger_postback', response.data.results.result.trigger_postback, { shouldDirty: false, shouldValidate: true });
                    setValue('track_id', response.data.results.result.track_id, { shouldDirty: false, shouldValidate: true });
                    setValue('postback_url', response.data.results.result.postback_url, { shouldDirty: false, shouldValidate: true });
                    setValue('condition_type', response.data.results.result.condition_type, { shouldDirty: false, shouldValidate: true });
                    // setValue('condition_currency', response.data.results.result.condition_currency, { shouldDirty: false, shouldValidate: true });
                    setValue('condition_amount', response.data.results.result.condition_amount, { shouldDirty: false, shouldValidate: true });
                    setStatus(response.data.results.result.status === 'active');
                    'status' in dirtyFields ? delete dirtyFields.status : '';
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    const onSubmit = ({ name, description, affiliate_network, payout_amount, trigger_postback, track_id, postback_url, condition_type,
        // condition_currency,
        condition_amount }) => {
        setLoading(true);
        let form_data = {
            name: name,
            description: description,
            affiliate_network: affiliate_network,
            payout_amount: payout_amount,
            trigger_postback: trigger_postback,
            track_id: track_id,
            postback_url: postback_url,
            condition_type: condition_type,
            condition_currency: 'cash',
            condition_amount: condition_amount,
            status: status ? 'active' : 'inactive'
        };

        axios.post(moduleId === 'create' ? jwtServiceConfig.campaignsSave : jwtServiceConfig.campaignUpdate + `/${moduleId}`, form_data)
            .then((response) => {
                if (response.status === 200) {
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                    navigate(`/app/campaigns`);
                    // navigate(`/app/campaigns/${response.data.results.result.id}`);
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
                                        <Tooltip title="Click to copy" placement="right">
                                            <FormHelperText color="primary" onClick={() => clickToCopy('%trackId%=&%payout%=&%status%=')} className="cursor-pointer w-1/3" variant="standard">
                                                <b>%trackId%=&%payout%=&%status%=</b>
                                            </FormHelperText>
                                        </Tooltip>
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
                            {/* <Controller
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
                            /> */}
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
                            {moduleId !== 'create' &&
                                <>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl className="w-1/2 mb-10 p-15">
                                                <FormGroup aria-label="position" row>
                                                    <FormControlLabel
                                                        {...field}
                                                        value="top"
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
                                    {Object.keys(singleCampaignData).length > 0 &&
                                        <>
                                            <Divider className="pb-10" textAlign="left"><h3>Campaign Link</h3></Divider>
                                            <div className="w-full border-3">
                                                <div className="flex w-full justify-center m-10">
                                                    <div className="flex w-2/12 mr-5"> <b> Home Page :</b></div>
                                                    <div className="w-10/12 ml-5"> {singleCampaignData.campaign_link.home_page_url}</div>
                                                </div>
                                                <div className="flex w-full justify-center m-10">
                                                    <div className="flex w-2/12 mr-5"> <b> Registration Page :</b></div>
                                                    <div className="w-10/12 ml-5"> {singleCampaignData.campaign_link.registration_page_url}</div>
                                                </div>
                                                <div className="flex w-full justify-center m-10 pt-5">
                                                    <div className="flex w-2/12 mr-5"> <h3> <b> Referral Link -</b></h3></div>
                                                    <div className="w-10/12 ml-5"> <h3> {singleCampaignData.campaign_link.referral_link}</h3></div>
                                                </div>
                                                <div className="flex w-full justify-center m-10">
                                                    <div className="flex w-2/12 mr-5"> <b> Home Page :</b></div>
                                                    <div className="w-10/12 ml-5"> {singleCampaignData.campaign_link.ref_home_page_url}</div>
                                                </div>
                                                <div className="flex w-full justify-center m-10">
                                                    <div className="flex w-2/12  mr-5"> <b> Registration Page :</b></div>
                                                    <div className="w-10/12 ml-5"> {singleCampaignData.campaign_link.ref_registration_page_url}</div>
                                                </div>
                                            </div>
                                        </>}
                                </>
                            }
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