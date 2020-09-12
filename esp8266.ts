/**
 * MakeCode extension for ESP8266 Wifi modules 
 */
//% color=#00f35b icon="\uf1ed" block="ESP8266"
namespace ESP8266 {
        let wifi_connected = false
        let internet_connected = false
    // 发送以//r//n结尾的命令
    function sendAT(command: string, wait: number = 100) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }
	
    // 发送以 命令
    function sendCMD(command: string, wait: number = 100) {
        serial.writeString(command)
        basic.pause(wait)
    }

    // 等待ESP8266返回信息
    function waitResponse(waitForWords : string): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
			//取前200个字符
            if (serial_str.length > 200) serial_str = serial_str.substr(serial_str.length - 200)
			//如果返回中有等待的信息
            if (serial_str.includes(waitForWords) ) {
                result = true
                break
			//如失败
            } else if (serial_str.includes("ERROR") || serial_str.includes("FAIL")) {
                break
            }
			//超时30秒
            if (input.runningTime() - time > 30000) break
        }
        return result
    }

    /**
    * 初始化 ESP8266 模块，使用穿透模式连接到Wifi
    */
    //% block="Initi ESP8266|RX (Tx of micro:bit) %tx|TX (Rx of micro:bit) %rx|Baud rate %baudrate|Wifi SSID = %ssid|Wifi PW = %pw"
    //% tx.defl=SerialPin.P0
    //% rx.defl=SerialPin.P1
    //% ssid.defl=your_ssid
    //% pw.defl=your_pw
    export function connectWifi(tx: SerialPin, rx: SerialPin, baudrate: BaudRate, ssid: string, pw: string) {
        wifi_connected = false
        internet_connected = false
        serial.redirect(
            tx,
            rx,
            baudrate
        )
        serial.setRxBufferSize(128)
		sendAT("AT+RESTORE", 1000) // 恢复出厂模式
        sendAT("AT+CWMODE=1") // 设置为STA模式
		if(waitResponse("OK")){
			basic.showNumber(6)
		}
        sendAT("AT+RST", 1000) // 重启
		
        sendAT("AT+CWJAP=\"" + ssid + "\",\"" + pw + "\"", 0) // connect to Wifi router
        wifi_connected = waitResponse("OK")
        basic.pause(100)
    }

   
    /**
    * Wait between uploads
    */
    //% block="Wait %delay ms"
    //% delay.min=0 delay.defl=5000
    export function wait(delay: number) {
        if (delay > 0) basic.pause(delay)
    }

    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% block="Wifi connected ?"
    export function isWifiConnected() {
        return wifi_connected
    }

    /**
    * Check if ESP8266 successfully connected to ThingSpeak
    */
    //% block="ThingSpeak connected ?"
    export function isInterneConnected() {
        return internet_connected
    }

}
