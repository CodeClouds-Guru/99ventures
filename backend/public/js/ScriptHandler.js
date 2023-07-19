$(() => {
    const scriptElements = $(".scripted-custom-script");
    Array.from(scriptElements).forEach(element => {
        callAndReplaceScripts(element)
    });
    function callAndReplaceScripts(element) {
        $(element).attr("data-timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
        const dataAttrs = $(element).data();
        // console.log('data-attrs', dataAttrs);
        let params = {
            pageno: 1,
            perpage: 10,
            orderby: null,
            order: null,
            script: '',
            member: null,
            ...dataAttrs
        }
        if (params.where && typeof params.where === 'object' && params.where) {
            params.where = JSON.stringify(params.where)
        }
        if(dataAttrs.survey != undefined){
            $('.data-loading').removeClass('d-none')
        }
        $.ajax({
            url: `/get-scripts/`,
            type: 'GET',
            data: params,
            success: function (res) {
                if(dataAttrs.survey != undefined){
                    $('.data-loading').addClass('d-none')
                }
                if (res.status) {
                    $(element).html(res.html)
                }
            }
        });
    }
});