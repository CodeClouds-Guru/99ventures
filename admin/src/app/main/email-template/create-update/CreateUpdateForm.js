import { useRef, useState, useEffect } from 'react';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import WYSIWYGEditor from 'app/shared-components/WYSIWYGEditor';
import { Controller, useForm } from 'react-hook-form';
import { Button, Checkbox, FormControl, FormControlLabel, TextField, Paper, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import _ from '@lodash';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { Link, useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import CreateUpdateFormHeader from './CreateUpdateFormHeader';

const CreateUpdateForm = ({ input, meta }) => {
    const inputElement = useRef('');
    const moduleId = useParams().id;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [actionOptions, setActionOptions] = useState([]);
    const [variableOptions, setVariableOptions] = useState([]);
    const [allData, setAllData] = useState({
        subject: '',
        action: '',
        variable: '',
        insertedHtml: '',
    });
    const [errors, setErrors] = useState({
        subject: '',
        action: '',
        variable: '',
        insertedHtml: '',
    })
    useEffect(() => {
        getFieldData()
    }, []);
    const onSubjectChange = (event) => {
        if (event.target.value) {
            setAllData(allData => ({
                ...allData, subject: event.target.value
            }))
            setErrors(errors => ({
                ...errors, subject: ''
            }))
        } else {
            setErrors(errors => ({
                ...errors, subject: 'Please insert Subject'
            }))
        }
    }
    const onChangeInEditor = (input) => {
        if (input) {
            setAllData(allData => ({
                ...allData, insertedHtml: input
            }));
            setErrors(errors => ({
                ...errors, insertedHtml: ''
            }))
        } else {
            setErrors(errors => ({
                ...errors, insertedHtml: 'Please insert email body'
            }))
        }
    }
    const handleChangeAction = (event) => {
        if (event.target.value) {
            setAllData(allData => ({
                ...allData, action: event.target.value
            }))
            setErrors(errors => ({
                ...errors, action: ''
            }))
        } else {
            setErrors(errors => ({
                ...errors, action: 'Please insert Action'
            }))
        }
    }
    const handleChangeVariable = (event) => {
        setAllData(allData => ({
            ...allData, variable: event.target.value
        }))
    }

    console.log('editor', inputElement)

    const getFieldData = () => {
        axios.get(jwtServiceConfig.getEmailTemplatesFieldData)
            .then((response) => {
                console.log(response)
                if (response.data.results.status) {
                    setActionOptions(response.data.results.fields.email_actions.options);
                    setVariableOptions(response.data.results.fields.email_template_variables.options);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    const onSubmit = () => {
        axios.post(jwtServiceConfig.saveEmailTemplates, allData)
            .then((response) => {
                // console.log(response)
                if (response.data.status) {
                    dispatch(showMessage({ variant: 'success', message: response.data.message }))
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }

    return (
        <>
            <CreateUpdateFormHeader moduleId={moduleId} />
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-64 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0">
                        <FormControl className="w-1/2 mb-24 pr-10">
                            <InputLabel id="demo-simple-select-label">Action*</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={allData.action}
                                label="Action"
                                onChange={handleChangeAction}
                            >
                                <MenuItem value="">Select an action</MenuItem>
                                {actionOptions.map((value) => {
                                    return <MenuItem key={value.id} value={value.id}>{value.action}</MenuItem>
                                })}
                            </Select>
                            <FormHelperText error variant="standard">{errors.action}</FormHelperText>
                        </FormControl>

                        <FormControl className="w-1/2 mb-24">
                            <InputLabel id="demo-simple-select-label">Variable</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={allData.variable}
                                label="Variable"
                                onChange={handleChangeVariable}
                            >
                                <MenuItem value="">Select a variable</MenuItem>
                                {variableOptions.map((value) => {
                                    return <MenuItem key={value.id} value={value.code}>{value.name}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                        <FormControl className="w-full mb-24">
                            <TextField
                                label="Subject"
                                type="text"
                                error={!!errors.subject}
                                helperText={errors?.subject?.message}
                                variant="outlined"
                                required
                                fullWidth
                                value={allData.subject}
                                onChange={onSubjectChange}
                                ref={inputElement}
                            />
                            <FormHelperText error variant="standard">{errors.subject}</FormHelperText>
                        </FormControl>

                        <FormControl className="w-full mb-24">
                            <WYSIWYGEditor ref={inputElement} onChange={onChangeInEditor} />
                            <FormHelperText error variant="standard">{errors.insertedHtml}</FormHelperText>
                        </FormControl>

                        <span className="flex items-center justify-center">
                            <Button
                                variant="contained"
                                color="secondary"
                                className="w-1/2 mt-24"
                                aria-label="Save"
                                type="submit"
                                size="large"
                                onClick={onSubmit}
                            >
                                {moduleId === 'create' ? 'Save' : 'Update'}
                            </Button>
                        </span>
                    </div>
                </Paper>
            </div>

        </>
    )
}

export default CreateUpdateForm;