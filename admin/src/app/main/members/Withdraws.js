import List from '../crud/list/List';
import { useParams } from 'react-router-dom';

const UserDetails = () => {
    const { moduleId } = useParams();

    return (
        <List module="withdrawal-requests"
            where={{ member_id: moduleId, status: 'completed' }}
            editable={false}
            addable={false}
            deletable={false}
            actionable={true}
            moduleHeading={false}
            customHeading="Withdraws"
        />
    );
}

export default UserDetails;