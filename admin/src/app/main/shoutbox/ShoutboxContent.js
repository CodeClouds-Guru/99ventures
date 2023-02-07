import List from "../crud/list/List";
import JwtService from "src/app/auth/services/jwtService";

function ShoutboxContent() {
    return (
        <List
            module="shoutbox"
            where={{ company_portal_id: JwtService.getCompanySiteId().site_id }}
        />
    );
}
export default ShoutboxContent;