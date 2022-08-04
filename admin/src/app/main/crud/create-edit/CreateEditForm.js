import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Controller, useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { saveModule, updateModule, selectModule } from "../store/moduleSlice"
import MenuItem from '@mui/material/MenuItem';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { showMessage } from 'app/store/fuse/messageSlice';

import * as yup from "yup";
import { useParams, useNavigate } from 'react-router-dom';

const schema = yup.object({
  // email: yup.string().required(),
}).required();

function CreateEditForm(props) {
  const fields = useSelector(state => state.crud.module.fields);
  const moduleData = useSelector(selectModule);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  const { module, moduleId } = useParams()

  const processFormFields = (field, fieldConfig) => {
    let fieldType = fieldConfig.type
    switch (fieldType) {
      case "date":
        return <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={fieldConfig.placeholder}
            {...field}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      case "custom":
        return <input type="text" {...field} />
      case "multi-select":
        return <input type="text" {...field} />
      case "select":
        let fieldOptions = fieldConfig.options || []
        return <TextField
          {...field}
          className="mt-8 mb-16"
          error={!!errors.name}
          helperText={errors?.name?.message}
          label={fieldConfig.placeholder}
          autoFocus
          id={fieldConfig.field_name}
          variant="outlined"
          fullWidth
          select
        >{fieldOptions.map((option) => (
          <MenuItem key={option.key} value={option.value}>
            {option.label}
          </MenuItem>
        ))}</TextField>
      case "textarea":
        return (<TextField
          {...field}
          className="mt-8 mb-16"
          error={!!errors.name}
          helperText={errors?.name?.message}
          label={fieldConfig.placeholder}
          autoFocus
          id={fieldConfig.field_name}
          variant="outlined"
          fullWidth
          multiline
          rows={fieldConfig.rows ?? 5}
        />)
      case "number":
        return (<TextField
          {...field}
          className="mt-8 mb-16"
          error={!!errors.name}
          helperText={errors?.name?.message}
          label={fieldConfig.placeholder}
          autoFocus
          id={fieldConfig.field_name}
          variant="outlined"
          fullWidth
          type="number"
        />)
      case "password":
        return <TextField
          {...field}
          className="mt-8 mb-16"
          error={!!errors.name}
          helperText={errors?.name?.message}
          label={fieldConfig.placeholder}
          autoFocus
          id={fieldConfig.field_name}
          variant="outlined"
          fullWidth
          type="password"
        />
      case "text":
      default:
        return (<TextField
          {...field}
          className="mt-8 mb-16"
          error={!!errors.name}
          helperText={errors?.name?.message}
          label={fieldConfig.placeholder}
          autoFocus
          id={fieldConfig.field_name}
          variant="outlined"
          fullWidth
        />)

    }
  }

  const onSubmit = async data => {
    if (moduleId == 'create') {
      let res = await dispatch(saveModule({ ...data, module }));
      if (!res.error) {
        navigate(`/app/${module}`);
        dispatch(showMessage({ variant: 'success', message: 'Record created successfully' }));
      }
    } else {
      let res = await dispatch(updateModule({ ...data, module, moduleId }));
      if (!res.error) {
        dispatch(showMessage({ variant: 'success', message: 'Record updated successfully' }));
      }
    }

  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {Object.values(fields).filter(f => f.show_in_form)
          .map(mField => {
            let defaultVal = moduleData && moduleData[mField.field_name] ? moduleData[mField.field_name] : ''
            return <div key={mField.field_name}>
              <Controller
                name={mField.field_name}
                control={control}
                defaultValue={defaultVal}
                render={({ field }) => (
                  processFormFields(field, mField)
                )}
              />
            </div>
          }
          )}
        <input type="submit" style={{ "padding": "5px", border: "1px solid" }} value={'Save'} />
      </form>
    </div>
  );
}

export default CreateEditForm;
