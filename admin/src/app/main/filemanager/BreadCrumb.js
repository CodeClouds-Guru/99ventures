import { useSelector, useDispatch } from "react-redux";
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { IconButton, Breadcrumbs, Typography, Link} from '@mui/material'
import { setPathObject, setSelectedItem } from 'app/store/filemanager';
import { useNavigate } from "react-router-dom";

const BreadCrumb = () => { 
    const dispatch = useDispatch()
    // const breadCrumb = useSelector(state=> state.filemanager.breadCrumb);
	const pathObject = useSelector(state=> state.filemanager.pathObject);
    const navigate = useNavigate();

    const setPath = (val) => {
        if(val){
            const index = pathObject.findIndex(el => el == val);     
            var result = pathObject.slice(0, index+1);
        } else {
            var result = []
        }

        dispatch(setPathObject(result));
        dispatch(setSelectedItem(null));    // To disabled sidebar if opened
        return navigate(result.join('/'));
    }

    return (
        <div role="presentation" className='w-full breadcrumb py-12 flex items-center'>
            <Breadcrumbs aria-label="breadcrumb">
                <Link to="#" role="button" onClick={()=>setPath('')}>
                    <IconButton color="primary" aria-label="Filter" component="label">
                        <FuseSvgIcon className="text-48" size={25} color="action">material-outline:home</FuseSvgIcon>
                    </IconButton>
                </Link>
                {
                    // breadCrumb.length && breadCrumb.map((br, indx) => {
                    pathObject.length && pathObject.map((br, indx) => {
                        if(indx === (pathObject.length-1)){  // To match the last object of the array
                            return (
                                <Typography
                                    key={ indx }
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                    color="text.primary"
                                >
                                    { br }
                                </Typography>
                            )
                        } else {
                            return (
                                <Link
                                    role="button"
                                    key={ indx }
                                    underline="hover"
                                    color="inherit"
                                    to="#"
                                    onClick={()=>setPath(br)}
                                >
                                    { br }
                                </Link>
                            )
                        }
                    })                    
                }
            </Breadcrumbs>
		</div>
    )
}

export default BreadCrumb;