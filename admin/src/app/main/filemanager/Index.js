import * as React from 'react';
import FileManagerHeader from './FileManagerHeader';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FusePageCarded from '@fuse/core/FusePageCarded';
import SidebarContent from './SidebarContent';
import FileManagerList from './FilemanagerList';
import ImagePreview from './ImagePreview';
import DragDropzone from './DragDropZone';
import './FileManager.css';
import FolderOptions from './components/FolderOptions';
import { getConfig, getAllFileTypes } from 'app/store/filemanager';
import { useDispatch, useSelector } from 'react-redux';



const Index = () => {
    const dispatch = useDispatch();
    const selectedItem = useSelector(state=>state.filemanager.selectedItem)
    // const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const listing = useSelector(state=> state.filemanager.listData);

    React.useEffect(()=>{
		dispatch(getConfig());
        /** 
		 * To fetch all the filetypes
		 */
		dispatch(getAllFileTypes())
	}, []);

    return (
        <>
            <FusePageCarded
                className="sm:px-20"
                header={<FileManagerHeader />}
                content={<DragDropzone listing={ listing } />}
                rightSidebarOpen={ selectedItem !== null }
                rightSidebarContent={<SidebarContent />}
                rightSidebarWidth={400}
                scroll='content'
                // scroll={isMobile ? 'normal' : 'content'}
            />            
            <ImagePreview />
            <FolderOptions />
        </>
    )
}

export default Index;