import axios from 'axios';
import * as yup from 'yup';
import * as React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import { TextField, MenuItem, Link, Autocomplete, Accordion, AccordionDetails, AccordionSummary, InputLabel, FormControl, ListItemText, Select, Checkbox, Button, Typography, FormControlLabel, FormGroup, Switch } from '@mui/material';

 

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Pulp Fiction', year: 1994 },
]

const accordianStyle = {
    backgroundColor: '#eee',
    minHeight: '50px !important',
    '& .muiltr-o4b71y-MuiAccordionSummary-content.Mui-expanded': {margin: '13px 0'}
}

const CreateEditForm = () => {
    const [expanded, setExpanded] = useState(true);
    const [countryList, setCountryList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSelectAllCountry = (e) => {
        if(e.target.checked) {

        }
    }

    const validationFields = {};
    const validationSchema = yup.object().shape({ ...validationFields });
    const {
        control,
        formState: { isValid, dirtyFields, errors },
        handleSubmit,
        setValue
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            password: ''
        },
        resolver: yupResolver(validationSchema),
    });

    const handleFormSubmit = () => {

    }

    useEffect(() => {
        getPaymentData();
    }, []);

    const getPaymentData = () => {
        
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
                                name="payment_field"
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
                                name="redo_wait"
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
                                <FormControlLabel control={<Switch defaultChecked />} label="Yes, force the user to type info twice" />
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
                                        id="tags-outlined"
                                        options={top100Films}
                                        getOptionLabel={(option) => option.title}
                                        defaultValue={[top100Films[1], top100Films[2]]}                            
                                        className="w-full"
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Countries"
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
                                )}
                            />
                            <Controller
                                name="api_username"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-select-currency"
                                        select
                                        label="Verified"
                                        defaultValue="EUR"
                                        helperText="Please select your currency"
                                        className="w-full mt-20"
                                        >
                                        <MenuItem value="Name">
                                            Both
                                        </MenuItem>
                                    </TextField>
                                )}
                            />
                            <Controller
                                name="api_username"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        id="outlined-select-currency"
                                        select
                                        label="Upgrade"
                                        defaultValue="EUR"
                                        helperText=""
                                        className="w-full mt-20"
                                        >
                                        <MenuItem value="Name">
                                            Allow all members
                                        </MenuItem>
                                    </TextField>
                                )}
                            />

                            <FormGroup aria-label="position" row className="w-full mt-20">
                                <TextField
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
                                </TextField>
                                <TextField
                                    type="tel"
                                    required
                                    id="outlined-required"
                                    label="Amount"
                                    defaultValue=""
                                    helperText='Past withdraw(s)'
                                    className="w-1/2"
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
                        <div className='flex flex-col justify-center p-16'>
                            <Autocomplete
                                multiple
                                id="tags-outlined"
                                options={top100Films}
                                getOptionLabel={(option) => option.title}
                                defaultValue={[top100Films[1]]}
                                className="w-1/2 mx-auto"
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Users"
                                    placeholder="User"
                                />
                                )}
                            />
                            <TextField
                                required
                                id="outlined-required"
                                label="Fees"
                                defaultValue=""
                                className="w-1/2 mx-auto mt-20"
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