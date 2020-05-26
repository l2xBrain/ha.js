import { join } from 'path';
import dva from 'dva';
import { createMemoryHistory } from 'history';
import { parse as parseQs, ParsedUrlQuery } from 'querystring'
import { format as formatUrl, parse as parseUrl, UrlWithParsedQuery } from 'url'
import loadConfig from './config'
import { CLIENT_PUBLIC_FILES_PATH, SERVER_DIRECTORY, PAGES_MANIFEST } from '../lib/constants';
import Router from '../router';


export default class SSRController {
    constructor({
        dir = '.',
        staticMarkup = false,
        quiet = false,
        conf = null,
        dev = false,
        customServer = true,
    }) {
        this.dir = resolve(dir);
        this.hachiConfig = loadConfig(this.dir, conf);
        this.distDir = join(this.dir, this.hachiConfig.distDir);
        this.publicDir = join(this.dir, CLIENT_PUBLIC_FILES_PATH);

        this.serverBuildDir = join(this.distDir,SERVER_DIRECTORY);

        const pagesManifestPath = join(this.serverBuildDir, PAGES_MANIFEST)

        if (!dev) {
            this.pagesManifest = require(pagesManifestPath)
        }
        this.router = new Router(this.generateRoutes());

    }

    generateRoutes() {
        return [
            {
                path: '/',
                exact: true,
                getComponent: (locale) => {
                    return <div>getComponent</div>
                }
            }
        ]
    }

    async run(
        req,
        res,
        parsedUrl
      ) {
        this.initApp(this.router);
        const app = this.app;
        const App = app.start();
        try {
          const matched = await this.router.execute(req, res, parsedUrl)
          if (matched) {
            return
          }
        } catch (err) {
          if (err.code === 'DECODE_FAILED') {
            res.statusCode = 400
            return this.renderError(null, req, res, '/_error', {})
          }
          throw err
        }
    
        await this.render404(req, res, parsedUrl)
    }

    initApp(router, initModel) {
        // 初始化DvaApp
        const history = createMemoryHistory();
        history.push(this.ctx.url);
        let initialState = this.initLocale(this.initialState);

        this.app = dva({history, initialState, onError: e => {
            console.log(e.message);
        }});
        this.app.router(router);

        if (initModel.length) {
            initModel.forEach(model => {
                registerModel(this.app, model);
            });
        }

    }

    async handleRequest(
        req,
        res,
        parsedUrl
      ){
        // Parse url if parsedUrl not provided
        if (!parsedUrl || typeof parsedUrl !== 'object') {
          const url = req.url
          parsedUrl = parseUrl(url, true)
        }

        // 检测是否为数据请求
        if (this.hachiConfig.apiReg.test(parsedUrl.pathname)) {
            console.log('api接口', parsedUrl.pathname);
            
        }
    
        // Parse the querystring ourselves if the user doesn't handle querystring parsing
        if (typeof parsedUrl.query === 'string') {
          parsedUrl.query = parseQs(parsedUrl.query)
        }
    
        res.statusCode = 200
        try {
          return await this.run(req, res, parsedUrl)
        } catch (err) {
          this.logError(err)
          res.statusCode = 500
          res.end('Internal Server Error')
        }
      }
    
}