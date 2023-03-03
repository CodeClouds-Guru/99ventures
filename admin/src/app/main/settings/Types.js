import { amber, blue, green, grey, red, purple, orange, deepOrange, blueGrey, yellow, lightBlue } from '@mui/material/colors';

const types = {
    'images': [
        {
            ext: ".jpg/.jpeg",
            mime_type: "image/jpeg",
            checked: false,
            color: ''
        },
        {
            ext: ".png",
            mime_type: "image/png",
            checked: false,
            color: ''
        },
        {
            ext: '.gif',
            mime_type: 'image/gif',
            checked: false,
            color: ''
        },
        {
            ext: '.bmp',
            mime_type: 'image/bmp',
            checked: false,
            color: ''
        },
        {
            ext: '.webp',
            mime_type: 'image/webp',
            checked: false,
            color: ''
        },
        {
            ext: '.svg',
            mime_type: 'image/svg+xml',
            checked: false,
            color: blueGrey[900]
        }
    ],
    'documents': [
        {
            ext: '.doc',
            mime_type: 'application/msword',
            checked: false,
            color: blue[600]
        },
        {
            ext: '.docx',
            mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            checked: false,
            color: blue[600]
        },
        {
            ext: '.xls',
            mime_type: 'application/vnd.ms-excel',
            checked: false,
            color: green[600]
        },
        {
            ext: '.xlsx',
            mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            checked: false,
            color: green[600]
        },
        {
            ext: '.ppt',
            mime_type: 'application/vnd.ms-powerpoint',
            checked: false,
            color: orange[500]
        },
        {
            ext: '.pptx',
            mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            checked: false,
            color: orange[500]
        },
        {
            ext: '.txt',
            mime_type: 'text/plain',
            checked: false,
            color: grey[600]
        },
        {
            ext: '.pdf',
            mime_type: 'application/pdf',
            checked: false,
            color: red[600]
        },
        {
            ext: '.csv',
            mime_type: 'text/csv',
            checked: false,
            color: green[600]
        }
    ],
    'videos': [
        {
            ext: '.mp4',
            mime_type: 'video/mp4',
            checked: false,
            color: deepOrange[900]
        },
        {
            ext: '.mpeg',
            mime_type: 'video/mpeg',
            checked: false,
            color: blueGrey[900]
        },
        {
            ext: '.avi',
            mime_type: 'video/x-msvideo',
            checked: false,
            color: blueGrey[900]
        }
    ],
    'audio': [
        {
            ext: '.mp3',
            mime_type: 'audio/mpeg',
            checked: false,
            color: deepOrange[500]
        },
        {
            ext: '.wav',
            mime_type: 'audio/wav',
            checked: false,
            color: lightBlue[500]
        }
    ],
    'stylesheet': [
        {
            ext: '.css',
            mime_type: 'text/css',
            checked: false,
            color: blue[500]
        },
    ],
    'script': [
        {
            ext: '.json',
            mime_type: 'application/json',
            checked: false,
            color: yellow[700],
        },
        {
            ext: '.js',
            mime_type: 'text/javascript',
            obsolete_mime_type: 'application/javascript',
            checked: false,
            color: yellow[700],
        },
    ],
    'fonts': [
        {
            ext: '.ttf',
            mime_type: 'font/ttf',
            checked: false,
            color: blueGrey[900]
        },
        {
            ext: '.eot',
            mime_type: 'font/otf',
            obsolete_mime_type: 'application/vnd.ms-fontobject',
            checked: false,
            color: blueGrey[900]
        },
        {
            ext: '.otf',
            mime_type: 'application/vnd.oasis.opendocument.formula-template',
            checked: false,
            color: blueGrey[900]
        },
        {
            ext: '.woff',
            mime_type: 'font/woff',
            checked: false,
            color: blueGrey[900]
        },
        {
            ext: '.woff2',
            mime_type: 'font/woff2',
            checked: false,
            color: blueGrey[900]
        },
    ]
}

export default types