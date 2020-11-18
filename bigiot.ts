/**
 * MakeCode extension for Bigiot.net 
 * 
 * update: 2020-10-4
 * version:1.01
 */
//% color=#35e3af icon="\uf1ec" block="Bigiot_net"

enum DateTimeFormat {
    DateSimple = 0,  
    TimeSimple = 1, 
    Date = 2, 
    Time = 3,
    DateTimeStamp = 4,
    DateTime = 5
}
let DateTimeFormats=["Ymd","His","Y-m-d","H:i:s","stamp","Y-m-d H:i:s"]

namespace Bigiot_net {
    let listener:boolean=false //监听网站发来命令的信号量
    let last_cmd_successful: boolean =false
    let serverTime: string=""
    let last_cmd: string =""
    let bigiot_connected:boolean = false
    const IO_CHECK_TIMEOUT =500
    const BIGIOT_CHECK_TIMEOUT =5000
    const BIGIOT_SERVERTIME_TIMEOUT =1000
    const BIGIOT_WELCOME_CHECK_TIMEOUT=10000 //等待连接超时时间
    //const BIGIOT_CHECKIN_OUT_CHECK_TIMEOUT=10000 //等待连接超时时间

    //截取子串
    function subStr(value: string,beginStr:string,endStr:string): string {
        let begin = value.indexOf(beginStr)
        let end = value.indexOf(endStr)
        if (begin != -1 && end != -1) {
            return value.substr(begin + beginStr.length, end - begin -  beginStr.length)
        }
        else
            return ""
    }
     /**
    *检查最近一步操作是否成功?
    */
    //% block="最近一步操作是否成功?"
    export function isLastCmdSuccessful():boolean {
        return last_cmd_successful
    }

    /**
    * 读取串口数据，判断是否存在某个特定表示成功字符串，默认等待时间为10s，失败字符串为"ERROR"、"FAIL"
    */
    //% block="存在表示成功的字符串|字符串 = %waitForWords|超时 %timeout"
    //% waitForWords.defl="string"
    //% timeout.defl=30000
    function waitResponse(waitForWords : string,timeout : number=10000): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
			//取前200个字符
            if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
            //如果返回中有等待的信息
            if (serial_str.includes(waitForWords)) {
                basic.pause(500)
                result = true
                break
            }
			if (input.runningTime() - time > timeout) {
                break
            }
        }
        return result
    }
    /**
    * 连接到Bigiot.net服务器，时限为10s，是否成功可以从"已连到Bigiot服务器"中获取，同时释放信号量。
    */
    //% block="Bigiot连接到服务器|域名或IP地址 = %url|端口 = %port"
    //% url.defl=www.bigiot.net
    //% port.defl=8181
    export function connectToBigiotServer(url: string="www.bigiot.net", port: number=8181):void {
        //默认已经连接上了WIFI
        ESP8266.sendAT("AT+CIPSTART=\"TCP\",\""+url+"\","+port,IO_CHECK_TIMEOUT)
        last_cmd_successful=waitResponse("WELCOME",BIGIOT_WELCOME_CHECK_TIMEOUT)
        bigiot_connected=last_cmd_successful
        //登录后开始监听网站发来的命令
        listener=true  //释放信号量
    }

    /**
    *检查ESP8266是否连接到了Bigiot服务器
    */
    //% block="已连接到Bigiot服务器"
    export function isBigiotConnected():boolean {
        return bigiot_connected
    }

    /**
    * Bigiot发送心跳包
    */
    //% block="Bigiot发送心跳包"
    export function sendBigiotBeat(): void {
        while(~listener){ //等待释放信号量
            control.waitMicros(10)
        }
        listener=false//占有信号量
        let cmd:string="{\"M\":\"beat\"}\n"
        ESP8266.sendAT("AT+CIPSEND="+cmd.length)
        ESP8266.sendCMD(cmd)
        last_cmd_successful=!waitResponse("ERROR",IO_CHECK_TIMEOUT)
        listener=true//释放信号量
    }


     /**
    * Bigiot设备退出登录
    */
    //% block="Bigiot设备强制下线|设备ID %DID|APIKey %APIKey"
    //DID.defl=0
    //APIKey.defl=0
    export function checkoutBigiot(DID: string, APIKey: string): void {
        while(~listener){ //等待释放信号量
            control.waitMicros(10)
        }
        listener=false    //占有信号量
        let cmd:string="{\"M\":\"checkout\", \"ID\":\"" + DID + "\", \"K\":\"" + APIKey + "\"}\n"
        ESP8266.sendAT("AT+CIPSEND="+cmd.length)
        ESP8266.sendCMD(cmd)
        last_cmd_successful=waitResponse("checkout",BIGIOT_CHECK_TIMEOUT)
        listener=true    //释放信号量
    }

    /**
    * Bigiot设备登录
    */
    //% block="Bigiot设备登录|设备ID %DID|APIKey %APIKey"
    //DID.defl=0
    //APIKey.defl=0
    export function checkinBigiot(DID: string, APIKey: string): void {
        while(~listener){ //等待释放信号量
            control.waitMicros(10)
        }
        listener=false    //占有信号量
        let cmd:string="{\"M\":\"checkin\", \"ID\":\"" + DID + "\", \"K\":\"" + APIKey + "\"}\n"
        ESP8266.sendAT("AT+CIPSEND="+cmd.length)
        ESP8266.sendCMD(cmd)
        last_cmd_successful=waitResponse("checkinok",BIGIOT_CHECK_TIMEOUT)
        listener=true    //释放信号量
    }


    /**
    * Bigiot发送一项实时数据
    */
    //% block="发送实时数据|设备ID %DID|接口ID %IID|接口值 %value" blockExternalInputs=true
    //更新一项数据
    export function updateBigiot1(DID: string, IID: string, value: string): void {
        while(~listener){ //等待释放信号量
            control.waitMicros(10)
        }
        listener=false    //占有信号量
        let cmd:string="{\"M\":\"update\",\"ID\":\"" + DID + "\",\"V\":{\"" + IID + "\":\"" + value + "\"}}\n" 
        ESP8266.sendAT("AT+CIPSEND="+cmd.length)
        ESP8266.sendCMD(cmd)
        last_cmd_successful=waitResponse("SEND OK",IO_CHECK_TIMEOUT)
        listener=true     //释放信号量
    }
    /**
    * Bigiot发送两项实时数据
    */
    //% block="发送实时数据|设备ID %DID|接口1ID %IID1|接口1值 %value1|接口2ID %IID2|接口2值 %value2" blockExternalInputs=true
    //更新两项数据
    export function updateBigiot2(DID: string, IID1: string, value1: string, IID2: string, value2: string): void {
        while(~listener){ //等待释放信号量
            control.waitMicros(10)
        }
        listener=false    //占有信号量
        let cmd:string="{\"M\":\"update\",\"ID\":\"" + DID + "\",\"V\":{\"" + IID1 + "\":\"" + value1 + "\",\"" + IID2 + "\":\"" + value2 + "\"}}\n" 
        ESP8266.sendAT("AT+CIPSEND="+cmd.length)
        ESP8266.sendCMD(cmd)
        last_cmd_successful=waitResponse("SEND OK",IO_CHECK_TIMEOUT)
        listener=true     //释放信号量
    }

    /**
    * 读取串口数据，判断是否存在Bigiot命令词，默认读取时长为3s
    */
    //% block="不断读取串口，检查Bigiot是否发来命令|时长:%timeout"
    //% timeout.defl=3000
    export function waitforCommand(timeout : number=3000): boolean {
        let serial_str: string = ""
        let result: boolean = false 
        while(~listener){ //等待释放信号量
            control.waitMicros(10)
        }
        listener=false    //占有信号量
        let time: number = input.runningTime()
        while (true) {
                serial_str += serial.readString()
			    //取前的200个字符
                if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
			    //如果返回中有命令词
                let temp_str:string=subStr(serial_str,"\"C\":\"","\",\"T\"")
                if (temp_str.compare("")!=0) {
                    last_cmd=temp_str
                    result = true
                    break
			    //如超过时长
                }
                if (input.runningTime() - time > timeout) {
                    break
                }
        }
        listener=true     //释放信号量
        return result
    }

    /**
    *最新Bigiot发来的命令词
    */
    //% block="最新Bigiot发来的命令词"
    export function lastCmd():string {
        return last_cmd
    }


    /**
    * 获取服务器日期/时间
    */
    //% block="获取服务器日期/时间|格式：%format"
    //% format.defl=DateTimeFormat.DateTime
    export function checkServerDateBigiot(format:DateTimeFormat): void {
        while(~listener){ //等待释放信号量
            control.waitMicros(10)
        }
        listener=false    //占有信号量
        let cmd:string="{\"M\":\"time\",\"F\":\""+DateTimeFormats[format]+"\"}\n"
        ESP8266.sendAT("AT+CIPSEND="+cmd.length)
        ESP8266.sendCMD(cmd)
        last_cmd_successful=waitforServerTime(BIGIOT_SERVERTIME_TIMEOUT)
        listener=true     //释放信号量
    }

    /**
    *最近一次获取的服务器时间戳
    */
    //% block="最近一次获取的服务器时间戳"
    export function lastServerTime():string {
        return serverTime
    }

    function waitforServerTime(timeout : number=BIGIOT_SERVERTIME_TIMEOUT): boolean {
        let serial_str: string = ""
        let result: boolean = false 
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
		    //取前的200个字符
            if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
			//如果返回中有命令词
            let temp_str:string=subStr(serial_str,"\"T\":\"","\"}")
            if (temp_str.compare("")!=0) {
                serverTime=temp_str
                result = true
                break
			//如超过时长
            }
            if (input.runningTime() - time > timeout) {
                break
            }
        }
        return result
    }
}