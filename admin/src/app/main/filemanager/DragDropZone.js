import React, { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@mui/material';
import axios from 'axios'
import FileItems from "./FileItems";
import FolderItem from "./FolderItem";
import { useSelector } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

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

function DragDropzone(props) {
    const jsonData = useSelector(state=> state.filemanager.jsonData)
    // const jsonData = []
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
		isDragReject
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
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => files.forEach(file => URL.revokeObjectURL(file.preview));
	}, []);

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
                        jsonData.length ? jsonData.map((el, i) => {
                            if(el.type === 'folder') {
                                return <FolderItem key={i} file={ el }/>
                            }
                        }) : ''
                    }
                    {
                        jsonData.length ? jsonData.map((el, i) => {
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