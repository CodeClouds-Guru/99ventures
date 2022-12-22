import { Box, TextareaAutosize, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import { styled } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';


const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
    position: 'absolute',
    '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
      top: '-26px',
      right: '-21px',
    },
}));

const BodyPart = (props) => {
    return (
        <>
            <Box sx={{ position: 'relative', height: 0 }}>
                <StyledSpeedDial
                    ariaLabel="SpeedDial playground example"
                    hidden={ false }
                    icon={<SpeedDialIcon />}
                    direction="down"
                >
                    <SpeedDialAction
                        icon={
                            <FuseSvgIcon className="text-48" size={18} color="action">material-outline:edit</FuseSvgIcon>
                        }
                        tooltipTitle="Edit"
                        onClick={props.handleOpenDialog}
                    />
                    {
                        props.fullScreen ? (
                            <SpeedDialAction
                                icon={
                                    <FuseSvgIcon className="text-48" size={18} color="action">material-outline:fullscreen_exit</FuseSvgIcon>
                                }
                                tooltipTitle="Fullscreen"
                                onClick={()=>props.handleFullScreen(false)}
                            />
                        ) : (
                            <SpeedDialAction
                                icon={
                                    <FuseSvgIcon className="text-48" size={18} color="action">material-outline:fullscreen</FuseSvgIcon>
                                }
                                tooltipTitle="Fullscreen"
                                onClick={()=>props.handleFullScreen(true)}
                            />
                        )
                    }
                    
                </StyledSpeedDial>
            </Box>
            <div className='relative'>                                
                <pre>
                    <code>
                        <textarea
                            rows={8}
                            aria-label="maximum height"
                            value={props.body}
                            className={ props.fullScreen ? 'custom-code-editor-view-fullscreen' : 'custom-code-editor-md' }
                            disabled
                        ></textarea>
                    </code>
                </pre>
            </div>
        </>
    )
}

export default BodyPart;