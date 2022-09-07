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

const CreateUpdateForm = ({ input, meta }) => {
    const inputElement = useRef();
    const moduleId = useParams().moduleId;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [action, setAction] = useState(10);
    const [variable, setVariable] = useState(0);
    const [insertedHtml, setInsertedHtml] = useState('');
    const [errors, setErrors] = useState({})
    // useEffect(() => {
    // }, []);

    const onChangeInEditor = (input) => {
        setInsertedHtml(input);
    }
    const handleChangeAction = (event) => {
        setAction(event.target.value)
    }
    const onSubmit = ({ subject }) => {
        axios.post(jwtServiceConfig.saveEmailTemplates, {
            subject: subject,
            body: insertedHtml,
            email_actions: 44,
        })
            .then((response) => {
                console.log(response)
                if (response.data.status) {
                    dispatch(showMessage({ variant: 'success', message: response.data.message }))
                    getEmailConfiguration();
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
            <TextField
                className="mb-24"
                label="Subject"
                type="text"
                error={!!errors.subject}
                helperText={errors?.subject?.message}
                variant="outlined"
                required
                fullWidth
                value={subject}
            />


            <FormControl className="w-1/2">
                <InputLabel id="demo-simple-select-label">Action</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={action}
                    label="Action"
                    onChange={handleChangeAction}
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl>
            <WYSIWYGEditor ref={inputElement} onChange={onChangeInEditor} />
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
        </>
    )
}

export default CreateUpdateForm;