import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Checkbox, Box, Typography, IconButton, ListItemText, ListItemIcon, Menu, MenuItem, Tooltip, Modal, Button, TextField } from '@mui/material';
import ItemIcon from "./ItemIcon";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItemsId, setSelectedItem, setlightBoxStatus, deleteData, filemanagerUpdateFile, getMetadata } from 'app/store/filemanager'
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';
import { copyUrl, convertFileSizeToKB, isImageFile, downloadFile } from './helper'
import Helper from '../../../app/helper'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

const modalStyle = {
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

/**
 * Grid & List Style
 */
const style = {
    grid: {
        box: 'sm:w-144 md:w-136 h-136 flex-col p-16',
        icon_btn: 'absolute',
        nav_icon_adapter: 'flex-col',
        icon: 'flex-auto w-full justify-center',
        title: 'text-center',
        modify: 'text-center',
        size: 'text-center'
    },
    list: {
        box: 'sm:w-full flex items-center flex-row row-style p-6',
        icon_btn: '',
        nav_icon_adapter: 'flex-row items-center justify-between',
        icon: 'mr-3',
        title: 'text-left grow w-20',
        modify: 'text-left basis-1/5',
        size: 'text-left basis-1/5'
    }
}

const schema =  yup.object().shape({
    file_name: yup.string().required('Please enter the filename')
});

const defaultValues = {
    file_name: ''
}

const FileItems = (props) => {
    const dispatch = useDispatch();
    const selectedItem = useSelector(state=>state.filemanager.selectedItem);
    const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
    const listing = useSelector(state=> state.filemanager.listData);
    const viewType = useSelector(state=> state.filemanager.viewType);
    
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    const [ msg, setMsg ] = useState('');
    const [open, setOpen] = useState(false);

    function handleMenuClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }

    /**
     * Alert box open, close & confirm delete
     */
    const onOpenAlertDialogHandle = () => {
        setMsg(`Do you want to delete ${props.file.name}?`);
        setOpenAlertDialog(true)
        handleMenuClose();        
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }
  
    const onConfirmAlertDialogHandle = async () => {        
        dispatch(deleteData([props.file.id]))
        .then(result => {
            setOpenAlertDialog(false);
        })
        
    }

    /**
     * Select / deselect item by clicking the checkbox
     */
    const handleChange = (event) => {
        if(!event.target.checked && selectedItemsId.includes(props.file.id)){
            const ids = selectedItemsId.filter(el=> el !== props.file.id);
            dispatch(setSelectedItemsId(ids))
        } else {
            dispatch(
                setSelectedItemsId([...selectedItemsId, props.file.id])
            )            
        }
    }

    /**
     * Open lightbox for preview
     */
    const handleOpenPreview = () => {
        if(isImageFile(props.file.mime_type) === true) {
            dispatch(setlightBoxStatus({isOpen: true, src: props.file.file_path}));
            handleMenuClose();
            dispatch(setSelectedItem(null));
        } else {
            window.open(props.file.file_path, '_blank');
            handleMenuClose();
        }
    }
    
    const copyFilePath = () => {
        handleMenuClose()
		copyUrl(props.file.file_path);
        dispatch(showMessage({ variant: 'success', message: 'URL Copied' }));
  	}

    const handleFileDownload = () => {
        downloadFile(props.file.file_path, props.file.name);
        handleMenuClose();
    }

    const { 
        control,
        formState: { isValid, dirtyFields, errors }, 
        handleSubmit,
        reset,
    } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    }); 

    const handleFileCopy = (data) => {
        const fileExt = props.file.name.split('.').pop();
        const fileName = data.file_name + '.' + fileExt;
        const checkFileName = listing.some(fl => fl.name === fileName && fl.type === 'file');
        if(checkFileName) {
            dispatch(showMessage({ variant: 'error', message: 'File name already exists!' }));
            return;
        }
        
        handlePopupClose();
        const params = {
            id: props.file.id,
            type: 'copy-file',
            file_name: fileName
        }
        dispatch(filemanagerUpdateFile(params));
    }

    const handlePopupOpen = () => {
        setOpen(true);
        handleMenuClose();
        dispatch(setSelectedItem(null));
    }

    const handlePopupClose = () => {
        setOpen(false);
        reset(defaultValues)
    }

    const handleViewFile = () => {
        dispatch(setSelectedItem(props.file));
        dispatch(getMetadata({id: props.file.id}));
    }

    return (
        <Box
            sx={{ backgroundColor: 'rgb(255, 255, 255)' }}
            className={`${style[viewType].box} flex relative w-full m-8 shadow rounded-16 cursor-pointer ${(selectedItem && selectedItem.id === props.file.id) ? 'border-2 border-gray-800' : ''} ${viewType}--view--section`}
            >
            <IconButton
                className={`z-20 top-0 right-0 m-6 w-32 h-32 min-h-32 ${style[viewType].icon_btn}`}
            >
                <Checkbox 
                    size="small"
                    checked={ selectedItemsId.includes(props.file.id) }
                    inputProps={{ 'aria-label': 'controlled' }}
                    onChange={handleChange} 
                />
            </IconButton>

            <NavLinkAdapter
				className={`flex h-full w-full ${style[viewType].nav_icon_adapter}`}
                to="#"
				role="button"
			>
                <div className={`flex items-center ${style[viewType].icon}`} onClick={ handleViewFile }>
                    <ItemIcon file={ props.file } />
                </div>
                
                <div className={`flex shrink flex-col justify-center text-left ${style[viewType].title}`}>
                    <Tooltip title={ props.file.name } placement="bottom-start">
                        <Typography className="pr-5 truncate text-12 font-medium" onClick={ handleViewFile }>{ props.file.name }</Typography>
                    </Tooltip>
                    <div className="item-list-icon">
                        <IconButton color="primary" aria-label="Filter" component="label"  onClick={ handleMenuClick }>
                            <FuseSvgIcon className="text-20" size={15} color="action">heroicons-outline:dots-vertical</FuseSvgIcon>  
                        </IconButton>

                        <Menu
                            id="actions-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            >
                            <MenuItem 
                                onClick={()=> {
                                    handleViewFile();
                                    handleMenuClose();
                                }}>
                                <ListItemIcon className="min-w-40">
                                    <FuseSvgIcon className="text-48" size={20} color="action">material-outline:info</FuseSvgIcon>
                                </ListItemIcon>
                                <ListItemText primary="Details" />
                            </MenuItem>
                            {
                                props.file.access === 'public' && (
                                    <MenuItem onClick={ handleOpenPreview }>
                                        <ListItemIcon className="min-w-40">
                                            <FuseSvgIcon className="text-48" size={20} color="action">material-outline:remove_red_eye</FuseSvgIcon>
                                        </ListItemIcon>
                                        <ListItemText primary="Preview" />
                                    </MenuItem>
                                )
                            }
                            <MenuItem onClick={handlePopupOpen}>
                                <ListItemIcon className="min-w-40">
                                    <FuseSvgIcon className="text-48" size={20} color="action">material-outline:content_copy</FuseSvgIcon>
                                </ListItemIcon>
                                <ListItemText primary="Copy" />
                            </MenuItem> 
                            {
                                props.file.access === 'public' && (
                                    <MenuItem onClick={ copyFilePath }>
                                        <ListItemIcon className="min-w-40">
                                            <FuseSvgIcon className="text-48" size={20} color="action">material-outline:insert_link</FuseSvgIcon>
                                        </ListItemIcon>
                                        <ListItemText primary="Copy URL" />
                                    </MenuItem>
                                )
                            }
                            <MenuItem onClick={ onOpenAlertDialogHandle }>
                                <ListItemIcon className="min-w-40">
                                    <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                                </ListItemIcon>
                                <ListItemText primary="Delete" />
                            </MenuItem>
                            <MenuItem onClick={ handleFileDownload }>
                                <ListItemIcon className="min-w-40">
                                    <FuseSvgIcon size={20}>material-outline:file_download</FuseSvgIcon>
                                </ListItemIcon>
                                <ListItemText primary="Download" />
                            </MenuItem> 
                        </Menu>                     
                    </div>
                </div>
                {
                    viewType === 'list' && (
                        <>
                            <div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].modify}`} onClick={()=> dispatch(setSelectedItem(props.file))}>
                                <Typography className="truncate text-12 font-medium">{ Helper.parseTimeStamp(props.file.last_modified) }</Typography>
                            </div>
                            <div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].size}`} onClick={()=> dispatch(setSelectedItem(props.file))}>
                                <Typography className="truncate text-12 font-medium">{ convertFileSizeToKB(props.file.size) } KB</Typography>
                            </div>
                        </>
                    )
                }	
            </NavLinkAdapter>
            {
                openAlertDialog && (
                    <AlertDialog
                        content={msg}
                        open={openAlertDialog}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }
            <Modal
                open={open}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={ modalStyle }>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Add File Name
                    </Typography>
                    <form
                        name="copy-filename"
                        noValidate  
                        className="flex flex-col justify-center w-full mt-32"
                        onSubmit={ handleSubmit(handleFileCopy) }
                    >
                        <Controller
                            name="file_name"
                            control={ control }
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Enter File Name"                            
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
                                Copy
                            </Button>
                        </div>
                    </form>
                </Box>
            </Modal>
        </Box>
    )
}

export default FileItems;