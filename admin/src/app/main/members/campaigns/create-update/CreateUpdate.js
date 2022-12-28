import { useState, useEffect } from 'react';
import { Typography, FormControl, TextField, Paper, Select, InputLabel, Tooltip, IconButton, Avatar, MenuItem, Divider, TextareaAutosize } from '@mui/material';
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
    affiliate_network: yup.string().required('Please enter Affiliate Network'),
    payout_amount: yup.number().required('Please enter Payout Amount').typeError('Please insert only number'),
    trigger_postback: yup.string().required('Please enter Trigger Postback'),
    postback_url: yup.string().required('Please enter Postback URL'),
    condition_type: yup.number().required('Please enter Condition Type'),
    condition_currency: yup.string().required('Please enter Condition Currency'),
    condition_amount: yup.number().required('Please enter Condition Amount').typeError('Please insert only number'),
});

const defaultValues = {
    name: '',
    description: '',
    affiliate_network: '',
    trigger_postback: '',
    postback_url: '',
    condition_type: '',
    payout_amount: '',
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
                name="campaignCreateForm"
                noValidate
                className="flex flex-col justify-center w-full mt-10"
                onSubmit={handleSubmit(onSubmit)}
            >

                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                        <div className="w-full justify-between">
                            <Divider textAlign="left"><h3>General</h3></Divider>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        className="w-1/2 mb-10 p-5"
                                        {...field}
                                        label="Name"
                                        type="text"
                                        error={!!errors.first_name}
                                        helperText={errors?.first_name?.message}
                                        variant="outlined"
                                        required
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
                                    />
                                )}
                            />
                            <Divider textAlign="left"><h3>Affiliate Network/Postback</h3></Divider>
                            <Divider textAlign="left"><h3>Conditions</h3></Divider>
                        </div>
                    </div>
                </Paper>
            </form>
        </>
    )
}

export default CreateUpdate;