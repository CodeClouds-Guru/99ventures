import React from 'react';
import { Typography, FormControl, TextField, Paper, FormHelperText, InputLabel, Button, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails, TextareaAutosize, FormGroup, FormControlLabel, Switch } from '@mui/material';


export default function Others(props) {
    const [data, setData] = React.useState({
        id: 0,
        slug: '',
        name: '',
        content: '',
    });

    React.useEffect(() => {
        setData({ ...props.data });
    }, []);

    const onConentChange = (event) => {
        setData({
            ...data,
            content: event.target.value.trim()
        });
    }

    const submit = () => {
        props.updateContent(data)
    }

    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                <div className="flex justify-end">
                    <FormControl className="w-full">
                        <TextareaAutosize
                            maxRows={100}
                            aria-label="maximum height"
                            placeholder="Enter Content"
                            value={data.content}
                            style={{ minHeight: '80px', overflow: 'auto', width: '100%', padding: '15px', backgroundColor: '#000', color: '#ffeeba', height: '450px' }}
                            onChange={onConentChange}
                        />
                    </FormControl>
                </div>
                <div className="flex justify-start">
                    <span className="flex items-center justify-center mb-24">
                        <Button
                            variant="contained"
                            color="secondary"
                            className="w-1/2 mt-20"
                            aria-label="Register"
                            type="submit"
                            size="large"
                            disabled={data.content.trim().length === 0}
                            onClick={() => submit()}
                        >
                            Save
                        </Button>
                    </span>
                </div>
            </div>
        </div>
    )
}
