import { Typography, IconButton, Checkbox } from '@mui/material';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box } from '@mui/system';
import ItemIcon from './ItemIcon';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItemsId, setBreadCrumb } from 'app/store/filemanager';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function FolderItem(props) {
	const location = useLocation();
	const dispatch = useDispatch();
	const viewType = useSelector(state=> state.filemanager.viewType);
	const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
	const [ path, setPath ] = useState(location.pathname);
	const navigate = useNavigate();

	useEffect(()=> {
		const currentPath = location.pathname.replace(/\/$/, "");
		const pathArry = currentPath.split('/');
		setPath(
			[...new Set([...pathArry, props.file.id])].join('/')
		)
	}, [location.pathname])

		
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
			box: 'sm:w-160 h-160 p-16 flex-col',
			icon_btn: 'absolute',
			nav_icon_adapter: 'flex-col',
			icon: 'flex-auto w-full justify-center',
			title: 'text-center',
			modify: 'text-center',
			size: 'text-center'
		},
		list: {
			box: 'sm:w-full items-center row-style p-6',
			icon_btn: '',
			nav_icon_adapter: 'flex-row items-center justify-between',
			icon: 'mr-3',
			title: 'text-left grow w-20',
			modify: 'text-left basis-1/5',
			size: 'text-left basis-1/5'
		}
	}

	const navigateTochild = ()=>{
		// console.log(path)		
		return navigate(path);
	}

	return (
		<Box
			sx={{ backgroundColor: 'background.paper' }}
			className={`relative flex w-full m-8 shadow rounded-16 folder--box ${style[viewType].box} ${viewType}--view--section`}
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
			<a
				className={`flex h-full w-full ${style[viewType].nav_icon_adapter}`}
				to="#"
				role="button"
				onClick= { navigateTochild }
			>
				
				<div className={`flex  items-center ${style[viewType].icon}`}>
					<ItemIcon file={ props.file } />
				</div>
				<div className={`flex shrink flex-col justify-center text-left ${style[viewType].title}`}>
					<Typography className="truncate text-12 font-medium">{ props.file.name }</Typography>					
				</div>
				{
					viewType === 'list' && (
						<>
							<div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].modify}`}>
								<Typography className="truncate text-12 font-medium">{ props.file.last_modified }</Typography>
							</div>
							<div className={`flex shrink flex-col justify-center text-left basis-1/5 ${style[viewType].size}`}>
								<Typography className="truncate text-12 font-medium">---</Typography>
							</div>
						</>
					)
				}				
			</a>
		</Box>
	);
}

export default FolderItem;
