import List from "../../crud/list/List";
// import JwtService from "src/app/auth/services/jwtService";

function CampaignsContent() {
    return (
        <List
            module="campaigns"
        // where={{ company_portal_id: JwtService.getCompanySiteId().site_id }}
        />
    );
}
export default CampaignsContent;