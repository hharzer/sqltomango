(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sqltomango=f()}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){var sqlparser=require("sql-parser"),simplify=function(e){var r=e.toString().replace(/^[`']/,"").replace(/[`']$/,"");if(r.match(/`/))throw new Error(r+" not supported");return r},parameterise=function(e){var r=simplify(e),t=r.toUpperCase();return r.match(/^[\-0-9\.]+$/)?r.match(/\./)?parseFloat(r):parseInt(r):"TRUE"===t||"FALSE"!==t&&r},selector=function(e,r){var t=null;switch(r.operation.toUpperCase()){case"=":e[simplify(r.left)]={$eq:parameterise(r.right)};break;case"!=":e[simplify(r.left)]={$ne:parameterise(r.right)};break;case"<":e[simplify(r.left)]={$lt:parameterise(r.right)};break;case"<=":e[simplify(r.left)]={$lte:parameterise(r.right)};break;case">":e[simplify(r.left)]={$gt:parameterise(r.right)};break;case">=":e[simplify(r.left)]={$gte:parameterise(r.right)};break;case"IN":e[simplify(r.left)]={$in:r.right.value.map(function(e){return e.value})};break;case"NOT IN":e[simplify(r.left)]={$nin:r.right.value.map(function(e){return e.value})};break;case"AND":t="$and",e[t]=[],e[t].push(selector({},r.left)),e[t].push(selector({},r.right));break;case"OR":t="$or",e[t]=[],e[t].push(selector({},r.left)),e[t].push(selector({},r.right));break;default:throw new Error("unsupported SQL operation "+r.operation)}return e},parse=function(e){if("string"!=typeof e)throw new Error("query must be a string");var r={},t=sqlparser.parse(e);if(t.distinct)throw new Error("DISTINCT not supported");if(t.joins.length>0)throw new Error("joins not supported");if(t.unions.length>0)throw new Error("unions not supported");if(t.group)throw new Error("GROUP not supported");if(t.fields&&"*"!==t.fields.toString()){r.fields=[];for(var i in t.fields){var s=t.fields[i];if(null!==s.name)throw new Error("alias "+s.toString()+" not supported");if(!s.field.value)throw new Error(s.toString()+" not supported");r.fields.push(simplify(s.field))}}if(t.where&&(r.selector=selector({},t.where.conditions)),t.order&&t.order.orderings){r.sort=[];var a=null;for(var i in t.order.orderings){var o=t.order.orderings[i],l={};if(l[o.value.value]="DESC"===o.direction.toUpperCase()?"desc":"asc",null!=a&&l[o.value.value]!=a)throw new Error("ORDER BY must be either all ASC or all DESC, not mixed");a=l[o.value.value],r.sort.push(l)}}return t.limit&&(r.limit=t.limit.value.value,t.limit.offset&&(r.skip=t.limit.offset.value)),r};module.exports={parse:parse}},{"sql-parser":5}],2:[function(require,module,exports){},{}],3:[function(require,module,exports){(function(process){function normalizeArray(r,t){for(var e=0,n=r.length-1;n>=0;n--){var s=r[n];"."===s?r.splice(n,1):".."===s?(r.splice(n,1),e++):e&&(r.splice(n,1),e--)}if(t)for(;e--;e)r.unshift("..");return r}function filter(r,t){if(r.filter)return r.filter(t);for(var e=[],n=0;n<r.length;n++)t(r[n],n,r)&&e.push(r[n]);return e}var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,splitPath=function(r){return splitPathRe.exec(r).slice(1)};exports.resolve=function(){for(var r="",t=!1,e=arguments.length-1;e>=-1&&!t;e--){var n=e>=0?arguments[e]:process.cwd();if("string"!=typeof n)throw new TypeError("Arguments to path.resolve must be strings");n&&(r=n+"/"+r,t="/"===n.charAt(0))}return r=normalizeArray(filter(r.split("/"),function(r){return!!r}),!t).join("/"),(t?"/":"")+r||"."},exports.normalize=function(r){var t=exports.isAbsolute(r),e="/"===substr(r,-1);return r=normalizeArray(filter(r.split("/"),function(r){return!!r}),!t).join("/"),r||t||(r="."),r&&e&&(r+="/"),(t?"/":"")+r},exports.isAbsolute=function(r){return"/"===r.charAt(0)},exports.join=function(){var r=Array.prototype.slice.call(arguments,0);return exports.normalize(filter(r,function(r,t){if("string"!=typeof r)throw new TypeError("Arguments to path.join must be strings");return r}).join("/"))},exports.relative=function(r,t){function e(r){for(var t=0;t<r.length&&""===r[t];t++);for(var e=r.length-1;e>=0&&""===r[e];e--);return t>e?[]:r.slice(t,e-t+1)}r=exports.resolve(r).substr(1),t=exports.resolve(t).substr(1);for(var n=e(r.split("/")),s=e(t.split("/")),i=Math.min(n.length,s.length),o=i,u=0;u<i;u++)if(n[u]!==s[u]){o=u;break}for(var l=[],u=o;u<n.length;u++)l.push("..");return l=l.concat(s.slice(o)),l.join("/")},exports.sep="/",exports.delimiter=":",exports.dirname=function(r){var t=splitPath(r),e=t[0],n=t[1];return e||n?(n&&(n=n.substr(0,n.length-1)),e+n):"."},exports.basename=function(r,t){var e=splitPath(r)[2];return t&&e.substr(-1*t.length)===t&&(e=e.substr(0,e.length-t.length)),e},exports.extname=function(r){return splitPath(r)[3]};var substr="b"==="ab".substr(-1)?function(r,t,e){return r.substr(t,e)}:function(r,t,e){return t<0&&(t=r.length+t),r.substr(t,e)}}).call(this,require("_process"))},{_process:4}],4:[function(require,module,exports){function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}function runTimeout(e){if(cachedSetTimeout===setTimeout)return setTimeout(e,0);if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout)return cachedSetTimeout=setTimeout,setTimeout(e,0);try{return cachedSetTimeout(e,0)}catch(t){try{return cachedSetTimeout.call(null,e,0)}catch(t){return cachedSetTimeout.call(this,e,0)}}}function runClearTimeout(e){if(cachedClearTimeout===clearTimeout)return clearTimeout(e);if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout)return cachedClearTimeout=clearTimeout,clearTimeout(e);try{return cachedClearTimeout(e)}catch(t){try{return cachedClearTimeout.call(null,e)}catch(t){return cachedClearTimeout.call(this,e)}}}function cleanUpNextTick(){draining&&currentQueue&&(draining=!1,currentQueue.length?queue=currentQueue.concat(queue):queueIndex=-1,queue.length&&drainQueue())}function drainQueue(){if(!draining){var e=runTimeout(cleanUpNextTick);draining=!0;for(var t=queue.length;t;){for(currentQueue=queue,queue=[];++queueIndex<t;)currentQueue&&currentQueue[queueIndex].run();queueIndex=-1,t=queue.length}currentQueue=null,draining=!1,runClearTimeout(e)}}function Item(e,t){this.fun=e,this.array=t}function noop(){}var process=module.exports={},cachedSetTimeout,cachedClearTimeout;!function(){try{cachedSetTimeout="function"==typeof setTimeout?setTimeout:defaultSetTimout}catch(e){cachedSetTimeout=defaultSetTimout}try{cachedClearTimeout="function"==typeof clearTimeout?clearTimeout:defaultClearTimeout}catch(e){cachedClearTimeout=defaultClearTimeout}}();var queue=[],draining=!1,currentQueue,queueIndex=-1;process.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];queue.push(new Item(e,t)),1!==queue.length||draining||runTimeout(drainQueue)},Item.prototype.run=function(){this.fun.apply(null,this.array)},process.title="browser",process.browser=!0,process.env={},process.argv=[],process.version="",process.versions={},process.on=noop,process.addListener=noop,process.once=noop,process.off=noop,process.removeListener=noop,process.removeAllListeners=noop,process.emit=noop,process.prependListener=noop,process.prependOnceListener=noop,process.listeners=function(e){return[]},process.binding=function(e){throw new Error("process.binding is not supported")},process.cwd=function(){return"/"},process.chdir=function(e){throw new Error("process.chdir is not supported")},process.umask=function(){return 0}},{}],5:[function(require,module,exports){sql=require("./lib/sql_parser");for(var key in sql)exports[key]=sql[key]},{"./lib/sql_parser":10}],6:[function(require,module,exports){(function(process){var parser=function(){function e(){this.yy={}}var s=function(e,s,r,a){for(r=r||{},a=e.length;a--;r[e[a]]=s);return r},r=[1,8],a=[5,26],t=[1,14],n=[1,13],i=[5,26,31,42],c=[1,17],o=[5,26,31,42,45,62],l=[1,27],h=[1,29],u=[1,38],b=[1,42],p=[1,43],E=[1,39],O=[1,40],T=[1,37],$=[1,41],y=[1,25],k=[5,26,31],R=[5,26,31,42,45],w=[1,55],N=[18,43],f=[1,58],I=[1,59],A=[1,60],S=[1,61],L=[5,18,23,26,31,34,37,38,41,42,43,45,62,64,65,66,67,68],g=[5,18,23,26,31,34,37,38,41,42,43,44,45,51,62,64,65,66,67,68,69],_=[1,66],m=[2,80],d=[1,80],F=[1,81],U=[1,96],C=[5,26,31,42,43,44],P=[1,104],v=[5,26,31,42,43,45,64],x=[5,26,31,41,42,45,62],H=[1,107],G=[1,108],W=[1,109],B=[5,26,31,34,35,37,38,41,42,45,62],D=[5,26,31,34,37,38,41,42,45,62],V=[5,26,31,42,56,58],M={trace:function(){},yy:{},symbols_:{error:2,Root:3,Query:4,EOF:5,SelectQuery:6,Unions:7,SelectWithLimitQuery:8,BasicSelectQuery:9,Select:10,OrderClause:11,GroupClause:12,LimitClause:13,SelectClause:14,WhereClause:15,SELECT:16,Fields:17,FROM:18,Table:19,DISTINCT:20,Joins:21,Literal:22,AS:23,LEFT_PAREN:24,List:25,RIGHT_PAREN:26,WINDOW:27,WINDOW_FUNCTION:28,Number:29,Union:30,UNION:31,ALL:32,Join:33,JOIN:34,ON:35,Expression:36,LEFT:37,RIGHT:38,INNER:39,OUTER:40,WHERE:41,LIMIT:42,SEPARATOR:43,OFFSET:44,ORDER:45,BY:46,OrderArgs:47,OffsetClause:48,OrderArg:49,Value:50,DIRECTION:51,OffsetRows:52,FetchClause:53,ROW:54,ROWS:55,FETCH:56,FIRST:57,ONLY:58,NEXT:59,GroupBasicClause:60,HavingClause:61,GROUP:62,ArgumentList:63,HAVING:64,MATH:65,MATH_MULTI:66,OPERATOR:67,CONDITIONAL:68,SUB_SELECT_OP:69,SubSelectExpression:70,SUB_SELECT_UNARY_OP:71,String:72,Function:73,UserFunction:74,Boolean:75,Parameter:76,NUMBER:77,BOOLEAN:78,PARAMETER:79,STRING:80,DBLSTRING:81,LITERAL:82,DOT:83,FUNCTION:84,AggregateArgumentList:85,Field:86,STAR:87,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",16:"SELECT",18:"FROM",20:"DISTINCT",23:"AS",24:"LEFT_PAREN",26:"RIGHT_PAREN",27:"WINDOW",28:"WINDOW_FUNCTION",31:"UNION",32:"ALL",34:"JOIN",35:"ON",37:"LEFT",38:"RIGHT",39:"INNER",40:"OUTER",41:"WHERE",42:"LIMIT",43:"SEPARATOR",44:"OFFSET",45:"ORDER",46:"BY",51:"DIRECTION",54:"ROW",55:"ROWS",56:"FETCH",57:"FIRST",58:"ONLY",59:"NEXT",62:"GROUP",64:"HAVING",65:"MATH",66:"MATH_MULTI",67:"OPERATOR",68:"CONDITIONAL",69:"SUB_SELECT_OP",71:"SUB_SELECT_UNARY_OP",77:"NUMBER",78:"BOOLEAN",79:"PARAMETER",80:"STRING",81:"DBLSTRING",82:"LITERAL",83:"DOT",84:"FUNCTION",87:"STAR"},productions_:[0,[3,2],[4,1],[4,2],[6,1],[6,1],[9,1],[9,2],[9,2],[9,3],[8,2],[10,1],[10,2],[14,4],[14,5],[14,5],[14,6],[19,1],[19,2],[19,3],[19,3],[19,3],[19,4],[19,6],[7,1],[7,2],[30,2],[30,3],[21,1],[21,2],[33,4],[33,5],[33,5],[33,6],[33,6],[33,6],[33,6],[15,2],[13,2],[13,4],[13,4],[11,3],[11,4],[47,1],[47,3],[49,1],[49,2],[48,2],[48,3],[52,2],[52,2],[53,4],[53,4],[12,1],[12,2],[60,3],[61,2],[36,3],[36,3],[36,3],[36,3],[36,3],[36,5],[36,3],[36,2],[36,1],[70,3],[50,1],[50,1],[50,1],[50,1],[50,1],[50,1],[50,1],[25,1],[29,1],[75,1],[76,1],[72,1],[72,1],[22,1],[22,3],[73,4],[74,4],[85,1],[85,2],[63,1],[63,3],[17,1],[17,3],[86,1],[86,1],[86,3]],performAction:function(e,s,r,a,t,n,i){var c=n.length-1;switch(t){case 1:return this.$=n[c-1];case 2:case 4:case 5:case 6:case 11:case 53:case 65:case 67:case 68:case 69:case 70:case 71:case 72:case 73:this.$=n[c];break;case 3:this.$=function(){return n[c-1].unions=n[c],n[c-1]}();break;case 7:this.$=function(){return n[c-1].order=n[c],n[c-1]}();break;case 8:this.$=function(){return n[c-1].group=n[c],n[c-1]}();break;case 9:this.$=function(){return n[c-2].group=n[c-1],n[c-2].order=n[c],n[c-2]}();break;case 10:this.$=function(){return n[c-1].limit=n[c],n[c-1]}();break;case 12:this.$=function(){return n[c-1].where=n[c],n[c-1]}();break;case 13:this.$=new a.Select(n[c-2],n[c],!1);break;case 14:this.$=new a.Select(n[c-2],n[c],!0);break;case 15:this.$=new a.Select(n[c-3],n[c-1],!1,n[c]);break;case 16:this.$=new a.Select(n[c-3],n[c-1],!0,n[c]);break;case 17:this.$=new a.Table(n[c]);break;case 18:this.$=new a.Table(n[c-1],n[c]);break;case 19:this.$=new a.Table(n[c-2],n[c]);break;case 20:case 49:case 50:case 51:case 52:case 57:this.$=n[c-1];break;case 21:case 66:this.$=new a.SubSelect(n[c-1]);break;case 22:this.$=new a.SubSelect(n[c-2],n[c]);break;case 23:this.$=new a.Table(n[c-5],null,n[c-4],n[c-3],n[c-1]);break;case 24:case 28:case 43:case 86:case 88:this.$=[n[c]];break;case 25:this.$=n[c-1].concat(n[$01]);break;case 26:this.$=new a.Union(n[c]);break;case 27:this.$=new a.Union(n[c],!0);break;case 29:this.$=n[c-1].concat(n[c]);break;case 30:this.$=new a.Join(n[c-2],n[c]);break;case 31:this.$=new a.Join(n[c-2],n[c],"LEFT");break;case 32:this.$=new a.Join(n[c-2],n[c],"RIGHT");break;case 33:this.$=new a.Join(n[c-2],n[c],"LEFT","INNER");break;case 34:this.$=new a.Join(n[c-2],n[c],"RIGHT","INNER");break;case 35:this.$=new a.Join(n[c-2],n[c],"LEFT","OUTER");break;case 36:this.$=new a.Join(n[c-2],n[c],"RIGHT","OUTER");break;case 37:this.$=new a.Where(n[c]);break;case 38:this.$=new a.Limit(n[c]);break;case 39:this.$=new a.Limit(n[c],n[c-2]);break;case 40:this.$=new a.Limit(n[c-2],n[c]);break;case 41:this.$=new a.Order(n[c]);break;case 42:this.$=new a.Order(n[c-1],n[c]);break;case 44:case 87:case 89:this.$=n[c-2].concat(n[c]);break;case 45:this.$=new a.OrderArgument(n[c],"ASC");break;case 46:this.$=new a.OrderArgument(n[c-1],n[c]);break;case 47:this.$=new a.Offset(n[c]);break;case 48:this.$=new a.Offset(n[c-1],n[c]);break;case 54:this.$=function(){return n[c-1].having=n[c],n[c-1]}();break;case 55:this.$=new a.Group(n[c]);break;case 56:this.$=new a.Having(n[c]);break;case 58:case 59:case 60:case 61:case 63:this.$=new a.Op(n[c-1],n[c-2],n[c]);break;case 62:this.$=new a.Op(n[c-3],n[c-4],n[c-1]);break;case 64:this.$=new a.UnaryOp(n[c-1],n[c]);break;case 74:this.$=new a.ListValue(n[c]);break;case 75:this.$=new a.NumberValue(n[c]);break;case 76:this.$=new a.BooleanValue(n[c]);break;case 77:this.$=new a.ParameterValue(n[c]);break;case 78:this.$=new a.StringValue(n[c],"'");break;case 79:this.$=new a.StringValue(n[c],'"');break;case 80:this.$=new a.LiteralValue(n[c]);break;case 81:this.$=new a.LiteralValue(n[c-2],n[c]);break;case 82:this.$=new a.FunctionValue(n[c-3],n[c-1]);break;case 83:this.$=new a.FunctionValue(n[c-3],n[c-1],!0);break;case 84:this.$=new a.ArgumentListValue(n[c]);break;case 85:this.$=new a.ArgumentListValue(n[c],!0);break;case 90:this.$=new a.Star;break;case 91:this.$=new a.Field(n[c]);break;case 92:this.$=new a.Field(n[c-2],n[c])}},table:[{3:1,4:2,6:3,8:4,9:5,10:6,14:7,16:r},{1:[3]},{5:[1,9]},s(a,[2,2],{7:10,13:11,30:12,31:t,42:n}),s(i,[2,4]),s(i,[2,5]),s(i,[2,6],{11:15,12:16,60:18,45:c,62:[1,19]}),s(o,[2,11],{15:20,41:[1,21]}),{17:22,20:[1,23],22:30,24:l,29:31,36:26,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$,86:24,87:y},{1:[2,1]},s(a,[2,3],{30:44,31:t}),s(i,[2,10]),s(k,[2,24]),{29:45,77:u},{6:46,8:4,9:5,10:6,14:7,16:r,32:[1,47]},s(i,[2,7]),s(i,[2,8],{11:48,45:c}),{46:[1,49]},s(R,[2,53],{61:50,64:[1,51]}),{46:[1,52]},s(o,[2,12]),{22:30,24:l,29:31,36:53,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{18:[1,54],43:w},{17:56,22:30,24:l,29:31,36:26,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$,86:24,87:y},s(N,[2,88]),s(N,[2,90]),s(N,[2,91],{23:[1,57],65:f,66:I,67:A,68:S}),{22:30,24:l,29:31,36:62,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},s(L,[2,65],{69:[1,63]}),{24:[1,65],70:64},s(g,[2,67],{83:_}),s(g,[2,68]),s(g,[2,69]),s(g,[2,70]),s(g,[2,71]),s(g,[2,72]),s(g,[2,73]),s([5,18,23,26,31,34,37,38,41,42,43,44,45,51,62,64,65,66,67,68,69,83],m,{24:[1,67]}),s([5,18,23,26,31,34,37,38,41,42,43,44,45,51,54,55,62,64,65,66,67,68,69],[2,75]),s(g,[2,78]),s(g,[2,79]),{24:[1,68]},s(g,[2,76]),s(g,[2,77]),s(k,[2,25]),s(i,[2,38],{43:[1,69],44:[1,70]}),s(k,[2,26],{13:11,42:n}),{6:71,8:4,9:5,10:6,14:7,16:r},s(i,[2,9]),{22:30,29:31,47:72,49:73,50:74,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},s(R,[2,54]),{22:30,24:l,29:31,36:75,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{22:30,24:l,29:31,36:77,50:28,63:76,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},s(o,[2,37],{65:f,66:I,67:A,68:S}),{19:78,22:79,24:d,82:F},{22:30,24:l,29:31,36:26,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$,86:82,87:y},{18:[1,83],43:w},{22:84,82:F},{22:30,24:l,29:31,36:85,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{22:30,24:l,29:31,36:86,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{22:30,24:l,29:31,36:87,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{22:30,24:l,29:31,36:88,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{26:[1,89],65:f,66:I,67:A,68:S},{24:[1,90],70:91},s(L,[2,64]),{4:92,6:3,8:4,9:5,10:6,14:7,16:r},{82:[1,93]},{20:U,22:30,24:l,29:31,36:77,50:28,63:95,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$,85:94},{20:U,22:30,24:l,29:31,36:77,50:28,63:95,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$,85:97},{29:98,77:u},{29:99,77:u},s(k,[2,27],{13:11,42:n}),s(i,[2,41],{48:100,43:[1,101],44:[1,102]}),s(C,[2,43]),s(C,[2,45],{51:[1,103]}),s(R,[2,56],{65:f,66:I,67:A,68:S}),s([5,26,31,42,45,64],[2,55],{43:P}),s(v,[2,86],{65:f,66:I,67:A,68:S}),s(x,[2,13],{21:105,33:106,34:H,37:G,38:W}),s(B,[2,17],{22:110,23:[1,111],27:[1,112],82:F,83:_}),{4:114,6:3,8:4,9:5,10:6,14:7,16:r,22:30,24:l,25:113,29:31,36:77,50:28,63:115,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},s([5,18,23,26,27,31,34,35,37,38,41,42,43,45,62,82,83],m),s(N,[2,89]),{19:116,22:79,24:d,82:F},s(N,[2,92],{83:_}),s([5,18,23,26,31,34,37,38,41,42,43,45,62,64,65,67,68],[2,58],{66:I}),s(L,[2,59]),s([5,18,23,26,31,34,37,38,41,42,43,45,62,64,67,68],[2,60],{65:f,66:I}),s([5,18,23,26,31,34,37,38,41,42,43,45,62,64,68],[2,61],{65:f,66:I,67:A}),s(L,[2,57]),{4:92,6:3,8:4,9:5,10:6,14:7,16:r,22:30,24:l,25:117,29:31,36:77,50:28,63:115,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},s(L,[2,63]),{26:[1,118]},s([5,18,23,26,27,31,34,35,37,38,41,42,43,44,45,51,62,64,65,66,67,68,69,82,83],[2,81]),{26:[1,119]},{26:[2,84],43:P},{22:30,24:l,29:31,36:77,50:28,63:120,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{26:[1,121]},s(i,[2,39]),s(i,[2,40]),s(i,[2,42]),{22:30,29:31,49:122,50:74,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{29:124,52:123,77:u},s(C,[2,46]),{22:30,29:31,50:125,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},s(x,[2,15],{33:126,34:H,37:G,38:W}),s(D,[2,28]),{19:127,22:79,24:d,82:F},{34:[1,128],39:[1,129],40:[1,130]},{34:[1,131],39:[1,132],40:[1,133]},s(B,[2,18],{83:_}),{22:134,82:F},{28:[1,135]},{26:[1,136]},{26:[1,137]},{26:[2,74],43:P},s(x,[2,14],{33:106,21:138,34:H,37:G,38:W}),{26:[1,139]},s(L,[2,66]),s(g,[2,83]),{26:[2,85],43:P},s(g,[2,82]),s(C,[2,44]),s(i,[2,47],{53:140,56:[1,141]}),{54:[1,142],55:[1,143]},s(v,[2,87]),s(D,[2,29]),{35:[1,144]},{19:145,22:79,24:d,82:F},{34:[1,146]},{34:[1,147]},{19:148,22:79,24:d,82:F},{34:[1,149]},{34:[1,150]},s(B,[2,19],{83:_}),{24:[1,151]},s(B,[2,20]),s(B,[2,21],{22:152,82:F}),s(x,[2,16],{33:126,34:H,37:G,38:W}),s(L,[2,62]),s(i,[2,48]),{57:[1,153],59:[1,154]},s(V,[2,49]),s(V,[2,50]),{22:30,24:l,29:31,36:155,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{35:[1,156]},{19:157,22:79,24:d,82:F},{19:158,22:79,24:d,82:F},{35:[1,159]},{19:160,22:79,24:d,82:F},{19:161,22:79,24:d,82:F},{29:162,77:u},s(B,[2,22],{83:_}),{29:124,52:163,77:u},{29:124,52:164,77:u},s(D,[2,30],{65:f,66:I,67:A,68:S}),{22:30,24:l,29:31,36:165,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{35:[1,166]},{35:[1,167]},{22:30,24:l,29:31,36:168,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{35:[1,169]},{35:[1,170]},{26:[1,171]},{58:[1,172]},{58:[1,173]},s(D,[2,31],{65:f,66:I,67:A,68:S}),{22:30,24:l,29:31,36:174,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{22:30,24:l,29:31,36:175,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},s(D,[2,32],{65:f,66:I,67:A,68:S}),{22:30,24:l,29:31,36:176,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},{22:30,24:l,29:31,36:177,50:28,71:h,72:32,73:33,74:34,75:35,76:36,77:u,78:b,79:p,80:E,81:O,82:T,84:$},s(B,[2,23]),s(i,[2,51]),s(i,[2,52]),s(D,[2,33],{65:f,66:I,67:A,68:S}),s(D,[2,35],{65:f,66:I,67:A,68:S}),s(D,[2,34],{65:f,66:I,67:A,68:S}),s(D,[2,36],{65:f,66:I,67:A,68:S})],defaultActions:{9:[2,1]},parseError:function(e,s){if(!s.recoverable)throw new Error(e);this.trace(e)},parse:function(e){function s(){var e;return e=p.lex()||u,"number"!=typeof e&&(e=r.symbols_[e]||e),e}var r=this,a=[0],t=[null],n=[],i=this.table,c="",o=0,l=0,h=0,u=1,b=n.slice.call(arguments,1),p=Object.create(this.lexer),E={yy:{}};for(var O in this.yy)Object.prototype.hasOwnProperty.call(this.yy,O)&&(E.yy[O]=this.yy[O]);p.setInput(e,E.yy),E.yy.lexer=p,E.yy.parser=this,void 0===p.yylloc&&(p.yylloc={});var T=p.yylloc;n.push(T);var $=p.options&&p.options.ranges;"function"==typeof E.yy.parseError?this.parseError=E.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;for(var y,k,R,w,N,f,I,A,S,L={};;){if(R=a[a.length-1],this.defaultActions[R]?w=this.defaultActions[R]:(null!==y&&void 0!==y||(y=s()),w=i[R]&&i[R][y]),void 0===w||!w.length||!w[0]){var g="";S=[];for(f in i[R])this.terminals_[f]&&f>2&&S.push("'"+this.terminals_[f]+"'");g=p.showPosition?"Parse error on line "+(o+1)+":\n"+p.showPosition()+"\nExpecting "+S.join(", ")+", got '"+(this.terminals_[y]||y)+"'":"Parse error on line "+(o+1)+": Unexpected "+(y==u?"end of input":"'"+(this.terminals_[y]||y)+"'"),this.parseError(g,{text:p.match,token:this.terminals_[y]||y,line:p.yylineno,loc:T,expected:S})}if(w[0]instanceof Array&&w.length>1)throw new Error("Parse Error: multiple actions possible at state: "+R+", token: "+y);switch(w[0]){case 1:a.push(y),t.push(p.yytext),n.push(p.yylloc),a.push(w[1]),y=null,k?(y=k,k=null):(l=p.yyleng,c=p.yytext,o=p.yylineno,T=p.yylloc,h>0&&h--);break;case 2:if(I=this.productions_[w[1]][1],L.$=t[t.length-I],L._$={first_line:n[n.length-(I||1)].first_line,last_line:n[n.length-1].last_line,first_column:n[n.length-(I||1)].first_column,last_column:n[n.length-1].last_column},$&&(L._$.range=[n[n.length-(I||1)].range[0],n[n.length-1].range[1]]),void 0!==(N=this.performAction.apply(L,[c,l,o,E.yy,w[1],t,n].concat(b))))return N;I&&(a=a.slice(0,-1*I*2),t=t.slice(0,-1*I),n=n.slice(0,-1*I)),a.push(this.productions_[w[1]][0]),t.push(L.$),n.push(L._$),A=i[a[a.length-2]][a[a.length-1]],a.push(A);break;case 3:return!0}}return!0}};return e.prototype=M,M.Parser=e,new e}();"undefined"!=typeof require&&"undefined"!=typeof exports&&(exports.parser=parser,exports.Parser=parser.Parser,exports.parse=function(){return parser.parse.apply(parser,arguments)},exports.main=function(e){e[1]||(console.log("Usage: "+e[0]+" FILE"),process.exit(1));var s=require("fs").readFileSync(require("path").normalize(e[1]),"utf8");return exports.parser.parse(s)},"undefined"!=typeof module&&require.main===module&&exports.main(process.argv.slice(1)))}).call(this,require("_process"))},{_process:4,fs:2,path:3}],7:[function(require,module,exports){(function(){var t;t=function(){function t(t,e){var o,n;for(null==e&&(e={}),this.sql=t,this.preserveWhitespace=e.preserveWhitespace||!1,this.tokens=[],this.currentLine=1,n=0;this.chunk=t.slice(n);){if((o=this.keywordToken()||this.starToken()||this.booleanToken()||this.functionToken()||this.windowExtension()||this.sortOrderToken()||this.seperatorToken()||this.operatorToken()||this.mathToken()||this.dotToken()||this.conditionalToken()||this.subSelectOpToken()||this.subSelectUnaryOpToken()||this.numberToken()||this.stringToken()||this.parameterToken()||this.parensToken()||this.whitespaceToken()||this.literalToken())<1)throw new Error("NOTHING CONSUMED: Stopped at - '"+this.chunk.slice(0,30)+"'");n+=o}this.token("EOF",""),this.postProcess()}var e,o,n,r,i,s,h,k,p,u,T,c,F,m,z,a,R;return t.prototype.postProcess=function(){var t,e,o,n,r,i,s;for(i=this.tokens,s=[],t=n=0,r=i.length;n<r;t=++n)o=i[t],"STAR"===o[0]?(e=this.tokens[t+1],"SEPARATOR"!==e[0]&&"FROM"!==e[0]?s.push(o[0]="MATH_MULTI"):s.push(void 0)):s.push(void 0);return s},t.prototype.token=function(t,e){return this.tokens.push([t,e,this.currentLine])},t.prototype.tokenizeFromRegex=function(t,e,o,n,r){var i,s;return null==o&&(o=0),null==n&&(n=o),null==r&&(r=!0),(i=e.exec(this.chunk))?(s=i[o],r&&this.token(t,s),i[n].length):0},t.prototype.tokenizeFromWord=function(t,e){var o,n;return null==e&&(e=t),e=this.regexEscape(e),n=/^\w+$/.test(e)?new RegExp("^("+e+")\\b","ig"):new RegExp("^("+e+")","ig"),(o=n.exec(this.chunk))?(this.token(t,o[1]),o[1].length):0},t.prototype.tokenizeFromList=function(t,e){var o,n,r,i;for(n=0,r=0,i=e.length;r<i&&(o=e[r],!((n=this.tokenizeFromWord(t,o))>0));r++);return n},t.prototype.keywordToken=function(){return this.tokenizeFromWord("SELECT")||this.tokenizeFromWord("DISTINCT")||this.tokenizeFromWord("FROM")||this.tokenizeFromWord("WHERE")||this.tokenizeFromWord("GROUP")||this.tokenizeFromWord("ORDER")||this.tokenizeFromWord("BY")||this.tokenizeFromWord("HAVING")||this.tokenizeFromWord("LIMIT")||this.tokenizeFromWord("JOIN")||this.tokenizeFromWord("LEFT")||this.tokenizeFromWord("RIGHT")||this.tokenizeFromWord("INNER")||this.tokenizeFromWord("OUTER")||this.tokenizeFromWord("ON")||this.tokenizeFromWord("AS")||this.tokenizeFromWord("UNION")||this.tokenizeFromWord("ALL")||this.tokenizeFromWord("LIMIT")||this.tokenizeFromWord("OFFSET")||this.tokenizeFromWord("FETCH")||this.tokenizeFromWord("ROW")||this.tokenizeFromWord("ROWS")||this.tokenizeFromWord("ONLY")||this.tokenizeFromWord("NEXT")||this.tokenizeFromWord("FIRST")},t.prototype.dotToken=function(){return this.tokenizeFromWord("DOT",".")},t.prototype.operatorToken=function(){return this.tokenizeFromList("OPERATOR",T)},t.prototype.mathToken=function(){return this.tokenizeFromList("MATH",r)||this.tokenizeFromList("MATH_MULTI",i)},t.prototype.conditionalToken=function(){return this.tokenizeFromList("CONDITIONAL",p)},t.prototype.subSelectOpToken=function(){return this.tokenizeFromList("SUB_SELECT_OP",z)},t.prototype.subSelectUnaryOpToken=function(){return this.tokenizeFromList("SUB_SELECT_UNARY_OP",a)},t.prototype.functionToken=function(){return this.tokenizeFromList("FUNCTION",u)},t.prototype.sortOrderToken=function(){return this.tokenizeFromList("DIRECTION",c)},t.prototype.booleanToken=function(){return this.tokenizeFromList("BOOLEAN",e)},t.prototype.starToken=function(){return this.tokenizeFromRegex("STAR",F)},t.prototype.seperatorToken=function(){return this.tokenizeFromRegex("SEPARATOR",k)},t.prototype.literalToken=function(){return this.tokenizeFromRegex("LITERAL",n,1,0)},t.prototype.numberToken=function(){return this.tokenizeFromRegex("NUMBER",s)},t.prototype.parameterToken=function(){return this.tokenizeFromRegex("PARAMETER",h)},t.prototype.stringToken=function(){return this.tokenizeFromRegex("STRING",m,1,0)||this.tokenizeFromRegex("DBLSTRING",o,1,0)},t.prototype.parensToken=function(){return this.tokenizeFromRegex("LEFT_PAREN",/^\(/)||this.tokenizeFromRegex("RIGHT_PAREN",/^\)/)},t.prototype.windowExtension=function(){var t;return(t=/^\.(win):(length|time)/i.exec(this.chunk))?(this.token("WINDOW",t[1]),this.token("WINDOW_FUNCTION",t[2]),t[0].length):0},t.prototype.whitespaceToken=function(){var t,e,o;return(t=R.exec(this.chunk))?(o=t[0],e=o.replace(/[^\n]/,"").length,this.currentLine+=e,this.preserveWhitespace&&this.token(name,o),o.length):0},t.prototype.regexEscape=function(t){return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")},u=["AVG","COUNT","MIN","MAX","SUM"],c=["ASC","DESC"],T=["=","!=",">=",">","<=","<>","<","LIKE","IS NOT","IS"],z=["IN","NOT IN","ANY","ALL","SOME"],a=["EXISTS"],p=["AND","OR"],e=["TRUE","FALSE","NULL"],r=["+","-"],i=["/","*"],F=/^\*/,k=/^,/,R=/^[ \n\r]+/,n=/^`?([a-z_][a-z0-9_]{0,})`?/i,h=/^\$[0-9]+/,s=/^[0-9]+(\.[0-9]+)?/,m=/^'([^\\']*(?:\\.[^\\']*)*)'/,o=/^"([^\\"]*(?:\\.[^\\"]*)*)"/,t}(),exports.tokenize=function(e,o){return new t(e,o).tokens}}).call(this)},{}],8:[function(require,module,exports){(function(){var t;t=function(t){var n;return function(){var i,r,o,e;for(o=t.split("\n"),e=[],i=0,r=o.length;i<r;i++)n=o[i],e.push("  "+n);return e}().join("\n")},exports.Select=function(){function n(t,n,i,r,o){this.fields=t,this.source=n,this.distinct=null!=i&&i,this.joins=null!=r?r:[],this.unions=null!=o?o:[],this.order=null,this.group=null,this.where=null,this.limit=null}return n.prototype.toString=function(){var n,i,r,o,e,u,s,h,l;for(i=["SELECT "+this.fields.join(", ")],i.push(t("FROM "+this.source)),h=this.joins,o=0,u=h.length;o<u;o++)n=h[o],i.push(t(n.toString()));for(this.where&&i.push(t(this.where.toString())),this.group&&i.push(t(this.group.toString())),this.order&&i.push(t(this.order.toString())),this.limit&&i.push(t(this.limit.toString())),l=this.unions,e=0,s=l.length;e<s;e++)r=l[e],i.push(r.toString());return i.join("\n")},n}(),exports.SubSelect=function(){function n(t,n){this.select=t,this.name=null!=n?n:null}return n.prototype.toString=function(){var n;return n=[],n.push("("),n.push(t(this.select.toString())),n.push(this.name?") "+this.name.toString():")"),n.join("\n")},n}(),exports.Join=function(){function n(t,n,i,r){this.right=t,this.conditions=null!=n?n:null,this.side=null!=i?i:null,this.mode=null!=r?r:null}return n.prototype.toString=function(){var n;return n="",null!=this.side&&(n+=this.side+" "),null!=this.mode&&(n+=this.mode+" "),n+"JOIN "+this.right+"\n"+t("ON "+this.conditions)},n}(),exports.Union=function(){function t(t,n){this.query=t,this.all=null!=n&&n}return t.prototype.toString=function(){return"UNION"+(this.all?" ALL":"")+"\n"+this.query.toString()},t}(),exports.LiteralValue=function(){function t(t,n){this.value=t,this.value2=null!=n?n:null,this.value2?(this.nested=!0,this.values=this.value.values,this.values.push(n)):(this.nested=!1,this.values=[this.value])}return t.prototype.toString=function(){return"`"+this.values.join(".")+"`"},t}(),exports.StringValue=function(){function t(t,n){this.value=t,this.quoteType=null!=n?n:"''"}return t.prototype.toString=function(){return""+this.quoteType+this.value+this.quoteType},t}(),exports.NumberValue=function(){function t(t){this.value=Number(t)}return t.prototype.toString=function(){return this.value.toString()},t}(),exports.ListValue=function(){function t(t){this.value=t}return t.prototype.toString=function(){return"("+this.value.join(", ")+")"},t}(),exports.ParameterValue=function(){function t(t){this.value=t,this.index=parseInt(t.substr(1),10)-1}return t.prototype.toString=function(){return""+this.value},t}(),exports.ArgumentListValue=function(){function t(t,n){this.value=t,this.distinct=null!=n&&n}return t.prototype.toString=function(){return this.distinct?"DISTINCT "+this.value.join(", "):""+this.value.join(", ")},t}(),exports.BooleanValue=function(){function t(t){this.value=function(){switch(t.toLowerCase()){case"true":return!0;case"false":return!1;default:return null}}()}return t.prototype.toString=function(){return null!=this.value?this.value.toString().toUpperCase():"NULL"},t}(),exports.FunctionValue=function(){function t(t,n,i){this.name=t,this.arguments=null!=n?n:null,this.udf=null!=i&&i}return t.prototype.toString=function(){return this.arguments?this.name.toUpperCase()+"("+this.arguments.toString()+")":this.name.toUpperCase()+"()"},t}(),exports.Order=function(){function t(t,n){this.orderings=t,this.offset=n}return t.prototype.toString=function(){return"ORDER BY "+this.orderings.join(", ")+(this.offset?"\n"+this.offset.toString():"")},t}(),exports.OrderArgument=function(){function t(t,n){this.value=t,this.direction=null!=n?n:"ASC"}return t.prototype.toString=function(){return this.value+" "+this.direction},t}(),exports.Offset=function(){function t(t,n){this.row_count=t,this.limit=n}return t.prototype.toString=function(){return"OFFSET "+this.row_count+" ROWS"+(this.limit?"\nFETCH NEXT "+this.limit+" ROWS ONLY":"")},t}(),exports.Limit=function(){function t(t,n){this.value=t,this.offset=n}return t.prototype.toString=function(){return"LIMIT "+this.value+(this.offset?"\nOFFSET "+this.offset:"")},t}(),exports.Table=function(){function t(t,n,i,r,o){this.name=t,this.alias=null!=n?n:null,this.win=null!=i?i:null,this.winFn=null!=r?r:null,this.winArg=null!=o?o:null}return t.prototype.toString=function(){return this.win?this.name+"."+this.win+":"+this.winFn+"("+this.winArg+")":this.alias?this.name+" AS "+this.alias:this.name.toString()},t}(),exports.Group=function(){function t(t){this.fields=t,this.having=null}return t.prototype.toString=function(){var t;return t=["GROUP BY "+this.fields.join(", ")],this.having&&t.push(this.having.toString()),t.join("\n")},t}(),exports.Where=function(){function t(t){this.conditions=t}return t.prototype.toString=function(){return"WHERE "+this.conditions},t}(),exports.Having=function(){function t(t){this.conditions=t}return t.prototype.toString=function(){return"HAVING "+this.conditions},t}(),exports.Op=function(){function t(t,n,i){this.operation=t,this.left=n,this.right=i}return t.prototype.toString=function(){return"("+this.left+" "+this.operation.toUpperCase()+" "+this.right+")"},t}(),exports.UnaryOp=function(){function t(t,n){this.operator=t,this.operand=n}return t.prototype.toString=function(){return"("+this.operator.toUpperCase()+" "+this.operand+")"},t}(),exports.Field=function(){function t(t,n){this.field=t,this.name=null!=n?n:null}return t.prototype.toString=function(){return this.name?this.field+" AS "+this.name:this.field.toString()},t}(),exports.Star=function(){function t(){}return t.prototype.toString=function(){return"*"},t.prototype.star=!0,t}()}).call(this)},{}],9:[function(require,module,exports){(function(){var r;r=function(){var r;return r=require("./compiled_parser").parser,r.lexer={lex:function(){var r,t;return t=this.tokens[this.pos++]||[""],r=t[0],this.yytext=t[1],this.yylineno=t[2],r},setInput:function(r){return this.tokens=r,this.pos=0},upcomingInput:function(){return""}},r.yy=require("./nodes"),r},exports.parser=r(),exports.parse=function(t){return r().parse(t)}}).call(this)},{"./compiled_parser":6,"./nodes":8}],10:[function(require,module,exports){(function(){exports.lexer=require("./lexer"),exports.parser=require("./parser"),exports.nodes=require("./nodes"),exports.parse=function(e){return exports.parser.parse(exports.lexer.tokenize(e))}}).call(this)},{"./lexer":7,"./nodes":8,"./parser":9}]},{},[1])(1)});