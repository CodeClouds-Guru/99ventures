import { Typography, IconButton, Checkbox } from '@mui/material';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box } from '@mui/system';
import ItemIcon from './ItemIcon';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItemsId } from 'app/store/filemanager'

function FolderItem(props) {
	const viewType = useSelector(state=> state.filemanager.viewType);
	const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
	const dispatch = useDispatch();
	// const { item } = props;

	// if (!item) {
	// 	return null;
	// }

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
	 * Grid & List Style
	 */
	const style = {
		grid: {
			box: 'sm:w-160 h-160 p-16',
			icon_btn: 'absolute',
			nav_icon_adapter: 'flex-col',
			icon: 'flex-auto w-full justify-center',
			title: 'text-center',
			modify: 'text-center',
			size: 'text-center'
		},
		list: {
			box: 'sm:w-full flex items-center row-style p-10',
			icon_btn: '',
			nav_icon_adapter: 'flex-row items-center justify-between',
			icon: '',
			title: 'text-left grow w-20',
			modify: 'text-left basis-1/5',
			size: 'text-left basis-1/5'
		}
	}

	return (
		<Box
			sx={{ backgroundColor: 'background.paper' }}
			className={`relative w-full m-8 shadow rounded-16 folder--box ${style[viewType].box} ${viewType}--view--section`}
		> 
			<IconButton
                className={`z-20 top-0 right-0 m-6 w-32 h-32 min-h-32 ${style[viewType].icon_btn}`}
            >
                <Checkbox 
                    checked={ selectedItemsId.includes(props.file.id) }
                    inputProps={{ 'aria-label': 'controlled' }}
                    onChange={handleChange} 
                />
            </IconButton>
			<NavLinkAdapter
				className={`flex h-full w-full ${style[viewType].nav_icon_adapter}`}
				to={`/app/filemanager/ss`}
				role="button"
			>
				<div className={`flex  items-center ${style[viewType].icon}`}>
					<ItemIcon className="" type="folder" />
				</div>
				<div className={`flex shrink flex-col justify-center text-left ${style[viewType].title}`}>
					<Typography className="truncate text-12 font-medium">Folder</Typography>					
				</div>
				{
					viewType === 'list' && (
						<>
							<div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].modify}`}>
								<Typography className="truncate text-12 font-medium">Modified At</Typography>
							</div>
							<div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].size}`}>
								<Typography className="truncate text-12 font-medium">100KB</Typography>
							</div>
						</>
					)
				}				
			</NavLinkAdapter>
		</Box>
	);
}

export default FolderItem;
