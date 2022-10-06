
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { setlightBoxStatus } from '../../store/filemanager'
import { useDispatch, useSelector } from 'react-redux';

const ImagePreview = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector(state=> state.filemanager.lightBox.isOpen);
    const previewLink = useSelector(state=> state.filemanager.lightBox.src);

    return isOpen && previewLink && (
        <Lightbox
            mainSrc='//placekitten.com/1500/500'
            onCloseRequest={() => dispatch(setlightBoxStatus({isOpen: false, src: '//placekitten.com/1500/500'})) }
        />
    )
}

export default ImagePreview;