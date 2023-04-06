$(() => {
    const scriptElements = $(".scripted-custom-script");
    Array.from(scriptElements).forEach(element => {
        callAndReplaceScripts(element)
    });

    function callAndReplaceScripts(element) {
        const dataAttrs = $(element).data();
        let params = {
            pageno: 1,
            perpage: 10,
            orderby: null,
            order: null,
            script: '',
            member: null,
            ...dataAttrs
        }
        $.ajax({
            url: `/get-scripts/`,
            type: 'GET',
            data: params,
            success: function (res) {
                if (res.status) {
                    $(element).html(res.html)
                }
            }
        });
    }
});