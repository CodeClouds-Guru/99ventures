import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { amber, blue, green, grey, red, purple, orange } from '@mui/material/colors';

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
			PNG: purple[700],
			GIF: grey[900]
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

const renderItem = (type)=> {
	switch(type) {
		case 'application/pdf':
			return badgeComponent('PDF');
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
			return badgeComponent('XLS');
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
			return badgeComponent('DOC');;
		case 'image/jpg':
			return (	
				<div className='img-div'>		
					<img
						src="https://picsum.photos/200"
						alt="lorem ipsum"
						loading="lazy"
						className='rounded-md'
						style={{
							borderBottomLeftRadius: 4,
							borderBottomRightRadius: 4,
							display: 'block',
							width: '100%',
						}}
					/>		
				</div>			
			);
		default:
			return '';
	}
}


function ItemIcon(props) {
	const { type } = props;

	if (type === 'folder') {
		return (
			<FuseSvgIcon className="fuse--icon" size={56} color="disabled">
				material-outline:folder_open
			</FuseSvgIcon>
		);
	}

	return renderItem(type);
}

export default ItemIcon;