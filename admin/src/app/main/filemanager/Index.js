import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Dropzone from "./Dropzone";
import FileManagerHeader from './FileManagerHeader';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Divider from '@mui/material/Divider';
import SidebarContent from './SidebarContent';
import FileManagerList from './FilemanagerList';
import { useSelector } from 'react-redux';

const Index = () => {
    const showSidebar = useSelector(state => state.filemanager.show_sidebar);
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    return (
        <>
            {/* <FusePageCarded
                header={<FileManagerHeader/>}
                content={
                    
                }
                scroll={isMobile ? 'normal' : 'content'}
            /> */}
            {/* <FileManagerHeader/>
            <Divider className="mb-5" />
            <div className="flex flex-col flex-1 w-full mx-auto px-24 pt-24 sm:p-40">
                
          
            </div>
            <Divider className="mt-5" />            
            <Box
                className="p-16 w-full rounded-16 mb-24 border"
                sx={{
                    backgroundColor: 'rgb(246, 249, 251)',
                }}
                >
                <Dropzone />   
            </Box> */}
            <FusePageCarded
                header={<FileManagerHeader />}
                content={<FileManagerList />}
                rightSidebarOpen={showSidebar}
                rightSidebarContent={<SidebarContent />}
                rightSidebarWidth={400}
                scroll={isMobile ? 'normal' : 'content'}
            />
        </>
    )
}

export default Index;