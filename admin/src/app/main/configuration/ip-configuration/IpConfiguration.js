import { Button, Paper, Card, CardContent, CardHeader, Autocomplete, TextField, Checkbox, FormControl, FormControlLabel, Typography } from '@mui/material';
import _ from '@lodash';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import AddMore from 'app/shared-components/AddMore';
import axios from 'axios';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';

function IpConfiguration(props) {
    let [ips, setIps] = useState([]);
    let [isps, setIsps] = useState([]);
    let [countryOptions, setCountryOptions] = useState([]);
    let [countryIsos, setCountryIsos] = useState([]);
    let [preSelectedCountryValues, setPreSelectedCountryValues] = useState([]);
    let [browserOptions, setBrowserOptions] = useState([]);
    let [browsers, setBrowsers] = useState([]);
    let [preSelectedBrowserValues, setPreSelectedBrowserValues] = useState([]);
    let [selectAllCountry, setSelectAllCountry] = useState(false);
    let [selectAllBrowser, setSelectAllBrowser] = useState(false);

    const dispatch = useDispatch();
    const [permission, setPermission] = useState(false);

    useEffect(() => {
        fetchData();
        setPermission(
            (props.permission('save') || props.permission('update'))
        );
    }, [props.permission])
    useEffect(() => {
        preSelectedCountries();
    }, [countryIsos])
    useEffect(() => {
        preSelectedBrowsers();
    }, [browsers])
    const submit = (e) => {
        e.preventDefault();
        axios.post(jwtServiceConfig.saveIpConfiguration, {
            ips,
            isps,
            countries: countryIsos,
            browsers: browsers
        }).then(res => {
            const variant = res.data.results.status ? 'success' : 'error';
            dispatch(showMessage({ variant, message: res.data.results.message }))
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Something went wrong' }))
        });
    }

    const onIpChangeFromChild = (val) => {
        setIps(val);
    }

    const onIspChangeFromChild = (val) => {
        setIsps(val);
    }
    const handleCountries = (newValue) => {
        let iso = [];
        newValue.map((obj) => {
            iso.push(obj.value)
        })
        setCountryIsos(iso)
    }
    const onBrowserChangeFromChild = (val) => {
        setBrowsers(val)
    }
    const preSelectedCountries = () => {
        let country_values = [];
        countryOptions.map((c, index1) => {
            countryIsos.map(ci => {
                if (c.value === ci) {
                    country_values.push(countryOptions[index1])
                }
            })
        })
        countryOptions.length === countryIsos.length ? setSelectAllCountry(true) : setSelectAllCountry(false)
        setPreSelectedCountryValues(country_values)
    }
    const preSelectedBrowsers = () => {
        let browser_values = [];
        browserOptions.map((b, index1) => {
            browsers.map(bv => {
                if (b.value === bv) {
                    browser_values.push(browserOptions[index1])
                }
            })
        })
        browserOptions.length === browsers.length ? setSelectAllBrowser(true) : setSelectAllBrowser(false)
        setPreSelectedBrowserValues(browser_values)
    }
    const fetchData = () => {
        axios.get(jwtServiceConfig.getIpConfiguration).then(res => {
            if (res.data.results.status) {
                setIps(res.data.results.data.ip_list)
                setIsps(res.data.results.data.isp_list)
                setCountryOptions(res.data.results.all_country_list)
                setCountryIsos(res.data.results.data.country_list)
                setBrowserOptions(res.data.results.all_browser_list)
                setBrowsers(res.data.results.data.browser_list)
            } else {
                dispatch(showMessage({ variant: 'error', message: res.data.errors }))
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Something went wrong' }))
        });
    }
    const onSelectAllCountry = (event) => {
        let iso = [];
        setSelectAllCountry(event.target.checked);
        event.target.checked ? countryOptions.map((obj) => {
            iso.push(obj.value)
        }) : '';
        setCountryIsos(iso)
    }
    const onSelectAllBrowser = (event) => {
        let bro = [];
        setSelectAllBrowser(event.target.checked);
        event.target.checked ? browserOptions.map((obj) => {
            bro.push(obj.value)
        }) : '';
        setBrowsers(bro)
    }

    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-36 md:p-36 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full mx-auto sm:mx-0">
                    <div className="flex flex-col justify-center w-full">
                        <Card variant="outlined" className="mb-20">
                            <CardHeader title="Denied IP List" />
                            <CardContent>
                                <AddMore
                                    permission={permission}
                                    data={ips}
                                    placeholder="Enter IP"
                                    onChange={onIpChangeFromChild}
                                    validationRegex="(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])\.(\d{1,2}|(0|1)\d{2}|2[0-4]\d|25[0-5])"
                                />
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="mb-20">
                            <CardHeader title="Denied ISP List" />
                            <CardContent>
                                <AddMore
                                    permission={permission}
                                    data={isps}
                                    placeholder="Enter ISP"
                                    onChange={onIspChangeFromChild}
                                    validationRegex="([^\s])"
                                />
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="mb-20">
                            <CardHeader title="Denied Country List" />
                            <CardContent>
                                <FormControl className="items-center">
                                    <FormControlLabel
                                        control={
                                            <Checkbox checked={selectAllCountry} onChange={(event) => onSelectAllCountry(event)} />
                                        }
                                        label={<Typography variant="body2" >
                                            <b>SELECT ALL</b>
                                        </Typography>}
                                    />
                                </FormControl>
                                <Autocomplete
                                    multiple
                                    limitTags={5}
                                    id="tags-outlined"
                                    options={countryOptions}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(event, newValue) => handleCountries(newValue)}
                                    value={preSelectedCountryValues}
                                    filterSelectedOptions
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Denied Countrie(s)"
                                            placeholder="Select Countrie(s)"
                                        />
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardHeader title="Denied Browser List" />
                            <CardContent>
                                {/* <FormControl className="items-center">
                                    <FormControlLabel
                                        control={
                                            <Checkbox checked={selectAllBrowser} onChange={(event) => onSelectAllBrowser(event)} />
                                        }
                                        label={<Typography variant="body2" >
                                            <b>SELECT ALL</b>
                                        </Typography>}
                                    />
                                </FormControl>
                                <Autocomplete
                                    multiple
                                    limitTags={1}
                                    id="tags-outlined"
                                    options={browserOptions}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(event, newValue) => handleBrowsers(newValue)}
                                    value={preSelectedBrowserValues}
                                    filterSelectedOptions
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Denied Browser(s)"
                                            placeholder="Select Browser(s)"
                                        />
                                    )}
                                /> */}
                                <AddMore
                                    permission={permission}
                                    data={browsers}
                                    placeholder="Enter User Agent"
                                    onChange={onBrowserChangeFromChild}
                                    validationRegex="([^\s])"
                                    bro_agent={true}
                                />
                            </CardContent>
                        </Card>

                        {
                            permission ?
                                <span className="flex items-center justify-center">
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        className="w-1/2 mt-24"
                                        aria-label="Save"
                                        size="large"
                                        onClick={submit}
                                    >
                                        Save
                                    </Button>
                                </span>
                                : ''
                        }
                    </div>
                </div>
            </Paper>
        </div>
    )
}

export default IpConfiguration;