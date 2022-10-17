import React, { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, LinearProgress } from '@mui/material';
import axios from 'axios'
import FileItems from "./FileItems";
import FolderItem from "./FolderItem";
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch, useSelector } from 'react-redux';
import { getList, setPathObject, setLoading, setListData } from 'app/store/filemanager';
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
/*const thumbsContainer = {
	display: 'flex',
	flexDirection: 'row',
	flexWrap: 'wrap',
	marginTop: 16
};

const thumb = {
	display: 'inline-flex',
	borderRadius: 2,
	border: '1px solid #eaeaea',
	marginBottom: 8,
	marginRight: 8,
	width: 100,
	height: 100,
	padding: 4,
	boxSizing: 'border-box'
};

const thumbInner = {
	display: 'flex',
	minWidth: 0,
	overflow: 'hidden'
};

const img = {
	display: 'block',
	width: 'auto',
	height: '100%'
};*/

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

function DragDropzone() {
	const dispatch = useDispatch();
    const listing = useSelector(state=> state.filemanager.listData);
	const pathObject = useSelector(state=> state.filemanager.pathObject);
	const loading = useSelector(state=> state.filemanager.loading);
	const navigate = useNavigate();
	const [ progress, setProgress ] = useState(0);
	const [ buffer, setBuffer ] = useState(10);

	const [files, setFiles] = useState([]);
	const {
		getRootProps,
		getInputProps,
		isFocused,
		isDragAccept,
		isDragReject,
		acceptedFiles
	} = useDropzone({
		noKeyboard: true,
        noClick: true,
		accept: {
			'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
			'text/csv': ['.csv'],
			'application/msword': ['.doc'],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
			'application/vnd.oasis.opendocument.presentation': ['.odp'],
			'application/pdf': ['.pdf'],
			'application/vnd.ms-powerpoint': ['.ppt'],
			'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
			'application/vnd.ms-excel': ['.xls'],
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'audio/mpeg': ['.mp3'],
			'video/mp4': ['.mp4'],
		},
		onDrop: acceptedFiles => {
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
		if(!pathObject.length){
			// Remove trailing slash
			const pathname = location.pathname.replace(/\/$/, "");
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
		return () => files.forEach(file => URL.revokeObjectURL(file.preview));
	}, [location.pathname]);

		
	const handleFile = (config, files) => {
		const params = new FormData();
		params.append('file_path', pathObject.join('/'));
		files.forEach(file => {
			params.append('file', file);
		});
		dispatch(setLoading('pending'));

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
		.catch(error => dispatch(showMessage({ variant: 'error', message: error.response.data.errors })));
	}; 

	return (
		<div className='w-full h-full'>			
			{
				loading == 'pending' && <LinearProgress />
			}
			<section className={`
				${loading == 'pending' && `opacity-25 pointer-events-none`} filemanager-file-box container flex flex-col  h-full w-full md:p-24 sm:p-24 lg:p-24 w-full `
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
		</div>		
	);
}


export default DragDropzone;