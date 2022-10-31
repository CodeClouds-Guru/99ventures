import List from "../crud/list/List";
import JwtService from "src/app/auth/services/jwtService";

function ComponentsContent() {
    return (
        <>
            <List
                module="components"
                moduleHeading="Components"
                where={{ company_portal_id: JwtService.getCompanySiteId().site_id }}
            />
        </>
    );
}
export default ComponentsContent;