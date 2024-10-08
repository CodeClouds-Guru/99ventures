import * as React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Box, Paper, TextField, Typography, Divider, TextareaAutosize } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';

const schema = yup.object().shape({
    keywords: yup.string().required('Please enter the meta keywords'),
    description: yup.string().required('Please enter meta description'),
});

function MetatagConfiguration(props) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState(false);


    useEffect(() => {
        setPermission(
            (props.permission('save') || props.permission('update'))
        )
    }, [props.permission])

    const {
        control,
        formState: { isValid, dirtyFields, errors },
        handleSubmit,
        setValue
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            header_script: '',
            keywords: '',
            description: ''
        },
        // resolver: yupResolver(schema),
    });

    useEffect(() => {
        setValue('header_script', '');
        setValue('keywords', '', { shouldDirty: true, shouldValidate: false });
        setValue('description', '', { shouldDirty: true, shouldValidate: false });
        fetchData();
    }, [setValue])

    const fetchData = () => {
        axios.get(jwtServiceConfig.getMetaTagsConfiguration).then((response) => {
            if (response.data.results.status) {
                const result = response.data.results.data;
                setValue('header_script', (result.additional_headers === null ? '' : result.additional_headers.tag_content));
                setValue('keywords', result.Keywords, { shouldDirty: false, shouldValidate: true });
                setValue('description', result.Description, { shouldDirty: false, shouldValidate: true });
            } else {
                console.error('Failed to fetch Metatag Configuration');
            }
        });
    }


    /**
     * Metatags data post
     */
    const onSubmit = (data) => {
        if (data.keywords === '' && data.description === '' && data.header_script === '') {
            dispatch(showMessage({ variant: 'error', message: 'Please enter the value!' }));
            return;
        }

        const params = [{
            content: data.keywords,
            tag_name: 'Keywords'
        }, {
            content: data.description,
            tag_name: 'Description'
        }];
        setLoading(true);
        axios.post(jwtServiceConfig.saveMetaTagsConfiguration, { meta: params, header_script: { content: data.header_script } })
            .then((response) => {
                if (response.data.results.status) {
                    setLoading(false);
                    setValue('header_script', data.header_script);
                    setValue('keywords', data.keywords)
                    setValue('description', data.description)
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }))
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                }
            })
            .catch(error => dispatch(showMessage({ variant: 'error', message: error.response.data.errors })));
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-36 md:p-36 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0">
                        <form
                            name="metatagsFormControl"
                            noValidate
                            className="flex flex-col justify-center w-full"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Typography variant="h6">Additional Header Script</Typography>
                            <Typography variant="caption">Place any tracking script like Google Analytics, Facebook pixel etc.</Typography>
                            <Divider className="my-20" />

                            <Controller
                                name="header_script"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <pre>
                                            <code>
                                                <textarea
                                                    {...field}
                                                    rows={10}
                                                    maxRows={10}
                                                    aria-label="maximum height"
                                                    placeholder={
                                                        "#Add your tracking script like Google Analytics, Facebook pixel etc. \n" +
                                                        "Ex., \n<script>\n \t//...Add your script \n</script>"
                                                    }
                                                    className="custom-code-editor"
                                                ></textarea>
                                            </code>
                                        </pre>
                                        <small><em><strong>Note: </strong>You have to wrap your script within {'<script></script>'} tag.</em></small>
                                    </>
                                )}
                            />

                            <Divider className="my-24" light />
                            <Typography variant="h6">Meta Tags</Typography>
                            <Typography variant="caption">Add your meta keywords and description</Typography>
                            <Divider className="my-20" />
                            <Controller
                                name="keywords"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Keywords"
                                        id="fullWidth"
                                        className="mb-24"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        disabled={!permission}
                                    />
                                )}
                            />

                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Description"
                                        id="fullWidth"
                                        className="mb-24"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        disabled={!permission}
                                    />
                                )}
                            />


                            {
                                (permission) ?
                                    <div className='flex items-center justify-center'>
                                        <LoadingButton
                                            variant="contained"
                                            color="secondary"
                                            className="w-1/2 mt-24"
                                            aria-label="Register"
                                            type="submit"
                                            size="large"
                                            loading={loading}
                                        >
                                            Save
                                        </LoadingButton>
                                    </div>
                                    : ''
                            }
                        </form>
                    </div>
                </Paper>
            </div>
        </div>
    )
}

export default MetatagConfiguration;