import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import { Box, TextField, Typography, FormControlLabel, Paper, FormControl, InputAdornment } from '@mui/material';
import Helper from 'src/app/helper';

const MembersSettings = () => {
    const dispatch = useDispatch();
    const [fields, setFields] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        let params = { type: 'member' };
        axios.get(jwtServiceConfig.settingsRead, { params }).then((response) => {
            if (response.data.results.status) {
                setFields(response.data.results.data.config_data)
            } else {
                console.log('Error');
            }
        });
    }

    const handleData = (event, key) => {
        console.log(event.target.name)
        // setFields([
        //     ...fields, { ...fields[key].settings_value = Number(event.target.value) }
        // ])
        setFields(prevState => {
            const newState = prevState.map(obj => {
                if (obj.settings_key === event.target.name) {
                    return { ...obj, settings_value: Number(event.target.value) };
                }
                return obj;
            });
            return newState;
        });
    }
    console.log(fields);

    return (
        <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
            <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                <div className="w-full justify-between">
                    {fields.map((row, key) => (
                        <FormControl key={row.id} className="w-1/2 mb-24">
                            <TextField
                                id={row.settings_key}
                                name={row.settings_key}
                                value={row.settings_value}
                                className="w-full mb-10 p-5 capitalize"
                                label={row.settings_key.split('_').join(' ')}
                                type="number"
                                variant="outlined"
                                required
                                InputProps={['referral_percentage', 'registration_bonus'].includes(row.settings_key) ? row.settings_key === 'referral_percentage' ? {
                                    endAdornment: <InputAdornment position="start">%</InputAdornment>
                                } :
                                    row.settings_key === 'registration_bonus' ? { startAdornment: <InputAdornment position="start">$</InputAdornment> } : '' : ''}
                                onChange={(event) => handleData(event, key)}
                            />
                        </FormControl>
                    ))}
                </div>
            </div>
        </Paper>
    )

}
export default MembersSettings;