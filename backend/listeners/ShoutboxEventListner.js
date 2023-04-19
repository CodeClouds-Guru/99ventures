class ShoutboxEventListner {
    constructor() {
        this.listen = this.listen.bind(this);
    }
    async listen(payload) {
        const { ShoutboxConfiguration,Shoutbox } = require('./models/index');
        try{
            let event_slug = payload.action
            let shoutbox_verbose = await ShoutboxConfiguration.findOne({where:{event_slug:event_slug},attributes:['verbose']})
            if(shoutbox_verbose){
                let all_details = payload.data
                let verbose = shoutbox_verbose.verbose
                let match_variables = verbose.match(/\${(.*?)}/g);
                if(match_variables){
                    match_variables.forEach(function (value, key) {
                        let new_value = value;
                        new_value = new_value.replace('${', '');
                        new_value = new_value.replace('}', '');
                        match_variables[key] = eval('all_details' + '.' + new_value);
                        verbose = verbose.replaceAll(value, match_variables[key]);
                    });
                    await Shoutbox.create({
                        company_id: payload.company_id,
                        company_portal_id: payload.company_portal_id,
                        member_id: all_details.members.id ?? null,
                        survey_provider_id: all_details.survey_provider_id ?? null,
                        verbose: verbose,
                        created_at: new Date()
                    })
                    global.socket.emit('shoutbox', {
                        name: all_details.members.first_name ?? null,
                        place: 'USA',
                        message: verbose,
                    });
                }
            }
            return
        }catch(err){
            console.log(err.message);
            return
        }
    }
}

module.exports = {
    'event': 'happening_now',
    'classname': ShoutboxEventListner
}