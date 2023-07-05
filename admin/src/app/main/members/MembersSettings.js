import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import { TextField, Paper, FormControl, InputAdornment, FormGroup, FormControlLabel, Switch } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { motion } from 'framer-motion';

const MembersSettings = () => {
    const dispatch = useDispatch();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [switchField, setSwitchField] = useState(false)

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        let params = { type: 'member' };
        axios.get(jwtServiceConfig.settingsRead, { params }).then((response) => {
            if (response.data.results.status) {
                response.data.results.data.config_data.map((row) => {
                    row.settings_key === 'referral_status' ? setSwitchField(row.settings_value === 1) : ''
                })
                setFields(response.data.results.data.config_data)
            } else {
                console.error('Failed to fetch Member Settings');
            }
        });
    }

    const handleData = (event) => {
        if (Number(event.target.value) >= 0) {
            setFields(prevState => {
                const newState = prevState.map(obj => {
                    if (obj.settings_key === event.target.name) {
                        return { ...obj, settings_value: Number(event.target.value) };
                    }
                    return obj;
                });
                return newState;
            });
        } else {
            dispatch(showMessage({ variant: 'error', message: 'Negative value not accepted' }))
        }
    }
    const updateSettings = () => {
        setLoading(true);
        const params = [];
        fields.map((row) => {
            row.settings_key === 'referral_status' ? params.push({ id: row.id, key: row.settings_key, value: !switchField ? 0 : 1 }) : (row.settings_key === 'referral_percentage' && !switchField) ? params.push({ id: row.id, key: row.settings_key, value: 0 }) : params.push({ id: row.id, key: row.settings_key, value: row.settings_value })
        });
        axios.post(jwtServiceConfig.settingsUpdate, { config_data: params })
            .then((response) => {
                setLoading(false);
                if (response.data.results.status) {
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }))
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                }
            })
            .catch(error => dispatch(showMessage({ variant: 'error', message: error.response.data.errors })));
    }
    const handleSwitch = (e) => {
        setSwitchField(e.target.checked);
    }

    return (
        <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
            <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                <div className="w-full justify-between">
                    {fields.map((row, key) => (
                        <FormControl key={row.id} className="w-1/2 mb-24">
                            {row.settings_key === 'referral_status' ?
                                <FormControl>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    defaultChecked={row.settings_value === 1}
                                                    onChange={(e) => { handleSwitch(e) }}
                                                    value={switchField}
                                                />
                                            }
                                            id={row.settings_key}
                                            name={row.settings_key}
                                            className="w-full mb-10 p-5 capitalize"
                                            label={row.settings_key.split('_').join(' ')}
                                        />
                                    </FormGroup>
                                </FormControl> :
                                <TextField
                                    id={row.settings_key}
                                    name={row.settings_key}
                                    value={row.settings_value}
                                    className={row.settings_key === 'referral_percentage' && !switchField ? `w-full mb-10 p-5 capitalize hidden` : `w-full mb-10 p-5 capitalize`}
                                    label={row.settings_key.split('_').join(' ')}
                                    type="number"
                                    variant="outlined"
                                    required
                                    InputProps={['referral_percentage', 'registration_bonus'].includes(row.settings_key) ? row.settings_key === 'referral_percentage' ? {
                                        endAdornment: <InputAdornment position="start">%</InputAdornment>
                                    } :
                                        row.settings_key === 'registration_bonus' ? { startAdornment: <InputAdornment position="start">$</InputAdornment> } : '' : ''}
                                    onChange={(event) => handleData(event)}
                                />
                            }
                        </FormControl>
                    ))}
                </div>
                <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                >
                    <LoadingButton
                        className="whitespace-nowrap mx-4 mt-5 w-1/3"
                        variant="contained"
                        color="secondary"
                        loading={loading}
                        onClick={updateSettings}
                        disabled={fields.length === 0}
                    >
                        Save
                    </LoadingButton>

                </motion.div>
            </div>
        </Paper>
    )

}
export default MembersSettings;