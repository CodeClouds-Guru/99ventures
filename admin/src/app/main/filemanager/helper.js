export const copyUrl = (value) => {
    /**
     * Settimeout used because file items have a dropdown menu and that are coming in a overlay of the body element.
     * So when click on the copy option from the dropdown menu, first close the dropdown menu then after few milisecond copy will perform
     * */
    setTimeout(()=>{
        const el = document.createElement('input');
        el.value = value;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    },200)
}

export const convertFileSizeToKB = (size) => {
    return (size/1024).toFixed(2)
}

export const isImageFile = (mimyeType) => {
    switch(mimyeType) {			
        case 'image/jpg':
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
        case 'image/svg':
            return true;
        default:
            return false;
    }
}

export const downloadFile = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
}