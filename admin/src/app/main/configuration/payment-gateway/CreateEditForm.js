import _ from '@lodash';
import axios from 'axios';
import * as yup from 'yup';
import * as React from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import LoadingButton from '@mui/lab/LoadingButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import AlertDialog from 'app/shared-components/AlertDialog';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import {Visibility, VisibilityOff, ExpandMore, CheckBox, CheckBoxOutlineBlank} from '@mui/icons-material';
import { Select, TextField, MenuItem, Autocomplete, Accordion, AccordionDetails, AccordionSummary, Checkbox, Button, Typography, InputLabel, FormControl, FormControlLabel, FormGroup, Switch, IconButton, OutlinedInput, InputAdornment, CircularProgress, ListItemText } from '@mui/material';


const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;
const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
const accordianStyle = {
    backgroundColor: '#eee',
    minHeight: '50px !important',
    '& .muiltr-o4b71y-MuiAccordionSummary-content.Mui-expanded': {margin: '13px 0'}
}
const defaultValues = {
    name: '',
    description: '',
    image_url: '',
    type_user_info_again: false,
    status: true,
    field_option_list: [],
    maximum_amount: 0,
    withdraw_redo_interval: 0,
    // same_account_options: 'Mark as cheater',
    past_withdrawal_options: 'At least',
    past_withdrawal_count: 0,
    // verified_options: 'Both',
    // upgrade_options: '',
    fee_percent: 0,
    api_username: '',
    api_password: '',
    api_signature: '',
    api_memo: '',
    payment_type: 'Auto',
    amount_type: 'Minimum',
    amount: 0,
    member_list: [],
    country_list: [],
};

const validationSchema = yup.object().shape({
    name: yup.string().required(`Please enter payment gateway name!`),
    field_option_list: yup.array().min(1, 'Please select payment field options!').required(),
    // api_username: yup.string().required(`Please enter API Username!`),
    // api_password: yup.string().required(`Please enter name!`),
    // api_signature: yup.string().required(`Please enter name!`),
    // api_memo: yup.string().required(`Please enter name!`),
});

const fields = [
    {
        field_name: 'Username',
        field_type: 'input',
        required: true
    },
    {
        field_name: "Full Name",
        field_type: "input",
        required: false
    },
    {
        field_name: "First Name",
        field_type: "input",
        required: false
    },
    {
        field_name: "Last Name",
        field_type: "input",
        required: false
    },
    {
        field_name: "Email",
        field_type: "email",
        required: true
    },
    {
        field_name: "Phone",
        field_type: "number",
        required: true
    }
]

const CreateEditForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { moduleId } = useParams();
    
    const [open, setOpen] = useState(false);
    const [payload, setPayload] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [memberList, setMemberList] = useState([]);
    const [pageloader, setPageloader] = useState(true);
    const [countryList, setCountryList] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [paymentFields, setPaymentFields] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedMember, setSelectedMember] = useState([]);
    const [showSignature, setShowSignature] = useState(false);
    const [memberSearchTxt, setMemberSearchTxt] = useState('');
    const [selectedCountry, setSelectedCountry] = useState([]);
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [autoCompleteLoading, setAutoCompleteLoading] = useState(false);
    
    /**
     * Toggle type of Password & Signature fields
     */
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickSignature = () => setShowSignature((show) => !show);
    
    const {
        control,
        formState: { isValid, dirtyFields, errors },
        handleSubmit,
        setValue
    } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
        if(Object.keys(errors).length) {
            Object.keys(errors).forEach((key, indx) => {
                dispatch(showMessage({ variant: 'error', message: errors[key].message }));
                return;
            })
        }
    }, [errors]);

    const handlePaymentFieldChange = (e) => {
        setPaymentFields(e.target.value);
        setValue('field_option_list', e.target.value, { shouldDirty: false, shouldValidate: true })
    }

    /**
     * Confirm Box before update
     */
    const handleFormSubmit = (data) => {
        setPayload(data);
        if(
            !isNaN(moduleId) && (
                paymentData.api_username && data.api_username !== paymentData.api_username || 
                paymentData.api_password && data.api_password !== paymentData.api_password || 
                paymentData.api_signature && data.api_signature !== paymentData.api_signature
            )
        ) {
            setOpenAlertDialog(true)
        } else {
            savePaymentDataToDB(data);
        }
    }

    /**
     * Save|Update Payment Details
     */
    const savePaymentDataToDB = (data) => {
        const mandatoryFields = fields.filter(field => field.required === true).map(item=> item.field_name);
        const check = data.field_option_list.some(field=> mandatoryFields.includes(field));
        if(!check) {
            dispatch(showMessage({ variant: 'error', message: "Please select anyone mandatory fields like  username or email or phone from Payment Fields Dropdown." }));
            return;
        }
        if(data.amount_type === 'Minimum') {
            data.minimum_amount = data.amount ? data.amount : 0;
            data.fixed_amount = 0;
        } else {
            if(data.amount == 0) {
                dispatch(showMessage({ variant: 'error', message: "Fixed amount can not be 0!" }));
                return;
            }
            data.fixed_amount = data.amount ? data.amount : 0;
            data.minimum_amount = 0;
        }
        if(!data.fee_percent || data.fee_percent == ""){
            data.fee_percent = 0;
        }
        if(!data.past_withdrawal_count || data.past_withdrawal_count == ""){
            data.past_withdrawal_count = 0;
        }
        if(!data.maximum_amount || data.maximum_amount == "" || data.amount_type === 'Fixed'){
            data.maximum_amount = 0;
        }
     
        /**
         * rules max and min both 0 hote pare.
         * in > 0 hole then max er sathe check korbe.. Max = 0 hole min er sathe check lagbe na, but max > 0 hole min er thekeo > hbe
         */
        if(data.minimum_amount > 0 && data.maximum_amount > 0){
            if(data.maximum_amount <= data.minimum_amount){
                dispatch(showMessage({ variant: 'error', message: "Maximum amount should be greater than of Minimum Amount!" }));
                return;
            }
        }

        delete data.amount;
        delete data.amount_type;
        data.country_list = (selectedCountry.length ? selectedCountry.map(r=> r.id) : []);
        data.member_list = (selectedMember.length ? selectedMember.map(r=> r.id) : []);
        data.type_user_info_again = (Boolean(data.type_user_info_again) === true) ? 1 : 0;
        data.status = (Boolean(data.status) === true) ? 1 : 0;
        data.field_option_list = fields.filter(f => paymentFields.includes(f.field_name))
        
        const url = isNaN(moduleId) ? jwtServiceConfig.savePaymentMethodConfiguration : jwtServiceConfig.updatePaymentMethodConfiguration +'/'+moduleId;
        setLoading(true);
        axios.post(url, data)
        .then((response) => {
            setLoading(false);
            const result = response.data.results;
            if(result.status == true) {
                dispatch(showMessage({ variant: 'success', message: result.message }));
                if(result.id && isNaN(moduleId)){
                    navigate('/app/payment-configurations/' + result.id);
                }
                if(openAlertDialog){
                    setOpenAlertDialog(false);
                }
                if(!isNaN(moduleId)) {
                    getPaymentData();
                }
            }
        })
        .catch(error => {
            setLoading(false);
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
        });
    }

    const handleSelectAllCountry = (e) => {
        if(e.target.checked) {
            setSelectedCountry(countryList);
        } else {
            setSelectedCountry([]);
        }
    }

    useEffect(() => {
        getPaymentData();
    }, []);

    const getPaymentData = async () => {
        const url = isNaN(moduleId) ? jwtServiceConfig.addPaymentMethodConfiguration : jwtServiceConfig.editPaymentMethodConfiguration + '/' + moduleId
        axios.get(url)
        .then(response => {
            if(response.data.results.status && response.data.results.data) {
                const results = response.data.results.data;                
                if(results.country_list) {
                    setCountryList(results.country_list);
                }                
            }
            if(response.data.results.result) {
                const result = response.data.results.result;    
                setPaymentData(result);
                setSelectedMember(result.excluded_members);
                setSelectedCountry(result.allowed_countries);

                Object.keys(defaultValues).forEach((key, indx) => {
                    if(key == 'name') {    // This two fields added in the validation rule. That's why shouldDirty should be false
                        setValue(key, (typeof result[key] === 'undefined' ? '' : result[key]), { shouldDirty: false, shouldValidate: true });
                    }
                    else if(!['member_list', 'country_list', 'field_option_list'].includes(key)) {
                        setValue(key, (typeof result[key] === 'undefined' ? '' : result[key]), { shouldDirty: !false, shouldValidate: true });
                    }
                });
                
                if(result.minimum_amount > 0){
                    setValue('amount_type', 'Minimum', { shouldDirty: false, shouldValidate: true });
                    setValue('amount', result.minimum_amount, { shouldDirty: false, shouldValidate: true });
                } else if(result.fixed_amount > 0){
                    setValue('amount_type', 'Fixed', { shouldDirty: false, shouldValidate: true });
                    setValue('amount', result.fixed_amount, { shouldDirty: false, shouldValidate: true });
                    setDisabled(true);
                    setValue("maximum_amount", 0, { shouldDirty: false, shouldValidate: false });
                } else {
                    setValue('amount_type', defaultValues.amount_type, { shouldDirty: false, shouldValidate: true });
                    setValue('amount', defaultValues.amount, { shouldDirty: false, shouldValidate: true });
                }
                const pFields = result.PaymentMethodFieldOptions.map(f => f.field_name);
                setPaymentFields(pFields);
                setValue('field_option_list', pFields, { shouldDirty: false, shouldValidate: true })
            }
            setPageloader(false);
        })
        .catch(error => console.log(error))
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
        setValue('api_username', paymentData.api_username, { shouldDirty: false, shouldValidate: true });
        setValue('api_password', paymentData.api_password, { shouldDirty: false, shouldValidate: true });
        setValue('api_signature', paymentData.api_signature, { shouldDirty: false, shouldValidate: true });
    }

    const onConfirmAlertDialogHandle = () => {
        savePaymentDataToDB(payload);
    }

    const handleMemberSearch = (e) => {
        debounceFn(e.target.value);
    }

    useEffect(()=>{
        var clause = {};
        if(  // This block would work only on EDIT mode & initial Click on member list dropdown
            memberList.length === 0 && 
            !isNaN(moduleId) && 
            ('excluded_members' in paymentData) && 
            paymentData.excluded_members.length
        ){
            const selectedIds = paymentData.excluded_members.map(r => r.id);
            clause = {
                "filters":[
                    {"column": "id","match": "notIn","search": selectedIds}
                ]
            }
            setAutoCompleteLoading(true);
            getMemberList(clause);
        }
        else if(  // This block would work only on ADD mode & initial Click on member list dropdown
            memberSearchTxt === '' && 
            open &&
            memberList.length === 0 
        ){
            setAutoCompleteLoading(true);
            getMemberList(clause);
        }
        // This block would work when SEARCH get active in both ADD | EDIT mode
        else if(memberSearchTxt != ''){
            clause = {
                "filters":[
                    {"column": "username","match": "substring","search": memberSearchTxt}
                ]
            }
            setAutoCompleteLoading(true);
            getMemberList(clause);
        }
        
        return () => {
            setMemberSearchTxt('');
        }
    }, [memberSearchTxt, open])

    const debounceFn = useCallback(_.debounce((val) => {        
        const check = memberList.some(row => (row.username.toLowerCase()).includes(val.toLowerCase()));
        // If the search item not listed in the dropdown then Server Side Search get active
        if(!check){
		    setMemberSearchTxt(val);
        }
	}, 1000), [memberList]);

    const getMemberList = (clause) => {
        let params = {
            search: '',
            page: 1,
            show: 100,
            module: 'members',
            source_module: 'paymentconfiguration',
            where: {
                "status":[],
                ...clause
            }
        };

        axios.get(`/members`, {params})
        .then(response => {
            if(response.data.results.result) {
                const result = response.data.results.result.data;
                const newList = _.uniqBy([...memberList, ...selectedMember, ...result], 'id').map(row => {
                    return {
                        ...row
                    };
                });
                setMemberList(newList);
            }
            setAutoCompleteLoading(false);
        })
        .catch(error => console.log(error))
    }

    if(pageloader){
        return <FuseLoading />;
    }

    const handleAmountTypeSelect = (e) => {
        if('Fixed' === e.target.value){
            setDisabled(true);
            setValue("maximum_amount", 0, { shouldDirty: false, shouldValidate: false });
        } else {
            setDisabled(false)
        }
        setValue("amount_type", e.target.value, { shouldDirty: false, shouldValidate: true });
    }

    return (
        <div>
            <form
                name="paymentMethodForm"
                noValidate
                className="flex flex-col justify-center w-full mt-32"
                onSubmit={handleSubmit(handleFormSubmit)}
            >
                <Accordion expanded={ expanded } onChange={()=>setExpanded(!expanded)}>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        sx={accordianStyle}
                    >
                        <Typography>General</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className='flex flex-col justify-center p-16 w-1/2 mx-auto'>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        required
                                        id="outlined-required-name"
                                        label="Name"
                                        className="w-full"
                                    />
                                )}
                            />
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-required-description"
                                        label="Description"
                                        className="w-full mt-20"
                                    />
                                )}
                            />

                            <Controller
                                name="image_url"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-required-img-url"
                                        label="Image URL"
                                        className="w-full mt-20"
                                    />
                                )}
                            />

                            <Controller
                                name="field_option_list"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full mt-20">
                                        <InputLabel id="demo-multiple-checkbox-label">Payment Field</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="demo-multiple-checkbox-label"
                                            id="demo-multiple-checkbox"
                                            multiple
                                            required
                                            value={paymentFields}
                                            onChange={handlePaymentFieldChange}
                                            input={<OutlinedInput label="Payment Field" />}
                                            renderValue={(selected) => selected.join(', ')}
                                           
                                        >
                                        {fields.map((field, index) => (
                                            <MenuItem key={index} value={field.field_name}>
                                                <Checkbox checked={paymentFields.includes(field.field_name)} />
                                                <ListItemText primary={field.field_name} />
                                            </MenuItem>
                                        ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                             <Controller
                                name="withdraw_redo_interval"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        id="outlined-required-redo-wait"
                                        label="Redo Wait (in hour)"
                                        className="w-full mt-20"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        onKeyPress={(event) => {
                                            if (!/[0-9.]/.test(event.key)) {
                                                event.preventDefault();
                                            }
                                        }}
                                    />
                                )}
                            />
                            <FormGroup aria-label="position" row className="w-full mt-20">
                                <Controller
                                    name="amount_type"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            id="outlined-select-currency"
                                            select
                                            label="Amount Type"
                                            helperText=''
                                            className="w-1/2 pr-24"
                                            onChange={ handleAmountTypeSelect }
                                            >
                                            <MenuItem value="Minimum">
                                                Minimum
                                            </MenuItem>
                                            <MenuItem value="Fixed">
                                                Fixed
                                            </MenuItem>
                                        </TextField>
                                    )}
                                />
                                <Controller
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField  
                                            {...field}
                                            type="number"
                                            InputProps={{ inputProps: { min: 0 } }}
                                            required
                                            id="outlined-required"
                                            label="Amount"
                                            className="w-1/2"
                                            onKeyPress={(event) => {
                                                if (!/[0-9.]/.test(event.key)) {
                                                  event.preventDefault();
                                                }
                                            }}
                                        />
                                    )}
                                />
                                <small className='mt-5 text-gray-600'>If you wish the user to enter how much cash they wish to receive then please select the "Minimum". Fixed means the user has to receive the amount specified.</small>
                            </FormGroup>

                            <FormGroup aria-label="position" row className="mt-20">   
                                <Controller
                                    name="type_user_info_again"
                                    control={control}
                                    render={({ field }) => (          
                                        <FormControlLabel 
                                            control={<Switch {...field} checked={Boolean(field.value)} />} 
                                            label="Yes, force the user to type info twice" 
                                        />
                                    )}
                                    />
                            </FormGroup>
                            <FormGroup aria-label="position" row>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (   
                                        <FormControlLabel 
                                            control={<Switch {...field} checked={Boolean(field.value)}/>} 
                                            label="Enabled" 
                                        />
                                    )}
                                />
                            </FormGroup>
                        </div>
                    </AccordionDetails>
                </Accordion>

                {/* <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                    sx={accordianStyle}
                    >
                        <Typography>Security</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className='flex flex-col justify-center p-16 w-1/2 mx-auto'>
                            <Controller
                                name="same_account_options"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="same_account_options"
                                        select
                                        label="Same Account"
                                        helperText=""
                                        className="w-full mt-20"
                                        >
                                        <MenuItem value="Mark as cheater">
                                            Mark as cheater
                                        </MenuItem>
                                    </TextField>
                                )}
                            />
                        </div>
                    </AccordionDetails>
                </Accordion> */}

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                        sx={accordianStyle}
                    >
                        <Typography>Instant Payouts</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className='flex flex-col justify-center p-16 w-1/2 mx-auto'>
                            <Controller
                                name="api_username"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-required-api-username"
                                        label="API Username"
                                        className="w-full"
                                    />
                                )}
                            />
                            <Controller
                                name="api_password"
                                control={control}
                                render={({ field }) => (
                                    <FormControl sx={{ marginTop: 2, width: '100%' }} variant="outlined">
                                        <InputLabel htmlFor="outlined-adornment-api-password">Password</InputLabel>
                                        <OutlinedInput
                                            {...field}
                                            autoComplete="new-password"
                                            id="outlined-adornment-api-password"
                                            type={showPassword ? 'text' : 'password'}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="Password"
                                        />
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="api_signature"
                                control={control}
                                render={({ field }) => (
                                    <FormControl sx={{ marginTop: 2, width: '100%' }} variant="outlined">
                                        <InputLabel htmlFor="outlined-adornment-signature">API Signature</InputLabel>
                                        <OutlinedInput
                                            {...field}
                                            id="outlined-adornment-signature"
                                            type={showSignature ? 'text' : 'password'}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle signature visibility"
                                                        onClick={handleClickSignature}
                                                        edge="end"
                                                    >
                                                        {showSignature ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="Password"
                                        />
                                    </FormControl>
                                )}
                            />
                            <Controller
                                name="api_memo"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-required-api-memo"
                                        label="API Memo"
                                        className="w-full mt-20"
                                    />
                                )}
                            />
                            <Controller
                                name="maximum_amount"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        disabled={disabled}
                                        type="number"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        id="outlined-required-maximum-amount"
                                        label="Maximum Amount"
                                        className="w-full mt-20"
                                        onKeyPress={(event) => {
                                            if (!/[0-9.]/.test(event.key)) {
                                              event.preventDefault();
                                            }
                                        }}
                                    />
                                )}
                            />
                            {/* <FormGroup aria-label="position" row className="">
                                <FormControlLabel control={<Switch  />} label="Enabled" />
                            </FormGroup> */}
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                        sx={accordianStyle}
                    >
                        <Typography>Filters</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className='flex flex-col w-1/2 mx-auto justify-center p-16'>
                            <Controller
                                name="country_list"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        limitTags={5}
                                        multiple
                                        className="w-full"
                                        id="checkboxes-country"
                                        options={ countryList } 
                                        disableCloseOnSelect
                                        isOptionEqualToValue={(option, value) => option.name === value.name}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedCountry}
                                        onChange={(e, val)=>{
                                            setSelectedCountry(val)
                                        }}
                                        renderOption={(props, option, { selected }) => {
                                            return (
                                                <li {...props} key={option.id}>
                                                    <Checkbox
                                                        icon={icon}
                                                        checkedIcon={checkedIcon}
                                                        style={{ marginRight: 8 }}
                                                        checked={selected}
                                                    />
                                                    {option.name}
                                                </li>
                                            )
                                        }}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                label="Country" 
                                                placeholder="Country" 
                                                helperText={
                                                    <FormControlLabel
                                                        value="start"
                                                        control={<Checkbox {...label} size="small" checked={ countryList.length === selectedCountry.length } onChange={ handleSelectAllCountry }/>}
                                                        label={<small>Select All</small>}
                                                        labelPlacement="end"
                                                    />
                                                }
                                            />
                                        )}
                                    />
                                )}
                            />
                            
                            {/* <Controller
                                name="verified_options"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-select-currency"
                                        select
                                        label="Verified"
                                        helperText="Please select your currency"
                                        className="w-full mt-20"
                                        >
                                        <MenuItem value="Verified members">
                                            Verified members
                                        </MenuItem>
                                        <MenuItem value="Unverified members">
                                            Unverified members
                                        </MenuItem>
                                        <MenuItem value="Both">
                                            Both
                                        </MenuItem>
                                    </TextField>
                                )}
                            /> 
                            <Controller
                                name="upgrade_options"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-select-currency"
                                        select
                                        label="Upgrade"
                                        helperText=""
                                        className="w-full mt-20"
                                        >
                                        <MenuItem value="Allow all members">
                                            Allow all members
                                        </MenuItem>
                                    </TextField>
                                )}
                            />*/}

                            <FormGroup aria-label="position" row className="w-full mt-20">
                                <Controller
                                    name="past_withdrawal_options"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            id="outlined-select-currency"
                                            select
                                            label="Past Withdraws"
                                            defaultValue=""
                                            helperText=''
                                            className="w-1/2 pr-24"
                                            >
                                            <MenuItem value="At least">
                                                At least
                                            </MenuItem>
                                            <MenuItem value="At most">
                                                At most
                                            </MenuItem>
                                            <MenuItem value="Exact">
                                                Exact
                                            </MenuItem>
                                        </TextField>
                                    )}
                                />
                                <Controller
                                    name="past_withdrawal_count"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            InputProps={{ inputProps: { min: 0 } }}
                                            id="outlined-required-past-withdrawl"
                                            label=""
                                            helperText='Past withdraw(s)'
                                            className="w-1/2"
                                            onKeyPress={(event) => {
                                                if (!/[0-9]/.test(event.key)) {
                                                  event.preventDefault();
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </FormGroup>
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                        sx={accordianStyle}
                    >
                        <Typography>Extras</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className='flex flex-col mx-auto w-1/2 justify-center p-16'>
                            <Controller
                                name="member_list"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        limitTags={5}
                                        value={ selectedMember }
                                        id="asynchronous-demo"
                                        multiple
                                        disableCloseOnSelect
                                        className="w-full mt-20"
                                        open={open}
                                        onOpen={() => {
                                            setOpen(true);
                                        }}
                                        onClose={() => {
                                            setOpen(false);
                                        }}
                                        options={memberList}
                                        isOptionEqualToValue={(option, value) => option.username === value.username}
                                        getOptionLabel={(option) => option.username}
                                        loading={autoCompleteLoading}
                                        onChange={(e, val)=>{
                                            setSelectedMember(val);
                                        }}
                                        renderOption={(props, option, { selected }) => (
                                            <li {...props} key={option.id}>
                                                <Checkbox
                                                    icon={icon}
                                                    checkedIcon={checkedIcon}
                                                    style={{ marginRight: 8 }}
                                                    checked={selected}
                                                />
                                                {option.username} - {option.email}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                onChange={ handleMemberSearch }
                                                label="Excluded Users" 
                                                placeholder="Type user's name"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {autoCompleteLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                                helperText={`Total no. of excluded users is ${selectedMember.length}`}
                                            />
                                        )}
                                    />
                                )}
                            />
                            
                            <Controller
                                name="fee_percent"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        id="outlined-required-fee"
                                        label="Fee Percent (%)"
                                        className="w-full mt-20"
                                        helperText="In cent format"
                                        onKeyPress={(event) => {
                                            if (!/[0-9.]/.test(event.key)) {
                                              event.preventDefault();
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="payment_type"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="payment_type"
                                        select
                                        label="Payment Type"
                                        helperText=""
                                        className="w-full mt-20"
                                        >
                                        <MenuItem value="Auto">
                                            Auto
                                        </MenuItem>
                                        <MenuItem value="Manual">
                                            Manual
                                        </MenuItem>
                                    </TextField>
                                )}
                            />
                        </div>
                    </AccordionDetails>
                </Accordion>
                
                <motion.div
                    className="flex mt-20"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                    >
                    <LoadingButton
                        variant="contained"
                        color="secondary"
                        aria-label="Confirm"
                        loading={loading}
                        type="submit"
                        size="medium"
                        disabled={!Object.keys(dirtyFields).length || !isValid}
                    >
                        Save
                    </LoadingButton>
                    <Button
                        className="whitespace-nowrap mx-4"
                        variant="contained"
                        color="error"
                        onClick={() => navigate(`/configuration?tab=paymentconfigurations`)}
                    >
                        Cancel
                    </Button>
                </motion.div>
            </form>
            {
                openAlertDialog && (
                    <AlertDialog
                        content="You have changed the payment credentials. Do you want to update it?"
                        open={openAlertDialog}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }
        </div>
    )
}

export default CreateEditForm;