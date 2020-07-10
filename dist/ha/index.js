#!/usr/bin/env node
"use strict";exports.__esModule=true;exports.Loadable=void 0;var _arg=_interopRequireDefault(require("arg"));var Loadable=_interopRequireWildcard(require("react-loadable"));exports.Loadable=Loadable;var _build=_interopRequireDefault(require("./cli/build"));var _dev=_interopRequireDefault(require("./cli/dev"));var _start=_interopRequireDefault(require("./cli/start"));function _getRequireWildcardCache(){if(typeof WeakMap!=="function")return null;var cache=new WeakMap();_getRequireWildcardCache=function(){return cache;};return cache;}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache();if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}const args=(0,_arg.default)({// Types
'--version':Boolean,'--help':Boolean,'--inspect':Boolean,// Aliases
'-v':'--version','-h':'--help'},{permissive:true});const commands={build:_build.default,dev:_dev.default,start:_start.default};const defaultCommand='dev';const foundCommand=Boolean(commands[args._[0]]);const command=foundCommand?args._[0]:defaultCommand;const forwardedArgs=foundCommand?args._.slice(1):args._;const defaultEnv=command==='dev'?'development':'production';process.env.NODE_ENV=process.env.NODE_ENV||defaultEnv;commands[command](forwardedArgs);