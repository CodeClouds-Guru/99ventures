import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Controller, useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { saveModule, updateModule, selectModule } from "../store/moduleSlice"

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

  const processFormFields = (fieldConfig, defaultVal) => {
    let fieldType = fieldConfig.type
    switch (fieldType) {
      case "text":
      default:
        return (<Controller
          name={fieldConfig.field_name}
          control={control}
          defaultValue={defaultVal}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16"
              error={!!errors.name}
              helperText={errors?.name?.message}
              label={fieldConfig.placeholder}
              autoFocus
              id={fieldConfig.field_name}
              variant="outlined"
              fullWidth
            />
          )}
        />)

    }
  }

  const onSubmit = async data => {
    if (moduleId == 'create') {
      let res = await dispatch(saveModule({ ...data, module }));
      if (!res.error) {
        navigate(`/app/${module}`);
      }
    } else {
      await dispatch(updateModule({ ...data, module, moduleId }));
    }

  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {Object.values(fields).filter(f => f.show_in_form)
          .map(mField => {
            let defaultVal = moduleData && moduleData[mField.field_name] ? moduleData[mField.field_name] : ''
            return <div key={mField.field_name}>
              {processFormFields(mField, defaultVal)}
            </div>
          }
          )}
        <input type="submit" style={{ "padding": "5px", border: "1px solid" }} value={'Save'} />
      </form>
    </div>
  );
}

export default CreateEditForm;
