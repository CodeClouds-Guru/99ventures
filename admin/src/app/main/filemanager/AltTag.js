import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box, ClickAwayListener, IconButton, TextField, CircularProgress, Input, InputLabel, InputAdornment, FormControl, Typography, Tooltip } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import _ from '@lodash';

const schema = yup.object().shape({
    title: yup.string().required('You must enter a title'),
});

const AltTag = () => {
    const [formOpen, setFormOpen] = useState(false);

    const { control, formState, handleSubmit, reset } = useForm({
        mode: 'onChange',
        defaultValues: {
          title: '',
        },
        resolver: yupResolver(schema),
    });

    const { isValid, dirtyFields, errors } = formState;

    function handleOpenForm(ev) {
        ev.stopPropagation();
        setFormOpen(true);
    }
    
    function handleCloseForm() {
        setFormOpen(false);
    }
    
    function onSubmit(newData) {
        // dispatch(updateList({ id: list.id, newData }));
        handleCloseForm();
    }
    return (
        <>            
            {formOpen ? (
                <ClickAwayListener onClickAway={handleCloseForm}>
                  <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          variant="standard"
                          margin="none"
                          autoFocus
                          className="w-full"
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  type="submit"
                                  disabled={_.isEmpty(dirtyFields) || !isValid}
                                  size="large"
                                >
                                  <FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </form>
                </ClickAwayListener>
            ) : (
                <>
                    <Typography color="text.secondary" onClick={handleOpenForm}>
                        Alt Text: Lorem Ipsum
                    </Typography>
                    <Tooltip title="Delete">
                        <IconButton color="primary" aria-label="Filter" component="label" onClick={handleOpenForm}>
                            <FuseSvgIcon className="text-48" size={20} color="action">material-outline:edit</FuseSvgIcon>

                        </IconButton>
                    </Tooltip>
                </>
            )}
        </>
    )
}

export default AltTag;