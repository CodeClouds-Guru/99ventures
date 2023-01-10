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
    postback_error_checkbox: false,
    secure_sub_ids: '',
    status: '',
    mode: '',
    ips: [],
    allow_from_any: false,
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

    return (
        'Offerwalls Create Update form will be coming soon'
    )
}

export default CreateUpdate;