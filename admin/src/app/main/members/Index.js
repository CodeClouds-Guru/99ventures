import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MemberDetails from './MemberDetails'
import PageHeader from './PageHeader';
import { useState } from 'react';
import { Box, Divider, IconButton, Typography, TextField, Autocomplete, Chip, Dialog, DialogTitle, DialogActions, DialogContent, Button, List, ListItem, ListItemText, TextareaAutosize, Tooltip } from '@mui/material';
import Helper from 'src/app/helper';

const UserDetails = (props) => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Members';
    const [isMemberDeleted, setIsMemberDeleted] = useState(false);
    const [deletedMemberData, setDeletedMemberData] = useState({});

    return (
        !isMemberDeleted ?
            <FusePageCarded
                className="sm:px-20"
                header={
                    <PageHeader module={module} button="profile" />
                }
                content={
                    <MemberDetails setIsMemberDeleted={setIsMemberDeleted} setDeletedMemberData={setDeletedMemberData} />
                }
                rightSidebarOpen={false}
                scroll={isMobile ? 'normal' : 'content'}
            />
            :
            <FusePageCarded className="sm:p-20"
                content={<Box className="flex justify-center p-20" >
                    <Typography variant="h5" color="error"> Member is deleted by  <strong> {deletedMemberData.deleted_by_admin.username} </strong>  at  <strong>{Helper.parseTimeStamp(deletedMemberData.deleted_at)}</strong> </Typography>
                </Box>}
                rightSidebarOpen={false}
                scroll={isMobile ? 'normal' : 'content'}
            />
    );
}

export default UserDetails;