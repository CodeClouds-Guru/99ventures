import {
    Link, Typography
} from '@mui/material';
import Helper from 'src/app/helper';

const Notes = (props) => {
    return (
        <>
        {
            props.notes && props.notes.length ? (
                <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '30rem' }} >
                    {
                        props.notes.map((val, key) => {
                            return (
                                <div key={key} className="w-auto flex flex-col justify-items-center p-10 px-10 mt-10 rounded-8" style={{ background: '#dcdcdc' }}>
                                    <div className="flex flex-row justify-between">
                                        <span style={{ fontSize: '12px' }}>
                                            <i><b>{`${val.User ? val.User.alias_name : 'Application Firewall'}`}
                                                <span style={{ fontSize: '8px' }}> - More Surveys Support Team</span></b></i>
                                        </span>

                                        <div className="flex justify-end pl-5" style={{ fontSize: '10px' }}>{Helper.parseTimeStamp(val.created_at)}</div>
                                    </div>
                                    <div>
                                        <p>
                                            {val.note}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            ) : (
                <Typography variant="body2" className="italic text-gray-500">No more notes!</Typography>
            )
        }
        </>
    )
}

export default Notes;