
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const LightboxModal = (props) => {
    return (
        <Lightbox
            mainSrc={ props.previewLink }
            onCloseRequest={ props.handleLightboxClose }
        />
    )
}

export default LightboxModal;