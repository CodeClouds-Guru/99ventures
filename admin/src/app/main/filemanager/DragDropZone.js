import React, { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@mui/material';
import axios from 'axios'
import FileItems from "./FileItems";
import FolderItem from "./FolderItem";
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch, useSelector } from 'react-redux';
import { getList } from '../../store/filemanager'
import { useParams, useLocation } from 'react-router-dom';
import { setBreadCrumb } from 'app/store/filemanager';

const baseStyle1 = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	padding: '60px',
	borderWidth: 2,
	borderRadius: 2,
	borderColor: '#eeeeee',
	borderStyle: 'dashed',
	backgroundColor: '#fafafa',
	color: '#bdbdbd',
	outline: 'none',
	transition: 'border .24s ease-in-out'
};

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
	borderColor: '#ff1744'
};
const thumbsContainer = {
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

function DragDropzone() {
	const location = useLocation();
	const dispatch = useDispatch();
    const jsonData = useSelector(state=> state.filemanager.jsonData)
    // const jsonData = useSelector(state=> state.filemanager.listData)
    const [ listing, setListing ] = useState([]);

	// console.log(jsonData)

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
			'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.docx', '.csv', '.xlsx', '.pptx', '.doc', '.xls', '.ppt', '.pdf']
		},
		onDrop: acceptedFiles => {
			console.log(acceptedFiles)
			setFiles(acceptedFiles.map(file => Object.assign(file, {
				preview: URL.createObjectURL(file)
			})));
		},
		onDropAccepted: (e)=> {
			console.log(e)
			const config = {
				onUploadProgress: progressEvent => {
					var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      				console.log(percentCompleted)
				}
			}
			axios.put('/upload/server', {}, config)
		}
	});


	const style = useMemo(() => ({
		...(!jsonData.length ? baseStyle: {}),
		...(isFocused ? focusedStyle : {}),
		...(isDragAccept ? acceptStyle : {}),
		...(isDragReject ? rejectStyle : {})
	}), [
		isFocused,
		isDragAccept,
		isDragReject,
		jsonData
	]);

	const thumbs = files.map(file => (
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
	));

	useEffect(() => {
		dispatch(getList());
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => files.forEach(file => URL.revokeObjectURL(file.preview));
	}, []);


	/**
	 * Used to navigate inside folder
	 * And return files | folder data
	 */
	useEffect(()=>{
		setListing(jsonData);
		// console.log(jsonData)

		const pathname = location.pathname.replace(/\/$/, "");	// Remove trailing slash
		const pathArry = pathname.split('/');
		const breadCrumbArray = [];

		if(pathArry.length > 3 && jsonData.length) {
			const staticPath = pathArry.splice(0, 3);	// truncate frist three static path, like /app/filemanager
			
			var finalResult = [];
			for(let i=0; i<pathArry.length; i++) {
				if(i < 1) {
					finalResult = jsonData.filter(file => file.id === pathArry[i]);					
				} else if(finalResult[0].details.length){
					finalResult = finalResult[0].details.filter(file => file.id === pathArry[i]);					
				}		
				staticPath.push(finalResult[0].id);
				breadCrumbArray.push({
					name: finalResult[0].name, 
					path: staticPath.join('/')
				})	
			}
			if(finalResult.length && finalResult[0].details.length){				
				setListing(finalResult[0].details);
			}
		}
		dispatch(setBreadCrumb(breadCrumbArray))
	}, [jsonData, location.pathname]);

	
	const handleFile = (e) => {
		console.log(e.target.files)
		// setImageSent(e.target.files[0]);
	}; 

	return (
        <section className="container flex flex-col h-full  md:p-24 sm:p-24 lg:p-24 w-full border filemanager-file-box ">
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
					!jsonData.length && (
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