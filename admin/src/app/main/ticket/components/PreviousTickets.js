import {
    Link, Typography
} from '@mui/material';
import Helper from 'src/app/helper';

const PreviousTickets = (props)=> {    
    return (
        <>
            {
                props.previousTickets.length ? (
                    <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '34rem' }} >
                        {
                            props.previousTickets.map((val, key) => {
                                return (
                                    <div key={key} className="w-auto flex flex-row justify-between md:flex-col lg:flex-row lg:justify-between md:justify-start p-5 px-10 pb-8 mt-10 rounded-8" style={{ background: '#dcdcdc', cursor: 'pointer' }} >                                                
                                        <div className='sm:w-full lg:w-4/5 md:text-sm lg:text-base'>
                                            <Link href={`/app/tickets/${val.id}`} target="_blank">
                                                <p>{val.subject}</p>
                                            </Link>
                                        </div>
                                        <div className="sm:w-full lg:w-1/5 text-xs sm:text-right lg:text-left">
                                            {Helper.parseTimeStamp(val.created_at)}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                ) : (
                    <Typography variant="body2" className="italic text-gray-500">No more previous ticket!</Typography>
                )
            }
            
        </>
    )
}

export default PreviousTickets;