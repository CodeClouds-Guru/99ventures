import List from "../crud/list/List";
import JwtService from "src/app/auth/services/jwtService";
function PagesContent() {
    return (
        <List
            module="pages"
            moduleHeading="Pages"
            where={{ company_portal_id: JwtService.getCompanySiteId().site_id }}
        />
    );
}
export default PagesContent;