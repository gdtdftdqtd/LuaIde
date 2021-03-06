import vscode = require('vscode');
var fs = require('fs');
var path = require('path');
var os = require('os');
import child_process = require('child_process');
import { getConfigDir } from "../../Common"

export class LuaIdeConfigManager {
    private macroConfig: Map<string, string>;
    //模板文件夹路径
    public luaTemplatesDir: string;
    public luaOperatorCheck: boolean;
    public luaFunArgCheck: boolean;

    constructor() {
        this.configInit();
        this.copyConfig();
        this.showIndex();

    }
    public showIndex(){
        var extensionPath = vscode.extensions.getExtension("kangping.luaide").extensionPath
                        extensionPath = path.join(extensionPath, "images", "index.html")
                        var previewUri = vscode.Uri.file(extensionPath);
                        vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.One, "LuaIde介绍").then(value => {

                        })
    }

    public configInit() {


        var luaideConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("luaide")

        var macroListConfig: Array<any> = luaideConfig.get<Array<any>>("macroList");
        this.luaOperatorCheck = luaideConfig.get<boolean>("luaOperatorCheck")
        this.luaFunArgCheck = luaideConfig.get<boolean>("luaFunArgCheck")
        if (this.luaOperatorCheck == null) {
            this.luaOperatorCheck = true;
        }
        if (this.luaFunArgCheck == null) {
            this.luaFunArgCheck = true

        }

        this.macroConfig = new Map<string, string>();

        if (macroListConfig != null) {
            macroListConfig.forEach(element => {
                this.macroConfig.set(element.name, element.value)
            });
            //console.log(this.macroConfig)
        }

        var luaTemplatesDir: string = luaideConfig.get<string>("luaTemplatesDir")
        if (luaTemplatesDir) {
            this.luaTemplatesDir = luaTemplatesDir;
        } else {
            this.luaTemplatesDir = null;
        }
    }
    public showRecharge() {
        var date: Date = new Date();
        var day = date.getDate();
        if (day == 11) {
            var extensionPath = vscode.extensions.getExtension("kangping.luaide").extensionPath

            var userPath = getConfigDir()
            if (!fs.existsSync(userPath)) {
                fs.mkdirSync(userPath, '0755');
            }
            var configFile = path.join(userPath, "donate")
            if (fs.existsSync(configFile)) {
                var contentText = fs.readFileSync(path.join(configFile), 'utf-8');
                if (date.getMonth() + "" == contentText) {
                    return
                }
            }
            try {
                fs.writeFileSync(configFile, date.getMonth() + "");
            } catch (err) {

            }



            vscode.window.showInformationMessage("您愿意为luaIde捐献吗?", true, {
                title: "好的",
                isCloseAffordance: true,
                id: 1
            }, {
                    title: "不用了",
                    isCloseAffordance: true,
                    id: 2
                }).then(value => {
                    if (value.id == 1) {
                        var extensionPath = vscode.extensions.getExtension("kangping.luaide").extensionPath
                        extensionPath = path.join(extensionPath, "images", "donate.html")
                        var previewUri = vscode.Uri.file(extensionPath);
                        vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.One, "谢谢您的支持").then(value => {

                        })

                    }


                })

        }

    }

    public replaceConfigValue(text: string, moduleName: string) {

        if (moduleName) {
            text = text.replace(new RegExp("{moduleName}", "gm"), moduleName)
        }
        var date: Date = new Date();
        var dateStr: string = this.datepattern(date, "yyyy-MM-dd hh:mm:ss")
        text = text.replace(new RegExp("{time}", "gm"), dateStr)
        this.macroConfig.forEach((v, k) => {
            text = text.replace(new RegExp("{" + k + "}", "gm"), v)
        })
        return text;
    }

    /**       
 * 对Date的扩展，将 Date 转化为指定格式的String       
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符       
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)       
 * eg:       
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423       
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04       
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04       
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04       
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18       
 */
    public datepattern(date: Date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份           
            "d+": date.getDate(), //日           
            "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时           
            "H+": date.getHours(), //小时           
            "m+": date.getMinutes(), //分           
            "s+": date.getSeconds(), //秒           
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度           
            "S": date.getMilliseconds() //毫秒           
        };
        var week = {
            "0": "/u65e5",
            "1": "/u4e00",
            "2": "/u4e8c",
            "3": "/u4e09",
            "4": "/u56db",
            "5": "/u4e94",
            "6": "/u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }



    private copyConfig() {

        //这里只生成一些配置信息放入文件夹用于debug 调试时获取
        //获取插件的路径
        var extensionPath = vscode.extensions.getExtension("kangping.luaide").extensionPath

        var userPath = getConfigDir()
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath, '0755');
        }
        var configFile = path.join(userPath, "luaideConfig")
        if (!fs.existsSync(configFile)) {
            try {
                fs.writeFileSync(configFile, extensionPath);
            } catch (err) {

            }
        } else {
            var contentText = fs.readFileSync(path.join(configFile), 'utf-8');
            if (contentText != extensionPath) {
                try {
                    fs.writeFileSync(configFile, extensionPath);
                } catch (err) {

                }
            }
        }
    }

}
