import List from '../crud/list/List';
import { useParams } from 'react-router-dom';

const UserDetails = () => {
    const { moduleId } = useParams();
 
    return (
        <List module="ip-logs"
            where={{member_id: moduleId}}
            editable={ false }
            addable={ false }
            deletable={ false }
            moduleHeading={ false }
            customHeading="Security"
        />
    );
}

export default UserDetails;