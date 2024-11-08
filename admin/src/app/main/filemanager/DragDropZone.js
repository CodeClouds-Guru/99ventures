import React, { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, LinearProgress } from '@mui/material';
import axios from 'axios'
import FileItems from "./FileItems";
import FolderItem from "./FolderItem";
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch, useSelector } from 'react-redux';
import { getList, setPathObject, setLoading, setListData, setSelectedItem, setUploadDialog} from 'app/store/filemanager';
import { useNavigate } from "react-router-dom";
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import { showMessage } from 'app/store/fuse/messageSlice';


const baseStyle = {
	justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
};


const focusedStyle = {
	borderColor: '#2196f3'
};

const acceptStyle = {
	borderColor: '#777',
    borderWidth: 3,
	borderRadius: 2,
	borderStyle: 'dashed',
};

const rejectStyle = {
	borderColor: '#ff1744',
	borderWidth: 3,
	borderRadius: 2,
	borderStyle: 'dashed',
};

const centerStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    inset: '0px',
    height: '220px',
    width: '220px',
    borderRadius: '50%',
    textAlign: 'center',
    marginBottom: 'auto',
    display: 'flex',
    zIndex: '-9',
    marginTop: 'auto',
    alignItems: 'center',
    justifyContent: 'center'
}

function nameLengthValidator(file) {
	if (file.name.length > 2) {
	  return {
		code: "name-too-large",
		message: `Name is larger than 2 characters`
	  };
	}
  
	return null
  }
  

function DragDropzone(props) {
	const dispatch = useDispatch();
    const listing = props.listing;
    // const listing = useSelector(state=> state.filemanager.listData);
	const pathObject = useSelector(state=> state.filemanager.pathObject);
	const loading = useSelector(state=> state.filemanager.loading);
	const selectConfig = useSelector(state => state.filemanager.config);
	const openDialog = useSelector(state => state.filemanager.openUploadDialog);
	const navigate = useNavigate();
	const [files, setFiles] = useState([]);

	const {
		getRootProps,
		getInputProps,
		isFocused,
		isDragAccept,
		isDragReject,
		acceptedFiles,
		open
	} = useDropzone({
		noKeyboard: true,
        noClick: true,
		maxSize: selectConfig.max_file_size ? selectConfig.max_file_size * Math.pow(1024, 2) : 1024,	// Bytes convert
		maxFiles: selectConfig.max_no_of_uploads ?? 0,
		accept: selectConfig.accept ?? {},
		validator: (file) =>{
			const checkFile = listing.some(row => row.name === file.name);
			if (checkFile) {
				return {
					code: "file-already-exists",
					message: file.name + ' already exists!'
				};
			}
			return null;
		},
		onDrop: acceptedFiles => {
			// console.log(acceptedFiles)
			setFiles(acceptedFiles.map(file => Object.assign(file, {
				preview: URL.createObjectURL(file)
			})));
		},
		onDropAccepted: (file)=> {
			const config = {
				/*onUploadProgress: progressEvent => {
					console.log(progressEvent)
					var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      				console.log(percentCompleted)
					if(percentCompleted < 80){
						setProgress(percentCompleted);
						const diff = Math.random() * 10;
						setBuffer(percentCompleted + diff);
					}
				},
				onDownloadProgress: progressEvent => {
					var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      				console.log(percentCompleted)
					setProgress(percentCompleted);
					const diff = Math.random() * 10;
					setBuffer(percentCompleted + diff);
				}*/
			}
			handleFile(config, file)
		},
		onDropRejected: (files) => {
			const msgs = [];
			const warning = [];
			for(let i=0; i<files.length; i++) {
				if(files[i].errors[0]['code'] === 'file-too-large'){
					msgs.push(`${files[i].file.name} is too large! Maximum file size is ${selectConfig.max_file_size ? selectConfig.max_file_size : 1} MB!`);
				}
				if(files[i].errors[0]['code'] === 'file-invalid-type'){
					msgs.push(`${files[i].file.name} is not supported!`);
				}
				if(files[i].errors[0]['code'] === 'too-many-files'){
					msgs.push(`${files[i].errors[0]['message']}. Maximum ${selectConfig.max_no_of_uploads} files can be uploaded at a time!`);
					break
				}
				if(files[i].errors[0]['code'] === 'file-already-exists'){
					warning.push(files[i].errors[0]['message']);
				}
			}
			if(msgs.length !=0)
				dispatch(showMessage({ variant: 'error', message: msgs.join('. ') }));
			else 
				dispatch(showMessage({ variant: 'warning', message: warning.join('. ') }));
		}
	});

	const style = useMemo(() => ({
		...(!listing.length ? baseStyle: {}),
		...(isFocused ? focusedStyle : {}),
		...(isDragAccept ? acceptStyle : {}),
		...(isDragReject ? rejectStyle : {})
	}), [
		isFocused,
		isDragAccept,
		isDragReject,
		listing
	]);

	/**
	 * Open file upload dialog box
	 */
	useEffect(()=>{
		if(openDialog){
			open();
			dispatch(setUploadDialog({status: false}))
		}
	}, [openDialog]);

	/*const thumbs = files.map(file => (
		<div style={thumb} key={file.name}>
			<div style={thumbInner}>
				<img
					src={file.preview}
					style={img}
					// Revoke data uri after image is loaded
					onLoad={() => { URL.revokeObjectURL(file.preview) }}
				/>
			</div>
		</div>
	));*/

	useEffect(() => {
		var path = pathObject;	

		/**
		 * This block will execute while reloading the page
		 */
		if(!path.length){
			const pathname = location.pathname.replace(/\/$/, "");// Remove trailing slash
			const pathArry = decodeURI(pathname).split('/');
			pathArry.splice(0, 3);
			path = pathArry
			dispatch(setPathObject(pathArry));
		}

		dispatch(
			getList(path.join('/'))
		).then(response => {
			if(response.payload.status === 409){
				dispatch(setPathObject([]));
				return navigate('/app/filemanager');
			}
		});
		
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => {
			files.forEach(file => URL.revokeObjectURL(file.preview));
			const pathname = location.pathname;
			(pathname.split('/')[2] !== 'filemanager') && dispatch(setPathObject([]));

		};
	}, [location.pathname]);

	

		
	const handleFile = (config, files) => {
		const params = new FormData();
		params.append('file_path', pathObject.join('/'));
		params.append('private', 0);
		params.append('alt_name', "");
		files.forEach((file) => {
			params.append('file', file);
		});
		dispatch(setLoading('pending'));
		dispatch(setSelectedItem(null));

		axios.post(jwtServiceConfig.filemanagerUploadFile, params, config)
		.then((response) => {
			dispatch(setLoading('idle'));
			if (response.data.results.status) {
				dispatch(showMessage({ variant: 'success', message: 'File uploaded!' }));
				if(response.data.results.data){
					dispatch(setListData(response.data.results.data));
				}
			} else {
				dispatch(showMessage({ variant: 'error', message: response.data.errors }));
			}
		})
		.catch(error => {
			dispatch(setLoading('idle'));
			dispatch(showMessage({ variant: 'error', message: error.response.data.message }))
		});
	}; 



	return (
		<section className={`
			${loading == 'pending' && `opacity-25 pointer-events-none`} filemanager-file-box container flex flex-col h-full w-full md:p-20 sm:p-20 lg:p-20 w-full`
		}>
			<Box 
				className="dropzone h-full"
				{...getRootProps({ style })}
			>					
				<div className='flex flex-wrap items-center' >
					{
						listing.length ? listing.map((el, i) => {
							if(el.type === 'folder') {
								return <FolderItem key={i} file={ el }/>
							}
						}) : ''
					}
					{
						listing.length ? listing.map((el, i) => {
							if(el.type === 'file') {
								return <FileItems key={i} file={ el } />
							}
						}) : ''
					} 
					<input {...getInputProps({
						onChange: handleFile,
					})} />
				</div>
				{
					!listing.length && loading == 'idle' && (
						<div style={centerStyle}>
							<div className='relative flex items-center relative flex-col justify-between'>
								<FuseSvgIcon style={{zIndex: '-1'}} className="text-48 absolute origin-center rotate-45 mt-auto mb-auto bottom-5 top-5 text-gray-200" size={150} color="action">heroicons-solid:photograph</FuseSvgIcon>
								<FuseSvgIcon style={{ margin: '0 auto'}} className="text-48 text-gray-500" size={50} color="action">material-outline:add_to_drive</FuseSvgIcon>
								<Typography className='text-gray-700' variant="body2">Drop files here</Typography>                     
							</div>
						</div>
					)
				}
			</Box>				
		</section>
	);
}


export default DragDropzone;