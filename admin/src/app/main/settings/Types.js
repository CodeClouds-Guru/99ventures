import { amber, blue, green, grey, red, purple, orange, deepOrange, blueGrey, yellow, lightBlue } from '@mui/material/colors';

const types = {
    'images': [
        {
            label: ".jpg/.jpeg",
            ext: [".jpg", ".jpeg"],
            mime_type: ["image/jpeg"],
            checked: false,
            color: ''
        },
        {
            label: '.png',
            ext: [".png"],
            mime_type: ["image/png"],
            checked: false,
            color: ''
        },
        {
            label: '.gif',
            ext: ['.gif'],
            mime_type: ['image/gif'],
            checked: false,
            color: ''
        },
        {
            label: '.bmp',
            ext: ['.bmp'],
            mime_type: ['image/bmp'],
            checked: false,
            color: ''
        },
        {
            label: '.webp',
            ext: ['.webp'],
            mime_type: ['image/webp'],
            checked: false,
            color: ''
        },
        {
            label: '.svg',
            ext: ['.svg'],
            mime_type: ['image/svg+xml'],
            checked: false,
            color: blueGrey[900]
        },
        {
            label: '.ico',
            ext: ['.ico'],
            mime_type: ['image/vnd.microsoft.icon'],
            checked: false,
            color: blueGrey[900]
        }
    ],
    'documents': [
        {
            label: '.doc',
            ext: ['.doc'],
            mime_type: ['application/msword'],
            checked: false,
            color: blue[600]
        },
        {
            label: '.docx',
            ext: ['.docx'],
            mime_type: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            checked: false,
            color: blue[600]
        },
        {
            label: '.xls',
            ext: ['.xls'],
            mime_type: ['application/vnd.ms-excel'],
            checked: false,
            color: green[600]
        },
        {
            label: '.xlsx',
            ext: ['.xlsx'],
            mime_type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            checked: false,
            color: green[600]
        },
        {
            label: '.ppt',
            ext: ['.ppt'],
            mime_type: ['application/vnd.ms-powerpoint'],
            checked: false,
            color: orange[500]
        },
        {
            label: '.pptx',
            ext: ['.pptx'],
            mime_type: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            checked: false,
            color: orange[500]
        },
        {
            label: '.txt',
            ext: ['.txt'],
            mime_type: ['text/plain'],
            checked: false,
            color: grey[600]
        },
        {
            label: '.pdf',
            ext: ['.pdf'],
            mime_type: ['application/pdf'],
            checked: false,
            color: red[600]
        },
        {
            label: '.csv',
            ext: ['.csv'],
            mime_type: ['text/csv'],
            checked: false,
            color: green[600]
        },
        {
            label: '.html',
            ext: ['.html'],
            mime_type: ['text/html'],
            checked: false,
            color: green[600]
        },
        {
            label: '.odp',
            ext: ['.odp'],
            mime_type: ['application/vnd.oasis.opendocument.presentation'],
            checked: false,
            color: blue[600]
        },
        {
            label: '.ods',
            ext: ['.ods'],
            mime_type: ['application/vnd.oasis.opendocument.spreadsheet'],
            checked: false,
            color: blue[600]
        },
        {
            label: '.odt',
            ext: ['.odt'],
            mime_type: ['application/vnd.oasis.opendocument.text'],
            checked: false,
            color: blue[600]
        },
    ],
    'videos': [
        {
            label: '.mp4',
            ext: ['.mp4'],
            mime_type: ['video/mp4'],
            checked: false,
            color: deepOrange[900]
        },
        {
            label: '.mpeg',
            ext: ['.mpeg'],
            mime_type: ['video/mpeg'],
            checked: false,
            color: blueGrey[900]
        },
        {
            label: '.avi',
            ext: ['.avi'],
            mime_type: ['video/x-msvideo'],
            checked: false,
            color: blueGrey[900]
        },
        {
            label: '.webm',
            ext: ['.webm'],
            mime_type: ['video/webm'],
            checked: false,
            color: blueGrey[900]
        }
    ],
    'audio': [
        {
            label: '.mp3',
            ext: ['.mp3'],
            mime_type: ['audio/mpeg'],
            checked: false,
            color: deepOrange[500]
        },
        {
            label: '.wav',
            ext: ['.wav'],
            mime_type: ['audio/wav'],
            checked: false,
            color: lightBlue[500]
        }
    ],
    'stylesheet': [
        {
            label: '.css',
            ext: ['.css'],
            mime_type: ['text/css'],
            checked: false,
            color: blue[500]
        },
    ],
    'script': [
        {
            label: '.json',
            ext: ['.json'],
            mime_type: ['application/json'],
            checked: false,
            color: yellow[700],
        },
        {
            label: '.js',
            ext: ['.js'],
            mime_type: ['text/javascript', 'application/javascript'],
            checked: false,
            color: yellow[700],
        },
    ],
    'fonts': [
        {
            label: '.ttf',
            ext: ['.ttf'],
            mime_type: ['font/ttf'],
            checked: false,
            color: blueGrey[900]
        },
        {
            label: '.eot',
            ext: ['.eot'],
            mime_type: ['font/otf', 'application/vnd.ms-fontobject'],
            checked: false,
            color: blueGrey[900]
        },
        {
            label: '.otf',
            ext: ['.otf'],
            mime_type: ['application/vnd.oasis.opendocument.formula-template'],
            checked: false,
            color: blueGrey[900]
        },
        {
            label: '.woff',
            ext: ['.woff'],
            mime_type: ['font/woff'],
            checked: false,
            color: blueGrey[900]
        },
        {
            label: '.woff2',
            ext: ['.woff2'],
            mime_type: ['font/woff2'],
            checked: false,
            color: blueGrey[900]
        },
    ],
    'others': [
        {
            label: '.zip',
            ext: ['.zip'],
            mime_type: ['application/zip'],
            checked: false,
            color: blueGrey[900]
        },
        {
            label: '.map',
            ext: ['.map'],
            mime_type: ['application/json'],
            checked: false,
            color: yellow[700],
        }
    ],
}

export default types