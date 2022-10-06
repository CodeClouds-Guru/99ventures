import React, { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import LinearProgress from '@mui/material/LinearProgress';
import axios from 'axios'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const baseStyle = {
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

const focusedStyle = {
	borderColor: '#2196f3'
};

const acceptStyle = {
	borderColor: '#00e676'
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

function Dropzone(props) {
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
		...baseStyle,
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
		<section className="container">
			<div {...getRootProps({ className: 'dropzone', style })}>
				<input {...getInputProps({
					onChange: handleFile,
				})} />
				<p>Drag 'n' drop some files here, or click to select files</p>
			</div>
			<aside style={thumbsContainer}>
				{thumbs}
			</aside>
			{/* <List>
				<ListItem disablePadding>
					<ListItemIcon>
						<img
							src="https://picsum.photos/200/300"
							style={img}
							
						/>
					</ListItemIcon>
					<ListItemText primary={
						<>
							{ 12 }
							<LinearProgress variant="determinate" value={14} />
						</>
					} />
				</ListItem>
			
			</List> */}
		</section>
	);

}


export default Dropzone;