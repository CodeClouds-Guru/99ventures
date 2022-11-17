import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { amber, blue, green, grey, red, purple, orange, deepOrange, blueGrey, yellow, lightBlue } from '@mui/material/colors';

const TypeBadge = styled(Box)(
	({ theme, ...props }) => ({
		backgroundColor: {
			PDF: red[600],
			DOC: blue[600],
			XLS: green[600],
			CSV: green[600],
			PPT: orange[500],
			TXT: grey[600],
			JPG: amber[600],
			JPEG: amber[600],
			PNG: purple[700],
			GIF: grey[900],
			SVG: blueGrey[900],
			CSS: blue[500],
			JS: yellow[500],
			JSON: grey[900],
			MP3: deepOrange[500],
			WAV: lightBlue[600],
			MP4: deepOrange[900],
			MPEG: blueGrey[900],
			AVI: blueGrey[900],
			UNKNOWN: blueGrey[900]
		}[props.color],
	})
);

const badgeComponent = (type) => {
	return (
		<div className="relative">
			<FuseSvgIcon className="fuse--icon" size={56} color="disabled">
				heroicons-outline:document
			</FuseSvgIcon>
			<TypeBadge
				color={type}
				className="type-badge absolute left-0 bottom-0 px-6 rounded text-12 font-semibold leading-20 text-white"
			>
				{type}
			</TypeBadge>
		</div>
	)
}

const renderItem = (file)=> {
	switch(file.mime_type) {
		case 'text/plain':
			return badgeComponent('TXT');
		case 'application/pdf':
			return badgeComponent('PDF');
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
		case 'application/vnd.ms-excel':
			return badgeComponent('XLS');
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
		case 'application/msword':
			return badgeComponent('DOC');
		case 'text/csv':
			return badgeComponent('CSV');
		case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
		case 'application/vnd.ms-powerpoint':
			return badgeComponent('PPT');
		case 'text/css':
			return badgeComponent('CSS');
		case 'text/javascript':
			return badgeComponent('JS');
		case 'audio/mpeg':
			return badgeComponent('MP3');
		case 'audio/wav':
			return badgeComponent('WAV');
		case 'video/mp4':
			return badgeComponent('MP4');
		case 'video/mpeg':
			return badgeComponent('MPEG');
		case 'video/avi':
			return badgeComponent('AVI');
		case 'image/svg+xml':
			return badgeComponent('SVG');
		case 'image/jpg':
		case 'image/jpeg':
		case 'image/bmp':
		case 'image/png':
		case 'image/gif':
		// case 'image/svg+xml':
		case 'image/webp':
			// const type = file.mime_type.split('/')[1];
			// return badgeComponent(type.toUpperCase());
			return (	
				<div className='img-div'>		
					<img
						src={file.file_path}
						alt="lorem ipsum"
						loading="lazy"
						className='rounded-md'
						style={{
							borderBottomLeftRadius: 4,
							borderBottomRightRadius: 4,
							display: 'block',
							width: '100%',
							height: '60px',
							objectFit: 'cover'
						}}
					/>		
				</div>			
			);
		default:
			return badgeComponent('UNKNOWN');
	}
}


function ItemIcon(props) {
	const { file } = props;
	if (file.type === 'folder') {
		return (
			<div className="relative">
			<FuseSvgIcon className="fuse--icon" size={60} color="disabled">
				material-outline:folder_open
			</FuseSvgIcon></div>
		);
	}
	return renderItem(file);
}

export default ItemIcon;