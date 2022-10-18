import * as React from 'react';
import { Box, Typography, Button, TextField, Tooltip, IconButton} from '@mui/material';
import Modal from '@mui/material/Modal';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import { setLoading, setListData, setJsonData } from 'app/store/filemanager';
import { useDispatch, useSelector } from 'react-redux';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const schema =  yup.object().shape({
    folder: yup.string().required('Please enter the heading')
});

const defaultValues = {
    folder: ''
}

const CreateFolder = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
	const pathObject = useSelector(state=> state.filemanager.pathObject);
    
    const { 
        control,
        formState: { isValid, dirtyFields }, 
        handleSubmit,
        reset,
    } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    }); 

    const createFolder = (data) => {
        const params = {
            "folder_name": data.folder,
            "file_path": pathObject.join('/')
        }
        dispatch(setLoading('pending'));
        handleClose();
        axios.post(jwtServiceConfig.filemanagerUploadFile, params)
		.then((response) => {
			dispatch(setLoading('idle'));
			if (response.data.results.status) {
				dispatch(showMessage({ variant: 'success', message: 'File uploaded!' }));                
				if(response.data.results.data){
					dispatch(setListData(response.data.results.data));
					dispatch(setJsonData(response.data.results.data));
				}
			} else {
				dispatch(showMessage({ variant: 'error', message: response.data.errors }));
			}
		})
		.catch(error => {
			dispatch(setLoading('idle'));
			dispatch(showMessage({ variant: 'error', message: error.response.data.message }))
		});
    }

    const handleClose = () => {
        setOpen(false);
        reset(defaultValues)
    }
    
    return (
        <>
            <Tooltip title="Create Folder">
                <IconButton color="primary" aria-label="Filter" component="label" onClick={handleOpen}>
                    <FuseSvgIcon className="text-48" size={26} color="action">material-outline:create_new_folder</FuseSvgIcon>
                </IconButton>
            </Tooltip>
            <Modal
                open={open}        
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Create Folder
                    </Typography>
                    <form
                        name="AutoresponderForm"
                        noValidate  
                        className="flex flex-col justify-center w-full mt-32"
                        onSubmit={ handleSubmit(createFolder) }
                    >
                        <Controller
                            name="folder"
                            control={ control }
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Add Folder Name"                            
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />
                        <div className='flex justify-between'>
                            <Button 
                                variant="contained"
                                component="label"
                                className=""
                                color="primary" 
                                onClick={ handleClose }
                            >Close</Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                className=""
                                aria-label="Create"
                                disabled={ !Object.keys(dirtyFields).length || !isValid}
                                type="submit"
                                size="large"
                                >
                                Create
                            </Button>
                        </div>
                    </form>
                </Box>
            </Modal>
        </>
    );
}

export default CreateFolder;