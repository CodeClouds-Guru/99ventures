import { useSelector } from "react-redux";
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { IconButton, Breadcrumbs, Typography} from '@mui/material'
import { Link } from "react-router-dom"; 

const BreadCrumb = () => { 
    const breadCrumb = useSelector(state=> state.filemanager.breadCrumb);
    // console.log(breadCrumb)

    return (
        <div role="presentation" className='w-full breadcrumb py-12 flex items-center'>
            <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" to="/app/filemanager" >
                    <IconButton color="primary" aria-label="Filter" component="label">
                        <FuseSvgIcon className="text-48" size={25} color="action">material-outline:home</FuseSvgIcon>
                    </IconButton>
                </Link>
                {
                    breadCrumb.length && breadCrumb.map((br, indx) => {
                        if(indx === (breadCrumb.length-1)){  // To match the last object of the array
                            return (
                                <Typography
                                    key={ indx }
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                    color="text.primary"
                                >
                                    { br.name }
                                </Typography>
                            )
                        } else {
                            return (
                                <Link
                                    key={ indx }
                                    underline="hover"
                                    color="inherit"
                                    to={ br.path }
                                >
                                    { br.name }
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