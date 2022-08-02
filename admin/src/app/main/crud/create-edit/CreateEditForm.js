import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Controller, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

function CreateEditForm(props) {
  const fields = useSelector(state=>state.crud.module.fields);

  const processFormFields = (fieldConfig)=>{
    let fieldType = fieldConfig.type
    switch(fieldType){
      case "text":
      default:
        return <TextField
          className="mt-8 mb-16"
          error={false}
          required
          helperText={''}
          label={fieldConfig.placeholder}
          autoFocus
          id={fieldConfig.field_name}
          variant="outlined"
          fullWidth
        />
    }
  }

  return (
    
    <div>
      {Object.values(fields).filter(f=>f.show_in_form).map(mField=>
          <div key={mField.field_name}>
            {processFormFields(mField)}
         </div>   
      )}
    </div>
  );
}

export default CreateEditForm;
