import List from '../crud/list/List';
import { useParams } from 'react-router-dom';


const MemberTransaction = () => {
    const { moduleId } = useParams();
 
    return (
        <List module="member-transactions"
            where={{member_id: moduleId}}
            editable={ false }
            addable={ false }
            deletable={ false }
            moduleHeading={ false }
            customHeading="History"
        />
    );
}


export default MemberTransaction;