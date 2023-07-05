import List from "../crud/list/List";
import JwtService from "src/app/auth/services/jwtService";

function EmailTemplateContent() {
    return (
        <div>
            <List
                module="email-templates"
                where={{ company_portal_id: JwtService.getCompanySiteId().site_id }}
            />
        </div>
    );
}
export default EmailTemplateContent;