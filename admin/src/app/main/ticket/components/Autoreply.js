import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { createTheme, useTheme, ThemeProvider, Theme } from '@mui/material/styles';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';


const customTheme = (outerTheme) =>
  createTheme({
    palette: {
      mode: outerTheme.palette.mode,
    },
    components: {
      MuiAutocomplete: {
        defaultProps: {
          renderOption: (props, option, state, ownerState) => (
            <Box
              sx={{
                borderRadius: '8px',
                margin: '5px',
                [`&.${autocompleteClasses.option}`]: {
                  padding: '6px',
                },
              }}
              component="li"
              {...props}
            >
              {option.name}
            </Box>
          ),
        },
      },
    },
});

const AutoReply = (props) => {
    const outerTheme = useTheme();
    const [opValue, setOpValue] = React.useState(null);
    const [responseVal, setResponseVal] = React.useState('');
    const [dropdownOptions, setDropdownoptions] = React.useState([]);

    const replyValue = (value) => {
        if(value !== null){
          props.handleChangeQuickResponse(value.body);
          setOpValue(value)
        }
    }
    React.useEffect(()=>{
      if(props.quickResponseval === 'clear'){
        setResponseVal('');
        setOpValue(null)
      }
      if(props.dropdownoptions && props.dropdownoptions.length) {
        setDropdownoptions(props.dropdownoptions)
      }
    }, [props.quickResponseval, props.dropdownoptions]);


    return (
        <ThemeProvider theme={customTheme(outerTheme)}>
          <Autocomplete
              autoHighlight
              blurOnSelect
              value={opValue}
              onChange={(event, newValue) => {
                replyValue(newValue);
              }}              
              onInputChange={(event, newInputValue) => {
                setResponseVal(newInputValue);
              }}
              inputValue={responseVal}
              id="ayto-reply-options"
              options={dropdownOptions}
              isOptionEqualToValue={(option, value) => option.name === value.name}
              getOptionLabel={(option) => option.name}
              sx={{ width: 280 }}
              renderInput={(params) => <TextField {...params} placeholder="Quick Response" />}
            />
        </ThemeProvider>
    )
}
export default AutoReply;
