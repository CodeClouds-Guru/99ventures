import { setlightBoxStatus } from '../../store/filemanager'
import { useDispatch, useSelector } from 'react-redux';
import LightboxModal from 'app/shared-components/LightboxModal';


const ImagePreview = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector(state=> state.filemanager.lightBox.isOpen);
    const previewLink = useSelector(state=> state.filemanager.lightBox.src);

    return isOpen && previewLink && (
        <LightboxModal 
            previewLink={ previewLink }
            handleLightboxClose={()=> dispatch(setlightBoxStatus({isOpen: false, src: ''})) }
        />
    )
}

export default ImagePreview;