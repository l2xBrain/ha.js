import * as React from 'react';
import { join, resolve } from 'path';
import fs from 'fs';
import dva from 'dva';
import Loadable from '../../../loadable';
import { parse as parseQs, ParsedUrlQuery } from 'querystring'
import { format as formatUrl, parse as parseUrl } from 'url'
import { renderToString } from 'react-dom/server';
import loadConfig from './config'
import { CLIENT_PUBLIC_FILES_PATH, SERVER_DIRECTORY, ROUTES_MANIFEST, BUILD_MANIFEST, BLOCKED_PAGES, BLOCKED_PAGES_REG } from '../lib/constants';
import { registerModel, sendHTML } from '../lib/utils';

export default class Controller {
    constructor({
        dir = '.',
        staticMarkup = false,
        quiet = false,
        conf = null,
        dev = false,
        customServer = true,
    }) {
        const rootDir = resolve(dir);
        this.haCon = loadConfig(rootDir, conf);
        this.distDir = join(rootDir, this.haCon.distDir);
        const Document = require(join(this.distDir, 'server/_document.js')).default;
        this.clientBundles = require(join(this.distDir, 'react-loadable.json'));
        const Ssr = require(join(this.distDir, 'server/server.js')).default;
        this.ssr = new Ssr({
          rootDir,
          distDir: this.distDir,
          Document,
          clientBundles: this.clientBundles
        });
    }

    preload = async () => {
      await this.ssr.Loadable.preloadAll();
    }

    handleRequest = async (req, res, parsedUrl) => {
        // Parse url if parsedUrl not provided
        if (!parsedUrl || typeof parsedUrl !== 'object') {
          parsedUrl = parseUrl(req.url, true)
        }

        // 检测是否为数据请求
        if (this.haCon.apiReg.test(parsedUrl.pathname)) {
            console.log('api接口', parsedUrl.pathname);
            res.end();
            return;
        }

        // 是否为静态文件
        if (parsedUrl.pathname.startsWith('/dist')) {
          res.write(
            fs.readFileSync(
              join(
                this.distDir,
                parsedUrl.pathname.slice('/dist/'.length)
              ),
              'utf8'
            )
          )
          return res.end()
        }

        if (parsedUrl.pathname === '/favicon.ico') {
          res.end();
          return;
        }
    
        // Parse the querystring ourselves if the user doesn't handle querystring parsing
        if (typeof parsedUrl.query === 'string') {
          parsedUrl.query = parseQs(parsedUrl.query)
        }

    
        try {
          return await this.ssr.run(req, res, parsedUrl)
        } catch (err) {
          console.error(err)
          res.statusCode = 500
          res.end('Internal Server Error')
        }
    }
    
}