import List from "../crud/list/List";
import JwtService from "src/app/auth/services/jwtService";
function LayoutsContent() {
    return (
        <List
            module="layouts"
            moduleHeading="Layouts"
            where={{ company_portal_id: JwtService.getCompanySiteId().site_id }}
        />
    );
}
export default LayoutsContent;