"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e["default"]:e}function isBinaryObject(e){return e instanceof ArrayBuffer||"undefined"!=typeof Blob&&e instanceof Blob}function cloneArrayBuffer(e){if("function"==typeof e.slice)return e.slice(0);var t=new ArrayBuffer(e.byteLength),r=new Uint8Array(t),n=new Uint8Array(e);return r.set(n),t}function cloneBinaryObject(e){if(e instanceof ArrayBuffer)return cloneArrayBuffer(e);var t=e.size,r=e.type;return"function"==typeof e.slice?e.slice(0,t,r):e.webkitSlice(0,t,r)}function isPlainObject(e){var t=Object.getPrototypeOf(e);if(null===t)return!0;var r=t.constructor;return"function"==typeof r&&r instanceof r&&funcToString.call(r)==objectCtorString}function clone(e){var t,r,n;if(!e||"object"!=typeof e)return e;if(Array.isArray(e)){for(t=[],r=0,n=e.length;n>r;r++)t[r]=clone(e[r]);return t}if(e instanceof Date)return e.toISOString();if(isBinaryObject(e))return cloneBinaryObject(e);if(!isPlainObject(e))return e;t={};for(r in e)if(Object.prototype.hasOwnProperty.call(e,r)){var o=clone(e[r]);"undefined"!=typeof o&&(t[r]=o)}return t}function pick(e,t){for(var r={},n=0,o=t.length;o>n;n++){var a=t[n];a in e&&(r[a]=e[a])}return r}function isChromeApp(){return"undefined"!=typeof chrome&&"undefined"!=typeof chrome.storage&&"undefined"!=typeof chrome.storage.local}function hasLocalStorage(){return hasLocal}function attachBrowserEvents(e){isChromeApp()?chrome.storage.onChanged.addListener(function(t){null!=t.db_name&&e.emit(t.dbName.newValue)}):hasLocalStorage()&&("undefined"!=typeof addEventListener?addEventListener("storage",function(t){e.emit(t.key)}):window.attachEvent("storage",function(t){e.emit(t.key)}))}function Changes(){events.EventEmitter.call(this),this._listeners={},attachBrowserEvents(this)}function guardedConsole(e){if("undefined"!==console&&e in console){var t=Array.prototype.slice.call(arguments,1);console[e].apply(console,t)}}function PouchError(e){Error.call(this,e.reason),this.status=e.status,this.name=e.error,this.message=e.reason,this.error=!0}function createError(e,t,r){function n(t){for(var n in e)"function"!=typeof e[n]&&(this[n]=e[n]);void 0!==r&&(this.name=r),void 0!==t&&(this.reason=t)}return n.prototype=PouchError.prototype,new n(t)}function tryFilter(e,t,r){try{return!e(t,r)}catch(n){var o="Filter function threw: "+n.toString();return createError(BAD_REQUEST,o)}}function filterChange(e){var t={},r=e.filter&&"function"==typeof e.filter;return t.query=e.query_params,function(n){n.doc||(n.doc={});var o=r&&tryFilter(e.filter,n.doc,t);if("object"==typeof o)return o;if(o)return!1;if(e.include_docs){if(!e.attachments)for(var a in n.doc._attachments)n.doc._attachments.hasOwnProperty(a)&&(n.doc._attachments[a].stub=!0)}else delete n.doc;return!0}}function f(){}function invalidIdError(e){var t;if(e?"string"!=typeof e?t=createError(INVALID_ID):/^_/.test(e)&&!/^_(design|local)/.test(e)&&(t=createError(RESERVED_ID)):t=createError(MISSING_ID),t)throw t}function getValue(e){return 0|Math.random()*e}function uuid(e,t){t=t||chars.length;var r="",n=-1;if(e){for(;++n<e;)r+=chars[getValue(t)];return r}for(;++n<36;)switch(n){case 8:case 13:case 18:case 23:r+="-";break;case 19:r+=chars[3&getValue(16)|8];break;default:r+=chars[getValue(16)]}return r}function toObject(e){return e.reduce(function(e,t){return e[t]=!0,e},{})}function parseRevisionInfo(e){if(!/^\d+\-./.test(e))return createError(INVALID_REV);var t=e.indexOf("-"),r=e.substring(0,t),n=e.substring(t+1);return{prefix:parseInt(r,10),id:n}}function makeRevTreeFromRevisions(e,t){for(var r=e.start-e.ids.length+1,n=e.ids,o=[n[0],t,[]],a=1,i=n.length;i>a;a++)o=[n[a],{status:"missing"},[o]];return[{pos:r,ids:o}]}function parseDoc(e,t){var r,n,o,a={status:"available"};if(e._deleted&&(a.deleted=!0),t)if(e._id||(e._id=uuid()),n=uuid(32,16).toLowerCase(),e._rev){if(o=parseRevisionInfo(e._rev),o.error)return o;e._rev_tree=[{pos:o.prefix,ids:[o.id,{status:"missing"},[[n,a,[]]]]}],r=o.prefix+1}else e._rev_tree=[{pos:1,ids:[n,a,[]]}],r=1;else if(e._revisions&&(e._rev_tree=makeRevTreeFromRevisions(e._revisions,a),r=e._revisions.start,n=e._revisions.ids[0]),!e._rev_tree){if(o=parseRevisionInfo(e._rev),o.error)return o;r=o.prefix,n=o.id,e._rev_tree=[{pos:r,ids:[n,a,[]]}]}invalidIdError(e._id),e._rev=r+"-"+n;var i={metadata:{},data:{}};for(var s in e)if(Object.prototype.hasOwnProperty.call(e,s)){var u="_"===s[0];if(u&&!reservedWords[s]){var c=createError(DOC_VALIDATION,s);throw c.message=DOC_VALIDATION.message+": "+s,c}u&&!dataWords[s]?i.metadata[s.slice(1)]=e[s]:i.data[s]=e[s]}return i}function winningRev(e){for(var t,r,n,o,a=e.rev_tree.slice();o=a.pop();){var i=o.ids,s=i[2],u=o.pos;if(s.length)for(var c=0,l=s.length;l>c;c++)a.push({pos:u+1,ids:s[c]});else{var f=!!i[1].deleted,d=i[0];t&&!(n!==f?n:r!==u?u>r:d>t)||(t=d,r=u,n=f)}}return r+"-"+t}function traverseRevTree(e,t){for(var r,n=e.slice();r=n.pop();)for(var o=r.pos,a=r.ids,i=a[2],s=t(0===i.length,o,a[0],r.ctx,a[1]),u=0,c=i.length;c>u;u++)n.push({pos:o+1,ids:i[u],ctx:s})}function sortByPos(e,t){return e.pos-t.pos}function collectLeaves(e){var t=[];traverseRevTree(e,function(e,r,n,o,a){e&&t.push({rev:r+"-"+n,pos:r,opts:a})}),t.sort(sortByPos).reverse();for(var r=0,n=t.length;n>r;r++)delete t[r].pos;return t}function collectConflicts(e){for(var t=winningRev(e),r=collectLeaves(e.rev_tree),n=[],o=0,a=r.length;a>o;o++){var i=r[o];i.rev===t||i.opts.deleted||n.push(i.rev)}return n}function compactTree(e){var t=[];return traverseRevTree(e.rev_tree,function(e,r,n,o,a){"available"!==a.status||e||(t.push(r+"-"+n),a.status="missing")}),t}function rootToLeaf(e){for(var t,r=[],n=e.slice();t=n.pop();){var o=t.pos,a=t.ids,i=a[0],s=a[1],u=a[2],c=0===u.length,l=t.history?t.history.slice():[];l.push({id:i,opts:s}),c&&r.push({pos:o+1-l.length,ids:l});for(var f=0,d=u.length;d>f;f++)n.push({pos:o+1,ids:u[f],history:l})}return r.reverse()}function sortByPos$1(e,t){return e.pos-t.pos}function binarySearch(e,t,r){for(var n,o=0,a=e.length;a>o;)n=o+a>>>1,r(e[n],t)<0?o=n+1:a=n;return o}function insertSorted(e,t,r){var n=binarySearch(e,t,r);e.splice(n,0,t)}function pathToTree(e,t){for(var r,n,o=t,a=e.length;a>o;o++){var i=e[o],s=[i.id,i.opts,[]];n?(n[2].push(s),n=s):r=n=s}return r}function compareTree(e,t){return e[0]<t[0]?-1:1}function mergeTree(e,t){for(var r=[{tree1:e,tree2:t}],n=!1;r.length>0;){var o=r.pop(),a=o.tree1,i=o.tree2;(a[1].status||i[1].status)&&(a[1].status="available"===a[1].status||"available"===i[1].status?"available":"missing");for(var s=0;s<i[2].length;s++)if(a[2][0]){for(var u=!1,c=0;c<a[2].length;c++)a[2][c][0]===i[2][s][0]&&(r.push({tree1:a[2][c],tree2:i[2][s]}),u=!0);u||(n="new_branch",insertSorted(a[2],i[2][s],compareTree))}else n="new_leaf",a[2][0]=i[2][s]}return{conflicts:n,tree:e}}function doMerge(e,t,r){var n,o=[],a=!1,i=!1;if(!e.length)return{tree:[t],conflicts:"new_leaf"};for(var s=0,u=e.length;u>s;s++){var c=e[s];if(c.pos===t.pos&&c.ids[0]===t.ids[0])n=mergeTree(c.ids,t.ids),o.push({pos:c.pos,ids:n.tree}),a=a||n.conflicts,i=!0;else if(r!==!0){var l=c.pos<t.pos?c:t,f=c.pos<t.pos?t:c,d=f.pos-l.pos,v=[],p=[];for(p.push({ids:l.ids,diff:d,parent:null,parentIdx:null});p.length>0;){var h=p.pop();if(0!==h.diff)for(var _=h.ids[2],g=0,m=_.length;m>g;g++)p.push({ids:_[g],diff:h.diff-1,parent:h.ids,parentIdx:g});else h.ids[0]===f.ids[0]&&v.push(h)}var y=v[0];y?(n=mergeTree(y.ids,f.ids),y.parent[2][y.parentIdx]=n.tree,o.push({pos:l.pos,ids:l.ids}),a=a||n.conflicts,i=!0):o.push(c)}else o.push(c)}return i||o.push(t),o.sort(sortByPos$1),{tree:o,conflicts:a||"internal_node"}}function stem(e,t){for(var r,n=rootToLeaf(e),o={},a=0,i=n.length;i>a;a++){for(var s=n[a],u=s.ids,c=Math.max(0,u.length-t),l={pos:s.pos+c,ids:pathToTree(u,c)},f=0;c>f;f++){var d=s.pos+f+"-"+u[f].id;o[d]=!0}r=r?doMerge(r,l,!0).tree:[l]}return traverseRevTree(r,function(e,t,r){delete o[t+"-"+r]}),{tree:r,revs:Object.keys(o)}}function merge(e,t,r){var n=doMerge(e,t),o=stem(n.tree,r);return{tree:o.tree,stemmedRevs:o.revs,conflicts:n.conflicts}}function revExists(e,t){for(var r,n=e.slice(),o=t.split("-"),a=parseInt(o[0],10),i=o[1];r=n.pop();){if(r.pos===a&&r.ids[0]===i)return!0;for(var s=r.ids[2],u=0,c=s.length;c>u;u++)n.push({pos:r.pos+1,ids:s[u]})}return!1}function getTrees(e){return e.ids}function isDeleted(e,t){t||(t=winningRev(e));for(var r,n=t.substring(t.indexOf("-")+1),o=e.rev_tree.map(getTrees);r=o.pop();){if(r[0]===n)return!!r[1].deleted;o=o.concat(r[2])}}function isLocalId(e){return/^_local/.test(e)}function arrayBufferToBinaryString(e){for(var t="",r=new Uint8Array(e),n=r.byteLength,o=0;n>o;o++)t+=String.fromCharCode(r[o]);return t}function createBlob(e,t){e=e||[],t=t||{};try{return new Blob(e,t)}catch(r){if("TypeError"!==r.name)throw r;for(var n="undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder,o=new n,a=0;a<e.length;a+=1)o.append(e[a]);return o.getBlob(t.type)}}function binaryStringToArrayBuffer(e){for(var t=e.length,r=new ArrayBuffer(t),n=new Uint8Array(r),o=0;t>o;o++)n[o]=e.charCodeAt(o);return r}function binStringToBluffer(e,t){return createBlob([binaryStringToArrayBuffer(e)],{type:t})}function readAsBinaryString(e,t){if("undefined"==typeof FileReader)return t(arrayBufferToBinaryString((new FileReaderSync).readAsArrayBuffer(e)));var r=new FileReader,n="function"==typeof r.readAsBinaryString;r.onloadend=function(e){var r=e.target.result||"";return n?t(r):void t(arrayBufferToBinaryString(r))},n?r.readAsBinaryString(e):r.readAsArrayBuffer(e)}function rawToBase64(e){return btoa$1(e)}function appendBuffer(e,t,r,n){(r>0||n<t.byteLength)&&(t=new Uint8Array(t,r,Math.min(n,t.byteLength)-r)),e.append(t)}function appendString(e,t,r,n){(r>0||n<t.length)&&(t=t.substring(r,n)),e.appendBinary(t)}function binaryMd5(e,t){function r(){var n=s*a,o=n+a;if(s++,i>s)c(u,e,n,o),setImmediateShim(r);else{c(u,e,n,o);var l=u.end(!0),f=rawToBase64(l);t(f),u.destroy()}}var n="string"==typeof e,o=n?e.length:e.byteLength,a=Math.min(MD5_CHUNK_SIZE,o),i=Math.ceil(o/a),s=0,u=n?new Md5:new Md5.ArrayBuffer,c=n?appendString:appendBuffer;r()}function updateDoc(e,t,r,n,o,a,i,s){if(revExists(t.rev_tree,r.metadata.rev))return n[o]=r,a();var u=t.winningRev||winningRev(t),c="deleted"in t?t.deleted:isDeleted(t,u),l="deleted"in r.metadata?r.metadata.deleted:isDeleted(r.metadata),f=/^1-/.test(r.metadata.rev);if(c&&!l&&s&&f){var d=r.data;d._rev=u,d._id=r.metadata.id,r=parseDoc(d,s)}var v=merge(t.rev_tree,r.metadata.rev_tree[0],e),p=s&&(c&&l||!c&&"new_leaf"!==v.conflicts||c&&!l&&"new_branch"===v.conflicts);if(p){var h=createError(REV_CONFLICT);return n[o]=h,a()}var _=r.metadata.rev;r.metadata.rev_tree=v.tree,r.stemmedRevs=v.stemmedRevs||[],t.rev_map&&(r.metadata.rev_map=t.rev_map);var g,m=winningRev(r.metadata),y=isDeleted(r.metadata,m),b=c===y?0:y>c?-1:1;g=_===m?y:isDeleted(r.metadata,_),i(r,m,y,g,!0,b,o,a)}function rootIsMissing(e){return"missing"===e.metadata.rev_tree[0].ids[1].status}function processDocs(e,t,r,n,o,a,i,s,u){function c(e,t,r){var n=winningRev(e.metadata),o=isDeleted(e.metadata,n);if("was_delete"in s&&o)return a[t]=createError(MISSING_DOC,"deleted"),r();var u=f&&rootIsMissing(e);if(u){var c=createError(REV_CONFLICT);return a[t]=c,r()}var l=o?0:1;i(e,n,o,o,!1,l,t,r)}function l(){++v===p&&u&&u()}e=e||1e3;var f=s.new_edits,d=new pouchdbCollections.Map,v=0,p=t.length;t.forEach(function(e,t){if(e._id&&isLocalId(e._id)){var n=e._deleted?"_removeLocal":"_putLocal";return void r[n](e,{ctx:o},function(e,r){a[t]=e||r,l()})}var i=e.metadata.id;d.has(i)?(p--,d.get(i).push([e,t])):d.set(i,[[e,t]])}),d.forEach(function(t,r){function o(){++u<t.length?s():l()}function s(){var s=t[u],l=s[0],d=s[1];if(n.has(r))updateDoc(e,n.get(r),l,a,d,o,i,f);else{var v=merge([],l.metadata.rev_tree[0],e);l.metadata.rev_tree=v.tree,l.stemmedRevs=v.stemmedRevs||[],c(l,d,o)}}var u=0;s()})}function slowJsonParse(e){try{return JSON.parse(e)}catch(t){return vuvuzela.parse(e)}}function safeJsonParse(e){return e.length<5e4?JSON.parse(e):slowJsonParse(e)}function safeJsonStringify(e){try{return JSON.stringify(e)}catch(t){return vuvuzela.stringify(e)}}function readAsBlobOrBuffer(e,t){var r=new Uint8Array(e);return createBlob([r],{type:t})}function prepareAttachmentForStorage(e,t){readAsBinaryString(e,t)}function createEmptyBlobOrBuffer(e){return createBlob([""],{type:e})}function getCacheFor(e,t){var r=t.prefix()[0],n=e._cache,o=n.get(r);return o||(o=new pouchdbCollections.Map,n.set(r,o)),o}function LevelTransaction(){this._batch=[],this._cache=new pouchdbCollections.Map}function getWinningRev(e){return"winningRev"in e?e.winningRev:winningRev(e)}function getIsDeleted(e,t){return"deleted"in e?e.deleted:isDeleted(e,t)}function fetchAttachment(e,t,r){var n=e.content_type;return new PouchPromise(function(o,a){t.binaryStore.get(e.digest,function(t,i){var s;if(t){if("NotFoundError"!==t.name)return a(t);s=r.binary?binStringToBluffer("",n):""}else s=r.binary?readAsBlobOrBuffer(i,n):i.toString("base64");delete e.stub,delete e.length,e.data=s,o()})})}function fetchAttachments(e,t,r){var n=[];return e.forEach(function(e){if(e.doc&&e.doc._attachments){var t=Object.keys(e.doc._attachments);t.forEach(function(t){var r=e.doc._attachments[t];"data"in r||n.push(r)})}}),PouchPromise.all(n.map(function(e){return fetchAttachment(e,t,r)}))}function LevelPouch(e,t){function r(){_.docStore=p.sublevel(DOC_STORE,{valueEncoding:safeJsonEncoding}),_.bySeqStore=p.sublevel(BY_SEQ_STORE,{valueEncoding:"json"}),_.attachmentStore=p.sublevel(ATTACHMENT_STORE,{valueEncoding:"json"}),_.binaryStore=p.sublevel(BINARY_STORE,{valueEncoding:"binary"}),_.localStore=p.sublevel(LOCAL_STORE,{valueEncoding:"json"}),_.metaStore=p.sublevel(META_STORE,{valueEncoding:"json"}),migrate.localAndMetaStores(p,_,function(){_.metaStore.get(UPDATE_SEQ_KEY,function(e,r){"undefined"==typeof p._updateSeq&&(p._updateSeq=r||0),_.metaStore.get(DOC_COUNT_KEY,function(e,r){p._docCount=e?0:r,_.metaStore.get(UUID_KEY,function(e,r){v=e?uuid():r,_.metaStore.put(UUID_KEY,v,function(){process.nextTick(function(){t(null,h)})})})})})})}function n(e){return p.isClosed()?e(new Error("database is closed")):e(null,p._docCount)}function o(e,t){try{e.apply(null,t)}catch(r){t[t.length-1](r)}}function a(){var e=p._queue.peekFront();"read"===e.type?i(e):s(e)}function i(e){for(var t=[e],r=1,n=p._queue.get(r);"undefined"!=typeof n&&"read"===n.type;)t.push(n),r++,n=p._queue.get(r);var i=0;t.forEach(function(e){var r=e.args,n=r[r.length-1];r[r.length-1]=getArguments(function(e){n.apply(null,e),++i===t.length&&process.nextTick(function(){t.forEach(function(){p._queue.shift()}),p._queue.length&&a()})}),o(e.fun,r)})}function s(e){var t=e.args,r=t[t.length-1];t[t.length-1]=getArguments(function(e){r.apply(null,e),process.nextTick(function(){p._queue.shift(),p._queue.length&&a()})}),o(e.fun,t)}function u(e){return getArguments(function(t){p._queue.push({fun:e,args:t,type:"write"}),1===p._queue.length&&process.nextTick(a)})}function c(e){return getArguments(function(t){p._queue.push({fun:e,args:t,type:"read"}),1===p._queue.length&&process.nextTick(a)})}function l(e){return("0000000000000000"+e).slice(-16)}function f(e){return parseInt(e,10)}function d(e,t){b.destroy(e,t)}e=clone(e);var v,p,h=this,_={},g=e.revs_limit,m=e.name;"undefined"==typeof e.createIfMissing&&(e.createIfMissing=!0);var y,b=e.db,S=functionName(b);dbStores.has(S)?y=dbStores.get(S):(y=new pouchdbCollections.Map,dbStores.set(S,y)),y.has(m)?(p=y.get(m),r()):y.set(m,sublevel(levelup(m,e,function(n){return n?(y["delete"](m),t(n)):(p=y.get(m),p._docCount=-1,p._queue=new Deque,void(e.migrate?migrate.toSublevel(m,p,r):r()))}))),h.type=function(){return"leveldb"},h._id=function(e){e(null,v)},h._info=function(e){var t={doc_count:p._docCount,update_seq:p._updateSeq,backend_adapter:functionName(b)};return process.nextTick(function(){e(null,t)})},h._get=c(function(e,t,r){t=clone(t),_.docStore.get(e,function(e,n){if(e||!n)return r(createError(MISSING_DOC,"missing"));var o=getWinningRev(n),a=getIsDeleted(n,o);if(a&&!t.rev)return r(createError(MISSING_DOC,"deleted"));o=t.rev?t.rev:o;var i=n.rev_map[o];_.bySeqStore.get(l(i),function(e,t){if(!t)return r(createError(MISSING_DOC));if("_id"in t&&t._id!==n.id)return r(new Error("wrong doc returned"));if(t._id=n.id,"_rev"in t){if(t._rev!==o)return r(new Error("wrong doc returned"))}else t._rev=o;return r(null,{doc:t,metadata:n})})})}),h._getAttachment=function(e,t,r,n,o){var a=r.digest,i=r.content_type;_.binaryStore.get(a,function(e,t){return e?"NotFoundError"!==e.name?o(e):o(null,n.binary?createEmptyBlobOrBuffer(i):""):void(n.binary?o(null,readAsBlobOrBuffer(t,i)):o(null,t.toString("base64")))})},h._bulkDocs=u(function(e,t,r){function n(e,t){w.get(_.attachmentStore,e,function(r){if(r){var n=createError(MISSING_STUB,"unknown stub attachment with digest "+e);t(n)}else t()})}function o(e){var t=[];if(R.forEach(function(e){e&&e._attachments&&Object.keys(e._attachments).forEach(function(r){var n=e._attachments[r];n.stub&&t.push(n.digest)})}),!t.length)return e();var r,o=0;t.forEach(function(a){n(a,function(n){n&&!r&&(r=n),++o===t.length&&e(r)})})}function a(e){function t(){return++n===R.length?e(r):void 0}var r,n=0;R.forEach(function(e){return e._id&&isLocalId(e._id)?t():void w.get(_.docStore,e._id,function(n,o){n?"NotFoundError"!==n.name&&(r=n):S.set(e._id,o),t()})})}function i(e,t){var r=PouchPromise.resolve();e.forEach(function(e,t){r=r.then(function(){return new PouchPromise(function(r,n){h._doCompactionNoLock(t,e,{ctx:w},function(e){return e?n(e):void r()})})})}),r.then(function(){t()},t)}function s(e){var t=new pouchdbCollections.Map;S.forEach(function(e,r){t.set(r,compactTree(e))}),i(t,e)}function u(){i(E,function(e){return e&&v(e),h.auto_compaction?s(v):void v()})}function c(e,t,n,o,a,i,s,u){function c(e){m++,g||(e?(g=e,u(g)):m===y.length&&h())}function v(e,t,r,n){return function(o){d(e,MD5_PREFIX+o,t,r,n)}}function p(e,t,r){return function(n){binaryMd5(n,v(e,t,n,r))}}function h(){var r=e.metadata.rev_map[e.metadata.rev];if(r)return u();r=++D,e.metadata.rev_map[e.metadata.rev]=e.metadata.seq=r;var n=l(r),o=[{key:n,value:e.data,prefix:_.bySeqStore,type:"put"},{key:e.metadata.id,value:e.metadata,prefix:_.docStore,type:"put"}];w.batch(o),b[s]={ok:!0,id:e.metadata.id,rev:t},S.set(e.metadata.id,e.metadata),u()}I+=i;var g=null,m=0;e.metadata.winningRev=t,e.metadata.deleted=n,e.data._id=e.metadata.id,e.data._rev=e.metadata.rev,o&&(e.data._deleted=!0),e.stemmedRevs.length&&E.set(e.metadata.id,e.stemmedRevs);for(var y=e.data._attachments?Object.keys(e.data._attachments):[],R=0;R<y.length;R++){var O=y[R],T=e.data._attachments[O];if(T.stub){var C=e.data._id,L=e.data._rev;f(C,L,T.digest,c)}else{var B;if("string"==typeof T.data){try{B=atob$1(T.data)}catch(N){return void r(createError(BAD_ARG,"Attachment is not a valid base64 string"))}p(e,O,c)(B)}else prepareAttachmentForStorage(T.data,p(e,O,c))}}y.length||h()}function f(e,t,r,n){function o(){return new PouchPromise(function(e,t){w.get(_.attachmentStore,r,function(r,n){return r&&"NotFoundError"!==r.name?t(r):void e(n)})})}function a(n){var o=[e,t].join("@"),a={};return n?n.refs&&(a.refs=n.refs,a.refs[o]=!0):(a.refs={},a.refs[o]=!0),new PouchPromise(function(e){w.batch([{type:"put",prefix:_.attachmentStore,key:r,value:a}]),e(!n)})}var i=C[r]||PouchPromise.resolve();C[r]=i.then(function(){return o().then(a).then(function(e){n(null,e)},n)})}function d(e,t,r,n,o){var a=e.data._attachments[r];delete a.data,a.digest=t,a.length=n.length;var i=e.metadata.id,s=e.metadata.rev;a.revpos=parseInt(s,10),f(i,s,t,function(e,r){return e?o(e):0===n.length?o(e):r?(w.batch([{type:"put",prefix:_.binaryStore,key:t,value:new Buffer(n,"binary")}]),void o()):o(e)})}function v(e){return e?process.nextTick(function(){r(e)}):(w.batch([{prefix:_.metaStore,type:"put",key:UPDATE_SEQ_KEY,value:D},{prefix:_.metaStore,type:"put",key:DOC_COUNT_KEY,value:p._docCount+I}]),void w.execute(p,function(e){return e?r(e):(p._docCount+=I,p._updateSeq=D,levelChanges.notify(m),void process.nextTick(function(){r(null,b)}))}))}var y=t.new_edits,b=new Array(e.docs.length),S=new pouchdbCollections.Map,E=new pouchdbCollections.Map,w=new LevelTransaction,I=0,D=p._updateSeq,R=e.docs,O=R.map(function(e){if(e._id&&isLocalId(e._id))return e;var t=parseDoc(e,y);return t.metadata&&!t.metadata.rev_map&&(t.metadata.rev_map={}),t}),T=O.filter(function(e){return e.error});if(T.length)return r(T[0]);var C={};return O.length?void o(function(e){return e?r(e):void a(function(e){return e?r(e):void processDocs(g,O,h,S,w,b,c,t,u)})}):r(null,[])}),h._allDocs=c(function(e,t){e=clone(e),n(function(r,n){if(r)return t(r);var o={},a=e.skip||0;if(e.startkey&&(o.gte=e.startkey),e.endkey&&(o.lte=e.endkey),e.key&&(o.gte=o.lte=e.key),e.descending){o.reverse=!0;var i=o.lte;o.lte=o.gte,o.gte=i}var s;if("number"==typeof e.limit&&(s=e.limit),0===s||"start"in o&&"end"in o&&o.start>o.end)return t(null,{total_rows:n,offset:e.skip,rows:[]});var u=[],c=_.docStore.readStream(o),f=through2.obj(function(t,r,n){function o(t){var r={id:i.id,key:i.id,value:{rev:f}};if(e.include_docs){r.doc=t,r.doc._rev=r.value.rev,e.conflicts&&(r.doc._conflicts=collectConflicts(i));for(var o in r.doc._attachments)r.doc._attachments.hasOwnProperty(o)&&(r.doc._attachments[o].stub=!0)}if(e.inclusive_end===!1&&i.id===e.endkey)return n();if(d){if("ok"!==e.deleted)return n();r.value.deleted=!0,r.doc=null}u.push(r),n()}var i=t.value,f=getWinningRev(i),d=getIsDeleted(i,f);if(d){if("ok"!==e.deleted)return void n()}else{if(a-- >0)return void n();if("number"==typeof s&&s--<=0)return c.unpipe(),c.destroy(),void n()}if(e.include_docs){var v=i.rev_map[f];_.bySeqStore.get(l(v),function(e,t){o(t)})}else o()},function(r){PouchPromise.resolve().then(function(){return e.include_docs&&e.attachments?fetchAttachments(u,_,e):void 0}).then(function(){t(null,{total_rows:n,offset:e.skip,rows:u})},t),r()}).on("unpipe",function(){f.end()});c.on("error",t),c.pipe(f)})}),h._changes=function(e){function t(){e.done=!0,c&&e.limit&&e.limit<a.length&&(a.length=e.limit),y.unpipe(b),y.destroy(),e.continuous||e.cancelled||(e.include_docs&&e.attachments?fetchAttachments(a,_,e).then(function(){e.complete(null,{results:a,last_seq:i})}):e.complete(null,{results:a,last_seq:i}))}if(e=clone(e),e.continuous){var r=m+":"+uuid();return levelChanges.addListener(m,r,h,e),levelChanges.notify(m),{cancel:function(){levelChanges.removeListener(m,r)}}}var n,o=e.descending,a=[],i=e.since||0,s=0,u={reverse:o};"limit"in e&&e.limit>0&&(n=e.limit),u.reverse||(u.start=l(e.since||0));var c,d=e.doc_ids&&new pouchdbCollections.Set(e.doc_ids),v=filterChange(e),g=new pouchdbCollections.Map;c="return_docs"in e?e.return_docs:"returnDocs"in e?e.returnDocs:!0;var y=_.bySeqStore.readStream(u),b=through2.obj(function(r,u,h){function m(t){function r(r){var n=e.processChange(r,t,e);n.seq=t.seq;var o=v(n);return"object"==typeof o?e.complete(o):(o&&(s++,e.attachments&&e.include_docs?fetchAttachments([n],_,e).then(function(){e.onChange(n)}):e.onChange(n),c&&a.push(n)),void h())}var n=getWinningRev(t);if(t.seq!==y)return h();if(i=y,n===b._rev)return r(b);var o=t.rev_map[n];_.bySeqStore.get(l(o),function(e,t){r(t)})}if(n&&s>=n)return t(),h();if(e.cancelled||e.done)return h();var y=f(r.key),b=r.value;if(y===e.since&&!o)return h();if(d&&!d.has(b._id))return h();var S;return(S=g.get(b._id))?m(S):void _.docStore.get(b._id,function(t,r){return e.cancelled||e.done||p.isClosed()||isLocalId(r.id)?h():(g.set(b._id,r),void m(r))})},function(t){return e.cancelled?t():(c&&e.limit&&e.limit<a.length&&(a.length=e.limit),void t())}).on("unpipe",function(){b.end(),t()});return y.pipe(b),{cancel:function(){e.cancelled=!0,t()}}},h._close=function(e){return p.isClosed()?e(createError(NOT_OPEN)):void p.close(function(t){t?e(t):(y["delete"](m),e())})},h._getRevisionTree=function(e,t){_.docStore.get(e,function(e,r){e?t(createError(MISSING_DOC)):t(null,r.rev_tree)})},h._doCompaction=u(function(e,t,r,n){h._doCompactionNoLock(e,t,r,n)}),h._doCompactionNoLock=function(e,t,r,n){if("function"==typeof r&&(n=r,r={}),!t.length)return n();var o=r.ctx||new LevelTransaction;o.get(_.docStore,e,function(a,i){function s(e){if(e&&(v=e),++g===t.length){if(v)return n(v);c()}}function u(e){return e?n(e):(o.batch(d),r.ctx?n():void o.execute(p,n))}function c(){function r(e){e&&(a=e),++i===n.length&&u(a)}var n=Object.keys(h);if(!n.length)return u();var a,i=0,s=new pouchdbCollections.Map;t.forEach(function(t){s.set(e+"@"+t,!0)}),n.forEach(function(e){o.get(_.attachmentStore,e,function(t,n){if(t)return"NotFoundError"===t.name?r():r(t);var o=Object.keys(n.refs||{}).filter(function(e){return!s.has(e)}),a={};o.forEach(function(e){a[e]=!0}),o.length?d.push({key:e,type:"put",value:{refs:a},prefix:_.attachmentStore}):d=d.concat([{key:e,type:"del",prefix:_.attachmentStore},{key:e,type:"del",prefix:_.binaryStore}]),r()})})}if(a)return n(a);var f=t.map(function(e){var t=i.rev_map[e];return delete i.rev_map[e],t});traverseRevTree(i.rev_tree,function(e,r,n,o,a){var i=r+"-"+n;-1!==t.indexOf(i)&&(a.status="missing")});var d=[];d.push({key:i.id,value:i,type:"put",prefix:_.docStore});var v,h={},g=0;f.forEach(function(e){d.push({key:l(e),type:"del",prefix:_.bySeqStore}),o.get(_.bySeqStore,l(e),function(e,t){if(e)return"NotFoundError"===e.name?s():s(e);var r=Object.keys(t._attachments||{});r.forEach(function(e){var r=t._attachments[e].digest;h[r]=!0}),s()})})})},h._getLocal=function(e,t){_.localStore.get(e,function(e,r){e?t(createError(MISSING_DOC)):t(null,r)})},h._putLocal=function(e,t,r){"function"==typeof t&&(r=t,t={}),t.ctx?h._putLocalNoLock(e,t,r):h._putLocalWithLock(e,t,r)},h._putLocalWithLock=u(function(e,t,r){h._putLocalNoLock(e,t,r)}),h._putLocalNoLock=function(e,t,r){delete e._revisions;var n=e._rev,o=e._id,a=t.ctx||new LevelTransaction;a.get(_.localStore,o,function(i,s){if(i&&n)return r(createError(REV_CONFLICT));if(s&&s._rev!==n)return r(createError(REV_CONFLICT));e._rev=n?"0-"+(parseInt(n.split("-")[1],10)+1):"0-1";var u=[{type:"put",prefix:_.localStore,key:o,value:e}];a.batch(u);var c={ok:!0,id:e._id,rev:e._rev};return t.ctx?r(null,c):void a.execute(p,function(e){return e?r(e):void r(null,c)})})},h._removeLocal=function(e,t,r){"function"==typeof t&&(r=t,t={}),t.ctx?h._removeLocalNoLock(e,t,r):h._removeLocalWithLock(e,t,r)},h._removeLocalWithLock=u(function(e,t,r){h._removeLocalNoLock(e,t,r)}),h._removeLocalNoLock=function(e,t,r){var n=t.ctx||new LevelTransaction;n.get(_.localStore,e._id,function(o,a){if(o)return r("NotFoundError"!==o.name?o:createError(MISSING_DOC));if(a._rev!==e._rev)return r(createError(REV_CONFLICT));n.batch([{prefix:_.localStore,type:"del",key:e._id}]);var i={ok:!0,id:e._id,rev:"0-0"};return t.ctx?r(null,i):void n.execute(p,function(e){return e?r(e):void r(null,i)})})},h._destroy=function(e,t){var r,n=functionName(b);return dbStores.has(n)?(r=dbStores.get(n),void(r.has(m)?(levelChanges.removeAllListeners(m),r.get(m).close(function(){r["delete"](m),d(m,t)})):d(m,t))):d(m,t)}}function FruitDownPouch(e,t){var r=jsExtend.extend({db:fruitdown},e);LevelPouch.call(this,r,t)}function FruitdownPouchPlugin(e){e.adapter("fruitdown",FruitDownPouch,!0)}var levelup=_interopDefault(require("levelup")),sublevel=_interopDefault(require("sublevel-pouchdb")),through2=require("through2"),getArguments=_interopDefault(require("argsarray")),pouchdbCollections=require("pouchdb-collections"),Deque=_interopDefault(require("double-ended-queue")),lie=_interopDefault(require("lie")),debug=_interopDefault(require("debug")),events=require("events"),inherits=_interopDefault(require("inherits")),Md5=_interopDefault(require("spark-md5")),vuvuzela=_interopDefault(require("vuvuzela")),jsExtend=require("js-extend"),fruitdown=_interopDefault(require("fruitdown")),toSublevel=function(e,t,r){process.nextTick(function(){r()})},localAndMetaStores=function(e,t,r){process.nextTick(function(){r()})},migrate={toSublevel:toSublevel,localAndMetaStores:localAndMetaStores},PouchPromise="function"==typeof Promise?Promise:lie,funcToString=Function.prototype.toString,objectCtorString=funcToString.call(Object),log=debug("pouchdb:api"),hasLocal;if(isChromeApp())hasLocal=!1;else try{localStorage.setItem("_pouch_check_localstorage",1),hasLocal=!!localStorage.getItem("_pouch_check_localstorage")}catch(e){hasLocal=!1}inherits(Changes,events.EventEmitter),Changes.prototype.addListener=function(e,t,r,n){function o(){function e(){i=!1}if(a._listeners[t]){if(i)return void(i="waiting");i=!0;var s=pick(n,["style","include_docs","attachments","conflicts","filter","doc_ids","view","since","query_params","binary"]);r.changes(s).on("change",function(e){e.seq>n.since&&!n.cancelled&&(n.since=e.seq,n.onChange(e))}).on("complete",function(){"waiting"===i&&setTimeout(function(){o()},0),i=!1}).on("error",e)}}if(!this._listeners[t]){var a=this,i=!1;this._listeners[t]=o,this.on(e,o)}},Changes.prototype.removeListener=function(e,t){t in this._listeners&&events.EventEmitter.prototype.removeListener.call(this,e,this._listeners[t])},Changes.prototype.notifyLocalWindows=function(e){isChromeApp()?chrome.storage.local.set({dbName:e}):hasLocalStorage()&&(localStorage[e]="a"===localStorage[e]?"b":"a")},Changes.prototype.notify=function(e){this.emit(e),this.notifyLocalWindows(e)},inherits(PouchError,Error),PouchError.prototype.toString=function(){return JSON.stringify({status:this.status,name:this.name,message:this.message,reason:this.reason})};var UNAUTHORIZED=new PouchError({status:401,error:"unauthorized",reason:"Name or password is incorrect."}),MISSING_BULK_DOCS=new PouchError({status:400,error:"bad_request",reason:"Missing JSON list of 'docs'"}),MISSING_DOC=new PouchError({status:404,error:"not_found",reason:"missing"}),REV_CONFLICT=new PouchError({status:409,error:"conflict",reason:"Document update conflict"}),INVALID_ID=new PouchError({status:400,error:"invalid_id",reason:"_id field must contain a string"}),MISSING_ID=new PouchError({status:412,error:"missing_id",reason:"_id is required for puts"}),RESERVED_ID=new PouchError({status:400,error:"bad_request",reason:"Only reserved document ids may start with underscore."}),NOT_OPEN=new PouchError({status:412,error:"precondition_failed",reason:"Database not open"}),UNKNOWN_ERROR=new PouchError({status:500,error:"unknown_error",reason:"Database encountered an unknown error"}),BAD_ARG=new PouchError({status:500,error:"badarg",reason:"Some query argument is invalid"}),INVALID_REQUEST=new PouchError({status:400,error:"invalid_request",reason:"Request was invalid"}),QUERY_PARSE_ERROR=new PouchError({status:400,error:"query_parse_error",reason:"Some query parameter is invalid"}),DOC_VALIDATION=new PouchError({status:500,error:"doc_validation",reason:"Bad special document member"}),BAD_REQUEST=new PouchError({status:400,error:"bad_request",reason:"Something wrong with the request"}),NOT_AN_OBJECT=new PouchError({status:400,error:"bad_request",reason:"Document must be a JSON object"}),DB_MISSING=new PouchError({status:404,error:"not_found",reason:"Database not found"}),IDB_ERROR=new PouchError({status:500,error:"indexed_db_went_bad",reason:"unknown"}),WSQ_ERROR=new PouchError({status:500,error:"web_sql_went_bad",reason:"unknown"}),LDB_ERROR=new PouchError({status:500,error:"levelDB_went_went_bad",reason:"unknown"}),FORBIDDEN=new PouchError({status:403,error:"forbidden",reason:"Forbidden by design doc validate_doc_update function"}),INVALID_REV=new PouchError({status:400,error:"bad_request",reason:"Invalid rev format"}),FILE_EXISTS=new PouchError({status:412,error:"file_exists",reason:"The database could not be created, the file already exists."}),MISSING_STUB=new PouchError({status:412,error:"missing_stub"}),INVALID_URL=new PouchError({status:413,error:"invalid_url",reason:"Provided URL is invalid"}),allErrors=[UNAUTHORIZED,MISSING_BULK_DOCS,MISSING_DOC,REV_CONFLICT,INVALID_ID,MISSING_ID,RESERVED_ID,NOT_OPEN,UNKNOWN_ERROR,BAD_ARG,INVALID_REQUEST,QUERY_PARSE_ERROR,DOC_VALIDATION,BAD_REQUEST,NOT_AN_OBJECT,DB_MISSING,WSQ_ERROR,LDB_ERROR,FORBIDDEN,INVALID_REV,FILE_EXISTS,MISSING_STUB,IDB_ERROR,INVALID_URL],hasName=f.name,res;
res=hasName?function(e){return e.name}:function(e){return e.toString().match(/^\s*function\s*(\S*)\s*\(/)[1]};var functionName=res,chars="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),reservedWords=toObject(["_id","_rev","_attachments","_deleted","_revisions","_revs_info","_conflicts","_deleted_conflicts","_local_seq","_rev_tree","_replication_id","_replication_state","_replication_state_time","_replication_state_reason","_replication_stats","_removed"]),dataWords=toObject(["_attachments","_replication_id","_replication_state","_replication_state_time","_replication_state_reason","_replication_stats"]),atob$1=function(e){return atob(e)},btoa$1=function(e){return btoa(e)},setImmediateShim=global.setImmediate||global.setTimeout,MD5_CHUNK_SIZE=32768;LevelTransaction.prototype.get=function(e,t,r){var n=getCacheFor(this,e),o=n.get(t);return o?process.nextTick(function(){r(null,o)}):null===o?process.nextTick(function(){r({name:"NotFoundError"})}):void e.get(t,function(e,o){return e?("NotFoundError"===e.name&&n.set(t,null),r(e)):(n.set(t,o),void r(null,o))})},LevelTransaction.prototype.batch=function(e){for(var t=0,r=e.length;r>t;t++){var n=e[t],o=getCacheFor(this,n.prefix);"put"===n.type?o.set(n.key,n.value):o.set(n.key,null)}this._batch=this._batch.concat(e)},LevelTransaction.prototype.execute=function(e,t){for(var r=new pouchdbCollections.Set,n=[],o=this._batch.length-1;o>=0;o--){var a=this._batch[o],i=a.prefix.prefix()[0]+"ÿ"+a.key;r.has(i)||(r.add(i),n.push(a))}e.batch(n,t)};var DOC_STORE="document-store",BY_SEQ_STORE="by-sequence",ATTACHMENT_STORE="attach-store",BINARY_STORE="attach-binary-store",LOCAL_STORE="local-store",META_STORE="meta-store",dbStores=new pouchdbCollections.Map,UPDATE_SEQ_KEY="_local_last_update_seq",DOC_COUNT_KEY="_local_doc_count",UUID_KEY="_local_uuid",MD5_PREFIX="md5-",safeJsonEncoding={encode:safeJsonStringify,decode:safeJsonParse,buffer:!1,type:"cheap-json"},levelChanges=new Changes;FruitDownPouch.valid=function(){return!!global.indexedDB},FruitDownPouch.use_prefix=!0;var PDB="undefined"!=typeof PouchDB?PouchDB:require("pouchdb");PDB?FruitdownPouchPlugin(PDB):guardedConsole("error",'fruitdown adapter plugin error: Cannot find global "PouchDB" object! Did you remember to include pouchdb.js?');