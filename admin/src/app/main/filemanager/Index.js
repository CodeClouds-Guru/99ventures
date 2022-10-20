import * as React from 'react';
import FileManagerHeader from './FileManagerHeader';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FusePageCarded from '@fuse/core/FusePageCarded';
import SidebarContent from './SidebarContent';
import FileManagerList from './FilemanagerList';
import { useSelector } from 'react-redux';
import ImagePreview from './ImagePreview';
import DragDropzone from './DragDropZone';
import './FileManager.css';
import FolderOptions from './components/FolderOptions';

const Index = () => {
    const selectedItem = useSelector(state=>state.filemanager.selectedItem)
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    return (
        <>
            <FusePageCarded
                className="sm:px-20"
                header={<FileManagerHeader />}
                content={<DragDropzone />}
                rightSidebarOpen={ selectedItem !== null }
                rightSidebarContent={<SidebarContent />}
                rightSidebarWidth={400}
                scroll={isMobile ? 'normal' : 'content'}
            />            
            <ImagePreview />
            <FolderOptions />
        </>
    )
}

export default Index;