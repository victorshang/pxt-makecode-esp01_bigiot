/**
 * MakeCode extension for ESP8266 Wifi modules 
 */
//% color=#de0423 icon="\uf1ee" block="ESP8266"

namespace ESP8266 {
    let last_cmd_successful: boolean =false
    let serverTime: string=""
    let last_cmd: string =""
    let wifi_connected:boolean = false
    let bigiot_connected:boolean = false

    // 发送以//r//n结尾的命令
    export function sendAT(command: string, wait: number = 500) {
        sendCMD(command + "\u000D\u000A",wait)
    }
    // 发送命令
    export function sendCMD(command: string, wait: number = 500) {
        serial.writeString(command)
        basic.pause(wait)
    }

    /**
    * 初始化 ESP8266 模块，使用穿透模式连接到Wifi
    */
    //% block="初始化 ESP8266|RX (Tx of micro:bit) %tx|TX (Rx of micro:bit) %rx|波特率为 %baudrate|SSID号 %ssid|密码 %pw"
    //% tx.defl=SerialPin.P0
    //% rx.defl=SerialPin.P1
    //% ssid.defl=SSID
    //% pw.defl=Password
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
    function isLastCmdSuccessful() {
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
}