// 在此处添加您的代码
//% weight=20 color=#2233DD icon="\uf067" block="ESP01+Bigiot"
namespace esp01 {
    function SerialLineWrite(txt: string): void {
        serial.writeString(txt + "\r\n")
    }
    //% block="阻断运行，直到读取到 %txt" blockExternalInputs=true
    //等待出现字符串
    export function WaitFor(txt: string): void {
        while (serial.readString().indexOf(txt) == -1) {
            basic.pause(100)
        }
    }
    function ShowOK(): void {
        basic.showLeds(`
        # # # . #
        # . # # .
        # . # . .
        # . # # .
        # # # . #
        `, 500)
    }
    //% block="重启ESP01"
    //重启ESP01
    export function RestartEsp01s(): void {
        serial.writeString("+++")
        basic.pause(500)
        SerialLineWrite("AT")
        basic.pause(500)
        SerialLineWrite("AT+RST")
        basic.pause(1000)
    }
    //% block="重置ESP01并连接到WIFI|SSID%SSID 密码 %Pwd" blockExternalInputs=true
    //重置ESP01，连接到指定的WIFI并保存
    export function LinkWifi(SSID: string, Pwd: string): void {
        basic.showNumber(0)
        serial.writeString("+++")
        basic.pause(1000)
        basic.showNumber(1)
        SerialLineWrite("AT+RESTORE")
        basic.pause(1000)
        basic.showNumber(2)
        SerialLineWrite("AT+CWMODE_DEF=1")
        basic.pause(500)
        WaitFor("OK")
        basic.showNumber(3)
        SerialLineWrite("AT+CWJAP_DEF=\"" + SSID + "\",\"" + Pwd + "\"")
        basic.pause(500)
        WaitFor("WIFI GOT IP")
        ShowOK()
        basic.pause(500)
    }

    //% block="建立TCP穿透模式|网址 %Address 端口号 %Port" blockExternalInputs=true
    //建立TCP穿透模式
    export function SaveTransLink(Address: string, Port: number): void {
        SerialLineWrite("AT+SAVETRANSLINK=1,\"" + Address + "\"," + Port + ",\"TCP\"")
        WaitFor("OK")
        ShowOK()
    }
    //% block="设备退出登录|设备ID %DID APIKey %APIKey 显示提示 %showdebug" blockExternalInputs=true
    //设备退出登录
    export function BigiotCheckout(DID: string, APIKey: string, showdebug: boolean): void {
        SerialLineWrite("{\"M\":\"checkout\", \"ID\":\"" + DID + "\", \"K\":\"" + APIKey + "\"}")
        if (showdebug) {
            basic.showString("checkout")
        }
        basic.pause(500)
    }
    //% block="设备登录|设备ID %DID APIKey %APIKey 显示提示 %showdebug" blockExternalInputs=true
    //设备登录
    export function BigiotCheckin(DID: string, APIKey: string, showdebug: boolean): void {
        SerialLineWrite("{\"M\":\"checkin\", \"ID\":\"" + DID + "\", \"K\":\"" + APIKey + "\"}")
        if (showdebug) {
            basic.showString("checkin")
        }
        basic.pause(500)
        WaitFor("OK")
    }
    //% block="更新数据|设备ID %DID 接口1ID %IID1 接口1值 %value1" blockExternalInputs=true
    //更新数据1
    export function BigiotUpdate1(DID: string, IID1: string, value1: string): void {
        SerialLineWrite("{\"M\":\"update\",\"ID\":\"" + DID + "\",\"V\":{\"" + IID1 + "\":\"" + value1 + "\"}}")
    }
    //% block="更新数据|设备ID %DID 接口1ID %IID1 接口1值 %value1 接口2ID %IID2 接口2值 %value2" blockExternalInputs=true
    //更新数据2
    export function BigiotUpdate2(DID: string, IID1: string, value1: string, IID2: string, value2: string): void {
        SerialLineWrite("{\"M\":\"update\",\"ID\":\"" + DID + "\",\"V\":{\"" + IID1 + "\":\"" + value1 + "\",\"" + IID2 + "\":\"" + value2 + "\"}}")
    }

    //% block="从字符串 %value 中获取命令词"
    //获取命令词
    export function GetCMD(value: string): string {
        let len = value.indexOf("\",\"T\"") - value.indexOf("\"C\":\"")
        if (len > 0) return value.substr(value.indexOf("\"C\":\"") + 5, len - 5)
        else return ""
    }

}