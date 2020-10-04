# ESP01 (ESP8266) and www.Bigiot.net for micro:bit
# 适用于ESP01（ESP8266）与基于Bigiot.net物联网通讯协议的 micro:bit 扩展

## ESP01 (ESP8266)

  硬件要求：ESP01/ESP01S 模块已经写入安信可AT固件。
  
  * connectWifi(tx: SerialPin, rx: SerialPin, baudrate: BaudRate, ssid: string, pw: string):void
 
 功能:初始化ESP01模块，并连接到指定的WIFI<br>
 参数:<br>
        tx：micro:bit 定义为TX的引脚
        rx：micro:bit 定义为RX的引脚
        baudrate: 波特率
        ssid：无线ssid号
        pw：无线密码
 返回:<br>
        无
   
  * isWifiConnected() 

 功能：判断当前是否已经连接上的WIFI，一般用于初始化ESP01是否成功的判断。<br>
 参数:<br>
        无
 返回:<br>
        无

## BIG_IOT

  要求：已经在www.Bigiot.net注册成功，并建立了"设备"及"接口"。<br>

  * isLastCmdSuccessful():boolean
 功能:最近一次ESP8266操作（发送数据）是否成功。一般用于数据发送后是否成功的判断。<br>
 参数:<br>
        无
 返回：<br>
        false:失败
        true:成功


  * connectToBigiotServer(url: string="www.bigiot.net", port: number=8181):void  <br>
 功能:连接到Bigiot服务器<br>
 参数:<br>
        url:bigiot网址
        port:端口
 返回：<br>
        无

  * isBigiotConnected():boolean <br>
 功能:判断是否已经连接到了Bigiot服务器<br>
 参数:<br>
        无
 返回：<br>
        false:失败
        true:成功

  * sendBigiotBeat():void <br>
 功能:向Bigiot服务器发送心跳包<br>
 参数:<br>
        无
 返回：<br>
        无
   
  * checkoutBigiot(DID: string, APIKey: string): void<br>
 功能:强制设备下线<br>
 参数:<br>
        DID:设备ID号
        APIKey:APIKEY
 返回：<br>
        无

  * checkinBigiot(DID: string, APIKey: string): void<br>
 功能:设备登录<br>
 参数:<br>
        DID:设备ID号
        APIKey:APIKEY
 返回：<br>
        无

  * updateBigiot1(DID: string, IID: string, value: string): void<br>
 功能:向Bigiot服务器发送1项实时数据<br>
 参数:<br>
        DID:设备ID号
        IID:接口ID号
        value:数据
 返回：<br>
        无
   
   
  * updateBigiot2(DID: string, IID1: string, value1: string, IID2: string, value2: string): void<br>
 功能:向Bigiot服务器发送2项实时数据<br>
 参数:<br>
        DID:设备ID号
        IID1:接口1ID号
        value1:数据1
        IID2:接口2ID号
        value2:数据2
 返回：<br>
        无
   
  * waitforCommand(timeout : number=3000): boolean <br>
 功能:从缓冲区捕获Bigiot服务器发来的命令词<br>
 参数:<br>
        timeout:捕获的等待时长
 返回：<br>
        true:捕获到了命令词
        false:未捕获到命令词
  

  * lastCmd(): void<br>
 功能:返回最新获取的命令词<br>
 参数:<br>
        无<br>
 返回：<br>
        获取到的命令词字符串

  * checkServerDateBigiot(format:DateTimeFormat):void<br>
 功能:获取服务器日期/时间<br>
 参数:<br>
        format: 
	        DateSimple: [年月日]
		    TimeSimple: [时分秒]
		    Date: [年-月-日]
		    Time: [时:分:秒]
		    DateTimeStamp: [时间戳]
		    DateTime: [年-月-日 时:分:秒]
 返回：<br>
        无

  * lastServerTime()<br>
 功能:最近一次获取的服务器时间戳<br>
 参数:<br>
        无
 返回：<br>
        获取到的服务器时间戳字符串

## License
MIT License

## Supported targets
* for PXT/microbit
(The metadata above is needed for package search.)