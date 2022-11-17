const types = {
    'images': [
        {
            ext: ".jpg/.jpeg",
            mime_type: "image/jpeg",
            checked: false
        },
        {
            ext: ".png",
            mime_type: "image/png",
            checked: false
        },
        {
            ext: '.gif',
            mime_type: 'image/gif',
            checked: false
        },
        {
            ext: '.bmp',
            mime_type: 'image/bmp',
            checked: false
        },
        {
            ext: '.webp',
            mime_type: 'image/webp',
            checked: false
        },
        {
            ext: '.svg',
            mime_type: 'image/svg+xml',
            checked: false
        }
    ],
    'documents': [
        {
            ext: '.doc',
            mime_type: 'application/msword',
            checked: false
        },
        {
            ext: '.docx',
            mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            checked: false
        },
        {
            ext: '.xls',
            mime_type: 'application/vnd.ms-excel',
            checked: false
        },
        {
            ext: '.xlsx',
            mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            checked: false
        },
        {
            ext: '.ppt',
            mime_type: 'application/vnd.ms-powerpoint',
            checked: false
        },
        {
            ext: '.pptx',
            mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            checked: false
        },
        {
            ext: '.txt',
            mime_type: 'text/plain',
            checked: false
        },
        {
            ext: '.pdf',
            mime_type: 'application/pdf',
            checked: false
        },
        {
            ext: '.csv',
            mime_type: 'text/csv',
            checked: false
        }
    ],
    'videos': [
        {
            ext: '.mp4',
            mime_type: 'video/mp4',
            checked: false
        },
        {
            ext: '.mpeg',
            mime_type: 'video/mpeg',
            checked: false
        },
        {
            ext: '.avi',
            mime_type: 'video/x-msvideo',
            checked: false
        }
    ],
    'audio': [
        {
            ext: '.mp3',
            mime_type: 'audio/mpeg',
            checked: false
        },
        {
            ext: '.wav',
            mime_type: 'audio/wav',
            checked: false
        }
    ],
    'stylesheet': [
        {
            ext: '.css',
            mime_type: 'text/css',
            checked: false
        },
    ],
    'script': [
        {
            ext: '.json',
            mime_type: 'application/json',
            checked: false
        },
        {
            ext: '.js',
            mime_type: 'text/javascript',
            checked: false
        },
    ]
}

export default types