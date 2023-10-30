import { useParams } from 'react-router-dom';
import List from '../crud/list/List';

const Downline = () => {
    const { moduleId } = useParams();

    return (
        <List module="member-referrals"
            where={{ member_id: moduleId }}
            editable={false}
            addable={false}
            deletable={false}
            moduleHeading={false}
            customHeading="Downline"
        />
    );
}

export default Downline;