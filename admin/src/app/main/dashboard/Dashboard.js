import { styled } from '@mui/material/styles';
// import { useTranslation } from 'react-i18next';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FusePageCarded from '@fuse/core/FusePageCarded/FusePageCarded';
// import DemoContent from '@fuse/core/DemoContent';
import DashboardContent from './DashboardContent';
import DashboardWidgets from './DashboardWidgets';
import { Typography} from '@mui/material';
import { selectUser } from 'app/store/userSlice';
import { useSelector } from 'react-redux';
import Widgets from './Widgets';
import { useEffect, useState } from 'react';

function DashboardPage(props) {
    const user = useSelector(selectUser);
    const [selectedWidgets, setSelectedWidgets] = useState([]);

    useEffect(()=>{
        if(user.choosen_widgets && user.choosen_widgets.length){
            setSelectedWidgets(user.choosen_widgets.map(row=> row.id))
        }
    }, []);

    const updateSelectedWidgets = (payload) => {
        setSelectedWidgets(payload)
    }
    return (
        <FusePageSimple
            header={
                <div className="p-24 flex items-center">
                    <Typography variant="h5" className="font-bold mr-5">Welcome { user.first_name }!</Typography>
                    <Widgets 
                        all_widgets={user.all_widgets} 
                        selected_widgets={selectedWidgets} 
                        updateSelectedWidgets={updateSelectedWidgets}
                    />
                </div>
            }
            content={
                <div className="p-10 w-full">
                    <DashboardWidgets all_widgets={user.all_widgets} selected_widgets={selectedWidgets}/>
                </div>
            }
            scroll="page"
        />
    );
}

export default DashboardPage;
