import axios from 'axios';
import * as yup from 'yup';
import * as React from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate, Link } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import {Visibility, VisibilityOff, ExpandMore, CheckBox, CheckBoxOutlineBlank} from '@mui/icons-material';
import { TextField, MenuItem, Autocomplete, Accordion, AccordionDetails, AccordionSummary, Checkbox, Button, Typography, InputLabel, FormControl, FormControlLabel, FormGroup, Switch, IconButton, OutlinedInput, InputAdornment } from '@mui/material';

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
    payment_field_options: 'Email',
    // minimum_amount: 0,
    // fixed_amount: 0,
    maximum_amount: 0,
    withdraw_redo_interval: '',
    same_account_options: 'Mark as cheater',
    past_withdrawal_options: 'At least',
    past_withdrawal_count: '',
    verified_options: 'Both',
    upgrade_options: '',
    fee_percent: '',
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
    name: yup.string().required(`Please enter name!`),
    payment_field_options: yup.string().required(`Please select payment_field_options!`),
    // api_username: yup.string().required(`Please enter name!`),
    // api_password: yup.string().required(`Please enter name!`),
    // api_signature: yup.string().required(`Please enter name!`),
    // api_memo: yup.string().required(`Please enter name!`),
});


const CreateEditForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { moduleId } = useParams();
    const [expanded, setExpanded] = useState(true);
    const [countryList, setCountryList] = useState([]);
    const [memberList, setMemberList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState([]);
    const [selectedMember, setSelectedMember] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showSignature, setShowSignature] = useState(false);

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

    /**
     * Save Payment Details
     */
    const handleFormSubmit = (data) => {
        console.log(data)
        if(data.amount_type === 'Minimum') {
            data.minimum_amount = data.amount;
        } else {
            data.fixed_amount = data.amount;
        }
        
        delete data.amount;
        delete data.amount_type;
        data.country_list = (selectedCountry.length ? selectedCountry.map(r=> r.id) : []);
        data.member_list = (selectedMember.length ? selectedMember.map(r=> r.id) : []);
        data.type_user_info_again = (data.type_user_info_again === true) ? 1 : 0;
        data.status = (data.status === true) ? 1 : 0;

        const url = isNaN(moduleId) ? jwtServiceConfig.savePaymentMethodConfiguration : jwtServiceConfig.updatePaymentMethodConfiguration +'/'+moduleId;
        setLoading(true);
        axios.post(url, data)
        .then((response) => {
            setLoading(false)
            console.log(response)
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
                    setMemberList(results.member_list);
                }
            }
            if(response.data.results.result) {
                const result = response.data.results.result;                
                Object.keys(defaultValues).forEach((key, indx) => {
                    setValue(key, (result[key] ? result[key] : ''), { shouldDirty: false, shouldValidate: true });
                });
                if(result.minimum_amount > 0){
                    setValue('amount_type', 'Minimum', { shouldDirty: false, shouldValidate: true });
                    setValue('amount', result.minimum_amount, { shouldDirty: false, shouldValidate: true });
                } else if(result.fixed_amount > 0){
                    setValue('amount_type', 'Fixed', { shouldDirty: false, shouldValidate: true });
                    setValue('amount', result.fixed_amount, { shouldDirty: false, shouldValidate: true });
                }
            }
        })
        .catch(error => console.log(error))
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
                                name="payment_field_options"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-select-currency"
                                        select
                                        label="Payment Field"
                                        helperText=""
                                        className="w-full mt-20"
                                        >
                                        <MenuItem value="Name">
                                            Name
                                        </MenuItem>
                                        <MenuItem value="Email">
                                            Email
                                        </MenuItem>
                                        <MenuItem value="Phone">
                                            Phone
                                        </MenuItem>
                                    </TextField>
                                )}
                            />
                             <Controller
                                name="withdraw_redo_interval"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="tel"
                                        id="outlined-required-redo-wait"
                                        label="Redo Wait"
                                        className="w-full mt-20"
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
                                            type="tel"
                                            required
                                            id="outlined-required"
                                            label="Amount"
                                            className="w-1/2"
                                        />
                                    )}
                                />
                                <small className='mt-5 text-gray-600'>If you wish the user to entet how much cash they wish to receuve then please select the "Minimum". Fixed means the user has to receive the amount specified.</small>
                            </FormGroup>

                            <FormGroup aria-label="position" row className="mt-20">   
                                <Controller
                                    name="type_user_info_again"
                                    control={control}
                                    render={({ field }) => (          
                                        <FormControlLabel 
                                            control={<Switch {...field} />} 
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
                                            control={<Switch {...field} checked={field.value}/>} 
                                            label="Enabled" 
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
                </Accordion>
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
                                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                        <OutlinedInput
                                            {...field}
                                            autoComplete="off"
                                            id="outlined-adornment-password"
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
                                        type="tel"
                                        id="outlined-required-maximum-amount"
                                        label="Maximum Amount"
                                        className="w-full mt-20"
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
                                        multiple
                                        className="w-full"
                                        id="checkboxes-country"
                                        options={ countryList } 
                                        disableCloseOnSelect
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
                                                        control={<Checkbox {...label} size="small" onChange={ handleSelectAllCountry }/>}
                                                        label={<small>Select All</small>}
                                                        labelPlacement="end"
                                                    />
                                                }
                                            />
                                        )}
                                    />
                                )}
                            />
                            
                            <Controller
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
                            />

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
                                            type="tel"
                                            id="outlined-required-past-withdrawl"
                                            label="Amount"
                                            helperText='Past withdraw(s)'
                                            className="w-1/2"
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
                                        value={ selectedMember }
                                        multiple
                                        className="w-full"
                                        id="checkboxes-users"
                                        options={ memberList }
                                        disableCloseOnSelect
                                        getOptionLabel={(option) => option.member_name}
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
                                                {option.member_name}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Excluded Users" placeholder="Excluded Users" />
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
                                        id="outlined-required-fee"
                                        label="Fees"
                                        className="w-full mt-20"
                                        helperText="In cent format"
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
                                        label="Payment Tyoe"
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
                        // disabled={!Object.keys(dirtyFields).length || !isValid}
                    >
                        Save
                    </LoadingButton>
                    <Button
                        className="whitespace-nowrap mx-4"
                        variant="contained"
                        color="error"
                        onClick={() => navigate(`/configuration`)}
                    >
                        Cancel
                    </Button>
                </motion.div>
            </form>
        </div>
    )
}

export default CreateEditForm;