"use strict";var e=require("./helpers-7a10276b.js"),r=require("./register-d5338d0c.js"),t=require("fs"),s=require("fs-extra"),n=require("memory-fs"),i=require("path"),a=require("http-proxy-middleware"),u=require("webpack"),c=require("webpack-dev-server");function o(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}require("webpack-merge"),require("mini-css-extract-plugin"),require("optimize-css-assets-webpack-plugin"),require("terser-webpack-plugin"),require("slash"),require("react"),require("lz-string"),require("urlsafe-base64"),require("recursive-readdir");var f=o(t),l=o(s),d=o(n),p=o(i),g=o(u),q=o(c),y=process.cwd(),v=require("unionfs").ufs,w=new d.default;v.use(f.default).use(w);var j=function(){var t=r._asyncToGenerator(r.regenerator.mark((function t(s){var n,i,u,c,o,f;return r.regenerator.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return l.default.removeSync(p.default.join(y,r.ssrConfig.distDir)),t.next=3,e.getEntry(w);case 3:return n=t.sent,i=e._slicedToArray(n,2),u=i[0],c=i[1],o=e.configureWebpack(u),(f=g.default(o)).inputFileSystem=v,8888,t.next=13,new e._Promise((function(e,t){new q.default(f,{hotOnly:!0,noInfo:!0,stats:"errors-only",overlay:!1,compress:!1,serveIndex:!1,after:function(e,t,s){for(var n=s.outputFileSystem,i=function(t){var s=c[t],i=r.getPageId(s,"_");e.get("/_react-ssr/".concat(i,".css"),(function(e,t){var s=p.default.join(y,r.ssrConfig.distDir,"".concat(i,".css")),a=n.existsSync(s)?n.readFileSync(s).toString():"";t.writeHead(200,{"Content-Type":"text/css"}),t.end(a,"utf-8")})),e.get("/_react-ssr/".concat(i,".js"),(function(e,t){var s=p.default.join(y,r.ssrConfig.distDir,"".concat(i,".js")),a=n.readFileSync(s).toString();t.status(200).type(".js").send(a)}))},a=0;a<c.length;a++)i(a)}}).listen(8888,(function(e){t(e)}));var n=a.createProxyMiddleware({target:"http://localhost:".concat(8888),changeOrigin:!0,ws:!0,logLevel:"error"});s.use("/*.css",n),s.use("/*.js",n),s.use("/*.json",n),s.use("/sockjs-node*",n),e()}));case 13:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}();exports.default=j;
