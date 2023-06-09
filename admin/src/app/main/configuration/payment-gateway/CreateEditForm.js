import axios from 'axios';
import * as yup from 'yup';
import * as React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { TextField, MenuItem, Link, Autocomplete, Accordion, AccordionDetails, AccordionSummary, InputLabel, FormControl, ListItemText, Select, Checkbox, Button, Typography, FormControlLabel, FormGroup, Switch } from '@mui/material';


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
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
    type_user_info_again: '',
    payment_field_options: '',
    minimum_amount: '',
    maximum_amount: '',
    fixed_amount: '',
    withdraw_redo_interval: '',
    same_account_options: '',
    past_withdrawal_options: '',
    past_withdrawal_count: '',
    verified_options: '',
    upgrade_options: '',
    fee_percent: '',
    api_username: '',
    api_password: '',
    api_signature: '',
    api_memo: '',
    payment_type: ''
};

const validationSchema = yup.object().shape({
    name: yup.string().required(`Please enter name!`),
    payment_field_options: yup.string().required(`Please select payment_field_options!`),
    api_username: yup.string().required(`Please enter name!`),
    api_password: yup.string().required(`Please enter name!`),
    api_signature: yup.string().required(`Please enter name!`),
    api_memo: yup.string().required(`Please enter name!`),
});


const CreateEditForm = () => {
    const [expanded, setExpanded] = useState(true);
    const [countryList, setCountryList] = useState([]);
    const [memberList, setMemberList] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSelectAllCountry = (e) => {
        if(e.target.checked) {

        }
    }

    
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

    const handleFormSubmit = (data) => {
        console.log(data)
    }

    useEffect(() => {
        getPaymentData();
    }, []);

    const getPaymentData = async () => {
        axios.get(jwtServiceConfig.addPaymentMethodConfiguration)
			.then(response => {
                if(response.data.results.status && response.data.results.data) {
                    const results = response.data.results.data;
                    if(results.country_list) {
                        setCountryList(results.country_list);
                        setMemberList(results.member_list);
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
                        expandIcon={<ExpandMoreIcon />}
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
                                        id="outlined-required"
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
                                        required
                                        id="outlined-required"
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
                                        required
                                        id="outlined-required"
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
                                        defaultValue="EUR"
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
                                        required
                                        id="outlined-required"
                                        label="Redo Wait"
                                        defaultValue=""
                                        className="w-full mt-20"
                                    />
                                )}
                            />
                            <FormGroup aria-label="position" row className="w-full mt-20">
                                <Controller
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            id="outlined-select-currency"
                                            select
                                            label="Amount"
                                            defaultValue="Minimum"
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
                                            control={<Switch {...field} defaultChecked />} 
                                            label="Yes, force the user to type info twice" 
                                        />
                                    )}
                                    />
                            </FormGroup>
                            <FormGroup aria-label="position" row className="">
                                <FormControlLabel control={<Switch defaultChecked />} label="Enabled" />
                            </FormGroup>
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
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
                                        <MenuItem value="mark_as_cheater">
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
                    expandIcon={<ExpandMoreIcon />}
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
                                        required
                                        id="outlined-required"
                                        label="API Username"
                                        defaultValue=""
                                        className="w-full"
                                    />
                                )}
                            />
                            <Controller
                                name="api_password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        required
                                        id="outlined-required"
                                        label="API Password"
                                        defaultValue=""
                                        className="w-full mt-20"
                                    />
                                )}
                            />
                            <Controller
                                name="api_signature"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        required
                                        id="outlined-required"
                                        label="API Signature"
                                        defaultValue=""
                                        className="w-full mt-20"
                                    />
                                )}
                            />
                            <Controller
                                name="api_memo"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        required
                                        id="outlined-required"
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
                                        required
                                        id="outlined-required"
                                        label="Maximum Amount"
                                        className="w-full mt-20"
                                    />
                                )}
                            />
                            <FormGroup aria-label="position" row className="">
                                <FormControlLabel control={<Switch defaultChecked />} label="Enabled" />
                            </FormGroup>
                            
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                    sx={accordianStyle}
                    >
                        <Typography>Filters</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className='flex flex-col w-1/2 mx-auto justify-center p-16'>
                            <Controller
                                name="api_username"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        multiple
                                        className="w-full"
                                        id="checkboxes-tags-demo"
                                        options={ countryList } 
                                        disableCloseOnSelect
                                        getOptionLabel={(option) => option.name}
                                        defaultValue={[]}  
                                        renderOption={(props, option, { selected }) => (
                                            <li {...props} key={option.id}>
                                                <Checkbox
                                                    icon={icon}
                                                    checkedIcon={checkedIcon}
                                                    style={{ marginRight: 8 }}
                                                    checked={selected}
                                                />
                                                {option.name} { selected }
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                label="Country" 
                                                placeholder="Country" 
                                                helperText={
                                                    <FormControlLabel
                                                        value="start"
                                                        control={<Checkbox {...label} size="small" checked={true} onChange={ handleSelectAllCountry }/>}
                                                        label={<small>Select All</small>}
                                                        labelPlacement="end"
                                                    />
                                                }
                                            />
                                        )}
                                    />
                                    // <Autocomplete
                                    //     multiple
                                    //     id="tags-outlined"
                                    //     options={top100Films}
                                    //     getOptionLabel={(option) => option.title}
                                    //     defaultValue={[top100Films[1], top100Films[2]]}                            
                                    //     className="w-full"
                                    //     renderInput={(params) => (
                                    //         <TextField
                                    //             {...params}
                                    //             label="Countries"
                                    //             placeholder="Country"
                                    //             helperText={
                                    //                 <FormControlLabel
                                    //                     value="start"
                                    //                     control={<Checkbox {...label} size="small" checked={true} onChange={ handleSelectAllCountry }/>}
                                    //                     label={<small>Select All</small>}
                                    //                     labelPlacement="end"
                                    //                 />
                                    //             }
                                    //         />
                                    //     )}
                                    // />
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
                                        <MenuItem value="Name">
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
                                            required
                                            id="outlined-required"
                                            label="Amount"
                                            defaultValue=""
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
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                        sx={accordianStyle}
                    >
                        <Typography>Extras</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className='flex flex-col mx-auto w-1/2 justify-center p-16'>
                            {/* <Autocomplete
                                multiple
                                id="tags-outlined"
                                options={ memberList }
                                getOptionLabel={(option) => option.member_name}
                                defaultValue={[]}
                                className="w-1/2 mx-auto"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Users"
                                        placeholder="User"
                                    />
                                )}
                            /> */}
                            <Autocomplete
                                multiple
                                className="w-full"
                                id="checkboxes-tags-demo"
                                options={ memberList }
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.member_name}
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
                                    <TextField {...params} label="Checkboxes" placeholder="Favorites" />
                                )}
                            />
                            <TextField
                                required
                                id="outlined-required"
                                label="Fees"
                                defaultValue=""
                                className="w-full mt-20"
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
                        disabled={!Object.keys(dirtyFields).length || !isValid}
                    >
                        Save
                    </LoadingButton>
                    <Button
                        className="whitespace-nowrap mx-4"
                        variant="contained"
                        color="error"
                        onClick={() => navigate(`/app/${module}`)}
                    >
                        Cancel
                    </Button>
                </motion.div>
            </form>
        </div>
    )
}

export default CreateEditForm;