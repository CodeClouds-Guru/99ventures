import Dropzone from "./Dropzone";
import Box from '@mui/material/Box';
import ItemIcon from "./ItemIcon";
import { Checkbox, FormGroup, FormControlLabel, Typography, Paper, Input, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'app/store/filemanager'
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FileItems from "./FileItems";
import FolderItem from "./FolderItem";

const FileManagerList = () => {
    const jsonData = useSelector(state=> state.filemanager.jsonData)
    // const sideBar = useSelector(state=>state.filemanager.show_sidebar)
    // const dispatch = useDispatch();
        

    return (
        <div className="p-32 list--view">
            <Box
                className="p-16 w-full rounded-16 mb-24 border filemanager-file-box"
                sx={{
                    backgroundColor: 'rgb(246, 249, 251)',
                }}
                >
                <div className="flex flex-wrap ">
                    {
                        jsonData.map((el, i) => {
                            if(el.type === 'folder') {
                                return <FolderItem key={i} file={ el }/>
                            }
                        })
                    }
                    {
                        jsonData.map((el, i) => {
                            if(el.type === 'file') {
                                return <FileItems key={i} file={ el } />
                            }
                        })
                    }
                    {/* <FolderItem />
                    <FileItems type="PDF"/>
                    <FileItems type="XLS"/>
                    <FileItems type="DOC"/>
                    <FileItems type="JPG"/>
                    <FileItems type="PPT"/>
                    <FileItems type="GIF"/> */}
                    
                </div>
            </Box>
            <Box
                className="p-16 w-full rounded-16 mb-24 border"
                sx={{
                    backgroundColor: 'rgb(246, 249, 251)',
                }}
                >
                <Dropzone />   
            </Box>
        </div>
    )
}

export default FileManagerList;