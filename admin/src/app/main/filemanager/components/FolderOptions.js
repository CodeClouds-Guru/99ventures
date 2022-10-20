import { Box, Typography, Button, TextField} from '@mui/material';
import Modal from '@mui/material/Modal';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { showMessage } from 'app/store/fuse/messageSlice';
import { createNewFolder, setFolderOptions, filemanagerUpdateFile } from 'app/store/filemanager';
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
    folder: yup.string().required('Please enter the foldername')
});

const defaultValues = {
    folder: ''
}

const FolderOptions = () => {
    const dispatch = useDispatch();
    const options = useSelector(state=> state.filemanager.folderOptions)
	const pathObject = useSelector(state=> state.filemanager.pathObject);
    const listing = useSelector(state=> state.filemanager.listData);

    const handlePopupClose = () => {
        dispatch(setFolderOptions({popup_mode: false, type: '', additional_params: {}}));
        reset(defaultValues);
    }

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

    const formSubmit = (data) => {
        const folderName = data.folder;
        const checkFileName = listing.some(fl => fl.name === folderName && fl.type === 'folder');
        if(checkFileName) {
            dispatch(showMessage({ variant: 'error', message: 'Folder already exists!' }));
            return;
        }

        if(options.type === 'new_folder'){
            const params = {
                folder_name: folderName,
                file_path: pathObject.join('/')
            }
            dispatch(createNewFolder(params));
        }
        else if(options.type === 'rename_folder') {
            const params = {
                type: 'rename',
                folder_name: folderName
            };
            dispatch(filemanagerUpdateFile({...params, ...options.additional_params}));
        }
        handlePopupClose();
    }

    return (
        <Modal
            open={ options.popup_mode }
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    { options.type === 'new_folder' ? 'Create' : 'Rename'} Folder
                </Typography>
                
                <form
                    name="MultipurposeFolderForm"
                    noValidate  
                    className="flex flex-col justify-center w-full mt-32"
                    onSubmit={ handleSubmit(formSubmit) }
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
                            onClick={ handlePopupClose }
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
                            { options.type === 'new_folder' ? 'Create' : 'Rename'}
                        </Button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
}

export default FolderOptions;