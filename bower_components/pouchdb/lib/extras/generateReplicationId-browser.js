"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e["default"]:e}function readAsArrayBuffer(e,r){if("undefined"==typeof FileReader)return r((new FileReaderSync).readAsArrayBuffer(e));var t=new FileReader;t.onloadend=function(e){var t=e.target.result||new ArrayBuffer(0);r(t)},t.readAsArrayBuffer(e)}function rawToBase64(e){return btoa$1(e)}function sliceBlob(e,r,t){return e.webkitSlice?e.webkitSlice(r,t):e.slice(r,t)}function appendBlob(e,r,t,n,i){(t>0||n<r.size)&&(r=sliceBlob(r,t,n)),readAsArrayBuffer(r,function(r){e.append(r),i()})}function appendString(e,r,t,n,i){(t>0||n<r.length)&&(r=r.substring(t,n)),e.appendBinary(r),i()}function binaryMd5(e,r){function t(){setImmediateShim(i)}function n(){var e=f.end(!0),t=rawToBase64(e);r(t),f.destroy()}function i(){var r=c*u,i=r+u;c++,l>c?d(f,e,r,i,t):d(f,e,r,i,n)}var o="string"==typeof e,a=o?e.length:e.size,u=Math.min(MD5_CHUNK_SIZE,a),l=Math.ceil(a/u),c=0,f=o?new Md5:new Md5.ArrayBuffer,d=o?appendString:appendBlob;i()}function sortObjectPropertiesByKey(e){return Object.keys(e).sort(pouchdbCollate.collate).reduce(function(r,t){return r[t]=e[t],r},{})}function generateReplicationId(e,r,t){var n=t.doc_ids?t.doc_ids.sort(pouchdbCollate.collate):"",i=t.filter?t.filter.toString():"",o="",a="";return t.filter&&t.query_params&&(o=JSON.stringify(sortObjectPropertiesByKey(t.query_params))),t.filter&&"_view"===t.filter&&(a=t.view.toString()),PouchPromise.all([e.id(),r.id()]).then(function(e){var r=e[0]+e[1]+i+a+o+n;return new PouchPromise(function(e){binaryMd5(r,e)})}).then(function(e){return e=e.replace(/\//g,".").replace(/\+/g,"_"),"_local/"+e})}var lie=_interopDefault(require("lie")),Md5=_interopDefault(require("spark-md5")),pouchdbCollate=require("pouchdb-collate"),PouchPromise="function"==typeof Promise?Promise:lie,btoa$1=function(e){return btoa(e)},setImmediateShim=global.setImmediate||global.setTimeout,MD5_CHUNK_SIZE=32768;module.exports=generateReplicationId;