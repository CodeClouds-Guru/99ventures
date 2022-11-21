"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.

    Example: await queryInterface.bulkInsert(
      "pages",
      [
        {
          company_portal_id: "1",
          html: '<main id="home">\n<h1>Home</h1>\n</main>',
          status: "draft",
          permalink: "/",
          is_homepage: "1",
          slug: "/",
          name: "Home Page",
          created_by: "1",
          created_at: "2022-11-21 10:46:49",
          page_json: null,
          layout_id: "1",
          keywords: null,
          descriptions: null,
          meta_code: null,
        },
        {
          company_portal_id: "2",
          html: '<main id="home">\n<h1>Home</h1>\n</main>',
          status: "draft",
          permalink: "/",
          is_homepage: "1",
          slug: "/",
          name: "Home Page",
          created_by: "1",
          created_at: "2022-11-21 10:46:49",
          page_json: null,
          layout_id: "2",
          keywords: null,
          descriptions: null,
          meta_code: null,
        },
        {
          company_portal_id: "1",
          html: '<main id="i36k">\n<style>.not-found-sec a,.not-found-sec a:focus,.not-found-sec a:hover{background-image:initial;background-position-x:initial;background-position-y:initial;background-size:initial;background-repeat-x:initial;background-repeat-y:initial;background-attachment:initial;background-origin:initial;background-clip:initial}*,::after,::before{box-sizing:border-box}.h-full{height:100vh}.flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.text-center{text-align:center}.not-found-sec{font-size:15px;font-family:"Inter var",Roboto,Helvetica,Arial,sans-serif}.not-found-sec h1{color:red;font-size:35px}.not-found-sec .opps{font-size:22px}.not-found-sec a{padding:8px 20px;margin-top:0;border-radius:50px;border-width:1px;border-style:solid;border-top:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000;border-color:#000;border-image-source:initial;border-image-slice:initial;border-image-width:initial;border-image-outset:initial;border-image-repeat:initial;background-color:#fff;color:#000;transition:.3s ease-in-out;text-decoration-line:none;text-decoration-thickness:initial;text-decoration-style:initial;text-decoration-color:initial;display:inline-block}.not-found-sec a:focus,.not-found-sec a:hover{background-color:#000;color:#fff}</style>\n<div class="not-found h-full flex items-center justify-center">\n      <div class="not-found-sec text-center">\n        <h1>500!\n        </h1>\n        <p class="opps">\n          <strong>Server Error!!..</strong>\n        </p>\n        <a href="/">Back to Home Page</a>\n      </div>\n    </div>\n</main>',
          status: "pending",
          permalink: "500",
          is_homepage: "0",
          slug: "500",
          name: "500",
          created_by: "8",
          created_at: "2022-11-14 14:37:54",
          page_json:
            '{"pages": [{"id": "indR5UFhS4MTKQlu", "type": "main", "frames": [{"component": {"type": "wrapper", "stylable": ["background", "background-color", "background-image", "background-repeat", "background-attachment", "background-position", "background-size"], "attributes": {"id": "i36k"}, "components": [{"classes": ["not-found", "h-full", "flex", "items-center", "justify-center"], "components": [{"classes": ["not-found-sec", "text-center"], "components": [{"type": "text", "tagName": "h1", "components": [{"type": "textnode", "content": "500!\\n\\t  "}]}, {"classes": ["opps"], "tagName": "p", "components": [{"type": "text", "tagName": "strong", "components": [{"type": "textnode", "content": "Server Error!!.."}]}]}, {"type": "link", "attributes": {"href": "/"}, "components": [{"type": "textnode", "content": "Back to Home Page"}]}]}]}]}}]}], "assets": [], "styles": [{"style": {"box-sizing": "border-box"}, "selectors": [], "selectorsAdd": "*, ::after, ::before"}, {"style": {"height": "100vh"}, "selectors": ["h-full"]}, {"style": {"display": "flex"}, "selectors": ["flex"]}, {"style": {"align-items": "center"}, "selectors": ["items-center"]}, {"style": {"justify-content": "center"}, "selectors": ["justify-center"]}, {"style": {"text-align": "center"}, "selectors": ["text-center"]}, {"style": {"font-size": "15px", "font-family": "\\"Inter var\\", Roboto, Helvetica, Arial, sans-serif"}, "selectors": ["not-found-sec"]}, {"style": {"color": "rgb(255, 0, 0)", "font-size": "35px"}, "selectors": [], "selectorsAdd": ".not-found-sec h1"}, {"style": {"font-size": "22px"}, "selectors": [], "selectorsAdd": ".not-found-sec .opps"}, {"style": {"color": "rgb(0, 0, 0)", "display": "inline-block", "margin-top": "0px", "padding-top": "8px", "padding-left": "20px", "padding-right": "20px", "padding-bottom": "8px", "background-clip": "initial", "background-size": "initial", "background-color": "rgb(255, 255, 255)", "background-image": "initial", "border-top-color": "rgb(0, 0, 0)", "border-top-style": "solid", "border-top-width": "1px", "transition-delay": "0s", "background-origin": "initial", "border-left-color": "rgb(0, 0, 0)", "border-left-style": "solid", "border-left-width": "1px", "border-image-slice": "initial", "border-image-width": "initial", "border-right-color": "rgb(0, 0, 0)", "border-right-style": "solid", "border-right-width": "1px", "background-repeat-x": "initial", "background-repeat-y": "initial", "border-bottom-color": "rgb(0, 0, 0)", "border-bottom-style": "solid", "border-bottom-width": "1px", "border-image-outset": "initial", "border-image-repeat": "initial", "border-image-source": "initial", "transition-duration": "300ms", "transition-property": "all", "text-decoration-line": "none", "background-attachment": "initial", "background-position-x": "initial", "background-position-y": "initial", "text-decoration-color": "initial", "text-decoration-style": "initial", "border-top-left-radius": "50px", "border-top-right-radius": "50px", "border-bottom-left-radius": "50px", "text-decoration-thickness": "initial", "border-bottom-right-radius": "50px", "transition-timing-function": "ease-in-out"}, "selectors": [], "selectorsAdd": ".not-found-sec a"}, {"style": {"color": "rgb(255, 255, 255)", "background-clip": "initial", "background-size": "initial", "background-color": "rgb(0, 0, 0)", "background-image": "initial", "background-origin": "initial", "background-repeat-x": "initial", "background-repeat-y": "initial", "background-attachment": "initial", "background-position-x": "initial", "background-position-y": "initial"}, "selectors": [], "selectorsAdd": ".not-found-sec a:hover, .not-found-sec a:focus"}]}',
          layout_id: "1",
          keywords: "",
          descriptions: "",
          meta_code: "",
        },
        {
          company_portal_id: "2",
          html: '<main id="i36k">\n<style>.not-found-sec a,.not-found-sec a:focus,.not-found-sec a:hover{background-image:initial;background-position-x:initial;background-position-y:initial;background-size:initial;background-repeat-x:initial;background-repeat-y:initial;background-attachment:initial;background-origin:initial;background-clip:initial}*,::after,::before{box-sizing:border-box}.h-full{height:100vh}.flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.text-center{text-align:center}.not-found-sec{font-size:15px;font-family:"Inter var",Roboto,Helvetica,Arial,sans-serif}.not-found-sec h1{color:red;font-size:35px}.not-found-sec .opps{font-size:22px}.not-found-sec a{padding:8px 20px;margin-top:0;border-radius:50px;border-width:1px;border-style:solid;border-top:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000;border-color:#000;border-image-source:initial;border-image-slice:initial;border-image-width:initial;border-image-outset:initial;border-image-repeat:initial;background-color:#fff;color:#000;transition:.3s ease-in-out;text-decoration-line:none;text-decoration-thickness:initial;text-decoration-style:initial;text-decoration-color:initial;display:inline-block}.not-found-sec a:focus,.not-found-sec a:hover{background-color:#000;color:#fff}</style>\n<div class="not-found h-full flex items-center justify-center">\n      <div class="not-found-sec text-center">\n        <h1>500!\n        </h1>\n        <p class="opps">\n          <strong>Server Error!!..</strong>\n        </p>\n        <a href="/">Back to Home Page</a>\n      </div>\n    </div>\n</main>',
          status: "pending",
          permalink: "500",
          is_homepage: "0",
          slug: "500",
          name: "500",
          created_by: "8",
          created_at: "2022-11-14 14:37:54",
          page_json:
            '{"pages": [{"id": "indR5UFhS4MTKQlu", "type": "main", "frames": [{"component": {"type": "wrapper", "stylable": ["background", "background-color", "background-image", "background-repeat", "background-attachment", "background-position", "background-size"], "attributes": {"id": "i36k"}, "components": [{"classes": ["not-found", "h-full", "flex", "items-center", "justify-center"], "components": [{"classes": ["not-found-sec", "text-center"], "components": [{"type": "text", "tagName": "h1", "components": [{"type": "textnode", "content": "500!\\n\\t  "}]}, {"classes": ["opps"], "tagName": "p", "components": [{"type": "text", "tagName": "strong", "components": [{"type": "textnode", "content": "Server Error!!.."}]}]}, {"type": "link", "attributes": {"href": "/"}, "components": [{"type": "textnode", "content": "Back to Home Page"}]}]}]}]}}]}], "assets": [], "styles": [{"style": {"box-sizing": "border-box"}, "selectors": [], "selectorsAdd": "*, ::after, ::before"}, {"style": {"height": "100vh"}, "selectors": ["h-full"]}, {"style": {"display": "flex"}, "selectors": ["flex"]}, {"style": {"align-items": "center"}, "selectors": ["items-center"]}, {"style": {"justify-content": "center"}, "selectors": ["justify-center"]}, {"style": {"text-align": "center"}, "selectors": ["text-center"]}, {"style": {"font-size": "15px", "font-family": "\\"Inter var\\", Roboto, Helvetica, Arial, sans-serif"}, "selectors": ["not-found-sec"]}, {"style": {"color": "rgb(255, 0, 0)", "font-size": "35px"}, "selectors": [], "selectorsAdd": ".not-found-sec h1"}, {"style": {"font-size": "22px"}, "selectors": [], "selectorsAdd": ".not-found-sec .opps"}, {"style": {"color": "rgb(0, 0, 0)", "display": "inline-block", "margin-top": "0px", "padding-top": "8px", "padding-left": "20px", "padding-right": "20px", "padding-bottom": "8px", "background-clip": "initial", "background-size": "initial", "background-color": "rgb(255, 255, 255)", "background-image": "initial", "border-top-color": "rgb(0, 0, 0)", "border-top-style": "solid", "border-top-width": "1px", "transition-delay": "0s", "background-origin": "initial", "border-left-color": "rgb(0, 0, 0)", "border-left-style": "solid", "border-left-width": "1px", "border-image-slice": "initial", "border-image-width": "initial", "border-right-color": "rgb(0, 0, 0)", "border-right-style": "solid", "border-right-width": "1px", "background-repeat-x": "initial", "background-repeat-y": "initial", "border-bottom-color": "rgb(0, 0, 0)", "border-bottom-style": "solid", "border-bottom-width": "1px", "border-image-outset": "initial", "border-image-repeat": "initial", "border-image-source": "initial", "transition-duration": "300ms", "transition-property": "all", "text-decoration-line": "none", "background-attachment": "initial", "background-position-x": "initial", "background-position-y": "initial", "text-decoration-color": "initial", "text-decoration-style": "initial", "border-top-left-radius": "50px", "border-top-right-radius": "50px", "border-bottom-left-radius": "50px", "text-decoration-thickness": "initial", "border-bottom-right-radius": "50px", "transition-timing-function": "ease-in-out"}, "selectors": [], "selectorsAdd": ".not-found-sec a"}, {"style": {"color": "rgb(255, 255, 255)", "background-clip": "initial", "background-size": "initial", "background-color": "rgb(0, 0, 0)", "background-image": "initial", "background-origin": "initial", "background-repeat-x": "initial", "background-repeat-y": "initial", "background-attachment": "initial", "background-position-x": "initial", "background-position-y": "initial"}, "selectors": [], "selectorsAdd": ".not-found-sec a:hover, .not-found-sec a:focus"}]}',
          layout_id: "2",
          keywords: "",
          descriptions: "",
          meta_code: "",
        },
        {
          company_portal_id: "1",
          html: '<main id="not-found">\n<style>.not-found-sec a,.not-found-sec a:focus,.not-found-sec a:hover{background-image:initial;background-position-x:initial;background-position-y:initial;background-size:initial;background-repeat-x:initial;background-repeat-y:initial;background-attachment:initial;background-origin:initial;background-clip:initial}*,::after,::before{box-sizing:border-box}.h-full{height:100vh}.flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.text-center{text-align:center}.not-found-sec{font-size:15px;font-family:"Inter var",Roboto,Helvetica,Arial,sans-serif}.not-found-sec h1{color:red;font-size:35px}.not-found-sec .opps{font-size:22px}.not-found-sec a{padding:8px 20px;margin-top:0;border-radius:50px;border-width:1px;border-style:solid;border-top:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000;border-color:#000;border-image-source:initial;border-image-slice:initial;border-image-width:initial;border-image-outset:initial;border-image-repeat:initial;background-color:#fff;color:#000;transition:.3s ease-in-out;text-decoration-line:none;text-decoration-thickness:initial;text-decoration-style:initial;text-decoration-color:initial;display:inline-block}.not-found-sec a:focus,.not-found-sec a:hover{background-color:#000;color:#fff}</style>\n  <div class="not-found h-full flex items-center justify-center">\n\t<div class="not-found-sec text-center">\n\t  <h1>404!\n\t  </h1>\n\t  <p class="opps">\n\t\t<strong>Opps!!..</strong>\n\t  </p>\n\t  <a href="/">Back to Home Page</a>\n\t</div>\n  </div>\n</main>',
          status: "pending",
          permalink: "404",
          is_homepage: "0",
          slug: "404",
          name: "404",
          created_by: "8",
          created_at: "2022-11-14 14:43:55",
          page_json:
            '{"pages": [{"id": "wZoiZ2y8ThSdTxut", "type": "main", "frames": [{"component": {"type": "wrapper", "stylable": ["background", "background-color", "background-image", "background-repeat", "background-attachment", "background-position", "background-size"]}}]}], "assets": [], "styles": [{"style": {"color": "red"}, "selectors": ["txt-red"]}]}',
          layout_id: "1",
          keywords: "",
          descriptions: "",
          meta_code: "",
        },
        {
          id: "6",
          company_portal_id: "2",
          html: '<main id="not-found">\n<style>.not-found-sec a,.not-found-sec a:focus,.not-found-sec a:hover{background-image:initial;background-position-x:initial;background-position-y:initial;background-size:initial;background-repeat-x:initial;background-repeat-y:initial;background-attachment:initial;background-origin:initial;background-clip:initial}*,::after,::before{box-sizing:border-box}.h-full{height:100vh}.flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.text-center{text-align:center}.not-found-sec{font-size:15px;font-family:"Inter var",Roboto,Helvetica,Arial,sans-serif}.not-found-sec h1{color:red;font-size:35px}.not-found-sec .opps{font-size:22px}.not-found-sec a{padding:8px 20px;margin-top:0;border-radius:50px;border-width:1px;border-style:solid;border-top:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000;border-color:#000;border-image-source:initial;border-image-slice:initial;border-image-width:initial;border-image-outset:initial;border-image-repeat:initial;background-color:#fff;color:#000;transition:.3s ease-in-out;text-decoration-line:none;text-decoration-thickness:initial;text-decoration-style:initial;text-decoration-color:initial;display:inline-block}.not-found-sec a:focus,.not-found-sec a:hover{background-color:#000;color:#fff}</style>\n  <div class="not-found h-full flex items-center justify-center">\n\t<div class="not-found-sec text-center">\n\t  <h1>404!\n\t  </h1>\n\t  <p class="opps">\n\t\t<strong>Opps!!..</strong>\n\t  </p>\n\t  <a href="/">Back to Home Page</a>\n\t</div>\n  </div>\n</main>',
          status: "pending",
          permalink: "404",
          is_homepage: "0",
          slug: "404",
          name: "404",
          created_by: "8",
          created_at: "2022-11-14 14:43:55",
          page_json:
            '{"pages": [{"id": "wZoiZ2y8ThSdTxut", "type": "main", "frames": [{"component": {"type": "wrapper", "stylable": ["background", "background-color", "background-image", "background-repeat", "background-attachment", "background-position", "background-size"]}}]}], "assets": [], "styles": [{"style": {"color": "red"}, "selectors": ["txt-red"]}]}',
          layout_id: "2",
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
