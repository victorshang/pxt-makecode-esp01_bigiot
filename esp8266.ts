/**
 * MakeCode extension for ESP8266 Wifi modules 
 */
//% color=#de0423 icon="\uf1ee" block="ESP8266"
enum DateTimeFormat {
    DateSimple = 0,  
    TimeSimple = 1, 
    Date = 2, 
    Time = 3,
    DateTimeStamp = 4,
    DateTime = 5
}
let DateTimeFormats=["Ymd","His","Y-m-d","H:i:s","stamp","Y-m-d H:i:s"]

namespace ESP8266 {
    let listener:boolean=false //监听网站发来命令的信号量
    let last_cmd_successful: boolean =false
    let serverTime:number=0
    let last_cmd: string =""
    let wifi_connected:boolean = false
    let bigiot_connected:boolean = false

    // 发送以//r//n结尾的命令
    function sendAT(command: string, wait: number = 100) {
        sendCMD(command + "\u000D\u000A",wait)
    }
    // 发送命令
    function sendCMD(command: string, wait: number = 100) {
        serial.writeString(command)
        basic.pause(wait)
    }

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
    * 初始化 ESP8266 模块，使用穿透模式连接到Wifi
    */
    //% block="初始化 ESP8266|RX (Tx of micro:bit) %tx|TX (Rx of micro:bit) %rx|波特率为 %baudrate|SSID号 = %ssid|密码 = %pw"
    //% tx.defl=SerialPin.P0
    //% rx.defl=SerialPin.P1
    //% ssid.defl=your_ssid
    //% pw.defl=your_pw
    export function connectWifi(tx: SerialPin, rx: SerialPin, baudrate: BaudRate, ssid: string, pw: string) {
        wifi_connected = false
        serial.redirect(
            tx,
            rx,
            baudrate
        )
        serial.setRxBufferSize(128)
		sendAT("AT+RESTORE", 2000) // 恢复出厂模式
        sendAT("AT+CWMODE=1",1000) // 设置为STA模式
        last_cmd_successful= waitResponse("OK")
        sendAT("AT+RST", 2000) // 重启
        last_cmd_successful= waitResponse("OK")
        sendAT("AT+CWJAP=\"" + ssid + "\",\"" + pw + "\"",1000) // 连接到WIFI
        last_cmd_successful= waitResponse("OK")
        wifi_connected =last_cmd_successful
        basic.pause(100)
    }
    /**
    * 检查ESP8266是否已经连接到WIFI
    */
    //% block="已连接到WIFI?"
    export function isWifiConnected() {
        return wifi_connected
    }
    /**
    *检查最近的一步ESP8266是否成功
    */
    //% block="上一步操作是否成功?"
    export function isLastCmdSuccessful() {
        return last_cmd_successful
    }
    /**
    * 读取串口数据，判断是否存在某个特定表示成功字符串，默认等待时间为30s，失败字符串为"ERROR"、"FAIL"
    */
    //% block="存在表示成功的字符串|字符串 = %waitForWords|超时 = %timeout"
    //% waitForWords.defl="string"
    //% timeout.defl=30000
    function waitResponse(waitForWords : string,timeout : number=30000): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
			//取前200个字符
            if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
            //如果返回中有等待的信息
            if (serial_str.includes(waitForWords) ) {
                basic.pause(500)
                result = true
                break
			//如失败
            } else if (serial_str.includes("ERROR") || serial_str.includes("FAIL")) {
                basic.showString("E")
                break
            }
            if (input.runningTime() - time > timeout) {
                basic.showString("t")
                break
            }
        }
        return result
    }
    /**
    * 连接到Bigiot服务器
    */
    //% block="Bigiot连接到服务器|域名或IP地址 = %url|端口 = %port"
    //% url.defl=www.bigiot.net
    //% port.defl=8181
    export function connectToBigiotServer(url: string="www.bigiot.net", port: number=8181) {
        if(wifi_connected){
            sendAT("AT+CIPSTART=\"TCP\",\""+url+"\","+port,1000)
            last_cmd_successful=waitResponse("WELCOME")
            bigiot_connected=last_cmd_successful
            //登录后开始监听网站发来的命令
            listener=true
        }else{
            basic.showString("u")
        }
    }
    /**
    *检查ESP8266是否连接到了Bigiot服务器
    */
    //% block="已连接到Bigiot服务器"
    export function isBigiotConnected() {
        return bigiot_connected
    }

    /**
    * 发送Bigiot心跳包
    */
    //% block="发送Bigiot心跳包"
    export function BigiotBeat(): void {
        if(listener){
            listener=false//关闭监听
            let cmd:string="{\"M\":\"beat\"}\n"
            sendAT("AT+CIPSEND="+cmd.length)
            sendCMD(cmd)
            listener=true//开启监听
        }
    }
     /**
    * Bigiot设备退出登录
    */
    //% block="Bigiot设备强制下线|设备ID %DID|APIKey %APIKey"
    export function BigiotCheckout(DID: string, APIKey: string): void {
        listener=false//关闭监听
        let cmd:string="{\"M\":\"checkout\", \"ID\":\"" + DID + "\", \"K\":\"" + APIKey + "\"}\n"
        sendAT("AT+CIPSEND="+cmd.length)
        sendCMD(cmd)
        last_cmd_successful=waitResponse("checkout",2000)
        listener=true//开启监听
    }
    /**
    * Bigiot设备登录
    */
    //% block="Bigiot设备登录|设备ID %DID|APIKey %APIKey"

    export function BigiotCheckin(DID: string, APIKey: string): void {
        listener=false//关闭监听
        let cmd:string="{\"M\":\"checkin\", \"ID\":\"" + DID + "\", \"K\":\"" + APIKey + "\"}\n"
        sendAT("AT+CIPSEND="+cmd.length)
        sendCMD(cmd)
        last_cmd_successful=waitResponse("checkinok",2000)
        listener=true//开启监听
    }
    /**
    * Bigiot发送一项实时数据
    */
    //% block="发送实时数据|设备ID %DID|接口ID %IID|接口值 %value" blockExternalInputs=true
    //更新一项数据
    export function BigiotUpdate1(DID: string, IID: string, value: string): void {
        if(listener){
            listener=false//关闭监听
            let cmd:string="{\"M\":\"update\",\"ID\":\"" + DID + "\",\"V\":{\"" + IID + "\":\"" + value + "\"}}\n" 
            sendAT("AT+CIPSEND="+cmd.length)
            sendCMD(cmd)
            last_cmd_successful=waitResponse("SEND OK",500)
            listener=true//开启监听
        }
        
    }
    /**
    * Bigiot发送两项实时数据
    */
    //% block="发送实时数据|设备ID %DID|接口1ID %IID1|接口1值 %value1|接口2ID %IID2|接口2值 %value2" blockExternalInputs=true
    //更新两项数据
    export function BigiotUpdate2(DID: string, IID1: string, value1: string, IID2: string, value2: string): void {
        if(listener){
            listener=false//关闭监听
            let cmd:string="{\"M\":\"update\",\"ID\":\"" + DID + "\",\"V\":{\"" + IID1 + "\":\"" + value1 + "\",\"" + IID2 + "\":\"" + value2 + "\"}}\n" 
            sendAT("AT+CIPSEND="+cmd.length)
            sendCMD(cmd)
            last_cmd_successful=waitResponse("SEND OK",500)
            listener=true//开启监听
        }
    }

    /**
    * 读取串口数据，判断是否存在Bigiot命令词，默认读取时长为3s
    */
    //% block="检查Bigiot是否发来命令|超时:%timeout"
    //% timeout.defl=3000
    export function waitforCommand(timeout : number=3000): boolean {
        let serial_str: string = ""
        let result: boolean = false 
        if(listener){
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
        }
        return result
    }
    /**
    *最新Bigiot发来的命令词
    */
    //% block="最新Bigiot发来的命令词"
    export function lastCmd() {
        return last_cmd
    }
    /**
    * 查询服务器日期时间
    */
    //% block="查询服务器日期/时间|格式：%format"
    //% format.defl=DateTimeFormat.DateTime
    export function BigiotCheckServerDate(format:DateTimeFormat): void {
        if(listener){
            listener=false//关闭监听
            let cmd:string="{\"M\":\"time\",\"F\":\""+DateTimeFormats[format]+"\"}\n"
            sendAT("AT+CIPSEND="+cmd.length)
            sendCMD(cmd)
            last_cmd_successful=waitforTime(1000)
            listener=true//开启监听
        }
    }
    /**
    *最近一次查询的服务器时间戳
    */
    //% block="最近一次查询的服务器时间戳"
    export function lastServerTime() {
        return serverTime
    }
    function waitforTime(timeout : number=1000): boolean {
        let serial_str: string = ""
        let result: boolean = false 
        if(listener){
            let time: number = input.runningTime()
            while (true) {
                serial_str += serial.readString()
			    //取前的200个字符
                if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
			    //如果返回中有命令词
                let temp_str:string=subStr(serial_str,"\"T\":\"","\"}")
                if (temp_str.compare("")!=0) {
                    serverTime=parseInt(temp_str)
                    result = true
                    break
			    //如超过时长
                }
                if (input.runningTime() - time > timeout) {
                    basic.showString("t")
                    break
                }
            }
        }
        return result
    }
   
}
