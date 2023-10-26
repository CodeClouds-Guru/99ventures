import { Box, Avatar, Tooltip } from '@mui/material';
import * as React from 'react'
import { useRef, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import LightboxModal from 'app/shared-components/LightboxModal';

const acceptAvatarMimeTypes = ["image/jpeg", "image/png", "image/bmp", "image/svg+xml"];

const MemberAvatar = (props) => {
    const avatarRef = useRef();
    const [ previewStatus, setPreviewStatus ] = useState(false);

    async function readFileAsync(e) {
        const response = await new Promise((resolve, reject) => {
            const file = e.target.files[0];
            const fileSizeInMB = Math.round(file.size / 1000 / 1000); //MiB

            if (fileSizeInMB > 2) {
                dispatch(showMessage({ variant: 'error', message: 'Image should be less than of 2 MB!' }));
                return;
            }
            if (!acceptAvatarMimeTypes.includes(file.type)) {
                dispatch(showMessage({ variant: 'error', message: 'Invalid image type!' }));
                return;
            }
            props.handleSetAvatarFile(file);
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                resolve(`data:${file.type};base64,${btoa(reader.result)}`);
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
        
        props.handleSetAvatar(response);
    }

    return (
        <Box
            sx={{
                borderWidth: 4,
                borderStyle: 'solid',
                borderColor: 'background.paper',
                width: '7rem',
                height: '7rem',
                '@media screen and (max-width: 1600px)': {
                    width: '6rem',
                    height: '6rem',
                },
                '@media screen and (max-width: 1400px)': {
                    width: '5rem',
                    height: '5rem',
                },
                '@media screen and (max-width: 1279px)': {
                    width: '16rem',
                    height: '16rem',
                },
                '@media screen and (max-width: 768px)': {
                    width: '15rem',
                    height: '15rem',
                },
                '@media screen and (max-width: 575px)': {
                    width: '7rem',
                    height: '7rem'
                }
            }}
            className="shadow-md relative rounded-full overflow-hidden"
        >
            {
                props.editMode && (
                    <>
                        <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div>
                                <label htmlFor="button-avatar" className="flex p-8 cursor-pointer">
                                    <input
                                        ref={avatarRef}
                                        accept="image/png, image/gif, image/jpeg"
                                        className="hidden"
                                        id="button-avatar"
                                        type="file"
                                        onChange={(e) => {
                                            readFileAsync(e);
                                        }}
                                    />
                                    <Tooltip title="Upload" placement="bottom-start">
                                        <FuseSvgIcon sx={props.iconStyle} className="text-white">heroicons-outline:camera</FuseSvgIcon>
                                    </Tooltip>
                                </label>
                            </div>
                            {/* <div>
                                <Tooltip title="Reset" placement="bottom-start">
                                    <IconButton
                                        onClick={() => {
                                            props.handleSetAvatar(props.memberData.avatar);
                                            avatarRef.current.value = ''; // To remove the value from input file
                                        }}
                                    >
                                        <FuseSvgIcon sx={props.iconStyle} className="text-white text-48" size={24} color="action">feather:rotate-ccw</FuseSvgIcon>
                                    </IconButton>
                                </Tooltip>
                            </div> */}
                        </div>
                    </>
                )
            }
            <Avatar
                sx={{
                    backgroundColor: 'background.default',
                    color: 'text.secondary',
                    '@media screen and (max-width: 768px)': {
                        width: 60,
                        height: 60,
                    },
                    '@media screen and (max-width: 1400px)': {
                        width: 120,
                        height: 120,
                    },
                    cursor: 'pointer'
                }}
                className="object-cover w-full h-full text-20 font-bold"
                src={props.avatar}
                alt={`${props.memberData.first_name} ${props.memberData.last_name}`}
                onClick={()=>setPreviewStatus(true)}
            >
                {props.memberData.first_name}
            </Avatar>
            {
                previewStatus && (
                    <LightboxModal 
                        previewLink={props.avatar}
                        handleLightboxClose={()=>setPreviewStatus(false)}
                    />
                )
            }
        </Box>
    )
}

export default MemberAvatar;