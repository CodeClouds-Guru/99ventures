import { useState } from 'react';
import { Tooltip, IconButton, ListItemText, Menu, MenuItem} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AlertDialog from 'app/shared-components/AlertDialog';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedItemsId, setSelectedItem, setViewType, deleteData, setListData, setLoading, setFolderOptions } from 'app/store/filemanager'
import { downloadFile } from './helper';
import { orderBy } from 'lodash';
import axios from 'axios'

const baseStyle = {
    borderTop: '3px solid #77777763',
    borderBottom: '3px solid #ddd',
    padding: '5px 0',
}

const Header = (props) => {
    const dispatch = useDispatch();
    const viewType = useSelector(state=> state.filemanager.viewType);
    const selectedItem = useSelector(state=>state.filemanager.selectedItem);
    const selectedItemIdArry = useSelector(state=> state.filemanager.selectedItemsId);
    const listing = useSelector(state=> state.filemanager.listData);

    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ msg, setMsg ] = useState('');

    /**
     * Alert box open, close & confirm delete
	*/
	const onOpenAlertDialogHandle = () => {
        var message = '';
        if(selectedItemIdArry.length > 1)
            message = `Do you want to delete ${selectedItemIdArry.length} item(s)?`;
        else if(selectedItemIdArry.length == 1)
            message = `Do you want to delete this item?`;
        else if(selectedItem)
            message = `Do you want to delete ${selectedItem.name}?`;

        setMsg(message);
        setOpenAlertDialog(true);
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
        dispatch(setSelectedItemsId([]));
    }
  
    const onConfirmAlertDialogHandle = async () => {
        var params = [];
        if(selectedItemIdArry.length)
            params = selectedItemIdArry;
        else if(selectedItem)
            params = [selectedItem.id]

        dispatch(deleteData(params))
        .then(result => {
            setOpenAlertDialog(false);
            dispatch(setSelectedItemsId([]));
            dispatch(setSelectedItem(null));
        });
    }

    const handleMenuClick = (event) =>{
        setAnchorEl(event.currentTarget);
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    }

    const handleFileDownload = () => {
        if(selectedItemIdArry.length && selectedItemIdArry.length < 2) {
            const index = listing.findIndex(file => file.id === selectedItemIdArry[0]);
            const fileData = listing[index];
            downloadFile(fileData.file_path, fileData.mime_type);
        } else if(selectedItem) {
            downloadFile(selectedItem.file_path, selectedItem.mime_type);
        } else if(selectedItemIdArry.length && selectedItemIdArry.length >= 2) {
            console.log('Download');

            axios.post('file-manager/download')
            .then((response) => {
                console.log(response)        
                const url = new Blob([response.data],{type:'application/zip'});
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'file.zip');
                document.body.appendChild(link);
                link.click();        
            })
            .catch(error => {
                console.log(error)                
            });

            // const urls = [
            //     // "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/xyz/1666010535178download.jpeg",
            //     // "https://99-ventures-bucket.s3.us-east-2.amazonaws.com/CodeClouds/1/file-manager/xyz/1665753910733person-holds-a-book-over-a-stack-and-turns-the-page.jpg"

            //     "http://localhost:3000/assets/images/logo/logo.svg"

            // ]

            // const zip = new JSZip();
            // const folder = zip.folder("files"); // folder name where all files will be placed in 
        
            // urls.forEach((url) => {
            //     const blobPromise = fetch(url).then((r) => {
            //         console.log(r.blob())
            //         if (r.status === 200) return r.blob();
            //         return Promise.reject(new Error(r.statusText));
            //     });
            //     const name = url.substring(url.lastIndexOf("/") + 1);
            //     folder.file(name, blobPromise);
                
            // });


        
            // zip.generateAsync({ type: "blob" }).then((blob) => 
            //     {
            //         console.log(blob)
            //     }
            // );



            
        }
        return;
    }

    const sortingFiles = (column, sortType) => {
       const result = orderBy(listing, [column], [sortType]);
       dispatch(setListData(result));
       handleMenuClose();
    }
    
    return (
        <>
            <div style={ baseStyle } className="flex flex-col sm:flex-row w-full sm:w-auto items-center space-y-16 sm:space-y-0 sm:space-x-16 justify-between">
                { props.selectAll }
                <div className='flex justify-between'>
                    <Tooltip title="Create Folder">
                        <IconButton 
                            color="primary" 
                            aria-label="Filter" 
                            component="label" 
                            onClick={ ()=> dispatch(setFolderOptions({type: 'new_folder', popup_mode: true, additional_params: {}}))}
                            >
                            <FuseSvgIcon className="text-48" size={26} color="action">material-outline:create_new_folder</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                    {
                        (selectedItemIdArry.length || selectedItem) && (
                            <>
                                <Tooltip title="Delete">
                                    <IconButton color="primary" aria-label="Delete" component="label" onClick={ onOpenAlertDialogHandle }>
                                        <FuseSvgIcon className="text-48" size={26} color="action">heroicons-outline:trash</FuseSvgIcon>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                    <IconButton color="primary" aria-label="Download" component="label" onClick={ handleFileDownload }>
                                        <FuseSvgIcon className="text-48" size={26} color="action">material-outline:file_download</FuseSvgIcon>
                                    </IconButton>
                                </Tooltip>
                            </>
                        )
                    }
                </div>
                <div className="flex " variant="outlined">
                    { props.search }
                </div>
                <div className='flex'>
                    <Tooltip title="Sorting">
                        <IconButton color="primary" aria-label="Sorting" component="label" onClick={ handleMenuClick } >                            
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" style={{ 'fill': 'rgba(0, 0, 0, 0.54)'}} viewBox="0 0 26 26">
                                <path d="M6 21l6-8h-4v-10h-4v10h-4l6 8zm16-12h-8v-2h8v2zm2-6h-10v2h10v-2zm-4 8h-6v2h6v-2zm-2 4h-4v2h4v-2zm-2 4h-2v2h2v-2z"/>
                            </svg>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        id="actions-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        >
                        <MenuItem onClick={()=> sortingFiles('last_modified', 'desc')}>
                            <ListItemText primary="Newest First" />
                        </MenuItem>
                        <MenuItem onClick={()=> sortingFiles('last_modified', 'asc')}>
                            <ListItemText primary="Oldest First" />
                        </MenuItem>
                        <MenuItem onClick={()=> sortingFiles('name', 'asc')}>
                            <ListItemText primary="Asc Filename" />
                        </MenuItem>
                        <MenuItem onClick={()=> sortingFiles('name', 'desc')}>
                            <ListItemText primary="Desc Filename" />
                        </MenuItem>
                    </Menu> 
                </div>
                <div className='flex view--type'>
                    <Tooltip title="Grid">
                        <IconButton color="primary" aria-label="Grid" component="label" onClick={()=> dispatch(setViewType('grid'))} className={ viewType === 'grid' ? 'active' : '' }>
                            <FuseSvgIcon className="text-48" size={26} color="action">material-outline:grid_view</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="List">
                        <IconButton color="primary" aria-label="List" component="label" onClick={()=> dispatch(setViewType('list'))} className={ viewType === 'list' ? 'active' : ''}>
                            <FuseSvgIcon className="text-48" size={26} color="action">material-outline:format_list_bulleted</FuseSvgIcon>
                        </IconButton>
                    </Tooltip>
                </div>            
            </div>
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
        </>
    )
}

export default Header