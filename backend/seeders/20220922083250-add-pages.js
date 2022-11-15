"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.

    Example: await queryInterface.bulkInsert(
      "pages",
      [
        {
          id: 1,
          company_portal_id: 2,
          html: "<h1>Home</h1>",
          status: "draft",
          permalink: "/",
          is_homepage: 1,
          slug: "/",
          name: "Home Page",
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          company_portal_id: 2,
          html: "<h1>About Us</h1>",
          status: "draft",
          permalink: "/about-us",
          is_homepage: 0,
          slug: "/about-us",
          name: "About Us",
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: 3,
          company_portal_id: 1,
          html: "<h1>Test</h1>",
          status: "draft",
          permalink: "/test",
          is_homepage: 0,
          slug: "/test",
          name: "Test Page",
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: "4",
          company_portal_id: "1",
          html: '<html>\n                <head>\n                    <title>500</title>\n                    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n                    <style>*, ::after, ::before{box-sizing:border-box;}.h-full{height:100vh;}.flex{display:flex;}.items-center{align-items:center;}.justify-center{justify-content:center;}.text-center{text-align:center;}.not-found-sec{font-size:15px;font-family:"Inter var", Roboto, Helvetica, Arial, sans-serif;}.not-found-sec h1{color:rgb(255, 0, 0);font-size:35px;}.not-found-sec .opps{font-size:22px;}.not-found-sec a{padding-top:8px;padding-right:20px;padding-bottom:8px;padding-left:20px;margin-top:0px;border-top-left-radius:50px;border-top-right-radius:50px;border-bottom-right-radius:50px;border-bottom-left-radius:50px;border-top-width:1px;border-right-width:1px;border-bottom-width:1px;border-left-width:1px;border-top-style:solid;border-right-style:solid;border-bottom-style:solid;border-left-style:solid;border-top-color:rgb(0, 0, 0);border-right-color:rgb(0, 0, 0);border-bottom-color:rgb(0, 0, 0);border-left-color:rgb(0, 0, 0);border-image-source:initial;border-image-slice:initial;border-image-width:initial;border-image-outset:initial;border-image-repeat:initial;background-image:initial;background-position-x:initial;background-position-y:initial;background-size:initial;background-repeat-x:initial;background-repeat-y:initial;background-attachment:initial;background-origin:initial;background-clip:initial;background-color:rgb(255, 255, 255);color:rgb(0, 0, 0);transition-duration:300ms;transition-timing-function:ease-in-out;transition-delay:0s;transition-property:all;text-decoration-line:none;text-decoration-thickness:initial;text-decoration-style:initial;text-decoration-color:initial;display:inline-block;}.not-found-sec a:hover, .not-found-sec a:focus{background-image:initial;background-position-x:initial;background-position-y:initial;background-size:initial;background-repeat-x:initial;background-repeat-y:initial;background-attachment:initial;background-origin:initial;background-clip:initial;background-color:rgb(0, 0, 0);color:rgb(255, 255, 255);}</style>\n                </head>\n                <body id="i36k"><div class="not-found h-full flex items-center justify-center"><div class="not-found-sec text-center"><h1>500!\n\t  </h1><p class="opps"><strong>Server Error!!..</strong></p><a href="/">Back to Home Page</a></div></div></body>            \n            </html>',
          status: "pending",
          permalink: "500",
          is_homepage: "0",
          slug: "500",
          name: "500",
          created_by: "8",
          updated_by: null,
          deleted_by: null,
          created_at: "2022-11-14 14:37:54",
          updated_at: null,
          deleted_at: null,
          page_json:
            '{"pages": [{"id": "indR5UFhS4MTKQlu", "type": "main", "frames": [{"component": {"type": "wrapper", "stylable": ["background", "background-color", "background-image", "background-repeat", "background-attachment", "background-position", "background-size"], "attributes": {"id": "i36k"}, "components": [{"classes": ["not-found", "h-full", "flex", "items-center", "justify-center"], "components": [{"classes": ["not-found-sec", "text-center"], "components": [{"type": "text", "tagName": "h1", "components": [{"type": "textnode", "content": "500!\\n\\t  "}]}, {"classes": ["opps"], "tagName": "p", "components": [{"type": "text", "tagName": "strong", "components": [{"type": "textnode", "content": "Server Error!!.."}]}]}, {"type": "link", "attributes": {"href": "/"}, "components": [{"type": "textnode", "content": "Back to Home Page"}]}]}]}]}}]}], "assets": [], "styles": [{"style": {"box-sizing": "border-box"}, "selectors": [], "selectorsAdd": "*, ::after, ::before"}, {"style": {"height": "100vh"}, "selectors": ["h-full"]}, {"style": {"display": "flex"}, "selectors": ["flex"]}, {"style": {"align-items": "center"}, "selectors": ["items-center"]}, {"style": {"justify-content": "center"}, "selectors": ["justify-center"]}, {"style": {"text-align": "center"}, "selectors": ["text-center"]}, {"style": {"font-size": "15px", "font-family": "\\"Inter var\\", Roboto, Helvetica, Arial, sans-serif"}, "selectors": ["not-found-sec"]}, {"style": {"color": "rgb(255, 0, 0)", "font-size": "35px"}, "selectors": [], "selectorsAdd": ".not-found-sec h1"}, {"style": {"font-size": "22px"}, "selectors": [], "selectorsAdd": ".not-found-sec .opps"}, {"style": {"color": "rgb(0, 0, 0)", "display": "inline-block", "margin-top": "0px", "padding-top": "8px", "padding-left": "20px", "padding-right": "20px", "padding-bottom": "8px", "background-clip": "initial", "background-size": "initial", "background-color": "rgb(255, 255, 255)", "background-image": "initial", "border-top-color": "rgb(0, 0, 0)", "border-top-style": "solid", "border-top-width": "1px", "transition-delay": "0s", "background-origin": "initial", "border-left-color": "rgb(0, 0, 0)", "border-left-style": "solid", "border-left-width": "1px", "border-image-slice": "initial", "border-image-width": "initial", "border-right-color": "rgb(0, 0, 0)", "border-right-style": "solid", "border-right-width": "1px", "background-repeat-x": "initial", "background-repeat-y": "initial", "border-bottom-color": "rgb(0, 0, 0)", "border-bottom-style": "solid", "border-bottom-width": "1px", "border-image-outset": "initial", "border-image-repeat": "initial", "border-image-source": "initial", "transition-duration": "300ms", "transition-property": "all", "text-decoration-line": "none", "background-attachment": "initial", "background-position-x": "initial", "background-position-y": "initial", "text-decoration-color": "initial", "text-decoration-style": "initial", "border-top-left-radius": "50px", "border-top-right-radius": "50px", "border-bottom-left-radius": "50px", "text-decoration-thickness": "initial", "border-bottom-right-radius": "50px", "transition-timing-function": "ease-in-out"}, "selectors": [], "selectorsAdd": ".not-found-sec a"}, {"style": {"color": "rgb(255, 255, 255)", "background-clip": "initial", "background-size": "initial", "background-color": "rgb(0, 0, 0)", "background-image": "initial", "background-origin": "initial", "background-repeat-x": "initial", "background-repeat-y": "initial", "background-attachment": "initial", "background-position-x": "initial", "background-position-y": "initial"}, "selectors": [], "selectorsAdd": ".not-found-sec a:hover, .not-found-sec a:focus"}]}',
          layout_id: "15",
          keywords: "",
          descriptions: "",
          meta_code: "",
        },
        {
          id: "5",
          company_portal_id: "1",
          html: '<html>\n                <head>\n                    <title>404</title>\n                    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n                    \n                </head>\n                <body></body>            \n            </html>',
          status: "pending",
          permalink: "404",
          is_homepage: "0",
          slug: "404",
          name: "404",
          created_by: "8",
          updated_by: null,
          deleted_by: null,
          created_at: "2022-11-14 14:43:55",
          updated_at: null,
          deleted_at: null,
          page_json:
            '{"pages": [{"id": "wZoiZ2y8ThSdTxut", "type": "main", "frames": [{"component": {"type": "wrapper", "stylable": ["background", "background-color", "background-image", "background-repeat", "background-attachment", "background-position", "background-size"]}}]}], "assets": [], "styles": [{"style": {"color": "red"}, "selectors": ["txt-red"]}]}',
          layout_id: "15",
          keywords: "",
          descriptions: "",
          meta_code: "",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Add commands to revert seed here.

    await queryInterface.bulkDelete("pages", null, {});
  },
};
